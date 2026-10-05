import json, subprocess, numpy as np
R=json.load(open("w/refined.json")); SP=json.load(open("w/split.json"))
SP["jn10_9"]["cut"]=None
SR=44100
REC=[
 ("12-be-ye-holy","Be Ye Holy","Sed santos",[
  ("lev20_7","Leviticus 20:7","Levítico 20:7","Sanctify yourselves","I am the LORD"),
  ("ps51_10","Psalm 51:10","Salmo 51:10","Create in me","Renew a right spirit"),
  ("ezk36_26","Ezekiel 36:26","Ezequiel 36:26","A new heart","An heart of flesh"),
  ("jn17_17","John 17:17","Juan 17:17","Sanctify them","Thy word is truth"),
  ("1th4_7","1 Thessalonians 4:7","1 Tesalonicenses 4:7","God hath not called us","But unto holiness"),
  ("1th5_23","1 Thessalonians 5:23","1 Tesalonicenses 5:23","The very God of peace","Spirit and soul and body"),
  ("heb10_10","Hebrews 10:10","Hebreos 10:10","We are sanctified","Once for all"),
  ("1pe1_16","1 Peter 1:16","1 Pedro 1:16","Be ye holy","For I am holy")]),
 ("13-the-only-way","The Only Way","El único camino",[
  ("isa43_11","Isaiah 43:11","Isaías 43:11","I, even I, am the LORD","There is no saviour"),
  ("isa45_22","Isaiah 45:22","Isaías 45:22","Look unto me","There is none else"),
  ("isa53_5","Isaiah 53:5","Isaías 53:5","He was wounded","With his stripes"),
  ("jn14_6","John 14:6","Juan 14:6","I am the way","But by me"),
  ("jn10_9","John 10:9","Juan 10:9","I am the door","He shall be saved"),
  ("acts4_12","Acts 4:12","Hechos 4:12","Salvation in any other","None other name"),
  ("1tim2_5","1 Timothy 2:5","1 Timoteo 2:5","One God","One mediator"),
  ("jn3_16","John 3:16","Juan 3:16","God so loved the world","Everlasting life")]),
]
def load(f,s,e):
    p=subprocess.run(["ffmpeg","-v","error","-ss",f"{s:.3f}","-t",f"{e-s:.3f}","-i",f,"-af","highpass=f=70","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True)
    return np.frombuffer(p.stdout,dtype=np.float32).copy()
def cutJn109():
    import numpy as np
    from find import wav
    v=R["jn10_9"]; a=wav(v["file"])[int(v["start"]*16000):int(v["end"]*16000)].astype(np.float32)
    fr=[np.sqrt((a[i*160:(i+1)*160]**2).mean()) for i in range(75,122)]
    return (75+int(np.argmin(fr)))/100
SP["jn10_9"]["cut"]=cutJn109()
meta=[]
for fn,title,title_es,vs in REC:
    out=[np.zeros(int(0.35*SR),np.float32)]; t=0.35; phrases=[]; verses=[]
    for vid,ref,ref_es,l1,l2 in vs:
        v=R[vid]; s=v["start"]-0.04; e=v["end"]+0.10
        a=load(v["file"],s,e)
        n=int(0.01*SR); a[:n]*=np.linspace(0,1,n); m=int(0.05*SR); a[-m:]*=np.linspace(1,0,m)
        fr=a[:len(a)//441*441].reshape(-1,441); r=np.sqrt((fr**2).mean(1)); act=r[r>r.max()*0.1]
        g=10**(-20/20)/np.sqrt((act**2).mean()); g=min(g, 10**(-1.5/20)/np.abs(a).max()); a=a*g
        cut=SP[vid]["cut"]+0.04
        verses.append({"ref":ref,"ref_es":ref_es,"at":round(t,3),"text":v["text"]})
        phrases.append([round(t,3), round(cut,3), l1, ref]); phrases.append([round(t+cut,3), round(len(a)/SR-cut,3), l2, ref])
        out.append(a); t+=len(a)/SR
        out.append(np.zeros(int(0.9*SR),np.float32)); t+=0.9
    y=np.concatenate(out)
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","64k","-id3v2_version","3",
        "-metadata",f"title={title} (KJV)","-metadata","artist=LibriVox volunteers","-metadata","comment=King James Version. Readings from LibriVox, public domain.",
        f"out/{fn}.mp3"],input=y.tobytes(),check=True)
    import os
    meta.append({"file":fn+".mp3","title":title,"title_es":title_es,"bpm":0,"kind":"scripture","style":"Scripture (KJV)","style_es":"Escritura (KJV)",
        "bars":0,"seconds":round(len(y)/SR,1),"bytes":os.path.getsize(f"out/{fn}.mp3"),"verses":verses,"phrases":phrases})
json.dump(meta,open("out/meta.json","w"),indent=1,ensure_ascii=False)
for m in meta: print(m["file"],m["seconds"],m["bytes"]); [print("  ",p) for p in m["phrases"]]
