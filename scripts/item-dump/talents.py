"""Build the talent trees for the character page, from WoW Forever's own data.

    python scripts/item-dump/talents.py [build]

WoW Forever's talent window runs on the trait system (C_Traits), not the
classic Talent/TalentTab tables, which still hold the old trees. So the trees
come from the client's trait tables (wago.tools), the same ones the game's
window draws:

    SkillLineXTraitTree -> TraitTree            the class's tree
    TraitNodeGroup, TraitNodeGroupXTraitNode    its three talent trees (the
                                                three biggest groups, which
                                                split its nodes between them)
    TraitNode (PosX, PosY)                      where each talent sits
    TraitNodeXTraitNodeEntry, TraitNodeEntry    its ranks and definition
    TraitDefinition                             its spell, name and icon
    TraitEdge                                   the arrows
    TraitDefinitionEffectPoints, CurvePoint     each rank's numbers

Forever has no spell per rank: rank N is the first rank's spell with its
effect values taken from the talent's curves at N, so each rank's text is the
spell's description filled in with those (spell_lines.py fills the rest).

Writes public/journal/talents/<CLASS>.json, one file per class, loaded by the
character page; and DJItemDump/TalentSpells.lua, the talent spells for
/djdump talents, whose saved names, icons and texts this script uses where the
tables have none.

Tier and column are 0-based here (the top row is tier 0), counted within each
talent tree with the grid's step (the smallest gap between positions) as one;
the addon's export counts the same way from 1, and also sends each talent's
TraitNode ID, which is what the site matches on.
"""
import collections
import glob
import importlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
fetch = importlib.import_module("fetch-icons")
spell_lines = importlib.import_module("spell_lines")

ROOT = fetch.ROOT
OUT = os.path.join(ROOT, "public", "journal", "talents")
FOREVER = "C:/Program Files (x86)/World of Warcraft/_forever_"

# SkillLineXTraitTree names one of each class's specialisations; its class:
CLASS_OF_SKILL = {"237": "MAGE", "574": "DRUID", "50": "HUNTER", "184": "PALADIN", "613": "PRIEST",
                  "38": "ROGUE", "373": "SHAMAN", "354": "WARLOCK", "26": "WARRIOR"}
CLASS_MASK = {"WARRIOR": 1, "PALADIN": 2, "HUNTER": 4, "ROGUE": 8, "PRIEST": 16, "SHAMAN": 64,
              "MAGE": 128, "WARLOCK": 256, "DRUID": 1024}
# A node far below its tree's grid is a leftover the game never shows (the
# priest's old Holy Specialization sits at row 33).
MAX_TIER = 10


def game_text(text):
    """The game's text as plain text: no colour codes (|cffRRGGBB, |CFF..., |r)
    or inline textures, no doubled spaces, and no indent left by a colour code."""
    text = str(text)
    # "2 |4hour:hrs;": the game's singular/plural pick
    text = re.sub(r"(\d+) \|4([^:;]*):([^;]*);", lambda m: f"{m.group(1)} {m.group(2) if m.group(1) == '1' else m.group(3)}", text)
    text = re.sub(r"\|4([^:;]*):([^;]*);", lambda m: m.group(2), text)
    text = re.sub(r"\|[cC][0-9a-fA-F]{8}|\|[rR]|\|T[^|]*\|t", "", text).replace("\r", "")
    text = re.sub(r"(?<=\S) {2,}", " ", text)
    return re.sub(r"\n[ \t]+", "\n", text).strip()


def load_dump():
    """What /djdump talents saved, when it has run:
    ({spell ID: {"d", "n", "i"}} from 1.4.0, {trait entry ID: {"n", "i", "d": [rank texts]}} from 1.5.0)."""
    # Every account's file, oldest first: logging in on another account writes
    # an empty one there, which must not hide the dump.
    files = sorted(glob.glob(os.path.join(FOREVER, "WTF", "Account", "*", "SavedVariables", "DJItemDump.lua")), key=os.path.getmtime)
    spells, traits = {}, {}
    for path in files:
        s, t = load_one(path)
        spells.update(s)
        for eid, row in t.items():
            have = traits.get(eid)
            traits[eid] = row if not have else {"n": row["n"] or have["n"], "i": row["i"] or have["i"], "d": {**have["d"], **row["d"]}}
    return spells, traits


