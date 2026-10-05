# AOG-SCRIPTURE-V2: the Lord's Prayer (Matthew 6:9-13), KJV and Reina-Valera 1909, one take each.
# Cut times were read off pocketsphinx word timings and the loudness of each 10 ms (see README.md);
# each cut snaps to the quietest moment within 0.25 s.
import json, subprocess, numpy as np, os
from find import wav
from refine import rms
SR=44100
P=[
 dict(fn="14-the-lords-prayer", src="matthew_06_kjv_64kb.mp3", title="The Lord's Prayer", title_es="El Padrenuestro (en inglés)",
  version="KJV", style="Scripture (KJV)", style_es="Escritura (KJV)", ref="Matthew 6:9–13", ref_es="Mateo 6:9–13",
  line="Matthew 6:9–13, King James Version. A line on each pad.", line_es="Mateo 6:9–13, en inglés (King James). Una línea en cada pad.",
  start=109.3, end=146.1, cuts=[113.1,114.7,117.0,119.4,121.3,125.1,127.9,130.4,132.8,136.3,138.6,140.8,142.4,143.8,145.0],
  labels=["After this manner","Our Father","Which art in heaven","Hallowed be thy name","Thy kingdom come","Thy will be done","Give us this day",
   "Forgive us our debts","As we forgive","Lead us not","Deliver us from evil","Thine is the kingdom","And the power","And the glory","For ever","Amen"],
  cues=[0,1,4,6,7,9,11,15], refs=["6:9","6:9","6:10","6:11","6:12","6:13","6:13","6:13"],
  text="After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name. Thy kingdom come, Thy will be done in earth, as it is in heaven. Give us this day our daily bread. And forgive us our debts, as we forgive our debtors. And lead us not into temptation, but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen."),
 dict(fn="15-el-padrenuestro", src="mateo_06_rva_64kb.mp3", title="The Lord's Prayer in Spanish", title_es="El Padrenuestro",
  version="RV 1909", style="Scripture (Reina-Valera)", style_es="Escritura (Reina-Valera)", ref="Matthew 6:9–13", ref_es="Mateo 6:9–13",
  line="Matthew 6:9–13, read in Spanish (Reina-Valera 1909). A line on each pad.", line_es="Mateo 6:9–13, Reina-Valera 1909. Una línea en cada pad.",
  start=109.45, end=146.9, cuts=[111.5,112.9,115.1,117.7,119.5,121.7,125.4,128.5,131.2,135.2,137.6,139.6,141.7,143.6,145.6],
  labels=["Oraréis así","Padre nuestro","Que estás en los cielos","Santificado tu nombre","Venga tu reino","Sea hecha tu voluntad","Como en el cielo",
   "Danos hoy nuestro pan","Perdónanos nuestras deudas","Nosotros perdonamos","No nos metas en tentación","Líbranos del mal","Tuyo es el reino",
   "El poder y la gloria","Por todos los siglos","Amén"],
  cues=[0,1,4,7,8,10,12,15], refs=["6:9","6:9","6:10","6:11","6:12","6:13","6:13","6:13"],
  text="Vosotros pues, oraréis así: Padre nuestro que estás en los cielos, sea santificado tu nombre. Venga tu reino. Sea hecha tu voluntad, como en el cielo, así también en la tierra. Danos hoy nuestro pan cotidiano. Y perdónanos nuestras deudas, como también nosotros perdonamos á nuestros deudores. Y no nos metas en tentación, mas líbranos del mal: porque tuyo es el reino, y el poder, y la gloria, por todos los siglos. Amén."),
]
meta=[]
for p in P:
    r=rms(wav(p["src"]))
    snap=lambda t:(lambda i:i/100)(int(t*100)-25+int(np.argmin(r[int(t*100)-25:int(t*100)+26])))
    cuts=[snap(c) for c in p["cuts"]]
    s=p["start"]-0.04; e=p["end"]+0.10
    pr=subprocess.run(["ffmpeg","-v","error","-ss",f"{s:.3f}","-t",f"{e-s:.3f}","-i",p["src"],"-af","highpass=f=70","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True)
    a=np.frombuffer(pr.stdout,np.float32).copy()
    n=int(0.01*SR); a[:n]*=np.linspace(0,1,n); m=int(0.05*SR); a[-m:]*=np.linspace(1,0,m)
    fr=a[:len(a)//441*441].reshape(-1,441); rr=np.sqrt((fr**2).mean(1)); act=rr[rr>rr.max()*0.1]
    g=min(10**(-20/20)/np.sqrt((act**2).mean()), 10**(-1.5/20)/np.abs(a).max()); a*=g
    lead=0.35; y=np.concatenate([np.zeros(int(lead*SR),np.float32),a,np.zeros(int(0.5*SR),np.float32)])
    off=lead-s; edges=[p["start"]-0.04]+cuts+[p["end"]+0.10]
    phrases=[[round(edges[i]+off,3), round(edges[i+1]-edges[i],3), p["labels"][i], p["ref"]] for i in range(16)]
    verses=[{"ref":p["ref"].split(" ")[0]+" "+p["refs"][k], "ref_es":p["ref_es"].split(" ")[0]+" "+p["refs"][k], "at":phrases[i][0], "text":p["labels"][i]} for k,i in enumerate(p["cues"])]
    out=f"out/{p['fn']}.mp3"
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","64k","-id3v2_version","3",
        "-metadata",f"title={p['title']} ({p['version']})","-metadata","artist=LibriVox volunteers","-metadata","comment=Matthew 6:9-13. Reading from LibriVox, public domain.",out],input=y.tobytes(),check=True)
    meta.append({"file":p["fn"]+".mp3","title":p["title"],"title_es":p["title_es"],"bpm":0,"kind":"scripture","version":p["version"],"style":p["style"],"style_es":p["style_es"],
        "bars":0,"seconds":round(len(y)/SR,1),"bytes":os.path.getsize(out),"line":p["line"],"line_es":p["line_es"],"text":p["text"],"verses":verses,"phrases":phrases})
json.dump(meta,open("out/prayer.json","w"),indent=1,ensure_ascii=False)
for m in meta: print(m["file"],m["seconds"]); [print("  ",x) for x in m["phrases"]]
