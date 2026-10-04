# Every note of every player, as the page plays it (the manifest's correction applied): how far from true, in cents.
#   heard:    tune.py, on the part of the note the ear takes its pitch from (held: from 0.25 s; pluck: its body;
#             short: finalize.py's window, which covers a short note)
#   finalize: finalize.py's single window, 0.06-0.56 s
#   python tunecheck2.py <aog-deploy/audio/band> [players]
import os, sys, json, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000; BAND=sys.argv[1]
PLUCK={"violins_pizz","violas_pizz","cellos_pizz","contrabass_pizz","harp"}
BARS={"timpani","marimba","xylophone","glockenspiel"}
man=json.load(open(os.path.join(BAND,"manifest.json")))
only=sys.argv[2].split(",") if len(sys.argv)>2 else list(man.keys())
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
worst_h=[]; worst_f=[]; n=0
for inst in [i for i in only if man[i]["sus"]]:
    m=man[inst]; files=[(inst,"%d%s"%(k,l)) for l,key in (("s","sus"),("l","susL")) for k in m[key]]+[(m.get("stacDir",inst),"%dt"%k) for k in m["stac"]]
    rh=[]; rf=[]
    for folder,key in files:
        x=load(os.path.join(BAND,folder,key+".mp3")); note=int(key[:-1]); kind="short" if key[-1]=="t" else ("pluck" if inst in PLUCK else "held")
        e=(tune.finalize_yin(x,note)-note)*100
        if inst in BARS: h=tune.bar_heard(x,note,inst=="timpani" and kind!="short")[0]   # a drum or a bar: its fundamental alone
        else: h=e if kind=="short" else (tune.heard(x,note,kind)[0])
        if h is None: h=e
        t=m["tune"].get(key,0); rh.append((round(h-t,1),key)); rf.append((round(e-t,1),key)); n+=1
    bh=max(rh,key=lambda r:abs(r[0])); bf=max(rf,key=lambda r:abs(r[0]))
    out_h=[r for r in rh if abs(r[0])>8]; out_f=[r for r in rf if abs(r[0])>8]
    print("%-17s %2d files  heard: worst %+5.1f (%s)%s   finalize: worst %+5.1f (%s)%s"%(inst,len(files),bh[0],bh[1]," beyond 8: "+str(out_h) if out_h else "",bf[0],bf[1]," beyond 8: "+str(out_f) if out_f else ""))
    worst_h+=out_h; worst_f+=out_f
print("%d files; beyond 8 cents, heard: %d; by finalize.py's window: %d"%(n,len(worst_h),len(worst_f)))
