# Site data pipeline

`data/journal.json` is generated from the Dungeon Journal addon's own data files.
Never edit it by hand — fix the addon's Lua and regenerate.

```bash
pip install lupa
python3 scripts/lua-to-json.py "C:/Program Files (x86)/World of Warcraft/_classic_beta_/Interface/AddOns/ForeverDungeonJournal"
git add data/journal.json && git commit -m "data: journal from addon 1.x.y"
```

Pushing to `main` redeploys the site on Vercel. Run this after every addon release
so the website and the addon ship the same data on the same day.

Site-wide constants (domain, links, item-link rules) live in `app/lib/site.ts`.
Supporter names for `/supporters` live in `data/supporters.json`.
Ad units: create a responsive display unit in AdSense and set
`NEXT_PUBLIC_ADSENSE_SLOT_CONTENT=<slot id>` in Vercel's environment variables;
until it is set the ad slots render nothing.
