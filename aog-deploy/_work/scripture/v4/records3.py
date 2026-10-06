import json
from build3 import *
REF={"ps23_1":("Psalm 23:1","Salmo 23:1"),"ps23_4":("Psalm 23:4","Salmo 23:4"),"ps23_6":("Psalm 23:6","Salmo 23:6"),"ps46_1":("Psalm 46:1","Salmo 46:1"),
 "ps46_10":("Psalm 46:10","Salmo 46:10"),"ps100_1":("Psalm 100:1","Salmo 100:1"),"ps100_4":("Psalm 100:4","Salmo 100:4"),"ps150_6":("Psalm 150:6","Salmo 150:6"),
 **{f"co13_{v}":(f"1 Corinthians 13:{v}",f"1 Corintios 13:{v}") for v in (1,4,5,6,7,8,12,13)},
 "jos1_9":("Joshua 1:9","Josué 1:9"),"pr3_5":("Proverbs 3:5","Proverbios 3:5"),"pr3_6":("Proverbs 3:6","Proverbios 3:6"),"isa40_31":("Isaiah 40:31","Isaías 40:31"),
 "jer29_11":("Jeremiah 29:11","Jeremías 29:11"),"rom8_28":("Romans 8:28","Romanos 8:28"),"rom8_38":("Romans 8:38–39","Romanos 8:38–39"),"php4_13":("Philippians 4:13","Filipenses 4:13"),
 "heb11_1":("Hebrews 11:1","Hebreos 11:1"),"heb11_6":("Hebrews 11:6","Hebreos 11:6"),**{f"eph6_{v}":(f"Ephesians 6:{v}",f"Efesios 6:{v}") for v in (10,11,14,15,16,17)}}
