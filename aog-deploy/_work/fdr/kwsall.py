import sys
sys.path.insert(0,"fdr")
from kws import find
f=sys.argv[1]; dur=float(sys.argv[2]); phs=sys.argv[3:]
for ph in phs:
    hits=[]
    for s in range(0,int(dur),240):
        hits+=find(f,ph,s,min(dur,s+250),1e-30)
    print(f, repr(ph), sorted(set((round(a,1),round(b,1),round(p,2)) for a,b,p in hits))[:12], flush=True)
