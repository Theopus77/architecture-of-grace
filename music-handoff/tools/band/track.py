# the pitch of a processed note over time: YIN (within 1.5 semitones of the label) on short windows, with the level
import os, sys, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(HERE,"pitch3.py")).read().split("rows=[]")[0]; ns={"__file__":os.path.join(HERE,"pitch3.py")}; exec(src, ns)
load, SR = ns["load"], 32000
def yinw(seg, m, W):
    f=440*2**((m-69)/12); P=SR/f; lo=int(P*2**(-1.5/12))-1; hi=int(P*2**(1.5/12))+2
    d=np.array([np.sum((seg[:W]-seg[t:t+W])**2) for t in range(lo,hi+1)])
    i=int(np.argmin(d)); t=lo+i
    if 0<i<len(d)-1: t+=0.5*(d[i-1]-d[i+1])/(d[i-1]-2*d[i]+d[i+1])
    return 69+12*np.log2(SR/t/440)
path=sys.argv[1]; m=int(os.path.basename(path)[:-5]); x=load(path)
step=float(sys.argv[2]) if len(sys.argv)>2 else 0.1
W=int(max(0.06*SR, 3*SR/(440*2**((m-69)/12))))
pk=np.max(np.abs(x)); out=[]
t=0.0
while int(t*SR)+W+2000<len(x):
    a=int(t*SR); seg=x[a:a+W+int(SR/(440*2**((m-69)/12))*1.2)]
    lv=20*np.log10(np.sqrt(np.mean(x[a:a+W]**2))/pk+1e-9)
    out.append("%.2f:%+.0f(%.0fdB)"%(t,(yinw(seg,m,W)-m)*100,lv)); t+=step
print(os.path.basename(path), " ".join(out))