# vid: (en split, en label 1, en label 2, es split, es label 1, es label 2)
P={
"ps23_1":("I shall","The LORD is my shepherd","I shall not want","nada","Jehová es mi pastor","Nada me faltará"),
"ps23_4":("for thou","I will fear no evil","Thou art with me","porque tú","No temeré mal alguno","Tú estarás conmigo"),
"ps23_6":("and I will dwell","Goodness and mercy","The house of the LORD","Y en la casa","El bien y la misericordia","En la casa de Jehová"),
"ps46_1":("a very present","Our refuge and strength","A very present help","Nuestro pronto","Nuestro amparo y fortaleza","Nuestro pronto auxilio"),
"ps46_10":("I will be exalted among","Be still, and know","I will be exalted","Ensalzado he","Estad quietos","Ensalzado seré"),
"ps100_1":("all ye lands","Make a joyful noise","All ye lands","habitantes","Cantad alegres á Dios","Toda la tierra"),
"ps100_4":("be thankful","Enter into his gates","Bless his name","Alabadle","Entrad por sus puertas","Bendecid su nombre"),
"ps150_6":("Praise ye the LORD.","Every thing that hath breath","Praise ye the LORD","Aleluya","Todo lo que respira","Aleluya"),
"co13_1":("and have not charity","Tongues of men","Sounding brass","y no tengo","Lenguas humanas y angélicas","Metal que resuena"),
"co13_4":("charity envieth not","Charity suffereth long","Charity envieth not","la caridad no tiene","La caridad es sufrida","No tiene envidia"),
"co13_5":("is not easily provoked","Seeketh not her own","Thinketh no evil","no se irrita","No busca lo suyo","No piensa el mal"),
"co13_6":("but rejoiceth","Rejoiceth not in iniquity","Rejoiceth in the truth","mas se huelga","No se huelga de la injusticia","Se huelga de la verdad"),
"co13_7":("hopeth all things","Beareth all things","Endureth all things","todo lo espera","Todo lo sufre","Todo lo soporta"),
"co13_8":("but whether","Charity never faileth","They shall fail","mas las profecías","La caridad nunca deja de ser","Cesarán las lenguas"),
"co13_12":("now I know in part","Through a glass, darkly","Even as also I am known","ahora conozco","Por espejo, en obscuridad","Como soy conocido"),
"co13_13":("but the greatest","Faith, hope, charity","The greatest of these","empero","La fe, la esperanza","La mayor de ellas"),
"jos1_9":("be not afraid","Of a good courage","Be not afraid","no temas","Seas valiente","No temas ni desmayes"),
"pr3_5":("and lean not","Trust in the LORD","Lean not","Y no estribes","Fíate de Jehová","No estribes en tu prudencia"),
"pr3_6":("and he shall","In all thy ways","He shall direct thy paths","Y él","En todos tus caminos","Enderezará tus veredas"),
"isa40_31":("they shall run","Wings as eagles","They shall run","correrán","Levantarán las alas","No se cansarán"),
"jer29_11":("thoughts of peace","I know the thoughts","Thoughts of peace","pensamientos de paz","Yo sé los pensamientos","Pensamientos de paz"),
"rom8_28":("to them who are","All things work together","According to his purpose","es á saber","Les ayudan á bien","Conforme al propósito"),
"rom8_38":("Nor height","Neither death, nor life","The love of God","Ni lo alto","Ni la muerte, ni la vida","El amor de Dios"),
"php4_13":("through Christ","I can do all things","Through Christ","en Cristo","Todo lo puedo","En Cristo que me fortalece"),
"heb11_1":("the evidence","Now faith is the substance","Things not seen","la demostración","La sustancia de las cosas","Las cosas que no se ven"),
"heb11_6":("for he that cometh","Without faith","He is a rewarder","porque es menester","Sin fe es imposible","Los que le buscan"),
"eph6_10":("and in the power","Be strong in the Lord","The power of his might","y en la potencia","Confortaos en el Señor","La potencia de su fortaleza"),
"eph6_11":("that ye may","The whole armour of God","Able to stand","para que","Toda la armadura de Dios","Estar firmes"),
"eph6_14":("and having on","Girt about with truth","The breastplate of righteousness","y vestidos","Estad pues firmes","La cota de justicia"),
"eph6_15":("with the preparation","Your feet shod","The gospel of peace","con el apresto","Calzados los pies","El evangelio de paz"),
"eph6_16":("wherewith","The shield of faith","The fiery darts","con que","El escudo de la fe","Los dardos de fuego"),
"eph6_17":("and the sword","The helmet of salvation","The sword of the Spirit","y la espada","El yelmo de salud","La espada del Espíritu"),
}
THEMES=[
 ("psalms-of-praise","salmos-de-alabanza","Psalms of Praise","Salmos de alabanza",["ps23_1","ps23_4","ps23_6","ps46_1","ps46_10","ps100_1","ps100_4","ps150_6"],
  "Praise and trust: Psalms 23, 46, 100 and 150.","Alabanza y confianza: Salmos 23, 46, 100 y 150."),
 ("charity-never-faileth","la-caridad","Charity Never Faileth","La caridad nunca deja de ser",["co13_1","co13_4","co13_5","co13_6","co13_7","co13_8","co13_12","co13_13"],
  "Love: eight verses of 1 Corinthians 13.","El amor: ocho versículos de 1 Corintios 13."),
 ("promises","promesas","Promises","Promesas",["jos1_9","pr3_5","pr3_6","isa40_31","jer29_11","rom8_28","rom8_38","php4_13"],
  "God's promises: Joshua to Philippians.","Las promesas de Dios: de Josué a Filipenses."),
 ("faith-and-armour","la-fe-y-la-armadura","Faith and the Armour of God","La fe y la armadura de Dios",["heb11_1","heb11_6","eph6_10","eph6_11","eph6_14","eph6_15","eph6_16","eph6_17"],
  "Faith (Hebrews 11) and the armour of God (Ephesians 6).","La fe (Hebreos 11) y la armadura de Dios (Efesios 6)."),
]
meta=[]; n=18
for slug_en,slug_es,ten,tes,ids,line,line_es in THEMES:
    for lang in ("en","es"):
        items=[(v,REF[v][0],REF[v][1])+((P[v][0],P[v][1],P[v][2]) if lang=="en" else (P[v][3],P[v][4],P[v][5])) for v in ids]
        y,ph,vs=verses_record(lang,items)
        fn=f"{n}-{slug_en if lang=='en' else slug_es}"; n+=1
        title=ten if lang=="en" else ten+" in Spanish"; title_es=(tes+" (en inglés)") if lang=="en" else tes
        size=write(fn,y,(ten+" (KJV)") if lang=="en" else (tes+" (Reina-Valera 1909)"))
        meta.append({"file":fn+".mp3","title":title,"title_es":title_es,"bpm":0,"kind":"scripture","version":"KJV" if lang=="en" else "RV 1909",
          "style":"Scripture (KJV)" if lang=="en" else "Scripture (Reina-Valera)","style_es":"Escritura (KJV)" if lang=="en" else "Escritura (Reina-Valera)",
          "bars":0,"seconds":round(len(y)/SR,1),"bytes":size,"line":line if lang=="en" else line+" Read in Spanish.","line_es":line_es,"verses":vs,"phrases":ph})
        print(fn, round(len(y)/SR,1))
