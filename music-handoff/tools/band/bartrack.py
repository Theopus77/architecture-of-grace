# the fundamental of a drum or bar note over time: YIN on the band around its spectral peak, every 50 ms
#   python bartrack.py file.mp3 [held]
import os, sys, subprocess, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import tune
SR=32000
p=sys.argv[1]; held=len(sys.argv)>2; m=int(os.path.basename(p)[:-5])
x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32).astype(np.float64)
a,b=(0.25,2.5) if held else (0.03,1.0)
f=tune.peak_near(x, m, a, b); y=tune.around(x, 69+12*np.log2(f/440), 1.0)
w=tune.windows(y, m, 0.0, 3.0, 0.05, None); pk=max(l for _,l in w)
print(os.path.basename(p), "spectral %+.0f"%((69+12*np.log2(f/440)-m)*100))
print("  "+" ".join("%.2f:%+.0f(%.0f)"%(i*0.05,(v-m)*100,20*np.log10(l/pk)) for i,(v,l) in enumerate(w)))
