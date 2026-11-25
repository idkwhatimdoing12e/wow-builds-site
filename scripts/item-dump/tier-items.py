"""Names and quality for the Tier Sets pieces and PvP items the journal's data does not name.

    python scripts/item-dump/tier-items.py

Tier 0.5 on WoW Forever is a set of new items (Forever's own Dungeon Set 2):
the addon only has their IDs (Systems/TierSets.lua) and reads names from the
game. This reads them from the WoW Forever client's ItemSparse table as
wago.tools publishes it, for every Tier Sets piece that data/item-game.json
(the in-game dump) does not have yet. Forever's Tier 0.5 items come to the
game as hotfixes and are not in the published table: for those, Wowhead's
tooltip service for WoW Forever (dataEnv 16). Writes data/tier-items.json:
{ "<id>": [name, quality] }. A later /djdump supersedes it.

Run after lua-to-json.py; fetch-icons.py fetches their icons.
"""
import importlib.util
import json
import os
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from pvp_ids import pvp_item_ids  # noqa: E402
OUT = os.path.join(ROOT, "data", "tier-items.json")


def load_fetch():
    spec = importlib.util.spec_from_file_location("fetch_icons", os.path.join(HERE, "fetch-icons.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    journal = json.load(open(os.path.join(ROOT, "data", "journal.json"), encoding="utf-8"))
    game = json.load(open(os.path.join(ROOT, "data", "item-game.json"), encoding="utf-8"))
    tier = journal.get("TIER_SETS") or {}
    ids = set()
    for s in (tier.get("tier0") or {}).values():
        ids.update(int(i) for i in s.get("items", []))
    for s in (tier.get("tier05") or {}).values():
        for v in s.get("versions", []):
            ids.update(int(i) for i in v.get("items", []))
    # The PvP pages' items (most are Forever's own: the Premier sets, the
    # Darkspear Islands rewards) are named the same way.
    ids |= pvp_item_ids(journal)
    wanted = {i for i in ids if str(i) not in game}
    out = {}
    if wanted:
        fetch = load_fetch()
        build = fetch.latest_forever_build()
        for row in fetch.table("ItemSparse", build):
            i = int(row.get("ID") or 0)
            if i in wanted:
                out[str(i)] = [row.get("Display_lang", "").strip(), int(row.get("OverallQualityID") or 1)]
    # Not in the client's table: Wowhead's WoW Forever tooltips.
    for i in sorted(wanted - {int(k) for k in out}):
        url = f"https://nether.wowhead.com/tooltip/item/{i}?dataEnv=16&locale=0"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "dungeon-journal-site/1.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                j = json.loads(r.read())
            if j.get("name"):
                out[str(i)] = [j["name"], int(j.get("quality") or 1)]
        except Exception as err:
            print(f"  {i}: {err}")
        time.sleep(0.25)
    missing = sorted(wanted - {int(k) for k in out})
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(dict(sorted(out.items(), key=lambda kv: int(kv[0]))), f, ensure_ascii=False, indent=1)
    print(f"{len(ids)} tier pieces, {len(wanted)} not in item-game.json, {len(out)} named -> {OUT}")
    if missing:
        print("not in ItemSparse:", missing)


if __name__ == "__main__":
    main()
