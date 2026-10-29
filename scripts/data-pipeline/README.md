# Data pipeline for /data

Regenerates the JSON in `src/data/`. Python 3, stdlib only. Run from a scratch directory, not the repo
(raw downloads and the Exa cache are large and untracked).

| Step | Script | Output |
| --- | --- | --- |
| Exa search + structured extraction (cached, hard spend cap in `exalib.py`) | `collect_ads.py`, `collect_engines.py` | `raw/*.json` |
| Normalise + dedupe ChatGPT Ads figures | `norm_bench.py` → `curate_bench.py` | `bench_curated.json` |
| Curate advertisers / timeline | `curate_adv.py`, `curate_time.py` | `adv_curated.json`, `time_curated.json` |
| Hand-curated engine + crawler facts | `engines.py`, `crawlers.py` | (imported) |
| Build site datasets | `build_data.py <repo>/src/data` | `chatgpt-ads-*.json`, `ai-*.json` |
| New data center projects via Exa (own ledger: `EXA_LEDGER=ledger-dc.json EXA_PRIOR=0 EXA_CAP=5`) | `collect_dc.py` | `raw/dc_projects.json` |
| Merge, dedupe, geocode (Nominatim, cached) | `build_dc.py <repo>/src/data` | `datacenters-new.json` |
| OpenStreetMap data centers (Overpass, world tiles, no API cost, ODbL) | `collect_osm_dc.py` → `node build_osm_dc.mjs <repo>` | `datacenters-existing.json` |
| robots.txt / llms.txt study (Tranco top 10k, no API cost) | `fetch.py top10k.csv` → `analyze.py <repo>/src/data` | `robots-study.json` |

Scripts expect the layout `exa/`, `build/`, `study/`, `free/` side by side (see path constants at the top
of each). Exa needs `EXA_KEY` in the environment; `free/robots.json` is
https://raw.githubusercontent.com/ai-robots-txt/ai.robots.txt/main/robots.json and `free/top10k.csv` is
the first 10,000 rows of https://tranco-list.eu/top-1m.csv.zip.

After rebuilding, bump `UPDATED` in `build_data.py` / `analyze.py` so pages, sitemap and JSON-LD show
the new date.
