# a third check: the YIN difference function, searched only within ±1.5 semitones of the labelled note (no octave slips)
import os, subprocess, numpy as np
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"out"); SR=32000
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
def yin(x, m):
    f=440*2**((m-69)/12); P=SR/f; lo=int(P*2**(-1.5/12))-1; hi=int(P*2**(1.5/12))+2
    a=int(0.06*SR); W=int(min(0.5*SR, max(4*hi, len(x)-a-hi-1)))
    if W<2*hi: a=0; W=len(x)-hi-1
    seg=x[a:a+W+hi]; d=np.array([np.sum((seg[:W]-seg[t:t+W])**2) for t in range(lo,hi+1)])
    i=int(np.argmin(d)); t=lo+i
    if 0<i<len(d)-1: t+=0.5*(d[i-1]-d[i+1])/(d[i-1]-2*d[i]+d[i+1])
    return 69+12*np.log2(SR/t/440)
rows=[]
for inst in sorted(os.listdir(OUT)):
    d=os.path.join(OUT,inst)
    if not os.path.isdir(d): continue
    for f in sorted(os.listdir(d)):
        m=int(f[:-5]); p=yin(load(os.path.join(d,f)),m); rows.append((inst,f,round((p-m)*100)))
bad=[r for r in rows if abs(r[2])>20]
print(len(rows),"files; more than 20 cents off:",bad)
print("all within:", max(abs(r[2]) for r in rows if r not in bad) if len(bad)<len(rows) else None, "cents for the rest")
