# every processed note of the new players: finalize.py's YIN (the first half second) next to the pitch the note
# settles on (YIN on 60 ms windows from 0.25 s to 2.5 s, the middle of them, louder windows counted more), and the
# spread of the settled pitch (vibrato). Notes where the two disagree by more than 8 cents are listed.
import os, sys, json, numpy as np
HERE=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(HERE,"pitch3.py")).read().split("rows=[]")[0]; ns={"__file__":os.path.join(HERE,"pitch3.py")}; exec(src, ns)
load, yin, SR = ns["load"], ns["yin"], 32000
def yinw(seg, m, W):
    f=440*2**((m-69)/12); P=SR/f; lo=int(P*2**(-1.5/12))-1; hi=int(P*2**(1.5/12))+2
    if len(seg)<W+hi+1: return None
    d=np.array([np.sum((seg[:W]-seg[t:t+W])**2) for t in range(lo,hi+1)])
    i=int(np.argmin(d)); t=lo+i
    if i==0 or i==len(d)-1: return None
    t+=0.5*(d[i-1]-d[i+1])/(d[i-1]-2*d[i]+d[i+1])
    return 69+12*np.log2(SR/t/440)
def settled(x, m, a=0.25, b=2.5):
    P=SR/(440*2**((m-69)/12)); W=int(max(0.06*SR, 3*P)); hi=int(P*2**(1.5/12))+2
    vals=[]; wts=[]; t=a
    while int(t*SR)+W+hi+1<min(len(x), int(b*SR)+W):
        s=int(t*SR); v=yinw(x[s:s+W+hi+1], m, W)
        if v is not None:
            vals.append(v); wts.append(np.sqrt(np.mean(x[s:s+W]**2)))
        t+=0.03
    if len(vals)<3: return None, None
    vals=np.array(vals); wts=np.array(wts)
    o=np.argsort(vals); cw=np.cumsum(wts[o]); med=vals[o][np.searchsorted(cw, cw[-1]/2)]
    return med, float(np.sqrt(np.average((vals-med)**2, weights=wts)))
if __name__=="__main__":
    OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(HERE,"out2")
    which=sys.argv[2].split(",") if len(sys.argv)>2 else sorted(os.listdir(OUT))
    bad=[]
    for inst in which:
        d=os.path.join(OUT,inst)
        if not os.path.isdir(d): continue
        rows=[]
        for f in sorted(os.listdir(d), key=lambda f:(int(f[:-5]), f[-5])):
            m=int(f[:-5]); x=load(os.path.join(d,f))
            e=(yin(x,m)-m)*100; s,sp=settled(x,m)
            if s is None: rows.append("%s %+.0f/-"%(f[:-4],e)); continue
            s=(s-m)*100; rows.append("%s %+.0f/%+.0f~%.0f"%(f[:-4],e,s,sp*100))
            if abs(e-s)>8: bad.append((inst,f,round(e),round(s),round(sp*100)))
        print(inst+": "+"  ".join(rows))
    print("disagree by more than 8 cents (player, file, first half second, settled, vibrato spread):")
    for b in bad: print("  ",b)
