import sys, numpy as np
from find import wav
from refine import rms, runs
f=sys.argv[1]; a=float(sys.argv[2]); b=float(sys.argv[3]); minp=float(sys.argv[4]) if len(sys.argv)>4 else 0.3
r=rms(wav(f)); seg=r[int(a*100):int(b*100)]; pk=np.percentile(seg,95)
q=seg<pk-32; sil=[(x,y) for x,y in runs(q) if y-x>=int(minp*100)]
prev=0; out=[]
for x,y in sil:
    if x>prev: out.append((a+prev/100, a+x/100, (y-x)/100))
    prev=y
if prev<len(seg): out.append((a+prev/100,b,0))
for s,e,p in out: print(f"{s:7.2f}-{e:7.2f} ({e-s:4.2f}s) pause after {p:4.2f}")
