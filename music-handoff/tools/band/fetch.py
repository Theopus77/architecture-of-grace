# The Band: pick and fetch the recordings from VSCO 2 Community Edition (CC0), one soft and one loud held note and one
# medium short note at every pitch recorded, for eight instruments.
import os, re, subprocess, json, sys
REPO="/home/user/sgossner/vsco-2-ce"; OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"raw")
INST={
 "trumpet":  {"sus":"Brass/Trumpet/sus",          "stac":"Brass/Trumpet/stac"},
 "trombone": {"sus":"Brass/Tenor Trombone/sus",   "stac":"Brass/Tenor Trombone/stac"},
 "horn":     {"sus":"Brass/F Horn/sus",           "stac":"Brass/F Horn/stac"},
 "tuba":     {"sus":"Brass/Tuba/sus",             "stac":"Brass/Tuba/stac"},
 "flute":    {"sus":"Woodwinds/Flute/susNV",      "stac":"Woodwinds/Flute/stac"},
 "clarinet": {"sus":"Woodwinds/Clarinet/susLong", "stac":"Woodwinds/Clarinet/stac"},
 "oboe":     {"sus":"Woodwinds/Oboe/Sus",         "stac":"Woodwinds/Oboe/Stacc"},
 "bassoon":  {"sus":"Woodwinds/Bassoon/sus",      "stac":"Woodwinds/Bassoon/stac"},
}
RX=re.compile(r"_([A-G]#?)(\d)_v(\d)(?:_(?:rr)?(\d))?")
PC={"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
def ls(path):
    out=subprocess.run(["git","-C",REPO,"ls-tree","-r","--name-only","HEAD",path],capture_output=True,text=True).stdout.split("\n")
    return [x for x in out if x.lower().endswith(".wav")]
plan=[]
for inst,arts in INST.items():
    for art,path in arts.items():
        by={}
        for f in ls(path):
            m=RX.search(os.path.basename(f))
            if not m: continue
            note=(int(m.group(2))+1)*12+PC[m.group(1)]          # by name; the true octave is measured later
            v=int(m.group(3)); rr=int(m.group(4) or 1)
            by.setdefault(note,[]).append((v,rr,f))
        for note,lst in sorted(by.items()):
            vs=sorted(set(v for v,rr,f in lst))
            pick=lambda v:[f for vv,rr,f in sorted(lst,key=lambda x:x[1]) if vv==v][0]
            if art=="sus":
                layers={"s":pick(vs[0])}
                loud=[v for v in vs if v>=2]
                if loud: layers["l"]=pick(3 if 3 in vs else max(loud))
            else:
                mid=2 if 2 in vs else (vs[len(vs)//2])
                layers={"m":pick(mid)}
            for lay,f in layers.items():
                plan.append({"inst":inst,"art":art,"note":note,"layer":lay,"src":f})
json.dump(plan,open(os.path.join(os.path.dirname(OUT),"plan.json"),"w"),indent=0)
print(len(plan),"files planned")
for inst in INST: print(" ",inst, {a:len([p for p in plan if p["inst"]==inst and p["art"]==a]) for a in ("sus","stac")})
if "--fetch" in sys.argv:
    for i,p in enumerate(plan):
        dst=os.path.join(OUT,p["inst"],p["art"],"%d%s.wav"%(p["note"],p["layer"]))
        if os.path.exists(dst) and os.path.getsize(dst)>1000: continue
        os.makedirs(os.path.dirname(dst),exist_ok=True)
        with open(dst,"wb") as fh: subprocess.run(["git","-C",REPO,"show","HEAD:"+p["src"]],stdout=fh,check=True)
        if i%20==0: print("fetched",i+1,"of",len(plan),flush=True)
    print("all fetched")
