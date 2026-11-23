"""Tooltips for the Tier Sets pieces the in-game dump does not have yet.

    python scripts/item-dump/tier-tooltips.py

Forever's Tier 0.5 items (Systems/TierSets.lua) are hotfix items: /djdump has
not seen them, so data/item-tooltips.json has no lines for them. This reads
each one's tooltip from Wowhead's tooltip service for WoW Forever (dataEnv 16)
and turns its HTML into the same lines the dump writes ({l, lc, r, rc, price}).
Writes data/tier-tooltips.json: { "<id>": [lines] }. A later /djdump, which
fills item-tooltips.json, takes precedence on the site.

Run after tier-items.py.
"""
import concurrent.futures
import html.parser
import json
import os
import re
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(ROOT, "data", "tier-tooltips.json")

WHITE = "#ffffff"
# Wowhead's tooltip classes, as the game colours them.
COLORS = {
    "q": "#ffd100",
    "q0": "#9d9d9d",
    "q1": "#ffffff",
    "q2": "#1eff00",
    "q3": "#0070dd",
    "q4": "#a335ee",
    "q5": "#ff8000",
}
VOID = {"br", "img", "hr"}


class Lines(html.parser.HTMLParser):
    """Wowhead tooltip HTML -> the dump's lines."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lines = []
        self.stack = []  # (tag, colour or None)
        self.left, self.lc = "", None
        self.right, self.rc = "", None
        self.on_right = False
        self.money = None  # the coin being read in the sell price
        self.copper = None
        self.si = None  # the set piece's IDs, from Wowhead's <!--si...--> mark
        self.line_si = []  # one entry per line: its set piece IDs or None

    def handle_comment(self, data):
        m = re.match(r"si([\d:]+)$", data)
        if m:
            self.si = [int(x) for x in m.group(1).split(":")]

    def colour(self):
        for _, c in reversed(self.stack):
            if c:
                return c
        return WHITE

    def flush(self):
        left, right = self.left.strip(), self.right.strip()
        if self.copper is not None:
            self.lines.append({"l": "Sell Price:", "lc": WHITE, "price": self.copper})
            self.line_si.append(None)
        elif left or right:
            line = {"l": left, "lc": self.lc or WHITE}
            if right:
                line.update(r=right, rc=self.rc or WHITE)
            self.lines.append(line)
            self.line_si.append(self.si)
        self.si = None
        self.left, self.lc, self.right, self.rc = "", None, "", None
        self.on_right = False
        self.copper = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = (a.get("class") or "").split()
        if tag in VOID:
            if tag == "br":
                self.flush()
            return
        if tag in ("div", "table", "tr"):
            self.flush()
        if tag == "th":
            self.on_right = True
        if "whtt-sellprice" in classes:
            self.copper = 0
        for coin in ("moneygold", "moneysilver", "moneycopper"):
            if coin in classes:
                self.money = coin
        c = next((COLORS[k] for k in classes if k in COLORS), None)
        self.stack.append((tag, c))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        while self.stack:
            t, _ = self.stack.pop()
            if t == tag:
                break
        if tag in ("div", "table", "tr"):
            self.flush()
        if tag == "span":
            self.money = None

    def handle_data(self, data):
        if self.copper is not None:
            if self.money and data.strip().isdigit():
                n = int(data.strip())
                self.copper += n * {"moneygold": 10000, "moneysilver": 100, "moneycopper": 1}[self.money]
            return
        text = re.sub(r"\s+", " ", data)
        if not text.strip() and not (self.right if self.on_right else self.left):
            return
        if self.on_right:
            if self.rc is None and text.strip():
                self.rc = self.colour()
            self.right += text
        else:
            if self.lc is None and text.strip():
                self.lc = self.colour()
            self.left += text


def tooltip_lines(markup, version=(), names=None):
    """`version`: the IDs of the item's own set version, whose names the set's
    piece list should show (Wowhead names each piece after one version)."""
    p = Lines()
    p.feed(markup)
    p.flush()
    out = []
    for line, si in zip(p.lines, p.line_si):
        if si and names:
            own = next((i for i in si if i in version and str(i) in names), None)
            if own:
                line["l"] = names[str(own)][0]
        # The game's Classic tooltip shows no item level.
        if line["l"].startswith("Item Level"):
            continue
        line["l"] = line["l"].replace("Set :", "Set:")
        out.append(line)
    # A gap before the set's name, as the game shows it.
    for i, line in enumerate(out):
        if i > 1 and re.search(r"\(\d+/\d+\)$", line["l"]):
            out.insert(i, {"l": ""})
            break
    return out


def main():
    tier = json.load(open(os.path.join(ROOT, "data", "tier-items.json"), encoding="utf-8"))
    dumped = (json.load(open(os.path.join(ROOT, "data", "item-tooltips.json"), encoding="utf-8")).get("items") or {})
    wanted = sorted((int(i) for i in tier if i not in dumped))
    journal = json.load(open(os.path.join(ROOT, "data", "journal.json"), encoding="utf-8"))
    version_of = {}
    for s in ((journal.get("TIER_SETS") or {}).get("tier05") or {}).values():
        for v in s.get("versions", []):
            ids = set(int(x) for x in v.get("items", []))
            for x in ids:
                version_of[x] = ids
    out = {}

    def one(i):
        url = f"https://nether.wowhead.com/tooltip/item/{i}?dataEnv=16&locale=0"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "dungeon-journal-site/1.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                j = json.loads(r.read())
            lines = tooltip_lines(j.get("tooltip") or "", version_of.get(i, set()), tier)
            if lines:
                out[str(i)] = lines
        except Exception as err:
            print(f"  {i}: {err}", flush=True)

    # The service is slow to answer each request, not to serve many: a few at a time.
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(one, wanted))
    out = dict(sorted(out.items(), key=lambda kv: int(kv[0])))
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"{len(wanted)} pieces without a dumped tooltip, {len(out)} written -> {OUT}")
    missing = [i for i in wanted if str(i) not in out]
    if missing:
        print("no tooltip:", missing)


if __name__ == "__main__":
    main()
