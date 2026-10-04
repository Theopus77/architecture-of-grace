# The timpani and the mallets: YIN on the fundamental alone (tune.bar_heard) next to the spectral peak, per file.
#   python barcheck.py <folder with timpani/ xylophone/ ...> [manifest.json]   (with a manifest: the note as played)
import os, sys, json, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000; BAND=sys.argv[1]
man=json.load(open(sys.argv[2])) if len(sys.argv)>2 else {}
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
worst=0
for inst in ("timpani","xylophone","glockenspiel","marimba"):
    rows=[]
    for f in sorted(os.listdir(os.path.join(BAND,inst)), key=lambda f:(int(f[:-5]),f[-5])):
        n=int(f[:-5]); k=f[-5]; x=load(os.path.join(BAND,inst,f))
        c,sp,cnt,spec=tune.bar_heard(x, n, inst=="timpani" and k!="t")
        t=man.get(inst,{}).get("tune",{}).get(f[:-4],0)
        if man: worst=max(worst, abs(c-t)); rows.append("%s yin %+.0f (spread %.0f) spectral %+.0f -> as played %+.1f / %+.1f"%(f[:-4],c,sp,spec,c-t,spec-t))
        else: rows.append("%s yin %+.0f (spread %.0f) spectral %+.0f"%(f[:-4],c,sp,spec))
    print(inst); print("   "+"\n   ".join(rows))
if man: print("largest left after the page's correction, by YIN on the fundamental: %.1f cents"%worst)
