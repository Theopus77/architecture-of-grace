import json, re, numpy as np
from find import wav, SR
from refine import rms, runs
R=json.load(open("w/refined.json"))
SPL={'heb10_10':'through the offering','1pe1_16':'for I am holy','isa43_11':'and beside me','isa45_22':'for I am God','isa53_5':'the chastisement','jn14_6':'no man cometh','jn10_9':'by me if','acts4_12':'for there is none','1tim2_5':'and one mediator','jn3_16':'that whosoever'}
def textsplit(t,vid=None):
    if vid in SPL:
        k=t.index(SPL[vid]); ws=t.split(); n=len(ws); kk=len(t[:k].split()); return t[:k].strip(), t[k:], kk/n
    ws=t.split(); n=len(ws); best=None
    for i,w in enumerate(ws[:-1]):
        if w[-1] in ":;,":
            pr={":":0,";":0.05,",":0.12}[w[-1]]
            sc=abs((i+1)/n-0.5)+pr
            if best is None or sc<best[0]: best=(sc,i+1)
    k=best[1]; return " ".join(ws[:k]), " ".join(ws[k:]), k/n
out={}
for vid,v in R.items():
    a=wav(v["file"])[int(v["start"]*SR):int(v["end"]*SR)]; r=rms(a); peak=np.percentile(r,95)
    best=None
    for th in (30,26,22,18):
        rr=[(x,y) for x,y in runs(r<peak-th) if y-x>=8 and 0.2*len(r)<(x+y)/2<0.8*len(r)]
        if rr: break
    p1,p2,frac=textsplit(v["text"],vid)
    # words-based expected time: fraction of words
    ws=v["words"]; 
    exp=frac*len(r)
    if rr:
        x,y=min(rr,key=lambda q:abs((q[0]+q[1])/2-exp)); cut=(x+y)/2/100
    else: cut=exp/100
    out[vid]=dict(cut=round(cut,2),dur=round(len(r)/100,2),p1=p1,p2=p2,frac=round(frac,2),pos=round(cut/(len(r)/100),2))
    # check ASR words around cut
    before=" ".join(w for w,s,e in ws if (s+e)/2<cut); after=" ".join(w for w,s,e in ws if (s+e)/2>=cut)
    print(f"{vid:9} cut {cut:5.2f}/{len(r)/100:5.2f} text@{frac:.2f} audio@{cut/(len(r)/100):.2f}\n   T1 {p1}\n   H1 {before}\n   T2 {p2}\n   H2 {after}")
json.dump(out,open("w/split.json","w"),indent=1)
