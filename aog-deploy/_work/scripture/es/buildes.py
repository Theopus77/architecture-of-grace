# AOG-SCRIPTURE-V3: Sed santos and El único camino, the same sixteen verses read in Spanish (Reina-Valera 1909).
import json, subprocess, numpy as np, os
from rvtexts import T
R=json.load(open("rv/final.json"))
SR=44100
REC=[
 ("16-sed-santos","Be Ye Holy in Spanish","Sed santos","Sanctification, read in Spanish: Leviticus to 1 Peter.","La santificación: ocho versículos de Levítico a 1 Pedro.",[
  ("lev20_7","Leviticus 20:7","Levítico 20:7","Santificaos","Soy vuestro Dios"),
  ("ps51_10","Psalm 51:10","Salmo 51:10","Un corazón limpio","Renueva un espíritu recto"),
  ("ezk36_26","Ezekiel 36:26","Ezequiel 36:26","Corazón nuevo","Corazón de carne"),
  ("jn17_17","John 17:17","Juan 17:17","Santifícalos","Tu palabra es verdad"),
  ("1th4_7","1 Thessalonians 4:7","1 Tesalonicenses 4:7","No nos ha llamado Dios","Santificación"),
  ("1th5_23","1 Thessalonians 5:23","1 Tesalonicenses 5:23","El Dios de paz","Espíritu y alma y cuerpo"),
  ("heb10_10","Hebrews 10:10","Hebreos 10:10","Somos santificados","Una sola vez"),
  ("1pe1_16","1 Peter 1:16","1 Pedro 1:16","Sed santos","Porque yo soy santo")]),
 ("17-el-unico-camino","The Only Way in Spanish","El único camino","Jesus is the only way to the Father, read in Spanish: Isaiah to John.","Jesús es el único camino al Padre: ocho versículos de Isaías a Juan.",[
  ("isa43_11","Isaiah 43:11","Isaías 43:11","Yo, yo Jehová","No hay quien salve"),
  ("isa45_22","Isaiah 45:22","Isaías 45:22","Sed salvos","No hay más"),
  ("isa53_5","Isaiah 53:5","Isaías 53:5","Por nuestras rebeliones","Por su llaga"),
  ("jn14_6","John 14:6","Juan 14:6","Yo soy el camino","Sino por mí"),
  ("jn10_9","John 10:9","Juan 10:9","Yo soy la puerta","Será salvo"),
  ("acts4_12","Acts 4:12","Hechos 4:12","En ningún otro hay salud","No hay otro nombre"),
  ("1tim2_5","1 Timothy 2:5","1 Timoteo 2:5","Hay un Dios","Un mediador"),
  ("jn3_16","John 3:16","Juan 3:16","Amó Dios al mundo","Vida eterna")]),
]
def load(f,s,e):
    p=subprocess.run(["ffmpeg","-v","error","-ss",f"{s:.3f}","-t",f"{e-s:.3f}","-i",f,"-af","highpass=f=70","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True,check=True)
    return np.frombuffer(p.stdout,dtype=np.float32).copy()
meta=[]
for fn,title,title_es,line,line_es,vs in REC:
    out=[np.zeros(int(0.35*SR),np.float32)]; t=0.35; phrases=[]; verses=[]
    for vid,ref,ref_es,l1,l2 in vs:
        assert l1.lower() in T[vid].lower() and l2.lower() in T[vid].lower(), (vid,l1,l2)
        v=R[vid]; s=v["start"]-0.04; e=v["end"]+0.10
        a=load(v["file"],s,e)
        n=int(0.01*SR); a[:n]*=np.linspace(0,1,n); m=int(0.05*SR); a[-m:]*=np.linspace(1,0,m)
        fr=a[:len(a)//441*441].reshape(-1,441); r=np.sqrt((fr**2).mean(1)); act=r[r>r.max()*0.1]
        g=min(10**(-20/20)/np.sqrt((act**2).mean()), 10**(-1.5/20)/np.abs(a).max()); a=a*g
        cut=v["cut"]+0.04
        verses.append({"ref":ref,"ref_es":ref_es,"at":round(t,3),"text":T[vid]})
        phrases.append([round(t,3), round(cut,3), l1, ref_es]); phrases.append([round(t+cut,3), round(len(a)/SR-cut,3), l2, ref_es])
        out.append(a); t+=len(a)/SR; out.append(np.zeros(int(0.9*SR),np.float32)); t+=0.9
    y=np.concatenate(out)
    subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","64k","-id3v2_version","3",
        "-metadata",f"title={title_es} (Reina-Valera 1909)","-metadata","artist=LibriVox volunteers","-metadata","comment=Reina-Valera 1909. Readings from LibriVox, public domain.",
        f"out/{fn}.mp3"],input=y.tobytes(),check=True)
    meta.append({"file":fn+".mp3","title":title,"title_es":title_es,"bpm":0,"kind":"scripture","version":"RV 1909","style":"Scripture (Reina-Valera)","style_es":"Escritura (Reina-Valera)",
        "bars":0,"seconds":round(len(y)/SR,1),"bytes":os.path.getsize(f"out/{fn}.mp3"),"line":line,"line_es":line_es,"verses":verses,"phrases":phrases})
json.dump(meta,open("out/es.json","w"),indent=1,ensure_ascii=False)
for m in meta: print(m["file"],m["seconds"],m["bytes"]); [print("  ",p) for p in m["phrases"]]
