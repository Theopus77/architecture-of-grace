import json, difflib
from find import wav, SR, words
from refine import refine, asr
OV={"ps23_1":(449.5,453.5),"ps23_4":(471.8,490.2),"ps23_6":(505.0,518.8),"co13_7":(73.0,79.4),"ps46_10":(439.7,449.4),"isa40_31":(398.1,409.9),"jos1_9":(104.3,114.3)}
for vid,(s,e) in OV.items():
    r=json.load(open(f"r2/m_{vid}.json"))
    ns,ne=refine(vid,r["file"],s,e)[:2]
    # keep the hand times when snapping moved them far
    if abs(ns-s)>0.6: ns=s
    if abs(ne-e)>0.6: ne=e
    r["rstart"],r["rend"]=round(ns,2),round(ne,2)
    a=wav(r["file"])[int(ns*SR):int(ne*SR)]; r["check"]=" ".join(w for w,_,_ in asr(a))
    r["check_ratio"]=round(difflib.SequenceMatcher(None,r["check"]," ".join(words(r["text"])),autojunk=False).ratio(),3)
    json.dump(r,open(f"r2/m_{vid}.json","w"))
    print(f"{vid:9} {ns:7.2f}-{ne:7.2f} check {r['check_ratio']}  {r['check'][:140]}")
