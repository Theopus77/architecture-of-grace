#!/usr/bin/env python3
"""AOG-SCALES-LIB-V1 (Jimmy, 2026-10-05: "The guitar Grimoire … SO MANY MANY SCALES AND MODES"): writes aog-deploy/aog-scales.js,
the scale library every instrument loads (guitar, bass, piano, The Band). Every mode of each parent scale, then bebop,
symmetric, six-note and world scales. Standard theory names, our own short words. No two scales share the same notes: a
later one with the same notes as an earlier one is left out. The first 53 ids (Solo mode's) never change.
    python3 aog-deploy/_work/music/make_scales.py"""
import json, os
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'aog-scales.js')
def rot(iv, k):
    r = iv[k:] + [x + 12 for x in iv[:k]]; b = r[0]; return [x - b for x in r]
ORD = ["1st","2nd","3rd","4th","5th","6th","7th","8th"]
ORD_ES = ["1.º","2.º","3.º","4.º","5.º","6.º","7.º","8.º"]
groups = []   # (gid, en, es, [ids])
S = {}        # id -> dict(iv, blue, le, ls, ne, ns)
seen = {}
def add(g, i, iv, le, ls, ne, ns, blue=None):
    key = tuple(iv)
    if i in S: g[3].append(i) if i not in g[3] else None; return
    if key in seen: return
    seen[key] = i; S[i] = dict(iv=iv, blue=blue, le=le, ls=ls, ne=ne, ns=ns); g[3].append(i)
def group(gid, en, es):
    g = (gid, en, es, []); groups.append(g); return g
def modes(g, parent_iv, parent_en, parent_es, names):
    """names: list of (id, name_en, name_es, feel_en, feel_es) per mode, in order"""
    for k, (i, ne, ns, fe, fs) in enumerate(names):
        iv = rot(parent_iv, k)
        le = f"{ne} · {fe}" if fe else f"{ne} · {ORD[k]} mode of {parent_en}"
        ls = f"{ns[0].upper()+ns[1:]} · {fs}" if fs else f"{ns[0].upper()+ns[1:]} · {ORD_ES[k]} modo de la {parent_es}"
        add(g, i, iv, le, ls, ne, ns)

# ---- pentatonic and blues ----
g = group("pent", "Pentatonic and blues", "Pentatónicas y blues")
add(g,"minpent",[0,3,5,7,10],"Minor pentatonic","Pentatónica menor","minor pentatonic","pentatónica menor")
add(g,"blues",[0,3,5,6,7,10],"Blues · with the blue note","Blues · con la nota blue","blues","de blues",blue=6)
add(g,"majpent",[0,2,4,7,9],"Major pentatonic","Pentatónica mayor","major pentatonic","pentatónica mayor")
add(g,"majblues",[0,2,3,4,7,9],"Major blues · major pentatonic with the blue note","Blues mayor · pentatónica mayor con la nota blue","major blues","de blues mayor",blue=3)
add(g,"mixblues",[0,2,3,4,5,6,7,9,10],"Mixed blues · both blues scales together","Blues mixto · las dos escalas de blues juntas","mixed blues","de blues mixto",blue=6)
add(g,"dompent",[0,2,4,7,10],"Dominant pentatonic · bright with a bluesy 7th","Pentatónica dominante · brillante con una 7.ª de blues","dominant pentatonic","pentatónica dominante")
add(g,"min6pent",[0,3,5,7,9],"Minor 6 pentatonic · minor with a sweet 6th","Pentatónica menor 6 · menor con una 6.ª dulce","minor 6 pentatonic","pentatónica menor 6")
add(g,"suspent",[0,2,5,7,10],"Suspended pentatonic · open, neither major nor minor","Pentatónica suspendida · abierta, ni mayor ni menor","suspended pentatonic","pentatónica suspendida")
add(g,"mangong",[0,3,5,8,10],"Man gong pentatonic · minor and gentle","Pentatónica man gong · menor y suave","man gong pentatonic","pentatónica man gong")
add(g,"majb6pent",[0,2,4,7,8],"Major ♭6 pentatonic · bright that turns wistful","Pentatónica mayor ♭6 · brillante que se vuelve nostálgica","major flat 6 pentatonic","pentatónica mayor bemol 6")
add(g,"minmaj7pent",[0,3,5,7,11],"Minor-major 7 pentatonic · minor with a rising 7th","Pentatónica menor-mayor 7 · menor con una 7.ª que sube","minor-major 7 pentatonic","pentatónica menor-mayor 7")
add(g,"majblues2",[0,2,3,4,5,7,9],"Major blues with the 4th · seven notes, country blues","Blues mayor con la 4.ª · siete notas, blues country","major blues with the 4th","de blues mayor con la 4.ª",blue=3)
add(g,"bluesmaj7",[0,3,5,6,7,10,11],"Blues with the major 7th · a passing note into home","Blues con la 7.ª mayor · una nota de paso hacia casa","blues with the major 7th","de blues con 7.ª mayor",blue=6)