# the Lord's Prayer, Luke 11:2-4
LR=[("Luke 11:2","Lucas 11:2")]*7+[("Luke 11:3","Lucas 11:3")]+[("Luke 11:4","Lucas 11:4")]*8
f="r2/a/luke_11-12_kjv_64kb.mp3"
lab=["Our Father","Which art in heaven","Hallowed be thy name","Thy kingdom come","Thy will be done","As in heaven","So in earth","Give us day by day",
     "Our daily bread","Forgive us our sins","For we also forgive","Every one that is indebted","Lead us not","Into temptation","But deliver us","From evil"]
cuts=[57.65,59.35,61.6,63.8,65.55,66.8,68.45,70.12,71.75,74.1,76.45,78.6,79.85,81.5,82.68]
ci=[0,2,3,4,7,9,12,14]
y,ph,vs=lines_record(f,56.85,83.45,cuts,lab,ci,[LR[i] for i in ci],"Luke 11:2–4")
size=write("14-the-lords-prayer-luke",y,"The Lord's Prayer (KJV, Luke 11)")
meta.append({"file":"14-the-lords-prayer-luke.mp3","title":"The Lord's Prayer","title_es":"El Padrenuestro (en inglés)","bpm":0,"kind":"scripture","version":"KJV",
  "style":"Scripture (KJV)","style_es":"Escritura (KJV)","bars":0,"seconds":round(len(y)/SR,1),"bytes":size,
  "line":"Luke 11:2–4, King James Version. A line on each pad.","line_es":"Lucas 11:2–4, en inglés (King James). Una línea en cada pad.","verses":vs,"phrases":ph,
  "text":"Our Father which art in heaven, Hallowed be thy name. Thy kingdom come. Thy will be done, as in heaven, so in earth. Give us day by day our daily bread. And forgive us our sins; for we also forgive every one that is indebted to us. And lead us not into temptation; but deliver us from evil."})
f="r2/a/lucas_11_rva_64kb.mp3"
lab=["Padre nuestro","Que estás en los cielos","Sea tu nombre santificado","Venga tu reino","Sea hecha tu voluntad","Como en el cielo","Así también en la tierra",
     "El pan nuestro","De cada día","Dánoslo hoy","Perdónanos nuestros pecados","Nosotros perdonamos","Todos los que nos deben","Y no nos metas","En tentación","Mas líbranos del mal"]
def mid(a,b,fr): return a+(b-a)*fr
cuts=[35.37,37.31,39.72,41.39,43.22,44.62,46.65,mid(47.0,48.81,0.42),48.98,50.56,53.11,mid(53.48,56.50,0.62),57.0,mid(57.19,58.88,0.45),59.10]
ci=[0,2,3,4,7,10,13,15]
LRs=[("Luke 11:2","Lucas 11:2")]*7+[("Luke 11:3","Lucas 11:3")]*3+[("Luke 11:4","Lucas 11:4")]*6
y,ph,vs=lines_record(f,34.25,60.71,cuts,lab,ci,[LRs[i] for i in ci],"Lucas 11:2–4")
size=write("15-el-padrenuestro-lucas",y,"El Padrenuestro (Reina-Valera 1909, Lucas 11)")
meta.append({"file":"15-el-padrenuestro-lucas.mp3","title":"The Lord's Prayer in Spanish","title_es":"El Padrenuestro","bpm":0,"kind":"scripture","version":"RV 1909",
  "style":"Scripture (Reina-Valera)","style_es":"Escritura (Reina-Valera)","bars":0,"seconds":round(len(y)/SR,1),"bytes":size,
  "line":"Luke 11:2–4, read in Spanish (Reina-Valera 1909). A line on each pad.","line_es":"Lucas 11:2–4, Reina-Valera 1909. Una línea en cada pad.","verses":vs,"phrases":ph,
  "text":es2texts.T["lk11_2"]})
json.dump(meta,open("out/v4.json","w"),indent=1,ensure_ascii=False)
print("done",len(meta))
