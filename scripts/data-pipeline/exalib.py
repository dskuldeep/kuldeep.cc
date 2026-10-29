"""Exa client with on-disk cache and a hard spend ledger."""
import hashlib, json, os, sys, time, threading, urllib.request, urllib.error
LOCK = threading.Lock()
HERE = os.path.dirname(os.path.abspath(__file__))
KEY = os.environ["EXA_KEY"]
# Each dataset project gets its own ledger and cap (EXA_LEDGER / EXA_CAP).
LEDGER = os.path.join(HERE, os.environ.get("EXA_LEDGER", "ledger.json"))
PRIOR = float(os.environ.get("EXA_PRIOR", "0.245"))   # spent before the ledger existed
CAP = float(os.environ.get("EXA_CAP", "5.00"))        # total hard cap, USD

def spent():
  with LOCK:
    if not os.path.exists(LEDGER): return PRIOR
    return PRIOR + sum(e["cost"] for e in json.load(open(LEDGER)))

def _log(kind, key, cost):
  with LOCK:
    data = json.load(open(LEDGER)) if os.path.exists(LEDGER) else []
    data.append({"kind": kind, "key": key, "cost": cost, "t": time.time()})
    tmp = LEDGER + ".tmp"
    json.dump(data, open(tmp, "w")); os.replace(tmp, LEDGER)

def _post(path, body, kind, key):
    h = hashlib.sha1((path + json.dumps(body, sort_keys=True)).encode()).hexdigest()
    cp = os.path.join(HERE, "cache", h + ".json")
    if os.path.exists(cp): return json.load(open(cp))
    if spent() > CAP - 0.05:
        raise SystemExit(f"BUDGET CAP reached: ${spent():.3f}")
    for attempt in range(4):
        try:
            req = urllib.request.Request("https://api.exa.ai" + path, data=json.dumps(body).encode(),
                headers={"x-api-key": KEY, "Content-Type": "application/json"})
            r = json.load(urllib.request.urlopen(req, timeout=120))
            break
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(2 * (attempt + 1)); continue
            print("HTTP", e.code, msg, file=sys.stderr); return {"results": []}
        except Exception as e:
            if attempt < 3: time.sleep(2); continue
            print("ERR", e, file=sys.stderr); return {"results": []}
    cost = (r.get("costDollars") or {}).get("total", 0.02)
    _log(kind, key, cost)
    json.dump(r, open(cp, "w"))
    return r

def search(query, n=10, summary=None, schema=None, text=False, start=None, include_domains=None, exclude_domains=None, kind="search"):
    body = {"query": query, "numResults": n, "type": "auto"}
    if start: body["startPublishedDate"] = start
    if include_domains: body["includeDomains"] = include_domains
    if exclude_domains: body["excludeDomains"] = exclude_domains
    contents = {}
    if summary:
        contents["summary"] = {"query": summary, **({"schema": schema} if schema else {})}
    if text: contents["text"] = {"maxCharacters": text if isinstance(text, int) else 20000}
    if contents: body["contents"] = contents
    return _post("/search", body, kind, query)

def contents(urls, summary=None, schema=None, text=False, kind="contents"):
    body = {"urls": urls}
    if summary: body["summary"] = {"query": summary, **({"schema": schema} if schema else {})}
    if text: body["text"] = {"maxCharacters": text if isinstance(text, int) else 30000}
    return _post("/contents", body, kind, ",".join(urls)[:200])

def parse_summary(res):
    s = res.get("summary")
    if not s: return None
    try: return json.loads(s)
    except Exception: return None