# ---- modes of major ----
g = group("modes", "Modes of the major scale", "Modos de la escala mayor")
add(g,"major",[0,2,4,5,7,9,11],"Major","Mayor","major","mayor")
add(g,"dorian",[0,2,3,5,7,9,10],"Dorian · minor, a little brighter","Dórica · menor, un poco más brillante","Dorian","dórica")
add(g,"phryg",[0,1,3,5,7,8,10],"Phrygian · minor with a dark half step","Frigia · menor con un semitono oscuro","Phrygian","frigia")
add(g,"lydian",[0,2,4,6,7,9,11],"Lydian · major that floats","Lidia · mayor que flota","Lydian","lidia")
add(g,"mixo",[0,2,4,5,7,9,10],"Mixolydian · major with a bluesy 7th","Mixolidia · mayor con una 7.ª de blues","Mixolydian","mixolidia")
add(g,"natmin",[0,2,3,5,7,8,10],"Natural minor","Menor natural","natural minor","menor natural")
add(g,"locrian",[0,1,3,5,6,8,10],"Locrian · the darkest mode","Locria · el modo más oscuro","Locrian","locria")

# ---- modes of melodic minor ----
g = group("melmin", "Modes of melodic minor", "Modos de la menor melódica")
modes(g,[0,2,3,5,7,9,11],"melodic minor","menor melódica",[
 ("melmin","Melodic minor","menor melódica","minor that climbs bright","menor que sube brillante"),
 ("dorb2","Dorian ♭2","dórica ♭2","dark jazz minor","menor oscura de jazz"),
 ("lydaug","Lydian augmented","lidia aumentada","dreamy and wide","soñadora y amplia"),
 ("lyddom","Lydian dominant","lidia dominante","bright and bluesy","brillante y con blues"),
 ("mixob6","Mixolydian ♭6","mixolidia ♭6","major that turns sad","mayor que se vuelve triste"),
 ("halfdim","Half-diminished","semidisminuida","Locrian with a natural 2nd","locria con la 2.ª natural"),
 ("altered","Altered","alterada","full of tension, for the 5 chord","llena de tensión, para el acorde 5")])

# ---- modes of harmonic minor ----
g = group("harmin", "Modes of harmonic minor", "Modos de la menor armónica")
modes(g,[0,2,3,5,7,8,11],"harmonic minor","menor armónica",[
 ("harmin","Harmonic minor","menor armónica","dark and Spanish","oscura y española"),
 ("locnat6","Locrian ♮6","locria ♮6","",""),
 ("ionaug","Ionian ♯5","jónica ♯5","major with a raised 5th","mayor con la 5.ª alta"),
 ("romanian","Romanian minor","menor rumana","Dorian with a raised 4th","dórica con la 4.ª alta"),
 ("phrydom","Phrygian dominant","frigia dominante","Spanish, flamenco and klezmer","española, flamenca y klezmer"),
 ("lydsh2","Lydian ♯2","lidia ♯2","bright and exotic","brillante y exótica"),
 ("ultraloc","Ultralocrian","ultralocria","the darkest of all","la más oscura de todas")])

