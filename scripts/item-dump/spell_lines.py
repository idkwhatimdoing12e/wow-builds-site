"""Item effect lines ("Equip: ...", "Chance on hit: ...", "Use: ...") built from
the WoW Forever client's own data tables, as wago.tools publishes them.

The in-game dump misses some of these: the client reports a few tooltips
without their spell text however it is asked (Ironforge Greathammer's
"Chance on hit: Blasts a target for 42 Fire damage."). The tables have the
text: ItemXItemEffect -> ItemEffect (trigger, spell, cooldown) -> Spell
(description with $s1, $d, ... placeholders) filled in from SpellEffect,
SpellMisc/SpellDuration, SpellAuraOptions and SpellRadius.

A line is only built when every placeholder resolves; anything the tables
cannot answer is left out rather than shown half filled.
"""
import collections
import csv
import math
import os
import re

# 6 (learn: recipes) is left out: its tooltip says "Teaches you how to make ...",
# not the spell's own text, and the dump always has it.
TRIGGER_PREFIX = {"0": "Use:", "1": "Equip:", "2": "Chance on hit:", "5": "Use:"}
TABLES = ["ItemXItemEffect", "ItemEffect", "Spell", "SpellEffect", "SpellMisc",
          "SpellDuration", "SpellAuraOptions", "SpellRadius"]


def _rows(get_table, name, build):
    return get_table(name, build)


class SpellText:
    def __init__(self, get_table, build):
        t = {name: _rows(get_table, name, build) for name in TABLES}
        self.item_effects = collections.defaultdict(list)
        for r in t["ItemXItemEffect"]:
            self.item_effects[r["ItemID"]].append(r["ItemEffectID"])
        self.effect = {r["ID"]: r for r in t["ItemEffect"]}
        self.desc = {r["ID"]: r.get("Description_lang") or "" for r in t["Spell"]}
        self.spell_effects = collections.defaultdict(dict)
        for r in t["SpellEffect"]:
            if r.get("DifficultyID", "0") == "0":
                self.spell_effects[r["SpellID"]][int(r["EffectIndex"])] = r
        durations = {r["ID"]: int(float(r["Duration"] or 0)) for r in t["SpellDuration"]}
        self.duration = {}
        for r in t["SpellMisc"]:
            if r.get("DifficultyID", "0") == "0" and r["DurationIndex"] not in ("", "0"):
                self.duration[r["SpellID"]] = durations.get(r["DurationIndex"], 0)
        self.proc = {r["SpellID"]: r["ProcChance"] for r in t["SpellAuraOptions"] if r.get("DifficultyID", "0") == "0"}
        self.radius = {r["ID"]: float(r["Radius"] or 0) for r in t["SpellRadius"]}

    # ---- values
    @staticmethod
    def _num(x):
        return f"{x:,.0f}" if abs(x - round(x)) < 1e-6 else f"{x:,.1f}".rstrip("0").rstrip(".")

    def _effect(self, spell, n):
        return self.spell_effects.get(spell, {}).get(n - 1)

    def _scales(self, e):
        """Values that grow with level or stats: the tables alone cannot say what the tooltip shows."""
        return any(float(e.get(k) or 0) for k in ("EffectRealPointsPerLevel", "EffectPointsPerResource", "BonusCoefficientFromAP", "EffectBonusCoefficient"))

    def _s(self, spell, n):
        e = self._effect(spell, n)
        if not e or self._scales(e):
            return None
        base = abs(float(e["EffectBasePointsF"] or 0))
        var = float(e.get("Variance") or 0)
        if var > 0:
            # the game rounds halves to even: 73.5-136.5 is "74 to 136", 22.5-27.5 "22 to 28"
            lo = round(round(base * (1 - var / 2), 4))
            hi = round(round(base * (1 + var / 2), 4))
            if lo != hi:
                return f"{lo:,} to {hi:,}"
        return f"{round(base + 1e-9):,}"

    def _m(self, spell, n):
        e = self._effect(spell, n)
        return self._num(abs(float(e["EffectBasePointsF"] or 0))) if e else None

    def _t(self, spell, n):
        e = self._effect(spell, n)
        if not e or not float(e["EffectAuraPeriod"] or 0):
            return None
        return self._num(float(e["EffectAuraPeriod"]) / 1000)

    def _o(self, spell, n):
        e = self._effect(spell, n)
        dur = self.duration.get(spell, 0)
        if not e or not float(e["EffectAuraPeriod"] or 0) or dur <= 0:
            return None
        ticks = dur / float(e["EffectAuraPeriod"])
        return self._num(abs(float(e["EffectBasePointsF"] or 0)) * ticks)

    def _a(self, spell, n):
        e = self._effect(spell, n)
        if not e:
            return None
        r = self.radius.get(e.get("EffectRadiusIndex_0", ""), 0)
        return self._num(r) if r else None

    def _d(self, spell):
        ms = self.duration.get(spell, 0)
        if ms <= 0:
            return None
        return self.time_text(ms)

    @staticmethod
    def time_text(ms):
        s = ms / 1000
        if s < 60:
            return f"{SpellText._num(s)} sec"
        if s < 3600:
            return f"{SpellText._num(s / 60)} min"
        h = s / 3600
        return f"{SpellText._num(h)} hour" + ("" if h == 1 else "s")

    def resolve(self, spell, text):
        """The description with its placeholders filled in, or None."""
        if not text or "${" in text or "$l" in text or "$g" in text:
            return None

        def sub(m):
            other, kind, n = m.group(1), m.group(2), m.group(3)
            sid = other or spell
            n = int(n) if n else 1
            v = {"s": lambda: self._s(sid, n), "m": lambda: self._m(sid, n), "t": lambda: self._t(sid, n),
                 "o": lambda: self._o(sid, n), "a": lambda: self._a(sid, n), "d": lambda: self._d(sid),
                 "h": lambda: self.proc.get(sid)}.get(kind, lambda: None)()
            if v is None:
                raise KeyError(m.group(0))
            return str(v)

        try:
            out = re.sub(r"\$(\d+)?([smtoadh])(\d)?", sub, text)
        except KeyError:
            return None
        if "$" in out:
            return None
        return out.replace("\r", "").strip()

    def lines(self, item_id):
        """[(prefix, text)] for the item's effects, in the game's order."""
        out = []
        effects = [self.effect[e] for e in self.item_effects.get(str(item_id), []) if e in self.effect]
        effects.sort(key=lambda r: int(r.get("LegacySlotIndex") or 0))
        for r in effects:
            prefix = TRIGGER_PREFIX.get(r["TriggerType"])
            if not prefix:
                continue
            text = self.resolve(r["SpellID"], self.desc.get(r["SpellID"], ""))
            if not text:
                continue
            # only the item's own cooldown: a shared one (potions) is not printed
            cd = int(float(r.get("CoolDownMSec") or 0))
            if prefix == "Use:" and cd > 0:
                text += f" ({self.time_text(cd).replace('sec', 'Sec').replace('min', 'Min').replace('hour', 'Hour')} Cooldown)"
            out.append((prefix, f"{prefix} {text}"))
        return out


