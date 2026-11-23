"""Export the addon's translations for the website.

    python scripts/locales-to-json.py ["<path>/ForeverDungeonJournal"]

Runs the addon's Localization/*.lua files (in its .toc order) in a sandboxed
Lua, then writes data/locales/<locale>.json for every language other than
English:

    ui        the interface strings (FDJ.Locales: OBJECTIVE, STARTS_AT, ...)
    dungeons  dungeon name / location / description, keyed by English name
    bosses    boss names, keyed by English name
    quests    quest name / objective / pickup / turnin / note, keyed by quest ID

Requires: pip install lupa
"""
import json
import os
import re
import sys

from lupa import LuaRuntime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_ADDON = "C:/Program Files (x86)/World of Warcraft/_forever_/Interface/AddOns/ForeverDungeonJournal"
OUT_DIR = os.path.join(ROOT, "data", "locales")
LOCALES = ["deDE", "frFR", "esES", "itIT", "ptBR", "ruRU", "koKR", "zhCN", "zhTW"]
QUEST_FIELDS = ["name", "objective", "pickup", "turnin", "note", "warning"]

BOOTSTRAP = r"""
local FDJ = {}
_G.ForeverDungeonJournal_NS = FDJ
FDJ.ADDON_NAME = "ForeverDungeonJournal"
GetLocale = function() return "enUS" end
GetTime = function() return 0 end
CreateFrame = function() return setmetatable({}, { __index = function() return function() end end }) end
C_Timer = { After = function() end }
hooksecurefunc = function() end
strtrim = function(s) return (s:gsub("^%s+", ""):gsub("%s+$", "")) end
wipe = function(t) for k in pairs(t) do t[k] = nil end return t end
return FDJ
"""


def py(v, depth=0):
    if v is None or isinstance(v, (bool, int, float, str)) or depth > 12:
        return v
    try:
        keys = list(v.keys())
    except Exception:
        return None
    if keys and all(isinstance(k, int) for k in keys) and sorted(keys) == list(range(1, len(keys) + 1)):
        return [py(v[k], depth + 1) for k in sorted(keys)]
    return {str(k): py(v[k], depth + 1) for k in keys}


def clean(text):
    """Game escapes out: colour codes, |n line breaks, inline textures."""
    if not isinstance(text, str):
        return text
    text = re.sub(r"\|c[0-9a-fA-F]{8}|\|r|\|T[^|]*\|t", "", text)
    return text.replace("|n", "\n").strip()


def main():
    addon = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ADDON
    toc = os.path.join(addon, "ForeverDungeonJournal.toc")
    files = [line.strip().replace("\\", "/") for line in open(toc, encoding="utf-8")
             if line.strip().lower().startswith("localization")]
    lua = LuaRuntime(unpack_returned_tuples=True, encoding="utf-8")
    fdj = lua.execute(BOOTSTRAP)
    loader = lua.eval("function(src, name) return load(src, '@' .. name) end")
    for rel in files:
        src = open(os.path.join(addon, rel), encoding="utf-8").read()
        chunk = loader(src, rel)
        if isinstance(chunk, tuple):  # (nil, error)
            chunk, err = chunk
            if chunk is None:
                print(f"skip {rel}: {err}")
                continue
        try:
            chunk("ForeverDungeonJournal", fdj)
        except Exception as err:  # a file that needs the game: its tables are mostly set before
            print(f"partial {rel}: {str(err)[:120]}")

    # The features in Systems/ keep their own strings in a "local strings =
    # { enUS = {...}, deDE = {...} }" table each (Tier Sets, Onyxia, the
    # Sleeping Bag...), merged into FDJ.Locales when the game loads them. Run
    # just those tables, and merge the same way: never over a key already set.
    merge = lua.eval("""function(src, name, FDJ)
        local chunk = load(src .. [[
            for loc, entries in pairs(strings) do
                local t = FDJ.Locales and FDJ.Locales[loc]
                if t and type(entries) == "table" then
                    for k, v in pairs(entries) do
                        if type(v) == "string" and t[k] == nil then t[k] = v end
                    end
                end
            end]], '@' .. name, "t", setmetatable({ FDJ = FDJ }, { __index = _G }))
        if not chunk then return false end
        return pcall(chunk)
    end""")
    systems = os.path.join(addon, "Systems")
    merged = 0
    for fn in sorted(os.listdir(systems)) if os.path.isdir(systems) else []:
        if not fn.endswith(".lua"):
            continue
        lines = open(os.path.join(systems, fn), encoding="utf-8").read().split("\n")
        for i, line in enumerate(lines):
            m = re.match(r"^(\s*)local strings = \{\s*$", line)
            if not m:
                continue
            close = m.group(1) + "}"
            end = next((j for j in range(i + 1, len(lines)) if lines[j].rstrip() == close), None)
            if end is None:
                continue
            ok = merge("\n".join(lines[i:end + 1]) + "\nstrings.esMX = strings.esMX or strings.esES\n", f"Systems/{fn}", fdj)
            merged += 1 if ok else 0
    print(f"merged {merged} string tables from Systems/")

    locales = py(fdj["Locales"]) or {}
    content = py(fdj["ContentLocales"]) or {}
    os.makedirs(OUT_DIR, exist_ok=True)
    english_ui = {k: v for k, v in (locales.get("enUS") or {}).items() if isinstance(v, str)}
    with open(os.path.join(OUT_DIR, "enUS.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump({"ui": english_ui}, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    for loc in LOCALES:
        c = content.get(loc) or {}
        ui = {k: clean(v) for k, v in (locales.get(loc) or {}).items() if isinstance(v, str)}
        dungeons = {}
        for name, d in (c.get("dungeons") or {}).items():
            if isinstance(d, dict):
                dungeons[name] = {k: clean(d[k]) for k in ("name", "location", "description") if isinstance(d.get(k), str)}
        bosses = {k: clean(v) for k, v in (c.get("bosses") or {}).items() if isinstance(v, str)}
        quests = {}
        for qid, q in (c.get("quests") or {}).items():
            if isinstance(q, dict):
                entry = {k: clean(q[k]) for k in QUEST_FIELDS if isinstance(q.get(k), str)}
                if entry:
                    quests[str(qid)] = entry
        doc = {"ui": ui, "dungeons": dungeons, "bosses": bosses, "quests": quests}
        with open(os.path.join(OUT_DIR, f"{loc}.json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump(doc, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        print(f"{loc}: {len(ui)} ui, {len(dungeons)} dungeons, {len(bosses)} bosses, {len(quests)} quests")


if __name__ == "__main__":
    main()
