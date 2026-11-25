#!/usr/bin/env python3
"""
Dungeon Journal data pipeline.

Executes the addon's Data/*.lua files in a sandboxed Lua runtime (the same
files that ship in the addon — no second copy of the data to maintain) and
writes the resulting tables to data/journal.json for the Next.js site.

Usage:
    python3 scripts/lua-to-json.py <path-to-ForeverDungeonJournal-folder>

Requires: pip install lupa
"""
import json
import os
import re
import sys

from lupa import LuaRuntime

DATA_FILES = [
    "Data/Dungeons.lua",
    "Data/SharedLoot.lua",
    "Data/DungeonEntrances.lua",
    "Data/DungeonRoutes.lua",
    "Data/Bosses.lua",
    "Data/QuestMaps.lua",
    "Data/QuestChains.lua",
    "Data/QuestRewards.lua",
    "Data/QuestShareability.lua",
    "Data/QuestUpdates.lua",
    "Data/DungeonAliases.lua",
    "Data/PvPRewards.lua",
    "UI/ThemeData.lua",
]

BOOTSTRAP = r"""
local FDJ = {}
_G.ForeverDungeonJournal_NS = FDJ
FDJ.ADDON_NAME = "ForeverDungeonJournal"
FDJ.Constants = { ALBA_FAIRMOON_LOCATION = "Alba Fairmoon, Sentinel Hill inn, Westfall" }
FDJ.L = function(key) return key end
-- WoW API stubs the data files may touch at load time.
-- Data files create frames for in-game behaviour (event handlers that learn
-- quest IDs as you play). The export only wants the tables, so a frame is a
-- table whose every method is a no-op.
_G.CreateFrame = function()
    return setmetatable({}, { __index = function() return function() end end })
end
_G.GetLocale = function() return "enUS" end
_G.IsPushableQuest = function() return false end
_G.C_QuestLog = { IsPushableQuest = function() return false end }
_G.ForeverDungeonJournalDB = {}
return FDJ
"""


def lua_to_py(obj, lua, depth=0):
    """Recursively convert Lua tables to JSON-safe Python values.

    The data files are trees (no back-references), so a depth cap is enough
    to guard against an accidental cycle. Functions are dropped.
    """
    t = lua.globals().type(obj)
    if t == "function" or t == "userdata" or t == "thread":
        return None
    if t != "table":
        return obj
    if depth > 24:
        return None
    keys = list(obj.keys())
    if not keys:
        return []  # empty Lua table: every empty table in this data is a list
    # Array-like table (1..n, no holes)?
    if all(isinstance(k, int) for k in keys) and sorted(keys) == list(range(1, len(keys) + 1)):
        return [lua_to_py(obj[k], lua, depth + 1) for k in range(1, len(keys) + 1)]
    out = {}
    for k in keys:
        raw = obj[k]
        if lua.globals().type(raw) == "function":
            continue
        out[str(k)] = lua_to_py(raw, lua, depth + 1)
    return out


