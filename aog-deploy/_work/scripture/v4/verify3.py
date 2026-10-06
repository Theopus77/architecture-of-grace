import json,subprocess,numpy as np
from pocketsphinx import Decoder
for m in json.load(open("out/v4.json")):
    p=subprocess.run(["ffmpeg","-v","error","-i","out/"+m["file"],"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True); a=np.frombuffer(p.stdout,np.int16)
    af=a.astype(float); avg=20*np.log10(np.sqrt((af**2).mean())+1)
    db=lambda t:20*np.log10(np.sqrt((af[max(0,int(t*16000)-80):int(t*16000)+80]**2).mean())+1)
    print("##",m["file"],m["seconds"],"s  cut depth (dB below average):",[round(avg-db(s)) for s,d,l,_ in m["phrases"]])
    if m["version"]=="KJV":
        for s,d,l,_ in m["phrases"]:
            dd=Decoder(samprate=16000); dd.start_utt(); dd.process_raw(a[int(s*16000):int((s+d)*16000)].tobytes(),full_utt=True); dd.end_utt()
            print(f"   {l:30}| {' '.join(x.word.split('(')[0] for x in dd.seg() if not x.word.startswith(('<','[')))}")
