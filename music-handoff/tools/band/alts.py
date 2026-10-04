# The library often recorded a pluck or a short note twice ("round robins"). For the plucked and the short notes, try
# each take of each strength and keep the cleaner one: the take whose pitch reads the same at its very start (as
# finalize.py measures it) and over its body (tune.py), and holds steady. Writes choices.json for fetch2.py.
import os, re, sys, json, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
REPO="/home/user/sgossner/vsco-2-ce"; ALT=os.path.join(HERE,"raw2alt"); SR=32000
FILES=open(os.path.join(os.path.dirname(HERE),"vsco-files.txt")).read().split("\n")
RX=re.compile(r"_([A-G]#?)(-?\d)_v(\d)(?:_(?:rr)?(\d))?", re.I)
PC={"C":0,"C#":1,"D":2,"D#":3,"E":4,"F":5,"F#":6,"G":7,"G#":8,"A":9,"A#":10,"B":11}
# player: (art, layer, folder, strength, octave offset measured by process2.py, kind)
JOBS=[
 ("violins_pizz","sus","s","Strings/Violin Section/Pizz",1,12,"pluck"), ("violins_pizz","sus","l","Strings/Violin Section/Pizz",2,12,"pluck"),
 ("violas_pizz","sus","s","Strings/Viola Section/pizz",1,12,"pluck"),   ("violas_pizz","sus","l","Strings/Viola Section/pizz",2,12,"pluck"),
 ("cellos_pizz","sus","s","Strings/Cello Section/pizzT",1,12,"pluck"),  ("cellos_pizz","sus","l","Strings/Cello Section/pizzT",2,12,"pluck"),
 ("contrabass_pizz","sus","s","Strings/Solo Contrabass/Pizz",1,12,"pluck"), ("contrabass_pizz","sus","l","Strings/Solo Contrabass/Pizz",3,12,"pluck"),
 ("violins","stac","m","Strings/Violin Section/Spic",2,12,"short"), ("violas","stac","m","Strings/Viola Section/spic",2,12,"short"),
 ("cellos","stac","m","Strings/Cello Section/spic",2,12,"short"),   ("contrabass","stac","m","Strings/Solo Contrabass/Spic",1,12,"short"),
]
def load(path):
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
def onset(x):
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return max(0,i-int(0.005*SR))
choices={}; report=[]
only=sys.argv[1].split(",") if len(sys.argv)>1 else None
for inst,art,lay,folder,vel,off,kind in JOBS:
    if only and inst not in only: continue
    by={}
    for f in FILES:
        if not (f.startswith(folder+"/") and f.lower().endswith(".wav")): continue
        m=RX.search(os.path.basename(f))
        if not m or int(m.group(3))!=vel: continue
        note=(int(m.group(2))+1)*12+PC[m.group(1).upper()]
        by.setdefault(note,[]).append(f)
    for note,fs in sorted(by.items()):
        midi=note+off; rows=[]
        for f in sorted(fs):
            dst=os.path.join(ALT,inst,os.path.basename(f))
            if not os.path.exists(dst):
                os.makedirs(os.path.dirname(dst),exist_ok=True)
                with open(dst,"wb") as fh: subprocess.run(["git","-C",REPO,"show","HEAD:"+f],stdout=fh,check=True)
            x=load(dst); x=x[onset(x):]; x=x[:int((3.0 if kind=="pluck" else 0.9)*SR)]
            e=(tune.finalize_yin(x, midi)-midi)*100; h,sp,n=tune.heard(x, midi, kind)
            if h is None: rows.append((99,f,e,None,None)); continue
            rows.append((abs(e-h)+0.5*sp, f, e, h, sp))
        rows.sort(key=lambda r:r[0]); best=rows[0]
        choices.setdefault(inst,{}).setdefault(art,{})["%d%s"%(note,lay)]=best[1]
        report.append("%-16s %-4s %3d%s  "%(inst,art,midi,lay)+"  ".join("%s:%+.0f/%s~%s%s"%(os.path.basename(r[1]).split("_")[-1][:-4], r[2], "%+.0f"%r[3] if r[3] is not None else "-", "%.0f"%r[4] if r[4] is not None else "-", " *" if r is best else "") for r in sorted(rows,key=lambda r:r[1])))
path=os.path.join(HERE,"choices.json")
old=json.load(open(path)) if os.path.exists(path) else {}
for i,v in choices.items(): old[i]=v
json.dump(old, open(path,"w"), indent=1)
print("\n".join(report))