GREEN = "#00ff00"


def _blocks_before(line):
    t = line.get("l", "")
    return (
        bool(line.get("price"))
        or t.startswith('"')
        or t.startswith("Requires ")
        or t.startswith("Classes:")
        or bool(re.search(r"\(\d+/\d+\)$", t))
    )


def fill(items, spell_text):
    """Add the effect lines a dumped tooltip lacks. Returns how many were added."""
    added = 0
    for item_id, lines in items.items():
        want = spell_text.lines(item_id)
        if not want:
            continue
        have = [l.get("l", "") for l in lines]
        norm = lambda s: re.sub(r"\s+", " ", s).strip().lower()
        have_norm = {norm(h) for h in have}
        count = collections.Counter(p for p, _ in want)
        have_count = collections.Counter(next((p for p in ("Use:", "Equip:", "Chance on hit:") if h.startswith(p)), None) for h in have)
        new = []
        for prefix, text in want:
            if norm(text) in have_norm:
                continue
            if have_count[prefix] >= count[prefix]:
                continue
            new.append({"l": text, "lc": GREEN})
            have_count[prefix] += 1
        if not new:
            continue
        # after the last effect line already there, else before the set block,
        # flavour text, requirements or the sell price, else at the end
        at = None
        for i, l in enumerate(lines):
            if l.get("l", "").startswith(("Use:", "Equip:", "Chance on hit:")):
                at = i + 1
        if at is None:
            at = next((i for i, l in enumerate(lines) if i > 0 and _blocks_before(l)), len(lines))
            while at > 1 and lines[at - 1].get("l", "") == "":
                at -= 1
        lines[at:at] = new
        added += len(new)
    return added