def merge_strings(lua, fdj, path, name):
    """A Systems/ file's "local strings = { enUS = {...}, ... }" table, merged
    into FDJ.Locales as the game does (never over a key already set)."""
    if not os.path.exists(path):
        return
    lines = open(path, encoding="utf-8").read().split("\n")
    for i, line in enumerate(lines):
        m = re.match(r"^(\s*)local strings = \{\s*$", line)
        if not m:
            continue
        end = next((j for j in range(i + 1, len(lines)) if lines[j].rstrip() == m.group(1) + "}"), None)
        if end is None:
            continue
        block = "\n".join(lines[i:end + 1]) + """
for loc, entries in pairs(strings) do
    local t = FDJ.Locales[loc]
    if t then for k, v in pairs(entries) do if type(v) == "string" and t[k] == nil then t[k] = v end end end
end"""
        lua.eval("function(src, name, FDJ) return load(src, '@' .. name, 't', setmetatable({ FDJ = FDJ }, { __index = _G })) end")(block, name, fdj)()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    addon_dir = sys.argv[1]
    out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "journal.json")

    lua = LuaRuntime(unpack_returned_tuples=True, encoding="utf-8")
    fdj = lua.execute(BOOTSTRAP)

    for rel in DATA_FILES:
        path = os.path.join(addon_dir, rel)
        if not os.path.exists(path):
            print(f"skip (missing): {rel}")
            continue
        with open(path, encoding="utf-8") as fh:
            src = fh.read()
        chunk = lua.eval(f"function(src, name) return load(src, '@' .. name) end")(src, rel)
        if chunk is None:
            raise SystemExit(f"could not compile {rel}")
        chunk("ForeverDungeonJournal", fdj)
        print(f"loaded {rel}")

    # The dungeon map pages (Map tab) live in Core/Journal.lua, not Data/: run
    # just that table. It ends at the first "}" in column 0 after its start.
    journal_lua = os.path.join(addon_dir, "Core", "Journal.lua")
    if os.path.exists(journal_lua):
        lines = open(journal_lua, encoding="utf-8").read().split("\n")
        start = next(i for i, l in enumerate(lines) if l.startswith("FDJ.DUNGEON_MAPS = {"))
        end = next(i for i in range(start + 1, len(lines)) if lines[i] == "}")
        block = "local _, FDJ = ...\n" + "\n".join(lines[start:end + 1])
        lua.eval("function(src) return load(src, '@Core/Journal.lua (DUNGEON_MAPS)') end")(block)("ForeverDungeonJournal", fdj)
        print("loaded DUNGEON_MAPS from Core/Journal.lua")

    # The Forever emblem's filter list (Systems/ForeverFilter.lua): read just the table.
    ff = os.path.join(addon_dir, "Systems", "ForeverFilter.lua")
    if os.path.exists(ff):
        m = re.search(r"FDJ\.FOREVER_DUNGEONS = \{.*?\n\}", open(ff, encoding="utf-8").read(), re.S)
        if m:
            lua.eval("function(src) return load(src, '@Systems/ForeverFilter.lua (FOREVER_DUNGEONS)') end")(
                "local _, FDJ = ...\n" + m.group(0))("ForeverDungeonJournal", fdj)
            print("loaded FOREVER_DUNGEONS from Systems/ForeverFilter.lua")

    # Tier Sets (Systems/TierSets.lua): the sets live in the page's own code,
    # not in Data/. Run just their tables: from "local SETS = {" to the
    # CLASS_ORDER line, plus SPEC_ICONS, and hand back plain lists.
    tier = None
    ts = os.path.join(addon_dir, "Systems", "TierSets.lua")
    if os.path.exists(ts):
        src = open(ts, encoding="utf-8").read()
        sets = re.search(r"^local SETS = \{.*?^local CLASS_ORDER = [^\n]*\n", src, re.S | re.M)
        spec = re.search(r"^local SPEC_ICONS = \{.*?^\}", src, re.S | re.M)
        if sets and spec:
            block = sets.group(0) + spec.group(0) + r"""
local unpack = table.unpack or unpack
local T0, T05 = {}, {}
for token, set in pairs(SETS) do T0[token] = { name = set.name, items = { unpack(set, 1, 8) } } end
for token, set in pairs(SETS2) do
    local versions = {}
    for i, v in ipairs(set) do versions[i] = { role = v.role, items = { unpack(v, 1, 8) } } end
    T05[token] = { name = set.name, versions = versions }
end
return { classes = CLASS_ORDER, tier0 = T0, tier05 = T05, pieceQuest = PIECE_QUEST,
    quests05 = QUEST05, quests05Names = QUEST05_EN, specIcons = SPEC_ICONS }
"""
            tier = lua.eval("function(src) return load(src, '@Systems/TierSets.lua (sets)') end")(block)()
            print("loaded TIER_SETS from Systems/TierSets.lua")

    # PvP (Systems/PvP.lua): the battlegrounds' cards (key, opening level,
    # level range, team size, loading screen and its cut) and their names in
    # the game's languages. Run just those two tables.
    pvp_bgs = None
    pv = os.path.join(addon_dir, "Systems", "PvP.lua")
    if os.path.exists(pv):
        src = open(pv, encoding="utf-8").read()
        bgs = re.search(r"^local BGS = \{.*?^\}", src, re.S | re.M)
        names = re.search(r"^local NAMES = \{.*?^\}", src, re.S | re.M)
        lvl = re.search(r"^local PVP_LEVEL = (\d+)", src, re.M)
        if bgs and names:
            level = lvl.group(1) if lvl else "10"
            block = f"{bgs.group(0)}\n{names.group(0)}\nreturn {{ battlegrounds = BGS, names = NAMES, level = {level} }}"
            pvp_bgs = lua.eval("function(src) return load(src, '@Systems/PvP.lua (BGS)') end")(block)()
            print("loaded the battlegrounds from Systems/PvP.lua")

    # Alterac Valley's quests (Systems/PvPQuests.lua) are a quest-chain page
    # the addon builds when it loads (FDJ.DB["Alterac Valley Quests"], with
    # its chains and steps). It writes the objectives from the PvP pages'
    # English strings: merge those first, then run the file up to the part
    # that needs the game.
    pq = os.path.join(addon_dir, "Systems", "PvPQuests.lua")
    if os.path.exists(pq):
        lua.execute("local FDJ = _G.ForeverDungeonJournal_NS; FDJ.Locales = FDJ.Locales or {}; FDJ.Locales.enUS = FDJ.Locales.enUS or {}")
        for fn in ("PvP.lua", "PvPRewards.lua"):
            merge_strings(lua, fdj, os.path.join(addon_dir, "Systems", fn), f"Systems/{fn}")
        src = open(pq, encoding="utf-8").read()
        cut = re.search(r"^-- -+ opening it", src, re.M)
        lua.eval("function(src) return load(src, '@Systems/PvPQuests.lua') end")(src[: cut.start()] if cut else src)()
        print(f"loaded {fdj['PVP_AV_PAGE']} from Systems/PvPQuests.lua")

    # The Cozy Sleeping Bag's chain differs by faction: step 1 is a quest of
    # each side's own and step 2 starts at that side's Nailed Plank. The data
    # files leave it set for the Alliance; switch to the Horde, keep what
    # changes, and switch back.
    variants = {}
    if fdj["SetSleepingBagFaction"] is not None and fdj["SLEEPING_BAG_PAGE"] is not None:
        page = fdj["SLEEPING_BAG_PAGE"]
        main_id = fdj["DB"][page]["quests"][1]["id"]
        fdj["SetSleepingBagFaction"]("Horde")
        chain = lua_to_py(fdj["QUEST_PREREQ_CHAINS"][main_id], lua)
        details = {str(s["id"]): lua_to_py(fdj["QUEST_PREREQ_DETAILS"][s["id"]], lua) for s in chain}
        variants[page] = {"Horde": {"quest": main_id, "chain": chain, "details": details}}
        fdj["SetSleepingBagFaction"]("Alliance")
        print(f"loaded the Horde's {page} chain")

    export_keys = [
        "DB", "ORDER", "BOSS_LEVELS", "STATIC_DISPLAY_IDS",
        "QUEST_START_MAPS", "QUEST_PREREQ_CHAINS", "QUEST_PREREQ_DETAILS",
        "FOREVER_QUEST_XP_FALLBACK", "FOREVER_QUEST_BASE_XP",
        "PREREQ_REWARD_ITEMS_FALLBACK", "PREREQ_REWARD_MONEY_FALLBACK",
        "QUEST_SHAREABILITY_AUDIT", "SHARED_BY_BOSS", "ENTRANCES", "ROUTES",
        "THEMES", "DUNGEON_HOME_ART", "DUNGEON_HOME_TEXCOORD",
        "DUNGEON_PAGE_ART", "DUNGEON_PAGE_TEXCOORD", "DUNGEON_MAPS", "FOREVER_DUNGEONS",
        "DUNGEON_SEARCH_ALIASES",
    ]
    result = {}
    for key in export_keys:
        val = fdj[key]
        if val is not None:
            result[key] = lua_to_py(val, lua)

    if tier is not None:
        result["TIER_SETS"] = lua_to_py(tier, lua)
    # PvP: the battlegrounds and the rewards, quests and names of Data/PvPRewards.lua.
    pvp = {}
    if pvp_bgs is not None:
        pvp.update(lua_to_py(pvp_bgs, lua))
    for key in ("PVP_REWARDS", "PVP_QUESTS", "PVP_HONOR", "PVP_ITEM_NAMES", "PVP_QUEST_NPCS",
                "PVP_QUEST_NPC_NAMES", "PVP_QUEST_INFO", "PVP_QUEST_FACTIONS", "PVP_QUEST_TEXT",
                "PVP_QUEST_NAMES", "PVP_INSIGNIA_NAMES", "PVP_FACTION_NAMES"):
        if fdj[key] is not None:
            pvp[key[4:].lower()] = lua_to_py(fdj[key], lua)
    if pvp:
        result["PVP"] = pvp
    result["FACTION_VARIANTS"] = variants
    for key in ("SLEEPING_BAG_PAGE", "ONYXIA_PAGE", "SLEEPING_BAG_ITEM", "PVP_AV_PAGE"):
        if fdj[key] is not None:
            result.setdefault("PAGES", {})[key] = fdj[key]

    # English UI labels (map labels, the Forever emblem's tooltip...) from the addon's locale table.
    labels = {}
    loc = os.path.join(addon_dir, "Localization", "Localization.lua")
    if os.path.exists(loc):
        keys = r"MAP_[A-Z0-9_]+|FOREVER_FILTER_[A-Z]+|RAIDS_TITLE|COMING_SOON"
        for m in re.finditer(r'^\s*(' + keys + r')\s*=\s*"((?:[^"\\]|\\.)*)"', open(loc, encoding="utf-8").read(), re.M):
            labels.setdefault(m.group(1), m.group(2))  # first occurrence is enUS
    result["MAP_LABELS"] = labels

    # Version from the TOC.
    toc = os.path.join(addon_dir, "ForeverDungeonJournal.toc")
    version = "unknown"
    if os.path.exists(toc):
        for line in open(toc, encoding="utf-8"):
            if line.startswith("## Version:"):
                version = line.split(":", 1)[1].strip()
    result["meta"] = {"addonVersion": version, "dungeonCount": len(result.get("ORDER", []))}

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(result, fh, ensure_ascii=False, indent=1)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"wrote {out_path} ({size_kb} KB) — {result['meta']['dungeonCount']} dungeons, addon {version}")


if __name__ == "__main__":
    main()
