import sys, json, subprocess, kjv
from find import wav, SR
from pocketsphinx import Decoder
V=[("lev20_7",2,20,7,"levitico_20_rva_64kb.mp3",20,20),("ps51_10",18,51,10,"salmos_14_rva_64kb.mp3",49,51),
 ("ezk36_26",25,36,26,"ezequiel_36_rva_64kb.mp3",36,36),("jn17_17",42,17,17,"juan_17_rva_64kb.mp3",17,17),
 ("1th4_7",51,4,7,"12tesalonicenses_04_rva_64kb.mp3",4,4),("1th5_23",51,5,23,"12tesalonicenses_05_rva_64kb.mp3",5,5),
 ("heb10_10",57,10,10,"hebreos_10_rva_64kb.mp3",10,10),("1pe1_16",59,1,16,"1-2pedro_01_rva_64kb.mp3",1,1),
 ("isa43_11",22,43,11,"isaias_22_reinavalera_64kb.mp3",43,44),("isa45_22",22,45,22,"isaias_23_reinavalera_64kb.mp3",45,46),
 ("isa53_5",22,53,5,"isaias_27_reinavalera_64kb.mp3",53,54),("jn14_6",42,14,6,"juan_14_rva_64kb.mp3",14,14),
 ("jn10_9",42,10,9,"juan_10_rva_64kb.mp3",10,10),("acts4_12",43,4,12,"hechos_04_rva_64kb.mp3",4,4),
 ("1tim2_5",53,2,5,"1-2_timoteo_02_rva_64kb.mp3",2,2),("jn3_16",42,3,16,"juan_03_rva_64kb.mp3",3,3)]
def est(it):
    vid,bi,c,v,f,c0,c1=it; a=wav("rv/"+f); dur=len(a)/SR
    bk=kjv.B[bi]; ks=sorted(k for k in bk if c0<=k[0]<=c1); tot=sum(len(bk[k]) for k in ks)
    b0=sum(len(bk[k]) for k in ks if k<(c,v)); b1=b0+len(bk[(c,v)])
    return 18+(dur-24)*b0/tot, 18+(dur-24)*b1/tot, dur
if __name__=="__main__":
    i=int(sys.argv[1]); it=V[i]; e0,e1,dur=est(it); a=wav("rv/"+it[4])
    s0=max(0,e0-20); s1=min(dur,e1+20)
    d=Decoder(samprate=SR); d.start_utt(); d.process_raw(a[int(s0*SR):int(s1*SR)].tobytes(),full_utt=True); d.end_utt()
    w=" ".join(("|" if x.word=="<sil>" else x.word.split("(")[0])+("@%.1f"%(s0+x.start_frame/100) if x.word=="<sil>" else "") for x in d.seg() if x.word not in("<s>","</s>","[NOISE]"))
    print(f"### {it[0]} est {e0:.1f}-{e1:.1f} of {dur:.0f}\n{w}\n")
