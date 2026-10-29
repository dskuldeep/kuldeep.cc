"""Merge Exa project mentions into one row per data center project, geocode, write the site dataset.

  python3 build_dc.py <repo>/src/data        (run in the directory holding raw/dc_projects.json)

Geocoding uses OpenStreetMap Nominatim at 1 request/second with an on-disk cache (raw/geocode.json).
Coordinates are city-level: good for a world map, not for site visits.
"""
import collections, json, os, re, sys, time, urllib.parse, urllib.request

UPDATED = "2026-10-29"
START = "2024-01-01"
RAW = os.path.join("raw", "dc_projects.json")
GEO = os.path.join("raw", "geocode.json")

STATUS = {
    "announced": "announced", "proposed": "announced", "planned": "planned", "planning": "planned",
    "approved": "planned", "permitted": "planned", "under construction": "under construction",
    "construction": "under construction", "in construction": "under construction", "building": "under construction",
    "operational": "operational", "completed": "operational", "live": "operational", "online": "operational",
    "cancelled": "cancelled", "canceled": "cancelled", "rejected": "cancelled", "withdrawn": "cancelled",
    "scrapped": "cancelled", "paused": "paused", "on hold": "paused", "delayed": "paused",
}
COUNTRY = {
    "usa": "United States", "us": "United States", "u.s.": "United States", "united states of america": "United States",
    "uk": "United Kingdom", "england": "United Kingdom", "scotland": "United Kingdom", "wales": "United Kingdom",
    "northern ireland": "United Kingdom", "uae": "United Arab Emirates", "u.a.e.": "United Arab Emirates",
    "korea": "South Korea", "republic of korea": "South Korea", "ksa": "Saudi Arabia", "kingdom of saudi arabia": "Saudi Arabia",
    "czechia": "Czech Republic", "the netherlands": "Netherlands", "holland": "Netherlands", "türkiye": "Turkey",
    "viet nam": "Vietnam", "russian federation": "Russia", "prc": "China", "people's republic of china": "China",
    "日本": "Japan", "中国": "China", "대한민국": "South Korea", "한국": "South Korea", "deutschland": "Germany",
    "台灣": "Taiwan", "臺灣": "Taiwan", "中國": "China", "宁夏": "China", "казахстан": "Kazakhstan", "schweiz": "Switzerland",
    "suisse": "Switzerland", "españa": "Spain", "italia": "Italy", "brasil": "Brazil", "méxico": "Mexico", "polska": "Poland",
}
# Multi-site programme names: a shared one doesn't make two sites the same project
PROGRAMS = {"stargate", "fairwater", "colossus", "project", "gigawatt", "texas", "energy", "power", "technology", "innovation", "industrial", "american", "national", "sovereign"}
PLACE_WORDS = {"county", "parish", "city", "north", "south", "east", "west", "new", "san", "port", "lake", "park",
               "area", "near", "fort", "mount", "saint", "st", "el", "la", "los", "las", "de", "del"}
US_STATES = {"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado",
    "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois",
    "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania",
    "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"}
PURPOSE = ["AI training/inference", "hyperscale cloud", "colocation", "enterprise", "crypto/HPC conversion"]
GENERIC = set("the a an of in at and data center centre centers centres datacenter datacenters campus campuses project "
              "facility site park hub new ai hyperscale gigawatt mw gw phase expansion development county city".split())
CORP = re.compile(r"\b(inc|llc|ltd|limited|corp|corporation|co|plc|group|holdings|technologies|technology|platforms|"
                  r"data centers?|datacenters?|digital|infrastructure|cloud|services|the)\b\.?")

def clean(s):
    return (s or "").strip() if isinstance(s, str) else ""

def norm(s):
    return re.sub(r"[^a-z0-9 ]", " ", clean(s).lower()).split()

def tokens(s, extra=()):
    return {t for t in norm(s) if t not in GENERIC and t not in extra and len(t) > 1}

def op_tokens(s):
    return set(CORP.sub(" ", " ".join(norm(s))).split()) - GENERIC

def country(s):
    c = re.sub(r",\s*(united states|usa|us)$", "", clean(s), flags=re.I)
    if c in US_STATES.values() or c.upper() in US_STATES:
        return "United States"
    return COUNTRY.get(c.lower(), c)

def region(s, c):
    r = clean(s)
    return US_STATES.get(r.upper(), r) if c == "United States" else r

def city(s, reg=""):
    c = re.sub(r"\(.*?\)", "", clean(s))
    c = re.sub(r"^(near|outside|around)\s+", "", c, flags=re.I)
    c = re.sub(r"\s+(area|region)$", "", c.strip(), flags=re.I)
    if reg and c.lower().endswith(", " + reg.lower()):
        c = c[: -len(reg) - 2]
    if re.fullmatch(r"(unknown|undisclosed|tbd|n/?a|not specified|various|multiple)?", c, re.I):
        return ""
    return c.split(",")[0].strip()

