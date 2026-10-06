import sys, json, re, subprocess, numpy as np
from pocketsphinx import Decoder
SR=16000
EXTRA={"arrogancies":"AE R AH G AH N S IY Z","schemings":"S K IY M IH NG Z","rededicate":"R IY D EH D AH K EY T","wheresoever":"W EH R S OW EH V ER",
 "violences":"V AY AH L AH N S AH Z","unconquerable":"AH N K AA NG K ER AH B AH L","invulnerable":"IH N V AH L N ER AH B AH L","rest":"R EH S T","keenness":"K IY N N AH S"}
def words(t): return [w for w in re.sub(r"[^a-z' ]"," ",t.lower().replace("-"," ")).split() if w]
def align(f, s0, s1, text):
    p=subprocess.run(["ffmpeg","-v","error","-ss",str(s0),"-t",str(s1-s0),"-i",f,"-ac","1","-ar",str(SR),"-f","s16le","-"],capture_output=True)
    a=np.frombuffer(p.stdout,np.int16)
    d=Decoder(samprate=SR, bestpath=False)
    ws=words(text); miss=[w for w in set(ws) if d.lookup_word(w) is None]
    for w in miss:
        if w in EXTRA: d.add_word(w, EXTRA[w], True)
        else: raise SystemExit("OOV "+w)
    d.set_align_text(" ".join(ws)); d.start_utt(); d.process_raw(a.tobytes(), full_utt=True); d.end_utt()
    out=[(x.word.split("(")[0], round(s0+x.start_frame/100,2), round(s0+(x.end_frame+1)/100,2)) for x in d.seg() if x.word not in ("<s>","</s>","<sil>")]
    return out
if __name__=="__main__":
    f,s0,s1,tf,out=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]),sys.argv[4],sys.argv[5]
    r=align(f,s0,s1,open(tf).read()); json.dump(r,open(out,"w")); print(len(r), r[:5], r[-5:])
