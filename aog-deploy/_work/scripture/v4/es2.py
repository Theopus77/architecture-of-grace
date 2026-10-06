import sys, json, subprocess, kjv
from find import wav, SR
from es2texts import T
from en2 import BK
A="r2/a/"
F={"ps23":("salmos_06_rva_64kb.mp3",22,24),"ps46":("salmos_13_rva_64kb.mp3",45,48),"ps100":("salmos_28_rva_64kb.mp3",98,102),"ps150":("salmos_40_rva_64kb.mp3",147,150),
   "co13":("1corintios_13_rva_64kb.mp3",13,13),"jos1":("josue_01_rva_64kb.mp3",1,1),"pr3":("proverbios_03_rva_64kb.mp3",3,3),"isa40":("isaias_20_reinavalera_64kb.mp3",39,40),
   "jer29":("jeremias_29_rva_64kb.mp3",29,29),"rom8":("romanos_08_64kb.mp3",8,8),"php4":("filipenses_04_rva_64kb.mp3",4,4),"heb11":("hebreos_11_rva_64kb.mp3",11,11),
   "eph6":("efesios_06_rva_64kb.mp3",6,6),"lk11":("lucas_11_rva_64kb.mp3",11,11)}
BKK={"ps":"ps","co":"1co","jos":"jos","pr":"pr","isa":"isa","jer":"jer","rom":"rom","php":"php","heb":"heb","eph":"eph","lk":"lk"}
def est(vid):
    key,vv=vid.split("_"); f,c0,c1=F[key]; import re
    b=re.match(r"[a-z]+",key).group(0); c=int(key[len(b):]); v=int(vv)
    bk=kjv.B[BK[BKK[b]]]; a=wav(A+f); dur=len(a)/SR
    ks=sorted(k for k in bk if c0<=k[0]<=c1); tot=sum(len(bk[k]) for k in ks); b0=sum(len(bk[k]) for k in ks if k<(c,v))
    return f, 18+(dur-24)*b0/tot, dur
if __name__=="__main__":
    vid=sys.argv[1]; f,e,dur=est(vid); n=len(T[vid])
    w=max(60, n*0.08)
    r=subprocess.run(["python3","esfind.py",A+f,T[vid],str(max(0,e-w)),str(min(dur,e+w+n*0.07))],capture_output=True,text=True)
    j=json.loads(r.stdout.strip().splitlines()[-1]); j.update(id=vid,file=A+f,est=round(e,1)); json.dump(j,open(f"r2/es_{vid}.json","w")); print(json.dumps(j))
