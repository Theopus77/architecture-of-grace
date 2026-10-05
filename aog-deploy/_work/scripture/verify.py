import json,subprocess,numpy as np
from pocketsphinx import Decoder
for m in json.load(open("out/meta.json")):
    p=subprocess.run(["ffmpeg","-v","error","-i","out/"+m["file"],"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True); a=np.frombuffer(p.stdout,np.int16)
    for s,d,l,ref in m["phrases"]:
        dd=Decoder(samprate=16000); dd.start_utt(); dd.process_raw(a[int(s*16000):int((s+d)*16000)].tobytes(),full_utt=True); dd.end_utt()
        print(f"{l:26}| {' '.join(x.word for x in dd.seg() if not x.word.startswith(('<','[')))}")
