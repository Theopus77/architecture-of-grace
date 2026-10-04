# What pitch is each timpani drum tuned to? The strongest spectral peaks (40-700 Hz) over the note's body, as notes,
# and YIN (tune.py) near the strongest low peak. Also the length of each file and of the mallet notes.
import os, sys, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000; D=os.path.join(HERE,"raw2perc")
def load(p):
    x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
    pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); return x[max(0,i-int(0.005*SR)):]
def note(f): return 69+12*np.log2(f/440)
def name(m):
    n=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][int(round(m))%12]; return "%s%d%+.0f"%(n,int(round(m))//12-1,(m-round(m))*100)
def peaks(x, a, b, lo=40, hi=700, k=6):
    seg=x[int(a*SR):int(b*SR)]
    if len(seg)<2048: seg=x[:int(0.5*SR)]
    N=1<<17; S=np.abs(np.fft.rfft(seg*np.hanning(len(seg)),N)); fr=np.arange(len(S))*SR/N
    m=(fr>lo)&(fr<hi); idx=np.where(m)[0]; out=[]
    loc=[i for i in idx[1:-1] if S[i]>S[i-1] and S[i]>=S[i+1]]
    loc.sort(key=lambda i:-S[i])
    for i in loc:
        if all(abs(fr[i]-fr[j])>6 for j in out): out.append(i)
        if len(out)>=k: break
    top=S[out[0]]
    return [(round(fr[i],1), name(note(fr[i])), round(20*np.log10(S[i]/top),1)) for i in out]
for f in sorted(os.listdir(D)):
    if not f.startswith(("Timpani","Xylo","Glock","Marimba")): continue
    x=load(os.path.join(D,f)); dur=len(x)/SR
    if f.startswith("Timpani"):
        p=peaks(x, 0.05, min(1.2, dur)); f0=p[0][0]
        print("%-45s %.1fs  peaks %s"%(f, dur, p[:5]))
    else:
        p=peaks(x, 0.02, min(0.5, dur), 100, 5000, 4)
        print("%-45s %.1fs  peaks %s"%(f, dur, p[:4]))
