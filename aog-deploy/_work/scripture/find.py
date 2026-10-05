import sys, json, re, subprocess, difflib, numpy as np, kjv
from pocketsphinx import Decoder
V=[ # id, book idx, ch, v, file, first ch, last ch
 ("lev20_7",2,20,7,"bible_03e_kjv_64kb.mp3",20,23),
 ("ps51_10",18,51,10,"psalms_18_kjv_64kb.mp3",50,52),
 ("ezk36_26",25,36,26,"ezekiel_09_kjv_64kb.mp3",33,36),
 ("jn17_17",42,17,17,"gospeljohn_4_kjv_64kb.mp3",13,17),
 ("1th4_7",51,4,7,"1_thessalonians_01_kjv_64kb.mp3",1,5),
 ("1th5_23",51,5,23,"1_thessalonians_01_kjv_64kb.mp3",1,5),
 ("heb10_10",57,10,10,"hebrews_4_kjv_64kb.mp3",10,11),
 ("1pe1_16",59,1,16,"epistlesofpeter_1_kjv_64kb.mp3",1,5),
 ("isa43_11",22,43,11,"isaiah_15_kjv_64kb.mp3",43,45),
 ("isa45_22",22,45,22,"isaiah_15_kjv_64kb.mp3",43,45),
 ("isa53_5",22,53,5,"isaiah_18_kjv_64kb.mp3",52,54),
 ("jn14_6",42,14,6,"gospeljohn_4_kjv_64kb.mp3",13,17),
 ("jn10_9",42,10,9,"gospeljohn_3_kjv_64kb.mp3",9,12),
 ("acts4_12",43,4,12,"acts_02_kjv_64kb.mp3",4,6),
 ("1tim2_5",53,2,5,"1_timothy_01_kjv_64kb.mp3",1,3),
 ("jn3_16",42,3,16,"gospeljohn_1_kjv_64kb.mp3",1,4),
]
SR=16000
def wav(f):
    out="w/"+f.replace(".mp3",".raw")
    import os
    if not os.path.exists(out):
        subprocess.run(["ffmpeg","-v","error","-y","-i",f,"-ac","1","-ar",str(SR),"-f","s16le",out],check=True)
    return np.fromfile(out,dtype=np.int16)
def words(t): return re.findall(r"[a-z']+", t.lower().replace("'s",""))
def run(item, win=75):
    vid,bi,c,v,f,c0,c1=item
    a=wav(f); dur=len(a)/SR
    bk=kjv.B[bi]; keys=sorted(k for k in bk if c0<=k[0]<=c1)
    tot=sum(len(bk[k]) for k in keys); before=sum(len(bk[k]) for k in keys if k<(c,v))
    est=25+(dur-40)*before/tot
    s0=max(0,est-win); s1=min(dur,est+win)
    d=Decoder(samprate=SR)
    seg=a[int(s0*SR):int(s1*SR)]
    d.start_utt(); d.process_raw(seg.tobytes(),full_utt=True); d.end_utt()
    hyp=[(s.word.split("(")[0].lower(), s0+s.start_frame/100, s0+(s.end_frame+1)/100) for s in d.seg() if not s.word.startswith(("<","[")) ]
    target=words(bk[(c,v)])
    hw=[h[0] for h in hyp]
    T=" ".join(target); L=len(target); best=(0,0,0)
    for i in range(len(hyp)):
        for j in range(i+max(1,L-6), min(len(hyp),i+L+8)+1):
            r=difflib.SequenceMatcher(None," ".join(hw[i:j]),T,autojunk=False).ratio()
            if r>best[0]: best=(r,i,j)
    r,i,j=best; n=round(r,3)
    st=hyp[i][1]; en=hyp[j-1][2]
    cl=None
    return dict(id=vid,file=f,est=round(est,1),start=round(st,2),end=round(en,2),matched=n,of=len(target),
        heard=" ".join(hw[i:j]), text=bk[(c,v)])
if __name__=="__main__":
    i=int(sys.argv[1]); r=run(V[i]); print(json.dumps(r)); json.dump(r,open(f"w/{V[i][0]}.json","w"))
