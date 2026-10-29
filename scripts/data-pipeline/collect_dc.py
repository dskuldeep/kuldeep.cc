"""New data center projects (announced / under construction since 2024) via Exa.

Run with EXA_LEDGER=ledger-dc.json EXA_PRIOR=0 EXA_CAP=5 so this project has its own spend cap.
Writes raw/dc_projects.json: one row per (project mention, source URL).
"""
import json, os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import exalib as X

START = "2024-01-01"
EXCL = ["linkedin.com", "reddit.com", "x.com", "twitter.com", "facebook.com", "youtube.com", "medium.com", "instagram.com"]
OUT = os.path.join(os.getcwd(), "raw", "dc_projects.json")

SCHEMA = {"type": "object", "properties": {"projects": {"type": "array", "items": {"type": "object", "properties": {
    "name": {"type": "string", "description": "project or campus name as stated (e.g. 'Stargate Abilene', 'Hyperion'); empty if unnamed"},
    "operator": {"type": "string", "description": "developer/owner/operator company"},
    "tenant": {"type": "string", "description": "anchor tenant or end user if stated (e.g. OpenAI, Microsoft), else empty"},
    "city": {"type": "string", "description": "city, town or county where it is being built"},
    "region": {"type": "string", "description": "state / province"},
    "country": {"type": "string"},
    "capacity_mw": {"type": "number", "description": "planned total IT or power capacity in MW (convert GW to MW); omit if not stated"},
    "investment_usd_bn": {"type": "number", "description": "stated investment converted to billions of USD; omit if not stated"},
    "status": {"type": "string", "description": "one of: announced, planned, under construction, operational, cancelled, paused"},
    "announced": {"type": "string", "description": "date announced, YYYY-MM or YYYY-MM-DD"},
    "expected_online": {"type": "string", "description": "expected completion / first capacity date, YYYY or YYYY-MM"},
    "purpose": {"type": "string", "description": "one of: AI training/inference, hyperscale cloud, colocation, enterprise, crypto/HPC conversion, other"},
    "detail": {"type": "string", "description": "one factual sentence: what is being built, power source or notable facts"}}}}}}
QUERY = ("List every specific physical data center or data center campus project described on this page that was announced, "
         "planned, under construction, completed, paused or cancelled since 2024. Only concrete sites with a location; skip "
         "vague national spending pledges with no site. Use only figures stated on the page; never invent numbers.")

US = ["Texas", "Virginia", "Ohio", "Arizona", "Georgia", "Louisiana", "Wyoming", "Pennsylvania", "Indiana", "Wisconsin",
      "North Dakota", "Oklahoma", "Tennessee", "Mississippi", "Nevada", "Utah", "Oregon", "Iowa", "Illinois",
      "North Carolina", "South Carolina", "New Mexico", "Michigan", "Minnesota", "Missouri", "Kentucky", "Alabama",
      "Nebraska", "Kansas", "Washington state", "New York state", "Montana", "Idaho", "Colorado", "Arkansas", "Maryland"]
WORLD = ["United Kingdom", "Ireland", "Germany", "France", "Spain", "Portugal", "Italy", "Norway", "Sweden", "Finland",
         "Denmark", "Iceland", "Netherlands", "Belgium", "Poland", "Croatia", "Greece", "Switzerland", "Austria",
         "India", "Japan", "South Korea", "Malaysia Johor", "Singapore", "Indonesia", "Thailand", "Vietnam",
         "Philippines", "Taiwan", "China", "Australia", "New Zealand", "UAE Abu Dhabi", "Saudi Arabia", "Qatar",
         "Israel", "Egypt", "Kenya", "Nigeria", "South Africa", "Morocco", "Brazil", "Chile", "Mexico", "Colombia",
         "Argentina", "Canada", "Kazakhstan", "Uzbekistan", "Turkey"]
OPS = ["OpenAI Stargate", "Microsoft Fairwater", "Meta Hyperion Prometheus", "xAI Colossus", "Amazon AWS", "Google",
       "Oracle", "CoreWeave", "Crusoe", "Nebius", "Lambda", "Equinix", "Digital Realty", "QTS", "Vantage Data Centers",
       "Aligned Data Centers", "Stack Infrastructure", "CyrusOne", "EdgeConneX", "NTT Data", "AirTrunk", "Iron Mountain",
       "Switch", "Applied Digital", "IREN", "Core Scientific", "TeraWulf", "Galaxy Helios", "Nscale", "Humain",
       "G42 Stargate UAE", "Reliance Jamnagar", "Adani", "Yotta", "Tract", "Tallgrass", "Fermi America", "Poolside",
       "Anthropic", "Fluidstack", "Cipher Mining", "Hut 8", "Blue Owl", "Brookfield", "Scala Data Centers",
       "Khazna", "Princeton Digital Group", "STT GDC", "Data4", "atNorth", "Verne", "Kevlinx", "Prime Data Centers",
       "Sabey", "Compass Datacenters", "Edged", "PowerHouse", "Related Digital", "Vantage Frontier"]
THEMES = ["gigawatt AI data center campus announced", "largest data center ever built", "data center project cancelled",
          "data center rejected by county", "data center paused", "nuclear powered data center project",
          "natural gas powered AI data center campus", "data center under construction 2026",
          "hyperscale data center groundbreaking", "AI factory data center announced", "sovereign AI data center"]

def queries():
    q = [f"new data center campus {s} announced" for s in US]
    q += [f"new data center {c} construction announced" for c in WORLD]
    q += [f"{o} new data center campus location" for o in OPS]
    return q + THEMES

def run(q):
    r = X.search(q, n=10, summary=QUERY, schema=SCHEMA, start=START, exclude_domains=EXCL, kind="dc")
    rows = []
    for res in r.get("results", []):
        s = X.parse_summary(res) or {}
        for p in s.get("projects") or []:
            if not isinstance(p, dict): continue
            p.update(sourceUrl=res.get("url"), sourceTitle=res.get("title"), published=(res.get("publishedDate") or "")[:10], query=q)
            rows.append(p)
    return rows

if __name__ == "__main__":
    qs = queries()[: int(sys.argv[1])] if len(sys.argv) > 1 else queries()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with ThreadPoolExecutor(6) as ex:
        rows = [row for batch in ex.map(run, qs) for row in batch]
    json.dump(rows, open(OUT, "w"), indent=1)
    print(len(qs), "queries,", len(rows), "project mentions, spent $%.3f" % X.spent())
