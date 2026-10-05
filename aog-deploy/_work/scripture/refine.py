import json, numpy as np, sys, difflib, re
from find import wav, SR, V, words
from pocketsphinx import Decoder
OVR={"jn17_17":(1080.94,1084.6),"jn14_6":(327.85,335.3),"jn3_16":(870.55,882.3),"isa53_5":(223.85,234.89),"ezk36_26":(908.4,917.39)}
def rms(a):
    n=len(a)//160; x=a[:n*160].astype(np.float32).reshape(n,160)
    return 20*np.log10(np.sqrt((x**2).mean(1))+1)
def runs(q):  # silent runs as (s,e) frame idx
    out=[];s=None
    for i,v in enumerate(q):
        if v and s is None: s=i
        if not v and s is not None: out.append((s,i)); s=None
    if s is not None: out.append((s,len(q)))
    return out
def refine(vid,f,st,en):
    a=wav(f); r=rms(a); s0,e0=int(st*100),int(en*100)
    seg=r[max(0,s0-300):e0+300]; peak=np.percentile(r[s0:e0],95)
    q=r< peak-32
    rr=[(a_,b_) for a_,b_ in runs(q) if b_-a_>=14]
    # start: last silent run ending <= s0+25 within 300 frames before
    cands=[b_ for a_,b_ in rr if s0-300<=b_<=s0+25]
    ns=max(cands) if cands else s0
    cands=[a_ for a_,b_ in rr if e0-25<=a_<=e0+300 and a_>ns+50]
    ne=min(cands) if cands else e0
    return ns/100, ne/100, r, peak
def asr(a):
    d=Decoder(samprate=SR); d.start_utt(); d.process_raw(a.tobytes(),full_utt=True); d.end_utt()
    return [(s.word.split("(")[0], s.start_frame/100, (s.end_frame+1)/100) for s in d.seg() if not s.word.startswith(("<","["))]
if __name__=="__main__":
    out={}
    for it in V:
        vid=it[0]; j=json.load(open(f"w/{vid}.json"))
        st,en=OVR.get(vid,(j["start"],j["end"]))
        ns,ne=(st,en) if vid in OVR else refine(vid,it[4],st,en)[:2]
        a=wav(it[4])[int(ns*SR):int(ne*SR)]
        h=asr(a); hw=" ".join(w for w,_,_ in h)
        ratio=difflib.SequenceMatcher(None,hw," ".join(words(j["text"])),autojunk=False).ratio()
        out[vid]=dict(file=it[4],start=ns,end=ne,text=j["text"],heard=hw,ratio=round(ratio,3),words=h)
        print(f"{vid:9} {st:8.2f}->{ns:8.2f}  {en:8.2f}->{ne:8.2f} len {ne-ns:5.2f} r={ratio:.2f}\n   {hw}",flush=True)
    json.dump(out,open("w/refined.json","w"),indent=1)