# ---- modes of harmonic major ----
g = group("harmaj", "Modes of harmonic major", "Modos de la mayor armónica")
modes(g,[0,2,4,5,7,8,11],"harmonic major","mayor armónica",[
 ("harmaj","Harmonic major","mayor armónica","major with a sad 6th","mayor con una 6.ª triste"),
 ("dorb5","Dorian ♭5","dórica ♭5","",""),
 ("phryb4","Phrygian ♭4","frigia ♭4","",""),
 ("lydmin","Lydian ♭3","lidia ♭3","Lydian with a minor 3rd","lidia con 3.ª menor"),
 ("mixob2","Mixolydian ♭2","mixolidia ♭2","",""),
 ("lydaugsh2","Lydian augmented ♯2","lidia aumentada ♯2","",""),
 ("locbb7","Locrian ♭♭7","locria ♭♭7","","")])

# ---- modes of double harmonic ----
g = group("dblharm", "Modes of double harmonic", "Modos de la doble armónica")
modes(g,[0,1,4,5,7,8,11],"double harmonic","doble armónica",[
 ("dblharm","Double harmonic","doble armónica","Arabic and Indian","árabe e india"),
 ("lydsh2sh6","Lydian ♯2 ♯6","lidia ♯2 ♯6","",""),
 ("ultraphryg","Ultraphrygian","ultrafrigia","",""),
 ("hungmin","Hungarian minor","menor húngara","gypsy minor","menor gitana"),
 ("oriental","Oriental","oriental","",""),
 ("ionaugsh2","Ionian augmented ♯2","jónica aumentada ♯2","",""),
 ("locbb3bb7","Locrian ♭♭3 ♭♭7","locria ♭♭3 ♭♭7","","")])

# ---- Neapolitan major and minor ----
g = group("neap", "Neapolitan modes", "Modos napolitanos")
modes(g,[0,1,3,5,7,9,11],"Neapolitan major","mayor napolitana",[
 ("neapmaj","Neapolitan major","mayor napolitana","bright with a dark start","brillante con un inicio oscuro"),
 ("leadwhole","Leading whole tone","de tono entero sensible","whole steps up to home","tonos enteros hasta casa"),
 ("lydaugdom","Lydian augmented dominant","lidia aumentada dominante","",""),
 ("lyddomb6","Lydian dominant ♭6","lidia dominante ♭6","",""),
 ("majloc","Major Locrian","locria mayor","Arabian","arábiga"),
 ("halfdimb4","Half-diminished ♭4","semidisminuida ♭4","",""),
 ("altbb3","Altered ♭♭3","alterada ♭♭3","","")])
modes(g,[0,1,3,5,7,8,11],"Neapolitan minor","menor napolitana",[
 ("neapmin","Neapolitan minor","menor napolitana","dark and dramatic","oscura y dramática"),
 ("lydsh6","Lydian ♯6","lidia ♯6","",""),
 ("mixoaug","Mixolydian augmented","mixolidia aumentada","",""),
 ("romanimin","Romani minor","menor romaní","",""),
 ("locdom","Locrian dominant","locria dominante","",""),
 ("ionsh2","Ionian ♯2","jónica ♯2","",""),
 ("ultralocbb3","Ultralocrian ♭♭3","ultralocria ♭♭3","","")])

# ---- modes of Hungarian major ----
g = group("hungmaj", "Modes of Hungarian major", "Modos de la mayor húngara")
modes(g,[0,3,4,6,7,9,10],"Hungarian major","mayor húngara",[
 ("hungmaj","Hungarian major","mayor húngara","bold and unusual","atrevida y poco común"),
 ("altbb6bb7","Altered ♭♭6 ♭♭7","alterada ♭♭6 ♭♭7","",""),
 ("locnat2bb7","Locrian ♮2 ♭♭7","locria ♮2 ♭♭7","",""),
 ("altdomnat6","Altered dominant ♮6","dominante alterada ♮6","",""),
 ("melminsh5","Melodic minor ♯5","menor melódica ♯5","",""),
 ("dorb2sh4","Dorian ♭2 ♯4","dórica ♭2 ♯4","",""),
 ("lydaugsh3","Lydian augmented ♯3","lidia aumentada ♯3","","")])

