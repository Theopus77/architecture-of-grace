# Each timpani drum's principal tone, the (1,1) mode the ear takes as its pitch: the peak p for which peaks also sit near
# 1.5 p and 2 p (the drum's (2,1) and (3,1) modes), for hits (0.05-1.5 s) and rolls (the steady part, 1-5 s). Then YIN
# (tune.py) within 1.5 semitones of it.
import os, sys, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000; D=os.path.join(HERE,"raw2perc")
def load(p):
    x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return x[max(0,i-int(0.005*SR)):]
def midi(f): return 69+12*np.log2(f/440)
def spectrum(x, a, b):
    seg=x[int(a*SR):int(b*SR)]; N=1<<18
    S=np.abs(np.fft.rfft(seg*np.hanning(len(seg)),N)); fr=np.arange(len(S))*SR/N; return fr,S
def principal(x, a, b):
    fr,S=spectrum(x,a,b); band=(fr>60)&(fr<330)
    idx=np.where(band)[0]; loc=[i for i in idx[1:-1] if S[i]>S[i-1] and S[i]>=S[i+1]]
    loc.sort(key=lambda i:-S[i]); loc=loc[:12]; top=S[loc[0]]
    best=None
    for i in loc:
        p=fr[i]
        def near(r):
            w=(fr>p*r*0.96)&(fr<p*r*1.04); return float(S[w].max()) if w.any() else 0.0
        sc=S[i]/top + near(1.5)/top + 0.6*near(2.0)/top
        if best is None or sc>best[0]: best=(sc,p)
    # refine on the peak
    p=best[1]; w=(fr>p*0.985)&(fr<p*1.015); j=np.where(w)[0][np.argmax(S[w])]
    y0,y1,y2=np.log(S[j-1]),np.log(S[j]),np.log(S[j+1]); off=0.5*(y0-y2)/(y0-2*y1+y2)
    return (j+off)*SR/(1<<18)
for drum in range(1,6):
    rows=[]
    for f in sorted(os.listdir(D)):
        if not f.startswith("Timpani") or "Timpani%d_"%drum not in f: continue
        x=load(os.path.join(D,f)); roll="Roll" in f
        p=principal(x, 1.0 if roll else 0.05, 5.0 if roll else 1.5); m=midi(p); n=int(round(m))
        y=(tune.finalize_yin(x, n)-n)*100
        h=tune.heard(x[:int(5*SR)], n, "held" if roll else "pluck")
        rows.append("  %-40s principal %6.1f Hz = %5.2f (%d%+.0f)  finalize-yin %+.0f  heard %s"%(f.replace("Timpani__",""),p,m,n,(m-n)*100,y,"%+.0f~%.0f"%(h[0],h[1]) if h[0] is not None else "-"))
    print("drum",drum); print("\n".join(rows))
