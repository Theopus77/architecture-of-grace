import sys, json, subprocess, numpy as np
from pocketsphinx import Decoder
f, s0, s1, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
SR=16000
p=subprocess.run(["ffmpeg","-v","error","-ss",str(s0),"-t",str(s1-s0),"-i",f,"-ac","1","-ar",str(SR),"-f","s16le","-"],capture_output=True)
a=np.frombuffer(p.stdout,np.int16); words=[]
# 60 s pieces, so one bad stretch does not derail the rest
for k in range(0, len(a), 60*SR):
    seg=a[k:k+62*SR]; d=Decoder(samprate=SR); d.start_utt(); d.process_raw(seg.tobytes(),full_utt=True); d.end_utt()
    for x in d.seg():
        t=s0+k/SR+x.start_frame/100
        if x.word.startswith(("<","[")) or (words and t<=words[-1][1]): continue
        words.append((x.word.split("(")[0], round(t,2), round(s0+k/SR+(x.end_frame+1)/100,2)))
json.dump(words,open(out,"w"))
print(out, len(words))
