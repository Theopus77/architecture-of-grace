# the pitch of raw takes over time: python track2.py MIDI STEP file.wav [file.wav ...]
import os, sys, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000
def load(path):
    pcm=subprocess.run(["ffmpeg","-v","error","-i",path,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout
    return np.frombuffer(pcm,dtype=np.float32).astype(np.float64)
m=int(sys.argv[1]); step=float(sys.argv[2])
for path in sys.argv[3:]:
    x=load(path); pk=np.max(np.abs(x)); i=int(np.argmax(np.abs(x)>pk*0.03)); x=x[max(0,i-int(0.005*SR)):]
    P=SR/(440*2**((m-69)/12)); W=int(max(0.06*SR, 3*P)); hi=int(P*2**(1.5/12))+2
    out=[]; t=0.0
    while int(t*SR)+W+hi+1<len(x) and t<2.0:
        s=int(t*SR); v=tune.yin_window(x[s:s+W+hi+1], m, W); lv=20*np.log10(np.sqrt(np.mean(x[s:s+W]**2))/pk+1e-9)
        out.append("%.2f:%s(%.0f)"%(t, "%+.0f"%((v-m)*100) if v is not None else "edge", lv)); t+=step
    print(os.path.basename(path), "finalize %+.0f"%((tune.finalize_yin(x,m)-m)*100), "heard %s"%str(tune.heard(x,m,"pluck")))
    print("   "+" ".join(out))