def load_one(path):
    from lupa import LuaRuntime
    lua = LuaRuntime(unpack_returned_tuples=True)
    with open(path, encoding="utf-8") as f:
        lua.execute(f.read())
    db = lua.globals().DJItemDumpDB
    keys = lua.eval("function(t) local k = {} for id in pairs(t) do k[#k + 1] = id end return k end")
    spells, traits = {}, {}
    tal = db and db["talents"]
    if tal:
        for sid in keys(tal).values():
            row = tal[sid]
            if not row:
                continue
            # 1.4.0 saved the text alone at first, then a table with name and icon
            text, name, icon = (row, None, None) if isinstance(row, str) else (row["d"], row["n"], row["i"])
            if text:
                spells[str(int(sid))] = {"d": game_text(text), "n": str(name) if name else None, "i": int(icon) if icon else None}
    tr = db and db["traits"]
    if tr:
        for eid in keys(tr).values():
            row = tr[eid]
            if not row:
                continue
            ranks = row["d"]
            texts = {}
            if ranks:
                for r in keys(ranks).values():
                    if ranks[r]:
                        texts[int(r)] = game_text(ranks[r])
            traits[str(int(eid))] = {"n": str(row["n"]) if row["n"] else None, "i": int(row["i"]) if row["i"] else None,
                                     "d": texts}
    return spells, traits


def curve_at(points, x):
    """A curve's value at x: its point there, else a straight line between its neighbours."""
    if not points:
        return None
    for px, py in points:
        if px == x:
            return py
    lo = [p for p in points if p[0] < x]
    hi = [p for p in points if p[0] > x]
    if lo and hi:
        (x0, y0), (x1, y1) = lo[-1], hi[0]
        return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return (lo[-1] if lo else hi[0])[1]


