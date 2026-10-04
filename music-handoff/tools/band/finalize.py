# The Band: relabel the clarinet's top note (it is F6, not F#6), measure every note's tuning (YIN near its label) and
# write the manifest the page reads: the notes of each kind, and a tuning correction in cents for each file
import os, json, numpy as np, importlib.util
HERE=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.join(HERE,"out")
spec=importlib.util.spec_from_file_location("p3", os.path.join(HERE,"pitch3.py"))
src=open(os.path.join(HERE,"pitch3.py")).read().split("rows=[]")[0]; ns={"__file__":os.path.join(HERE,"pitch3.py")}; exec(src, ns)
cl=os.path.join(OUT,"clarinet")
for L in "sl":
    a=os.path.join(cl,"90%s.mp3"%L)
    if os.path.exists(a): os.replace(a, os.path.join(cl,"89%s.mp3"%L))
man={}
for inst in sorted(os.listdir(OUT)):
    d=os.path.join(OUT,inst)
    if not os.path.isdir(d): continue
    m={"sus":set(),"susL":set(),"stac":set(),"tune":{}}
    for f in sorted(os.listdir(d)):
        n=int(f[:-5]); k=f[-5]
        (m["stac"] if k=="t" else m["sus"]).add(n)
        if k=="l": m["susL"].add(n)
        c=round((ns["yin"](ns["load"](os.path.join(d,f)), n)-n)*100)
        if abs(c)>=5: m["tune"][f[:-4]]=int(c)
    man[inst]={"sus":sorted(m["sus"]),"susL":sorted(m["susL"]),"stac":sorted(m["stac"]),"tune":m["tune"]}
json.dump(man, open(os.path.join(OUT,"manifest.json"),"w"), separators=(",",":"))
for i,v in man.items(): print("%-9s held %s | short %s | corrections %d (largest %s)"%(i, v["sus"], v["stac"], len(v["tune"]), max(v["tune"].values(), key=abs) if v["tune"] else 0))
print(len(json.dumps(man)),"bytes of manifest")
