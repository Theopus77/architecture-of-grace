# Find a Spanish verse in a reading: Spanish spelling -> speech sounds (ARPAbet), the reading -> sounds
# (pocketsphinx's phone recognizer), then the best local match (Smith-Waterman) between the two.
import sys, json, re, unicodedata, numpy as np
from pocketsphinx import Decoder, get_model_path
from find import wav, SR
VOW={"a":"AA","e":"EH","i":"IY","o":"OW","u":"UW"}
def strip(s): return "".join(c for c in unicodedata.normalize("NFD",s) if unicodedata.category(c)!="Mn" or c=="̃")
def g2p(text):
    t=text.lower().replace("ñ","N")
    t=strip(t).replace("ñ","N")
    t=re.sub(r"[^a-zN ]"," ",t); out=[]
    for w in t.split():
        i=0
        while i<len(w):
            c=w[i]; n=w[i+1] if i+1<len(w) else ""; nn=w[i+2] if i+2<len(w) else ""
            if c in VOW:
                if c in "iu" and n in VOW and n: out.append("Y" if c=="i" else "W")
                else: out.append(VOW[c])
            elif c=="y": out.append("IY" if (n=="" or n==" ") else "Y")
            elif c=="c" and n=="h": out.append("CH"); i+=1
            elif c=="c": out.append("S" if n in "ei" and n else "K")
            elif c=="q": out.append("K"); i+= 1 if n=="u" else 0
            elif c=="g" and n=="u" and nn in "ei" and nn: out.append("G"); i+=1
            elif c=="g": out.append("HH" if n in "ei" and n else "G")
            elif c=="l" and n=="l": out.append("Y"); i+=1
            elif c=="r" and n=="r": out.append("R"); i+=1
            elif c=="h": pass
            elif c=="j": out.append("HH")
            elif c in "bv": out.append("B")
            elif c=="z": out.append("S")
            elif c=="x": out+= ["K","S"]
            elif c=="N": out+= ["N","Y"]
            else: out.append({"d":"D","f":"F","k":"K","l":"L","m":"M","n":"N","p":"P","r":"R","s":"S","t":"T","w":"W"}.get(c,""))
            i+=1
    return [p for p in out if p]
VOWELS={"AA","AE","AH","AO","AW","AY","EH","ER","EY","IH","IY","OW","OY","UH","UW"}
CLS={**{v:"V" for v in VOWELS},"P":"S","B":"S","T":"S","D":"S","K":"S","G":"S","CH":"F","JH":"F","F":"F","V":"F","TH":"F","DH":"F","S":"F","Z":"F","SH":"F","ZH":"F","HH":"F","M":"N","N":"N","NG":"N","L":"L","R":"L","W":"G","Y":"G","ER":"V"}
NEAR={("AA","AH"),("AA","AO"),("AA","AE"),("EH","EY"),("EH","IH"),("EH","AE"),("IY","IH"),("OW","AO"),("OW","UH"),("UW","UH"),("B","V"),("B","P"),("D","DH"),("D","T"),("S","Z"),("K","G"),("R","ER"),("L","R"),("N","M")}
def sc(a,b):
    if a==b: return 2.0
    if (a,b) in NEAR or (b,a) in NEAR: return 1.0
    if CLS.get(a)==CLS.get(b): return 0.2
    return -1.0
def phones(a, s0, s1):
    d=Decoder(samprate=SR, allphone=get_model_path("en-us/en-us-phone.lm.bin"), lw=2.0, pip=0.3, beam=1e-20, pbeam=1e-20)
    d.start_utt(); d.process_raw(a[int(s0*SR):int(s1*SR)].tobytes(), full_utt=True); d.end_utt()
    return [(x.word, s0+x.start_frame/100, s0+(x.end_frame+1)/100) for x in d.seg() if x.word not in ("SIL","+SPN+","+NSN+","<s>","</s>")]
def sw(T, H):
    n,m=len(T),len(H); M=np.zeros((n+1,m+1)); B=np.zeros((n+1,m+1),int)
    for i in range(1,n+1):
        for j in range(1,m+1):
            opts=(0, M[i-1,j-1]+sc(T[i-1],H[j-1][0]), M[i-1,j]-1.0, M[i,j-1]-0.7)
            k=int(np.argmax(opts)); M[i,j]=opts[k]; B[i,j]=k
    return M,B
def best(M,B,H,n):
    # best end anywhere, but prefer alignments covering most of the verse: trace back
    i,j=np.unravel_index(np.argmax(M),M.shape); score=M[i,j]; ei,ej=i,j
    while i>0 and j>0 and B[i,j]!=0:
        k=B[i,j]
        if k==1: i,j=i-1,j-1
        elif k==2: i-=1
        else: j-=1
    return score, i, ei, H[j][1] if j<len(H) else H[-1][1], H[ej-1][2]
if __name__=="__main__":
    f, text, s0, s1 = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
    a=wav(f); T=g2p(text); H=phones(a,s0,s1)
    M,B=sw(T,H); score,ti,te,st,en=best(M,B,H,len(T))
    # second best elsewhere: mask the found region
    Hm=[h for h in H if h[2]<st-1 or h[1]>en+1]; M2,_=sw(T,Hm); s2=M2.max()
    print(json.dumps(dict(start=round(st,2),end=round(en,2),score=round(float(score),1),second=round(float(s2),1),max=2*len(T),covered=[int(ti),int(te),len(T)])))