def main():
    build = sys.argv[1] if len(sys.argv) > 1 else fetch.latest_forever_build()
    T = lambda name: fetch.table(name, build)
    names = {r["ID"]: r["Name_lang"] for r in T("SpellName")}
    icon_of_spell = {r["SpellID"]: r["SpellIconFileDataID"] for r in T("SpellMisc") if r.get("DifficultyID", "0") == "0"}
    icon_names = fetch.icon_names()
    text = spell_lines.SpellText(fetch.table, build)
    dumped, traits = load_dump()

    nodes = {r["ID"]: r for r in T("TraitNode")}
    group_tree = {r["ID"]: r["TraitTreeID"] for r in T("TraitNodeGroup")}
    group_nodes = collections.defaultdict(set)
    for r in T("TraitNodeGroupXTraitNode"):
        group_nodes[r["TraitNodeGroupID"]].add(r["TraitNodeID"])
    node_entries = collections.defaultdict(list)
    for r in T("TraitNodeXTraitNodeEntry"):
        node_entries[r["TraitNodeID"]].append((int(r["_Index"] or 0), r["TraitNodeEntryID"]))
    entries = {r["ID"]: r for r in T("TraitNodeEntry")}
    definitions = {r["ID"]: r for r in T("TraitDefinition")}
    curves = collections.defaultdict(list)
    for r in T("CurvePoint"):
        curves[r["CurveID"]].append((int(r["OrderIndex"] or 0), float(r["Pos_0"]), float(r["Pos_1"])))
    effect_curves = collections.defaultdict(dict)  # definition -> {effect number (1-based): [(rank, value)]}
    for r in T("TraitDefinitionEffectPoints"):
        pts = [(x, y) for _, x, y in sorted(curves.get(r["CurveID"], []))]
        if pts:
            effect_curves[r["TraitDefinitionID"]][int(r["EffectIndex"]) + 1] = pts
    edges = [(r["LeftTraitNodeID"], r["RightTraitNodeID"]) for r in T("TraitEdge")]
    tabs = T("TalentTab")

    def icon(file_id):
        name = icon_names.get(str(file_id))
        if name and fetch.download_icon(name):
            return f"/journal/icons/{name}.webp"
        return "/journal/icons/inv_misc_questionmark.webp"

    unfilled = []

    def describe(spell, values):
        """The spell's description with its own effect values replaced by `values`
        ({effect number: value}, a rank's), every other placeholder filled from
        the tables; "" when something cannot be filled."""
        raw = text.desc.get(spell, "")
        if not raw:
            return ""

        def value(sid, kind, n):
            if sid == spell and n in values and kind in "sm":
                return text._num(abs(values[n]))
            if sid == spell and n in values and kind == "o":
                e = text._effect(sid, n)
                dur = text.duration.get(sid, 0)
                if not e or not float(e["EffectAuraPeriod"] or 0) or dur <= 0:
                    raise KeyError("o")
                return text._num(abs(values[n]) * dur / float(e["EffectAuraPeriod"]))
            fn = {"s": text._s, "m": text._m, "o": text._o, "t": text._t, "a": text._a}.get(kind)
            v = fn(sid, n) if fn else text._d(sid) if kind == "d" else text.proc.get(sid) if kind == "h" else None
            if v is None:
                raise KeyError(kind)
            return str(v)

        PH = r"\$(\d+)?([smotdahSMOTDAH])(\d)?"

        def ph(m):
            return value(m.group(1) or spell, m.group(2).lower(), int(m.group(3) or 1))

        def number(m):
            return float(ph(m).replace(",", ""))

        try:
            # ${$s1/-1000}.1 and ${$s1*4}: sums on the values, ".1" the decimals to show
            def expr(m):
                body = re.sub(PH, lambda x: ph(x).replace(",", ""), m.group(1))
                if not re.fullmatch(r"[\d.+\-*/() ]+", body):
                    raise KeyError(body)
                v = abs(eval(body))
                return f"{v:.{m.group(3)}f}" if m.group(3) else text._num(v)
            out = re.sub(r"\$\{([^}]*)\}(\.(\d))?", expr, raw)
            # $/1000;S1: a value divided (or multiplied) by a number
            out = re.sub(r"\$([/*])(\d+);(\$?\d*[a-zA-Z]\d?)", lambda m: text._num(
                (lambda v: v / float(m.group(2)) if m.group(1) == "/" else v * float(m.group(2)))(
                    number(re.match(PH, "$" + m.group(3).lstrip("$"))))), out)
            out = re.sub(PH, ph, out)
        except (KeyError, ValueError, ZeroDivisionError, SyntaxError, TypeError, AttributeError):
            unfilled.append((spell, raw[:120]))
            return ""
        if "$" in out:
            unfilled.append((spell, out[:120]))
            return ""
        return re.sub(r"[ \t]+\n", "\n", out.replace("\r", "")).strip()

    os.makedirs(OUT, exist_ok=True)
    spells = set()  # (trait entry, spell, ranks): what /djdump talents reads
    from_game = 0
    for link in T("SkillLineXTraitTree"):
        cls = CLASS_OF_SKILL.get(link["SkillLineID"])
        tree_id = link["TraitTreeID"]
        if not cls:
            continue
        # The three talent trees: the biggest groups that share no node, left to right.
        groups = sorted((g for g in group_nodes if group_tree.get(g) == tree_id), key=lambda g: (-len(group_nodes[g]), int(g)))
        picked = []
        for g in groups:
            if all(not (group_nodes[g] & group_nodes[p]) for p in picked):
                picked.append(g)
            if len(picked) == 3:
                break
        picked.sort(key=lambda g: min(int(nodes[n]["PosX"]) for n in group_nodes[g] if n in nodes))
        tab_rows = sorted((t for t in tabs if int(t["ClassMask"] or 0) == CLASS_MASK[cls]), key=lambda t: int(t["OrderIndex"] or 0))

        trees = []
        for i, g in enumerate(picked):
            members = [nodes[n] for n in group_nodes[g] if n in nodes]
            xs = sorted({int(n["PosX"]) for n in members})
            ys = sorted({int(n["PosY"]) for n in members})
            step = min([b - a for a, b in zip(xs, xs[1:]) if b - a > 50] + [b - a for a, b in zip(ys, ys[1:]) if b - a > 50] or [600])
            x0, y0 = xs[0], ys[0]
            place = {}
            for n in members:
                place[n["ID"]] = (round((int(n["PosY"]) - y0) / step), round((int(n["PosX"]) - x0) / step))
            # the column count from the nodes on the grid, so a leftover cannot widen it
            rows = []
            for n in members:
                r, c = place[n["ID"]]
                if r > MAX_TIER:
                    print(f"  {cls}: left out node {n['ID']} at row {r + 1} (off the tree's grid)")
                    continue
                ents = [entries[e] for _, e in sorted(node_entries[n["ID"]]) if e in entries]
                if not ents:
                    continue
                entry = ents[0]
                d = definitions.get(entry["TraitDefinitionID"], {})
                spell = d.get("SpellID", "0")
                if spell in ("", "0"):
                    continue
                ranks = max(1, int(entry["MaxRanks"] or 1))
                spells.add((int(entry["ID"]), int(spell), ranks))
                per_effect = effect_curves.get(entry["TraitDefinitionID"], {})
                trait = traits.get(entry["ID"]) or {"d": {}}
                texts = [trait["d"].get(rank) or describe(spell, {k: curve_at(v, rank) for k, v in per_effect.items()})
                         for rank in range(1, ranks + 1)]
                from_game += sum(1 for rank in range(1, ranks + 1) if trait["d"].get(rank))
                game = dumped.get(spell) or {}
                if not texts[0] and game.get("d") and (ranks == 1 or not per_effect):
                    texts = [game["d"]] * ranks  # one text, the game's, when nothing changes per rank
                name = d.get("OverrideName_lang") or names.get(spell) or trait.get("n") or game.get("n") or ""
                icon_id = (d.get("OverrideIcon") if d.get("OverrideIcon") not in (None, "", "0")
                           else icon_of_spell.get(spell) or trait.get("i") or game.get("i") or 0)
                rows.append({"id": int(n["ID"]), "s": int(spell), "r": r, "c": c, "n": name, "i": icon(icon_id),
                             "m": ranks, "d": texts})
            on = {e["id"] for e in rows}
            at = {e["id"]: (e["r"], e["c"]) for e in rows}
            for e in rows:
                pre = []
                for a, b in edges:
                    a, b = int(a), int(b)
                    if e["id"] not in (a, b) or a not in on or b not in on:
                        continue
                    other = a if b == e["id"] else b
                    # the edge points from the talent above (or left) to the one that needs it
                    if at[other] < at[e["id"]]:
                        pre.append(list(at[other]))
                if pre:
                    e["p"] = sorted(pre)
            rows.sort(key=lambda e: (e["r"], e["c"]))
            tab = tab_rows[i] if i < len(tab_rows) else {}
            trees.append({"name": tab.get("Name_lang", f"Tree {i + 1}"),
                          "icon": icon(tab.get("SpellIconID", "0")),
                          "talents": rows})

        with open(os.path.join(OUT, f"{cls}.json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump(trees, f, ensure_ascii=False, separators=(",", ":"))
        empty = sum(1 for t in trees for e in t["talents"] for x in e["d"] if not x)
        print(f"{cls}: " + ", ".join(f"{t['name']} ({len(t['talents'])})" for t in trees) + (f"; {empty} rank texts empty" if empty else ""))

    with open(os.path.join(HERE, "DJItemDump", "TalentSpells.lua"), "w", encoding="utf-8", newline="\n") as f:
        f.write("-- Written by scripts/item-dump/talents.py: every talent in WoW Forever's trait trees,\n")
        f.write("-- as { trait entry ID, spell ID, ranks }.\n")
        f.write("DJItemDump_TALENT_ENTRIES = {\n")
        ordered = sorted(spells)
        for i in range(0, len(ordered), 6):
            f.write("    " + " ".join("{ %d, %d, %d }," % row for row in ordered[i:i + 6]) + "\n")
        f.write("}\n")
    print(f"{len(spells)} talents; {from_game} rank texts from the game's talent window (/djdump talents); "
          f"{len(unfilled)} the tables could not fill")
    for spell, raw in unfilled[:25]:
        print("  ", spell, names.get(str(spell), ""), "|", raw)


if __name__ == "__main__":
    main()