# ---- bebop ----
g = group("bebop", "Bebop scales", "Escalas bebop")
add(g,"bebopdom",[0,2,4,5,7,9,10,11],"Bebop dominant · Mixolydian plus a passing note","Bebop dominante · mixolidia con una nota de paso","bebop dominant","bebop dominante")
add(g,"bebopmaj",[0,2,4,5,7,8,9,11],"Bebop major · major plus a passing note","Bebop mayor · mayor con una nota de paso","bebop major","bebop mayor")
add(g,"bebopmin",[0,2,3,4,5,7,9,10],"Bebop minor · Dorian plus a passing note","Bebop menor · dórica con una nota de paso","bebop minor","bebop menor")
add(g,"bebopmelmin",[0,2,3,5,7,8,9,11],"Bebop melodic minor · melodic minor plus a passing note","Bebop menor melódica · menor melódica con una nota de paso","bebop melodic minor","bebop menor melódica")
add(g,"bebopharmin",[0,2,3,5,7,8,10,11],"Bebop harmonic minor · natural minor plus the raised 7th","Bebop menor armónica · menor natural con la 7.ª alta","bebop harmonic minor","bebop menor armónica")
add(g,"bebopdorian2",[0,2,3,5,7,9,10,11],"Bebop Dorian · Dorian plus the major 7th","Bebop dórica · dórica con la 7.ª mayor","bebop Dorian","bebop dórica")

# ---- symmetric ----
g = group("sym", "Symmetric and unusual", "Simétricas y poco comunes")
add(g,"whole",[0,2,4,6,8,10],"Whole tone · every step the same, like a dream","Tonos enteros · todos los pasos iguales, como un sueño","whole tone","de tonos enteros")
add(g,"dimhw",[0,1,3,4,6,7,9,10],"Diminished · half step, then whole step","Disminuida · semitono, luego tono","half-whole diminished","disminuida semitono-tono")
add(g,"dimwh",[0,2,3,5,6,8,9,11],"Diminished · whole step, then half step","Disminuida · tono, luego semitono","whole-half diminished","disminuida tono-semitono")
add(g,"augsc",[0,3,4,7,8,11],"Augmented · six notes, two triads","Aumentada · seis notas, dos tríadas","augmented","aumentada")
add(g,"auginv",[0,1,4,5,8,9],"Augmented inverse · half step, then minor 3rd","Aumentada inversa · semitono, luego 3.ª menor","augmented inverse","aumentada inversa")
add(g,"tritone",[0,1,4,6,7,10],"Tritone · two chords a tritone apart","Tritono · dos acordes a un tritono","tritone","de tritono")
add(g,"twosemitone",[0,1,2,6,7,8],"Two-semitone tritone · clusters a tritone apart","Tritono de dos semitonos · grupos a un tritono","two-semitone tritone","de tritono de dos semitonos")
add(g,"prometheus",[0,2,4,6,9,10],"Prometheus · mysterious and floating","Prometeo · misteriosa y flotante","Prometheus","de Prometeo")
add(g,"enigma",[0,1,4,6,8,10,11],"Enigmatic · strange and searching","Enigmática · extraña e inquieta","enigmatic","enigmática")
add(g,"messiaen3",[0,2,3,4,6,7,8,10,11],"Messiaen mode 3 · nine notes, shimmering","Modo 3 de Messiaen · nueve notas, brillante","Messiaen mode 3","modo 3 de Messiaen")
add(g,"messiaen4",[0,1,2,5,6,7,8,11],"Messiaen mode 4 · eight notes, clustered","Modo 4 de Messiaen · ocho notas, agrupadas","Messiaen mode 4","modo 4 de Messiaen")
add(g,"messiaen5",[0,1,5,6,7,11],"Messiaen mode 5 · six notes, stark","Modo 5 de Messiaen · seis notas, austera","Messiaen mode 5","modo 5 de Messiaen")
add(g,"messiaen6",[0,2,4,5,6,8,10,11],"Messiaen mode 6 · eight notes, whole-tone colors","Modo 6 de Messiaen · ocho notas, colores de tonos enteros","Messiaen mode 6","modo 6 de Messiaen")
add(g,"messiaen7",[0,1,2,3,5,6,7,8,9,11],"Messiaen mode 7 · ten notes, almost everything","Modo 7 de Messiaen · diez notas, casi todas","Messiaen mode 7","modo 7 de Messiaen")
add(g,"chrom",[0,1,2,3,4,5,6,7,8,9,10,11],"Chromatic · every note, for runs","Cromática · todas las notas, para carreras","chromatic","cromática")

