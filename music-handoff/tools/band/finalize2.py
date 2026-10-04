# The Band, more ways to sound: write the manifest the page reads, for every player, old and new: the notes of each
# kind, and a tuning correction in cents for each file that is 5 cents or more off.
#
# The new players' tuning is measured by tune.py: YIN as finalize.py measures it, but on the part of the note the ear
# takes its pitch from (a held note from 0.25 s, past the attack; a pluck or a short note over its body). The first
# players' corrections (finalize.py's single window over 0.06-0.56 s) are kept, except where that window caught the
# attack and missed the note by more than 8 cents (a horn player sliding up into G2 read 82 cents flat, so the page had
# raised the whole note 82 cents); those are measured again the new way.
#
# The vibrato players borrow the short notes of the same instrument without vibrato: "stacDir" names the folder, and
# their stac list and tuning come from it.
#   python finalize2.py <aog-deploy/audio/band>      (out2/ is copied in first)
import os, sys, json, shutil, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000
BAND=sys.argv[1]; OUT2=os.path.join(HERE,"out2")
BORROW={"trumpet_vib":"trumpet","trombone_vib":"trombone","flute_vib":"flute","oboe_vib":"oboe","bassoon_vib":"bassoon"}
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
old=json.load(open(os.path.join(HERE,"manifest-orig.json")))     # the first players, as they were (so a second run gives the same)
kinds=json.load(open(os.path.join(OUT2,"players.json")))["kinds"]
perc=json.load(open(os.path.join(OUT2,"percussion.json"))); kinds.update(perc["kinds"])   # timpani "drum", mallets "pluck", "kit"
new=sorted(d for d in os.listdir(OUT2) if os.path.isdir(os.path.join(OUT2,d)))
for d in new:                                            # the new players' files go in beside the first ones
    dst=os.path.join(BAND,d)
    if os.path.isdir(dst): shutil.rmtree(dst)
    shutil.copytree(os.path.join(OUT2,d), dst)
man={}; changes=[]; compare=[]
for inst in sorted(set(list(old.keys())+new)):
    d=os.path.join(BAND,inst)
    if not os.path.isdir(d): continue
    if kinds.get(inst)=="kit":                            # the unpitched pieces: named hits, soft and loud
        man[inst]={"sus":[],"susL":[],"stac":[],"tune":{},"hits":perc["hits"]}; continue
    m={"sus":set(),"susL":set(),"stac":set(),"tune":{}}
    for f in sorted(os.listdir(d)):
        if not f.endswith(".mp3"): continue
        n=int(f[:-5]); k=f[-5]; key=f[:-4]
        (m["stac"] if k=="t" else m["sus"]).add(n)
        if k=="l": m["susL"].add(n)
        x=load(os.path.join(d,f))
        kind="short" if k=="t" else kinds.get(inst,"held")
        e=(tune.finalize_yin(x, n)-n)*100
        if kinds.get(inst) in ("drum","bar"):  # a timpani or a mallet bar: YIN on its fundamental alone (tune.bar_heard)
            kind=kinds[inst]; h,sp,cnt=tune.drum_heard(x, n, kind=="drum" and k!="t")
        elif kind=="short": h,sp=e,0          # a short note is all attack: finalize.py's window covers it, as before
        else:
            h,sp,cnt=tune.heard(x, n, kind)
            if h is None: h=e
        if inst in old:
            was=old[inst]["tune"].get(key,0)
            if kind!="short" and abs(was-h)>8:
                c=int(round(h)); changes.append((inst,key,was,c if abs(c)>=5 else 0,round(e)))
            else: c=was
        else: c=int(round(h))
        if abs(c)>=5: m["tune"][key]=c
        compare.append((inst,key,kind,round(e),round(h),round(sp or 0),m["tune"].get(key,0)))
    e={"sus":sorted(m["sus"]),"susL":sorted(m["susL"]),"stac":sorted(m["stac"]),"tune":m["tune"]}
    if inst in BORROW:
        b=BORROW[inst]; e["stac"]=list(old[b]["stac"]); e["stacDir"]=b
        e["tune"].update({k:v for k,v in old[b]["tune"].items() if k.endswith("t")})
    man[inst]=e
# keep the first players in their order, the new ones after them
order=list(old.keys())+[i for i in man if i not in old]
man={i:man[i] for i in order if i in man}
json.dump(man, open(os.path.join(BAND,"manifest.json"),"w"), separators=(",",":"))
for i,v in man.items():
    if not v["sus"]: print("%-17s hits %s"%(i, v.get("hits"))); continue
    print("%-17s held %d-%d (%d, %d loud) | short %s | corrections %d (largest %s)%s"%(i, v["sus"][0], v["sus"][-1], len(v["sus"]), len(v["susL"]),
        ("%d-%d (%d)"%(v["stac"][0],v["stac"][-1],len(v["stac"])) if v["stac"] else "none"), len(v["tune"]), max(v["tune"].values(), key=abs) if v["tune"] else 0, (" short notes from "+v["stacDir"]) if "stacDir" in v else ""))
print(len(json.dumps(man,separators=(",",":"))),"bytes of manifest")
print("first players, corrections measured again (player, file, was, now, finalize.py's window):")
for c in changes: print("  ",c)
json.dump(compare, open(os.path.join(HERE,"tuning-table.json"),"w"))
