# a closer look at the tuning of one player's processed notes: YIN near the label (finalize.py), YIN over a later and
# longer stretch, and the spectral harmonic sum (pitchcheck.py)
import os, sys, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(HERE,"pitch3.py")).read().split("rows=[]")[0]; ns={"__file__":os.path.join(HERE,"pitch3.py")}; exec(src, ns)
src2=open(os.path.join(HERE,"pitchcheck.py")).read().split("rows=[]")[0]; ns2={"__file__":os.path.join(HERE,"pitchcheck.py")}; exec(src2, ns2)
load, yin, SR = ns["load"], ns["yin"], 32000
OUT=sys.argv[2] if len(sys.argv)>2 else os.path.join(HERE,"out2")
d=os.path.join(OUT, sys.argv[1])
for f in sorted(os.listdir(d), key=lambda f:(int(f[:-5]), f[-5])):
    m=int(f[:-5]); x=load(os.path.join(d,f))
    c1=(yin(x,m)-m)*100
    late=x[int(0.3*SR):int(1.3*SR)]
    c2=(yin(late,m)-m)*100 if len(late)>SR//4 else float("nan")
    c3=(ns2["pitch"](x.astype(np.float32),m)-m)*100
    print("%-8s yin %+6.0f  later %+6.0f  spectral %+6.0f   %.2f s"%(f,c1,c2,c3,len(x)/SR))