# ---- six-note scales ----
g = group("hexa", "Six-note scales", "Escalas de seis notas")
add(g,"majhex",[0,2,4,5,7,9],"Major six-note · major without the 7th, folk tunes","Mayor de seis notas · mayor sin la 7.ª, canciones populares","major six-note","mayor de seis notas")
add(g,"minhex",[0,2,3,5,7,10],"Minor six-note · minor without the 6th, Celtic","Menor de seis notas · menor sin la 6.ª, celta","minor six-note","menor de seis notas")
add(g,"mixohex",[0,2,4,5,7,10],"Mixolydian six-note · Mixolydian without the 6th","Mixolidia de seis notas · mixolidia sin la 6.ª","Mixolydian six-note","mixolidia de seis notas")
add(g,"lydhex",[0,2,4,7,9,11],"Lydian six-note · bright, without the 4th","Lidia de seis notas · brillante, sin la 4.ª","Lydian six-note","lidia de seis notas")
add(g,"phryhex",[0,1,3,5,7,10],"Phrygian six-note · dark, without the 6th","Frigia de seis notas · oscura, sin la 6.ª","Phrygian six-note","frigia de seis notas")
add(g,"harmhex",[0,2,3,5,7,11],"Harmonic minor six-note · without the 6th","Menor armónica de seis notas · sin la 6.ª","harmonic minor six-note","menor armónica de seis notas")
add(g,"istrian",[0,1,3,4,6,7],"Istrian · six close notes, folk from Croatia","Istria · seis notas cercanas, folclor de Croacia","Istrian","de Istria")
add(g,"pyramid",[0,2,3,5,6,9],"Pyramid · mysterious six notes","Pirámide · seis notas misteriosas","pyramid","pirámide")

# ---- around the world ----
g = group("world", "Around the world", "Alrededor del mundo")
add(g,"persian",[0,1,4,5,6,8,11],"Persian · rich and ancient","Persa · rica y antigua","Persian","persa")
add(g,"spanish8",[0,1,3,4,5,6,8,10],"Spanish eight-tone · flamenco runs","Española de ocho notas · carreras flamencas","Spanish eight-tone","española de ocho notas")
add(g,"hirajoshi",[0,2,3,7,8],"Hirajoshi · Japanese, five notes","Hirajoshi · japonesa, cinco notas","Hirajoshi","hirajoshi")
add(g,"insen",[0,1,5,7,10],"In-sen · Japanese, quiet and spare","In-sen · japonesa, tranquila y sencilla","In-sen","in-sen")
add(g,"iwato",[0,1,5,6,10],"Iwato · Japanese, dark","Iwato · japonesa, oscura","Iwato","iwato")
add(g,"kumoi",[0,2,3,7,9],"Kumoi · Japanese, gentle","Kumoi · japonesa, suave","Kumoi","kumoi")
add(g,"yo",[0,2,5,7,9],"Yo · Japanese folk, bright","Yo · folclórica japonesa, brillante","Yo","yo")
add(g,"ryukyu",[0,4,5,7,11],"Ryukyu · Okinawan, bright and sweet","Ryukyu · de Okinawa, brillante y dulce","Ryukyu","ryukyu")
add(g,"pelog",[0,1,3,7,8],"Pelog · Balinese gamelan","Pelog · gamelán de Bali","Pelog","pelog")
add(g,"todi",[0,1,3,6,7,8,11],"Raga Todi · Indian, serious and deep","Raga Todi · india, seria y profunda","Raga Todi","raga Todi")
add(g,"marwa",[0,1,4,6,9,11],"Raga Marwa · Indian, evening and longing","Raga Marwa · india, de tarde y nostalgia","Raga Marwa","raga Marwa")
add(g,"hamsa",[0,2,4,7,11],"Raga Hamsadhwani · Indian, joyful","Raga Hamsadhwani · india, alegre","Raga Hamsadhwani","raga Hamsadhwani")
add(g,"purvi",[0,1,4,6,7,8,11],"Raga Purvi · Indian, dusk","Raga Purvi · india, del atardecer","Raga Purvi","raga Purvi")
add(g,"chinese",[0,4,6,7,11],"Chinese · bright, five notes","China · brillante, cinco notas","Chinese","china")
add(g,"egyptian",[0,2,5,7,10],"Egyptian · open five notes","Egipcia · cinco notas abiertas","Egyptian","egipcia")
add(g,"ethiopian",[0,2,4,5,7,8,11],"Ethiopian · bright with a sad 6th","Etíope · brillante con una 6.ª triste","Ethiopian","etíope")

