"""Every OpenStreetMap feature tagged as a data center, from the QLever OSM planet SPARQL endpoint.

  python3 collect_osm_dc.py            -> raw/osm_dc.json (one element per feature: type, id, lat, lon, tags)

QLever answers the whole planet in one query (~10 s); the public Overpass servers time out on it.
Data © OpenStreetMap contributors, ODbL 1.0. No API cost.
"""
import csv, io, json, os, re, urllib.parse, urllib.request

ENDPOINT = "https://qlever.dev/api/osm-planet"
OUT = os.path.join("raw", "osm_dc.json")
TAGS = ["name", "name:en", "operator", "brand", "owner", "disused"]
QUERY = """PREFIX osmkey: <https://www.openstreetmap.org/wiki/Key:>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
SELECT ?osm %s (geof:centroid(?wkt) AS ?c) WHERE {
  { ?osm osmkey:telecom "data_center" } UNION { ?osm osmkey:building "data_center" } UNION { ?osm osmkey:industrial "data_center" }
  ?osm geo:hasGeometry/geo:asWKT ?wkt .
  %s
}""" % (" ".join(f"?t{i}" for i in range(len(TAGS))),
        " ".join(f"OPTIONAL {{ ?osm <https://www.openstreetmap.org/wiki/Key:{t}> ?t{i} }}" for i, t in enumerate(TAGS)))

def literal(v):
    v = v.strip()
    if v.startswith('"'):
        v = v[1 : v.rindex('"')]
    return v.encode().decode("unicode_escape").encode("latin-1").decode("utf-8") if "\\" in v else v

if __name__ == "__main__":
    os.makedirs("raw", exist_ok=True)
    req = urllib.request.Request(ENDPOINT, data=urllib.parse.urlencode({"query": QUERY}).encode(),
                                 headers={"Accept": "text/tab-separated-values", "User-Agent": "kuldeep.cc data research (mail@kuldeep.cc)"})
    tsv = urllib.request.urlopen(req, timeout=300).read().decode()
    els = {}
    for row in list(csv.reader(io.StringIO(tsv), delimiter="\t", quoting=csv.QUOTE_NONE))[1:]:
        m = re.match(r"<https://www.openstreetmap.org/(node|way|relation)/(\d+)>", row[0])
        p = re.match(r"POINT\(([-\d.]+) ([-\d.]+)\)", row[-1])
        if not m or not p:
            continue
        key = f"{m[1]}/{m[2]}"
        e = els.setdefault(key, {"type": m[1], "id": int(m[2]), "lon": float(p[1]), "lat": float(p[2]), "tags": {}})
        for t, v in zip(TAGS, row[1:-1]):
            if v and t not in e["tags"]:      # several values for one key: keep the first
                e["tags"][t] = literal(v)
    json.dump(list(els.values()), open(OUT, "w"), ensure_ascii=False)
    print(len(els), "features")