def num(v):
    try:
        f = float(v)
        return f if f > 0 else None
    except (TypeError, ValueError):
        return None

def date(s):
    m = re.match(r"(\d{4})(-\d{2})?(-\d{2})?", clean(s))
    return m.group(0) if m else None

def usable(m):
    if re.search(r"\(general\)|\bprogram(me)?\b|\bportfolio\b", m["name"], re.I):
        return False
    if re.search(r"\b(solar|wind farm|battery storage|power plant|substation)\b", m["name"], re.I) and not re.search(
            r"\b(data|compute|computing|ai)\b", m["name"], re.I):
        return False
    if not m["city"] and (not m["region"] or m["region"].lower() == m["country"].lower()):
        return False
    if not m["country"] or not (m["city"] or m["region"]) or not m["operator"]:
        return False
    if re.search(r"\bexisting\b|\bunnamed\b|\bvarious\b|\bmultiple\b|\bundisclosed location\b", f'{m["name"]} {m["city"]}', re.I):
        return False
    # "New builds" = announced, started or completed since 2024
    stamps = [d for d in (m["announced"], m["expected_online"]) if d]
    if m["status"] == "operational" and not any(d >= "2024" for d in stamps):
        return False
    if m["announced"] and m["announced"] < "2023" and m["status"] in ("announced", "planned"):
        return False
    return True

def load():
    out = []
    for r in json.load(open(RAW)):
        c = country(r.get("country"))
        reg = region(r.get("region"), c)
        st = STATUS.get(clean(r.get("status")).lower())
        if not st:
            continue
        m = {
            "name": clean(r.get("name")), "operator": clean(r.get("operator")), "tenant": clean(r.get("tenant")),
            "city": city(r.get("city"), reg), "region": reg, "country": c,
            "mw": num(r.get("capacity_mw")), "usd": num(r.get("investment_usd_bn")), "status": st,
            "announced": date(r.get("announced")), "expected_online": date(r.get("expected_online")),
            "purpose": clean(r.get("purpose")), "detail": clean(r.get("detail")),
            "url": r.get("sourceUrl"), "title": clean(r.get("sourceTitle")), "published": r.get("published") or None,
        }
        if m["mw"] and m["mw"] > 20000: m["mw"] = None      # unit slips (kW read as MW)
        # Millions or local currency read as USD billions: real builds cost ~$0.01-0.05B per MW
        if m["usd"] and (m["usd"] > 100 if not m["mw"] else m["usd"] / m["mw"] > 0.1):
            m["usd"] = None
        if re.search(r"[^\x00-\u024f\u2010-\u2027\s]", m["name"] + m["operator"] + m["city"] + m["country"]):
            continue
        if "/" in m["country"]:
            continue
        if usable(m):
            out.append(m)
    return out

def same(a, b):
    """Two mentions describe the same project: same place and a shared operator, tenant or name."""
    if a["country"] != b["country"]:
        return False
    ra, rb = set(norm(a["region"])) - PLACE_WORDS, set(norm(b["region"])) - PLACE_WORDS
    if ra and rb and not any(x[:6] == y[:6] for x in ra for y in rb):   # "Pomerania" ~ "Pomeranian Voivodeship"
        return False
    pa, pb = norm(a["city"]) or norm(a["region"]), norm(b["city"]) or norm(b["region"])
    place = set(pa) | set(pb)
    na, nb = tokens(a["name"], place), tokens(b["name"], place)
    # Named campuses ("Hyperion", "Stargate") match across differently reported towns in the same state
    if a["region"] and {t for t in na & nb if len(t) >= 5} - op_tokens(a["operator"]) - PROGRAMS:
        return True
    if not pa or not pb or (set(pa) - PLACE_WORDS).isdisjoint(set(pb) - PLACE_WORDS):
        return False
    oa = op_tokens(a["operator"]) | op_tokens(a["tenant"])
    ob = op_tokens(b["operator"]) | op_tokens(b["tenant"])
    return bool(oa & ob) or bool(na & nb) or bool(na & ob) or bool(nb & oa)

def mode(values):
    vals = [v for v in values if v not in (None, "")]
    return collections.Counter(vals).most_common(1)[0][0] if vals else None

