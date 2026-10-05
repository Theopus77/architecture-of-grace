import sys, json, numpy as np
import esfind
from esfind import g2p, phones, sw
from find import wav
from refine import rms, refine
from rvfind import V
from rvtexts import T
SPL={"lev20_7":"porque yo","ps51_10":"Y renueva","ezk36_26":"y quitaré","jn17_17":"tu palabra","1th4_7":"sino á","1th5_23":"para que","heb10_10":"por la ofrenda",
 "1pe1_16":"porque yo soy","isa43_11":"y fuera","isa45_22":"porque yo soy","isa53_5":"el castigo","jn14_6":"nadie viene","jn10_9":"el que por mí",
 "acts4_12":"porque no hay","1tim2_5":"asimismo","jn3_16":"para que todo"}
OVR={"isa43_11":(142.0,145.8)}
def trace(T_,H,M,B):
    i,j=np.unravel_index(np.argmax(M),M.shape); pairs=[]
    while i>0 and j>0 and B[i,j]!=0:
        k=B[i,j]
        if k==1: pairs.append((i-1,j-1)); i,j=i-1,j-1
        elif k==2: i-=1
        else: j-=1
    return pairs[::-1]
i=int(sys.argv[1]); vid=V[i][0]; f="rv/"+V[i][4]; m=json.load(open(f"rv/m_{i}.json"))
st,en=OVR.get(vid,(m["start"],m["end"]))
if vid not in OVR: st,en=refine(vid,f,st,en)[:2]
text=T[vid]; k=text.index(SPL[vid]); p1=text[:k].strip(); n1=len(g2p(p1))
a=wav(f); H=phones(a,st-0.3,en+0.3); Tp=g2p(text); M,B=sw(Tp,H); pr=trace(Tp,H,M,B)
cand=[H[j][1] for ti,j in pr if ti>=n1]
cut=cand[0] if cand else st+(en-st)*n1/len(Tp)
r=rms(a); c=int(cut*100); w=r[c-40:c+41]; cut=(c-40+int(np.argmin(w)))/100
print(json.dumps(dict(id=vid,file=f,start=round(st,2),end=round(en,2),cut=round(cut-st,2),p1=p1,p2=text[k:],frac_text=round(n1/len(Tp),2),frac_audio=round((cut-st)/(en-st),2))))