# ---- modes of other parent scales (named by their place: "2nd mode of …") ----
g = group("moremodes", "More modes", "Más modos")
def gen(parent_iv, pid, pen, pes, count=None):
    n = len(parent_iv) if count is None else count
    for k in range(1, n):
        iv = rot(parent_iv, k)
        add(g, f"{pid}{k+1}", iv, f"{pen[0].upper()+pen[1:]}, mode {k+1} · {ORD[k]} mode of the {pen} scale", f"{pes[0].upper()+pes[1:]}, modo {k+1} · {ORD_ES[k]} modo de la escala {pes}",
            f"{pen}, mode {k+1}", f"{pes}, modo {k+1}")
gen([0,3,5,6,7,10], "bluesm", "blues", "de blues")
gen([0,2,4,6,9,10], "promm", "Prometheus", "de Prometeo")
gen([0,1,4,5,6,8,11], "persm", "Persian", "persa")
gen([0,1,4,6,8,10,11], "enigm", "enigmatic", "enigmática")
gen([0,2,3,7,8], "hiram", "Hirajoshi", "hirajoshi")
gen([0,2,4,5,7,9], "majhexm", "major six-note", "mayor de seis notas")
gen([0,1,3,4,5,6,8,10], "span8m", "Spanish eight-tone", "española de ocho notas")
gen([0,1,3,6,7,8,11], "todim", "Raga Todi", "raga Todi")
gen([0,2,4,5,7,9,10,11], "bebdm", "bebop dominant", "bebop dominante")
gen([0,1,3,4,6,7], "istm", "Istrian", "de Istria")

# ---- check: the first 53 ids are all here ----
FIRST53 = ["minpent","blues","majpent","natmin","major","dorian","mixo","harmin","majblues","mixblues","dompent","min6pent","suspent","phryg","lydian","locrian",
  "melmin","hungmin","neapmin","romanian","harmaj","lyddom","mixob6","neapmaj","hungmaj","bebopdom","bebopmaj","bebopmin","altered","lydaug","halfdim","dorb2",
  "whole","dimhw","dimwh","augsc","tritone","prometheus","chrom","phrydom","dblharm","persian","majloc","spanish8","enigma","hirajoshi","insen","iwato","kumoi","yo","pelog","todi","chinese"]
missing = [i for i in FIRST53 if i not in S]
assert not missing, missing
order = [i for g in groups for i in g[3]]
assert len(order) == len(set(order)) == len(S)
SC = {i: ({"iv": S[i]["iv"]} | ({"blue": S[i]["blue"]} if S[i]["blue"] is not None else {})) for i in order}
W = {}
for i in order:
    W["sc_"+i] = {"en": S[i]["le"], "es": S[i]["ls"]}
    W["nm_"+i] = {"en": S[i]["ne"], "es": S[i]["ns"]}
for g in groups: W["sg_"+g[0]] = {"en": g[1], "es": g[2]}
G = [[g[0], g[3]] for g in groups]
js = ("/* AOG-SCALES-LIB-V1 (2026-10-05) — the scale library every instrument loads (guitar, bass, piano, The Band).\n"
      "   Written by aog-deploy/_work/music/make_scales.py: edit that, not this. iv = steps above the key's home note; blue = the\n"
      "   blues note; words: sc_ (menu label), nm_ (spoken name), sg_ (group heading), English and Spanish. */\n"
      "window.AOGScales={SCALES:" + json.dumps(SC, ensure_ascii=False, separators=(",",":")) + ",\nGROUPS:" + json.dumps(G, separators=(",",":")) +
      ",\nWORDS:" + json.dumps(W, ensure_ascii=False, separators=(",",":")) + "};\n")
open(OUT, "w").write(js)
print(len(order), "scales in", len(groups), "groups:", ", ".join(f"{g[0]} {len(g[3])}" for g in groups))