def merge(group):
    group.sort(key=lambda m: m["published"] or "", reverse=True)       # latest first
    loc = mode([(m["city"], m["region"], m["country"]) for m in group])
    # Identity and figures come from mentions at the chosen location, so one row never mixes two articles' sites
    core = [m for m in group if (m["city"], m["region"], m["country"]) == loc] or group
    latest = group[0]
    # Status evolves: trust the latest dated source, except a later "announced" never undoes construction.
    rank = {"announced": 0, "planned": 1, "under construction": 2, "operational": 3, "paused": 4, "cancelled": 5}
    status = latest["status"]
    if status in ("announced", "planned"):
        status = max((m["status"] for m in group if m["status"] in ("announced", "planned", "under construction", "operational")), key=rank.get)
    names = [m["name"] for m in core if m["name"] and not re.search(r"\b(in|near)\b", m["name"], re.I)]
    name = mode(names) or f'{mode([m["operator"] for m in core])} {loc[0] or loc[1]}'
    purpose = mode([m["purpose"] for m in group if m["purpose"] in PURPOSE]) or "other"
    sources, seen = [], set()
    for m in group:
        if m["url"] and m["url"] not in seen:
            seen.add(m["url"])
            sources.append({"url": m["url"], "title": m["title"], "published": m["published"]})
    return {
        "name": name.strip(),
        "operator": mode([m["operator"] for m in core]),
        "tenant": mode([m["tenant"] for m in core]) or "",
        "city": loc[0],
        "region": loc[1],
        "country": loc[2],
        "capacityMw": mode([m["mw"] for m in core]),
        "investmentUsdBn": mode([m["usd"] for m in core]),
        "status": status,
        "purpose": purpose,
        "announced": min((m["announced"] for m in group if m["announced"]), default=None),
        "expectedOnline": mode([m["expected_online"] for m in core]),
        "detail": next((m["detail"] for m in core if m["detail"]), ""),
        "sources": sources[:6],
    }

def open_meteo(p, cache):
    """GeoNames-backed town search (fast, no key). Only accepts a match in the right country (and state, if given)."""
    key = f'om:{p["city"]}|{p["region"]}|{p["country"]}'
    if key not in cache:
        url = "https://geocoding-api.open-meteo.com/v1/search?" + urllib.parse.urlencode(
            {"name": p["city"], "count": 10, "language": "en", "format": "json"})
        try:
            res = json.load(urllib.request.urlopen(url, timeout=30)).get("results") or []
        except Exception as e:
            print("open-meteo", p["city"], e, file=sys.stderr)
            res = []
        reg = p["region"].lower()
        hits = [r for r in res if country(r.get("country", "")) == p["country"]]
        if reg:
            hits = [r for r in hits if reg in (r.get("admin1") or "").lower() or (r.get("admin1") or "").lower() in reg] or (
                hits if len(hits) == 1 else [])
        cache[key] = [hits[0]["latitude"], hits[0]["longitude"], p["country"]] if hits else None
        time.sleep(0.15)
    return cache[key]

def geocode(p, cache):
    if p["city"]:
        hit = open_meteo(p, cache)
        if hit:
            return hit
    tries = []
    if p["city"]:
        tries.append(", ".join(x for x in (p["city"], p["region"], p["country"]) if x))
        tries.append(f'{p["city"]}, {p["country"]}')
    if p["region"]:
        tries.append(f'{p["region"]}, {p["country"]}')
    for q in tries:
        if q not in cache:
            url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
                {"q": q, "format": "json", "limit": 1, "addressdetails": 1, "accept-language": "en"})
            req = urllib.request.Request(url, headers={"User-Agent": "kuldeep.cc data research (mail@kuldeep.cc)"})
            try:
                res = json.load(urllib.request.urlopen(req, timeout=30))
                cache[q] = [float(res[0]["lat"]), float(res[0]["lon"]), res[0].get("address", {}).get("country", "")] if res else None
            except Exception as e:
                print("geocode", q, e, file=sys.stderr)
                cache[q] = None
            json.dump(cache, open(GEO, "w"))
            time.sleep(1.1)
        hit = cache[q]
        # Reject a match in the wrong country (ambiguous town names)
        if hit and (not hit[2] or country(hit[2]) == p["country"] or p["country"] in hit[2]):
            return hit
    return None

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:60]

if __name__ == "__main__":
    out_dir = sys.argv[1]
    mentions = load()
    groups = []
    for m in mentions:
        for g in groups:
            if any(same(m, x) for x in g):
                g.append(m)
                break
        else:
            groups.append([m])
    projects = [merge(g) for g in groups]
    cache = json.load(open(GEO)) if os.path.exists(GEO) else {}
    rows, ids = [], set()
    for p in projects:
        ll = geocode(p, cache)
        if not ll:
            continue
        p["lat"], p["lng"] = round(ll[0], 4), round(ll[1], 4)
        base = slug(f'{p["operator"]} {p["city"] or p["region"]} {p["country"]}')
        pid, n = base, 2
        while pid in ids:
            pid, n = f"{base}-{n}", n + 1
        ids.add(pid)
        rows.append({"id": pid, **p})
    rows.sort(key=lambda p: (-(p["capacityMw"] or 0), p["name"]))
    json.dump({"updated": UPDATED, "rows": rows}, open(os.path.join(out_dir, "datacenters-new.json"), "w"), indent=1, ensure_ascii=False)
    print(f"{len(mentions)} mentions -> {len(projects)} projects -> {len(rows)} geocoded")
