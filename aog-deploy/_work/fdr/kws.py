import sys, json, subprocess, numpy as np
from pocketsphinx import Decoder
SR=16000
def load(f,s0,s1):
    p=subprocess.run(["ffmpeg","-v","error","-ss",str(s0),"-t",str(s1-s0),"-i",f,"-ac","1","-ar",str(SR),"-f","s16le","-"],capture_output=True)
    return np.frombuffer(p.stdout,np.int16)
def find(f, phrase, s0, s1, th=1e-20):
    a=load(f,s0,s1); d=Decoder(samprate=SR, keyphrase=phrase.lower(), kws_threshold=th)
    d.start_utt(); d.process_raw(a.tobytes(),full_utt=True); d.end_utt()
    return [] if d.seg() is None else [(round(s0+x.start_frame/100,2), round(s0+(x.end_frame+1)/100,2), x.prob) for x in d.seg()]
if __name__=="__main__":
    f=sys.argv[1]; s0=float(sys.argv[2]); s1=float(sys.argv[3])
    for ph in sys.argv[4:]:
        for th in (1e-40,1e-25):
            r=find(f,ph,s0,s1,th)
            print(f"{ph!r:45} th={th:g} -> {r[:4]}")
