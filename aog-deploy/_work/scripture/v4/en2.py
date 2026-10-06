# find a run of KJV verses in a chapter reading (pocketsphinx ASR + fuzzy match), then snap to pauses
import sys, json, difflib, re, numpy as np, kjv
from pocketsphinx import Decoder
from find import wav, SR, words
from refine import refine, asr
A="r2/a/"
BK={"ps":18,"1co":45,"jos":5,"pr":19,"isa":22,"jer":23,"rom":44,"php":49,"eph":48,"heb":57,"lk":41}
V=[ # id, book, chapter, [verses], file, first ch, last ch
 ("ps23_1","ps",23,[1],"psalms_07_kjv_64kb.mp3",21,23),("ps23_4","ps",23,[4],"psalms_07_kjv_64kb.mp3",21,23),("ps23_6","ps",23,[6],"psalms_07_kjv_64kb.mp3",21,23),
 ("ps46_1","ps",46,[1],"psalms_16_kjv_64kb.mp3",44,46),("ps46_10","ps",46,[10],"psalms_16_kjv_64kb.mp3",44,46),
 ("ps100_1","ps",100,[1],"psalms_33_kjv_64kb.mp3",98,102),("ps100_4","ps",100,[4],"psalms_33_kjv_64kb.mp3",98,102),("ps150_6","ps",150,[6],"psalms_50_kjv_64kb.mp3",149,150),
 ("co13_1","1co",13,[1],"1corinthians_7_kjv_64kb.mp3",13,14),("co13_4","1co",13,[4],"1corinthians_7_kjv_64kb.mp3",13,14),("co13_5","1co",13,[5],"1corinthians_7_kjv_64kb.mp3",13,14),
 ("co13_6","1co",13,[6],"1corinthians_7_kjv_64kb.mp3",13,14),("co13_7","1co",13,[7],"1corinthians_7_kjv_64kb.mp3",13,14),("co13_8","1co",13,[8],"1corinthians_7_kjv_64kb.mp3",13,14),
 ("co13_12","1co",13,[12],"1corinthians_7_kjv_64kb.mp3",13,14),("co13_13","1co",13,[13],"1corinthians_7_kjv_64kb.mp3",13,14),
 ("jos1_9","jos",1,[9],"joshua_01_kjv_64kb.mp3",1,1),("pr3_5","pr",3,[5],"proverbs_03_kjv_64kb.mp3",3,3),("pr3_6","pr",3,[6],"proverbs_03_kjv_64kb.mp3",3,3),
 ("isa40_31","isa",40,[31],"isaiah_14_kjv_64kb.mp3",40,42),("jer29_11","jer",29,[11],"jeremiah_08_kjv_64kb.mp3",28,30),("rom8_28","rom",8,[28],"romans_4_kjv_64kb.mp3",7,8),
 ("rom8_38","rom",8,[38,39],"romans_4_kjv_64kb.mp3",7,8),("php4_13","php",4,[13],"4epistles_5_kjv_64kb.mp3",1,4),
 ("heb11_1","heb",11,[1],"hebrews_4_kjv_64kb.mp3",10,11),("heb11_6","heb",11,[6],"hebrews_4_kjv_64kb.mp3",10,11),
 ("eph6_10","eph",6,[10],"4epistles_4_kjv_64kb.mp3",4,6),("eph6_11","eph",6,[11],"4epistles_4_kjv_64kb.mp3",4,6),("eph6_14","eph",6,[14],"4epistles_4_kjv_64kb.mp3",4,6),
 ("eph6_15","eph",6,[15],"4epistles_4_kjv_64kb.mp3",4,6),("eph6_16","eph",6,[16],"4epistles_4_kjv_64kb.mp3",4,6),("eph6_17","eph",6,[17],"4epistles_4_kjv_64kb.mp3",4,6),
 ("lk11_2","lk",11,[2,3,4],"luke_11-12_kjv_64kb.mp3",11,12),
]
def text(it):
    bk=kjv.B[BK[it[1]]]; t=" ".join(bk[(it[2],v)] for v in it[3])
    return t.replace(" The Proverbs","") if it[0]=="ps150_6" else t
def run(it, win=75):
    vid,b,c,vs,f,c0,c1=it; a=wav(A+f); dur=len(a)/SR; bk=kjv.B[BK[b]]
    keys=sorted(k for k in bk if c0<=k[0]<=c1); tot=sum(len(bk[k]) for k in keys); before=sum(len(bk[k]) for k in keys if k<(c,vs[0]))
    est=20+(dur-30)*before/tot; s0=max(0,est-win); s1=min(dur,est+win)
    d=Decoder(samprate=SR); d.start_utt(); d.process_raw(a[int(s0*SR):int(s1*SR)].tobytes(),full_utt=True); d.end_utt()
    hyp=[(s.word.split("(")[0].lower(), s0+s.start_frame/100, s0+(s.end_frame+1)/100) for s in d.seg() if not s.word.startswith(("<","["))]
    hw=[h[0] for h in hyp]; tw=words(text(it)); T=" ".join(tw); L=len(tw); best=(0,0,1)
    for i in range(len(hyp)):
        for j in range(i+max(1,L-6), min(len(hyp),i+L+8)+1):
            r=difflib.SequenceMatcher(None," ".join(hw[i:j]),T,autojunk=False).ratio()
            if r>best[0]: best=(r,i,j)
    r,i,j=best
    return dict(id=vid,file=A+f,est=round(est,1),start=round(hyp[i][1],2),end=round(hyp[j-1][2],2),ratio=round(r,3),heard=" ".join(hw[i:j]),text=text(it))
if __name__=="__main__":
    it=[x for x in V if x[0]==sys.argv[1]][0]; r=run(it)
    try: ns,ne=refine(r["id"],r["file"],r["start"],r["end"])[:2]
    except Exception as e: ns,ne=r["start"],r["end"]
    r["rstart"],r["rend"]=round(ns,2),round(ne,2)
    a=wav(r["file"])[int(ns*SR):int(ne*SR)]; r["check"]=" ".join(w for w,_,_ in asr(a))
    r["check_ratio"]=round(difflib.SequenceMatcher(None,r["check"]," ".join(words(r["text"])),autojunk=False).ratio(),3)
    json.dump(r,open(f"r2/m_{r['id']}.json","w")); print(json.dumps(r))
