import csv, json, os, ssl, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
HERE=os.path.dirname(os.path.abspath(__file__))
UA="Mozilla/5.0 (compatible; kuldeep.cc-research/1.0; +https://kuldeep.cc/data/methodology)"
ctx=ssl.create_default_context()
def get(url, limit=300_000):
    req=urllib.request.Request(url, headers={"User-Agent":UA,"Accept":"text/plain,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as r:
            t0=time.time(); chunks=[]; n=0
            while n<limit:
                c=r.read(16384)
                if not c: break
                chunks.append(c); n+=len(c)
                if time.time()-t0>12: break
            body=b"".join(chunks)
            return {"status":r.status,"final":r.geturl(),"ctype":r.headers.get("content-type",""),"body":body.decode("utf-8","replace")}
    except urllib.error.HTTPError as e:
        return {"status":e.code,"final":url,"ctype":"","body":""}
    except Exception as e:
        return {"status":0,"final":url,"ctype":"","body":"","err":type(e).__name__}
def one(row):
    rank, dom = int(row[0]), row[1]
    out={"rank":rank,"domain":dom}
    for name in ("robots.txt","llms.txt"):
        r=get(f"https://{dom}/{name}")
        if r["status"]==0:
            r=get(f"https://www.{dom}/{name}")
        out[name]={k:v for k,v in r.items() if k!="body"}
        out[name]["body"]=r["body"] if name=="robots.txt" else r["body"][:2000]
    return out
rows=list(csv.reader(open(sys.argv[1])))
outp=os.path.join(HERE,"results.jsonl")
done=set()
if os.path.exists(outp):
    for l in open(outp): done.add(json.loads(l)["domain"])
rows=[r for r in rows if r[1] not in done]
t=time.time()
with open(outp,"a") as f, ThreadPoolExecutor(128) as ex:
    futs=[ex.submit(one,r) for r in rows]
    for i,fu in enumerate(as_completed(futs)):
        res=fu.result()
        f.write(json.dumps(res)+"\n")
        if i%500==0: print(i, round(time.time()-t), flush=True)
print("done", len(rows))
