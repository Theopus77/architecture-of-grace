"""AOG-DRUM-PERC-V1 (2026-10-13) — hand percussion, hand drums and the tabla. Jimmy: "DO them all."

Four recorded kits, built like the others (build.py; levels in FILE_LU), each pad a soft, a normal and a hard layer,
and two or three takes of each layer wherever the recordings have them (the engine plays them in turn, so a roll is
not one sound repeated; the cowbell and the tabla's na have one recording a strength):
  HP  Hand percussion               the school set: tambourine (hit, shake), triangle (open, muted), egg shaker,
                                    claves, woodblock (high, low)
  HD  Hand drums · djembe and cajón djembe (bass, tone, slap), cajón (bass, slap), maracas, hand claps, cowbell
  HC  Hand drums · congas and bongos conga (open, slap, muted, bass), tumba (open), bongos (high, low, slap)
  TB  Tabla                         bayan (ghe, glide, ke), dayan (na, te, tin, tun), dha (both hands)
A kit has eight pads, so the cowbell of the school list sits with the djembe (the bell of a djembe group).

Where the recordings come from (all CC0 1.0, public domain; credits in aog-deploy/audio/drums/CREDITS.txt):
  vcsl   Versilian Community Sample Library: tambourines, triangle 3, claves, cowbell 2, congas, tumba, bongos
  virt   Virtuosity Drums (its VSCO 2 Pro percussion): the two woodblocks
  swirly Swirly Drums (Karoryfer): the djembe
  fp     FreePats World percussion (Xavimart's instruments, recorded by Xavimart, Gonzalo and Roberto): the cajón
         flamenco, egg shaker, maracas and hand claps
  spi    Sonic Pi's tabla strokes, recorded by dio_333 (Freesound, CC0)

Made here, said plainly (no free recording of these strokes was found):
  * the djembe's tone and slap, the conga's slap and muted stroke, and the bongo's slap are shaped from the same drum's
    own recordings: the boom filtered away, the crack brought forward, the ring held short as a hand on the skin does;
  * the tabla's glide: the long open ghe bent upward, as a player's wrist presses the bayan's skin (one take is a
    recorded rising ghe); dha is the recorded na and the recorded ghe struck together, as both hands play it.
Sonic Pi calls the dayan's ringing stroke on the open skin "tas"; it rings the drum's higher note with the low one
held down, the stroke tabla players call tin, so the pad says tin.
"""
from kits import T, MAKE, L, ID, MB, VC

FP = "fp:samples/"
def FPS(rel, **kw):
    return T(FP + rel, **kw)

def WB(hi, vl, rr):
    return T("virt:Samples/perc/oh/woodblock/woodblock_%s_vl%d_rr%d.wav" % ("hi" if hi else "lo", vl, rr))

def DJ(vl, rr):
    return T("swirly:Samples/djembe/djembe_vl%d_rr%d.wav" % (vl, rr))

def TAB(n):
    return "spi:etc/samples/tabla_%s.flac" % n

def TS(n):
    return T(TAB(n))

def BEND(n, semis, over, at=0.06):
    """the bayan's glide: a recorded ghe, bent `semis` up over `over` seconds from `at` (build.py make_bend)"""
    return MAKE("bend", src=TAB(n), semis=semis, over=over, at=at)

def STACK(*parts):
    """recordings struck together: (source, gain, ms late) (build.py make_stack)"""
    return MAKE("stack", stack=list(parts))

CONGA = MB + "Conga/"
BONGO = MB + "Bongos/"

# the shaping that makes a slap from an open stroke: the boom away, the crack forward, the ring short
SLAP_EQ = [("hp", 420, .7, 0), ("hp", 420, .7, 0), ("peak", 1100, 0.9, 4), ("peak", 2600, 0.9, 6), ("highshelf", 6000, .7, 3)]
# the djembe's recording is brighter than the conga's: its slap is lifted lower down, nearer a hand's crack
DJ_SLAP_EQ = [("hp", 300, .7, 0), ("hp", 300, .7, 0), ("peak", 1200, 0.9, 6), ("peak", 3000, 1.0, 2), ("lp", 9000, .7, 0)]

PERC = {
  # ── HP · hand percussion, the school set ─────────────────────────────────────────────────────────────────────────
  "HP": {"dir": "handperc", "pads": {
    "kick":  {"name": "WBLOW", "s": L(WB(0, 2, 1), WB(0, 2, 2), WB(0, 2, 3)), "m": L(WB(0, 4, 1), WB(0, 4, 2), WB(0, 4, 3)),
              "h": L(WB(0, 6, 1), WB(0, 6, 2), WB(0, 6, 3)),
              "eq": [("hp", 250, .7, 0)], "len": 0.45, "fade": 0.25, "ceil": 0.41},
    "snare": {"name": "TAMBHIT", "s": L(VC(ID + "Tambourine 1/Tamb1_Hit_v1_rr1_Mid.wav"), VC(ID + "Tambourine 2/Tamb2_Hit_v1_rr1_Mid.wav")),
              "m": L(VC(ID + "Tambourine 1/Tamb1_Hit_v2_rr1_Mid.wav"), VC(ID + "Tambourine 2/Tamb2_Hit_v2_rr2_Mid.wav")),
              "h": L(VC(ID + "Tambourine 2/Tamb2_Hit_v2_rr2_Mid.wav"), VC(ID + "Tambourine 1/Tamb1_Hit_v2_rr1_Mid.wav")),
              "eq": [("hp", 250, .7, 0)], "len": 0.6, "fade": 0.35},
    "ch":    {"name": "EGG", "s": L(FPS("EggShaker/soft_03.wav"), FPS("EggShaker/soft_07.wav")),
              "m": L(FPS("EggShaker/slow_03.wav"), FPS("EggShaker/slow_08.wav")),
              "h": L(FPS("EggShaker/fast_03.flac"), FPS("EggShaker/fast_08.flac")),
              "eq": [("hp", 500, .7, 0)], "len": 0.3, "fade": 0.12},
    "oh":    {"name": "TAMBSHK", "s": L(VC(ID + "Tambourine 1/Tamb1_Shake_rr1_Mid.wav"), VC(ID + "Tambourine 1/Tamb1_Shake_rr2_Mid.wav")),
              "m": L(VC(ID + "Tambourine 1/Tamb1_Shake_rr2_Mid.wav"), VC(ID + "Tambourine 2/Tamb2_Shake_rr3_Mid.wav"), VC(ID + "Tambourine 1/Tamb1_Shake_rr1_Mid.wav")),
              "h": L(VC(ID + "Tambourine 2/Tamb2_Shake_rr4_Mid.wav"), VC(ID + "Tambourine 2/Tamb2_Shake_rr3_Mid.wav")),
              "eq": [("hp", 300, .7, 0)], "len": 0.55, "fade": 0.3},
    "clap":  {"name": "CLAVES", "s": L(VC(ID + "Claves/Claves1_Hit_v1_rr1_Mid.wav"), VC(ID + "Claves/Claves2_Hit_v1_rr1_Mid.wav")),
              "m": L(VC(ID + "Claves/Claves1_Hit_v2_rr1_Mid.wav"), VC(ID + "Claves/Claves2_Hit_v2_rr1_Mid.wav")),
              "h": L(VC(ID + "Claves/Claves1_Hit_v3_rr1_Mid.wav"), VC(ID + "Claves/Claves2_Hit_v3_rr1_Mid.wav")),
              "eq": [("hp", 400, .7, 0)], "len": 0.3, "fade": 0.15, "ceil": 0.41},
    "tom":   {"name": "WBHIGH", "s": L(WB(1, 2, 1), WB(1, 2, 2), WB(1, 2, 3)), "m": L(WB(1, 4, 1), WB(1, 4, 2), WB(1, 4, 3)),
              "h": L(WB(1, 6, 1), WB(1, 6, 2), WB(1, 6, 3)),
              "eq": [("hp", 300, .7, 0)], "len": 0.4, "fade": 0.22, "ceil": 0.41},
    "rim":   {"name": "TRIMUTE", "s": L(VC(ID + "Triangles/Triangle3_HitM_v1_rr1_Mid.wav"), VC(ID + "Triangles/Triangle3_HitM_v1_rr2_Mid.wav")),
              "m": L(VC(ID + "Triangles/Triangle3_HitM_v2_rr1_Mid.wav"), VC(ID + "Triangles/Triangle3_HitM_v2_rr2_Mid.wav")),
              "h": L(VC(ID + "Triangles/Triangle3_HitM_v2_rr1_Mid.wav"), VC(ID + "Triangles/Triangle3_HitM_v2_rr2_Mid.wav")),
              "eq": [("hp", 700, .7, 0)], "len": 0.5, "fade": 0.3},
    "bell":  {"name": "TRIOPEN", "s": L(VC(ID + "Triangles/Triangle3_Hit_v1_rr1_Mid.wav"), VC(ID + "Triangles/Triangle3_Hit_v1_rr2_Mid.wav")),
              "m": L(VC(ID + "Triangles/Triangle3_Hit_v2_rr1_Mid.wav"), VC(ID + "Triangles/Triangle3_Hit_v2_rr2_Mid.wav")),
              "h": L(VC(ID + "Triangles/Triangle3_Hit_v2_rr2_Mid.wav"), VC(ID + "Triangles/Triangle3_Hit_v2_rr1_Mid.wav")),
              "eq": [("hp", 700, .7, 0)], "len": 2.2, "fade": 1.3},
  }},
  # ── HD · hand drums: djembe and cajón, with maracas, hand claps and the bell ─────────────────────────────────────
  "HD": {"dir": "handdrums", "pads": {
    "kick":  {"name": "DJBASS", "s": L(DJ(7, 1), DJ(7, 2)), "m": L(DJ(10, 1), DJ(10, 2)), "h": L(DJ(12, 1), DJ(12, 3)),
              "eq": [("hp", 38, .7, 0), ("peak", 75, 1.0, 2), ("lp", 6000, .7, 0)], "len": 0.85, "fade": 0.45},
    # the slap: the hardest hits, the boom taken away and the crack brought forward, held short (made here)
    "snare": {"name": "DJSLAP", "s": L(DJ(9, 1), DJ(9, 2)), "m": L(DJ(11, 1), DJ(11, 2)), "h": L(DJ(12, 2), DJ(12, 4)),
              "eq": DJ_SLAP_EQ, "comp": (-14, 3, 1, 60), "shape": (0.012, 0.05), "len": 0.28, "fade": 0.12},
    "ch":    {"name": "MARACA", "s": L(FPS("Maracas/01_03.flac"), FPS("Maracas/02_04.flac")),
              "m": L(FPS("Maracas/01_01.flac"), FPS("Maracas/02_01.flac")), "h": L(FPS("Maracas/01_05.flac"), FPS("Maracas/02_05.flac")),
              "eq": [("hp", 500, .7, 0)], "len": 0.3, "fade": 0.12},
    # the tone: the soft hits, without the low boom, ringing a little shorter (made here)
    "oh":    {"name": "DJTONE", "s": L(DJ(4, 1), DJ(4, 2)), "m": L(DJ(5, 1), DJ(5, 2)), "h": L(DJ(6, 1), DJ(6, 2)),
              "eq": [("hp", 170, .7, 0), ("hp", 170, .7, 0), ("peak", 420, 1.0, 3), ("peak", 1800, 1.0, 2)], "shape": (0.06, 0.12),
              "len": 0.45, "fade": 0.2},
    "clap":  {"name": "CLAP", "s": L(FPS("HandClap/01_03.flac")), "m": L(FPS("HandClap/01_05.flac"), FPS("HandClap/01_06.flac")),
              "h": L(FPS("HandClap/02_02.flac"), FPS("HandClap/02_05.flac")),
              "eq": [("hp", 200, .7, 0)], "len": 0.35, "fade": 0.15},
    "tom":   {"name": "CAJBASS", "s": L(FPS("CajonFlamenco/107.flac"), FPS("CajonFlamenco/203.flac")),
              "m": L(FPS("CajonFlamenco/109.flac"), FPS("CajonFlamenco/110.flac"), FPS("CajonFlamenco/205.flac")),
              "h": L(FPS("CajonFlamenco/115.flac"), FPS("CajonFlamenco/206.flac")),
              "eq": [("hp", 40, .7, 0), ("peak", 85, 1.0, 2)], "len": 0.45, "fade": 0.2},
    "rim":   {"name": "CAJSLAP", "s": L(FPS("CajonFlamenco/102.flac"), FPS("CajonFlamenco/103.flac")),
              "m": L(FPS("CajonFlamenco/101.flac"), FPS("CajonFlamenco/201.flac"), FPS("CajonFlamenco/214.flac")),
              "h": L(FPS("CajonFlamenco/216.flac"), FPS("CajonFlamenco/219.flac")),
              "eq": [("hp", 90, .7, 0)], "len": 0.4, "fade": 0.18},
    "bell":  {"name": "COWBELL", "s": L(VC(ID + "Cowbells/Cowbell2_Normal_v2_rr1_Mid.wav")), "m": L(VC(ID + "Cowbells/Cowbell2_Normal_v3_rr1_Mid.wav")),
              "h": L(VC(ID + "Cowbells/Cowbell2_Normal_v3_rr1_Mid.wav")),
              "eq": [("hp", 300, .7, 0)], "len": 0.6, "fade": 0.32},
  }},
  # ── HC · hand drums: congas and bongos ───────────────────────────────────────────────────────────────────────────
  "HC": {"dir": "congas", "pads": {
    # the bass: a full hand in the middle of the conga sounds its low note (VCSL calls it HitFM)
    "kick":  {"name": "CGBASS", "s": L(VC(CONGA + "Conga_HitFM_v1_rr1_Sum.wav"), VC(CONGA + "Conga_HitFM_v1_rr2_Sum.wav")),
              "m": L(VC(CONGA + "Conga_HitFM_v2_rr1_Sum.wav"), VC(CONGA + "Conga_HitFM_v2_rr2_Sum.wav")),
              "h": L(VC(CONGA + "Conga_HitFM_v2_rr2_Sum.wav"), VC(CONGA + "Conga_HitFM_v2_rr1_Sum.wav")),
              "eq": [("hp", 35, .7, 0)], "len": 0.6, "fade": 0.3},
    "snare": {"name": "CGSLAP", "s": L(VC(CONGA + "Conga_HitN_v2_rr1_Sum.wav"), VC(CONGA + "Conga_HitN_v2_rr2_Sum.wav")),
              "m": L(VC(CONGA + "Conga_HitN_v3_rr1_Sum.wav"), VC(CONGA + "Conga_HitN_v3_rr2_Sum.wav")),
              "h": L(VC(CONGA + "Conga_HitN_v3_rr2_Sum.wav"), VC(CONGA + "Conga_HitN_v3_rr1_Sum.wav")),
              "eq": SLAP_EQ, "comp": (-14, 3, 1, 60), "shape": (0.012, 0.045), "len": 0.25, "fade": 0.1, "ceil": 0.55},
    # muted: the open stroke, the hand left on the skin so the ring stops
    "ch":    {"name": "CGMUTE", "s": L(VC(CONGA + "Conga_HitN_v1_rr1_Sum.wav"), VC(CONGA + "Conga_HitN_v1_rr2_Sum.wav")),
              "m": L(VC(CONGA + "Conga_HitN_v2_rr1_Sum.wav"), VC(CONGA + "Conga_HitN_v2_rr2_Sum.wav")),
              "h": L(VC(CONGA + "Conga_HitN_v3_rr1_Sum.wav"), VC(CONGA + "Conga_HitN_v3_rr2_Sum.wav")),
              "eq": [("hp", 90, .7, 0), ("peak", 1500, 1.0, 3)], "shape": (0.03, 0.035), "len": 0.22, "fade": 0.08},
    "oh":    {"name": "CGOPEN", "s": L(VC(CONGA + "Conga_HitN_v1_rr1_Sum.wav"), VC(CONGA + "Conga_HitN_v1_rr2_Sum.wav")),
              "m": L(VC(CONGA + "Conga_HitN_v2_rr1_Sum.wav"), VC(CONGA + "Conga_HitN_v2_rr2_Sum.wav")),
              "h": L(VC(CONGA + "Conga_HitN_v3_rr1_Sum.wav"), VC(CONGA + "Conga_HitN_v3_rr2_Sum.wav")),
              "eq": [("hp", 60, .7, 0)], "len": 0.65, "fade": 0.32},
    "clap":  {"name": "TUMBA", "s": L(VC(CONGA + "Tumba_HitN_v1_rr1_Sum.wav"), VC(CONGA + "Tumba_HitN_v1_rr2_Sum.wav")),
              "m": L(VC(CONGA + "Tumba_HitN_v3_rr1_Sum.wav"), VC(CONGA + "Tumba_HitN_v3_rr2_Sum.wav")),
              "h": L(VC(CONGA + "Tumba_HitN_v4_rr1_Sum.wav"), VC(CONGA + "Tumba_HitN_v4_rr2_Sum.wav")),
              "eq": [("hp", 50, .7, 0)], "len": 0.7, "fade": 0.35, "ceil": 0.55},
    "tom":   {"name": "BGLOW", "s": L(VC(BONGO + "BongoL_Hit1_v1_rr1_Mid.wav"), VC(BONGO + "BongoL_Hit1_v1_rr2_Mid.wav")),
              "m": L(VC(BONGO + "BongoL_Hit1_v2_rr1_Mid.wav"), VC(BONGO + "BongoL_Hit1_v2_rr2_Mid.wav")),
              "h": L(VC(BONGO + "BongoL_Hit1_v3_rr1_Mid.wav"), VC(BONGO + "BongoL_Hit1_v3_rr2_Mid.wav")),
              "eq": [("hp", 110, .7, 0)], "len": 0.45, "fade": 0.22},
    "rim":   {"name": "BGHIGH", "s": L(VC(BONGO + "BongoH_Hit1_v1_rr1_Mid.wav"), VC(BONGO + "BongoH_Hit1_v1_rr2_Mid.wav")),
              "m": L(VC(BONGO + "BongoH_Hit1_v2_rr1_Mid.wav"), VC(BONGO + "BongoH_Hit1_v2_rr2_Mid.wav")),
              "h": L(VC(BONGO + "BongoH_Hit1_v3_rr1_Mid.wav"), VC(BONGO + "BongoH_Hit1_v3_rr2_Mid.wav")),
              "eq": [("hp", 150, .7, 0)], "len": 0.4, "fade": 0.2},
    # the slap on the high bongo: its recorded muted stroke, made sharper (made here)
    "bell":  {"name": "BGSLAP", "s": L(VC(BONGO + "BongoH_HitMuted1_v1_rr1_Mid.wav"), VC(BONGO + "BongoH_HitMuted1_v1_rr2_Mid.wav")),
              "m": L(VC(BONGO + "BongoH_HitMuted1_v2_rr1_Mid.wav"), VC(BONGO + "BongoH_HitMuted1_v2_rr2_Mid.wav")),
              "h": L(VC(BONGO + "BongoH_HitMuted1_v3_rr1_Mid.wav"), VC(BONGO + "BongoH_HitMuted1_v3_rr2_Mid.wav")),
              "eq": [("hp", 600, .7, 0), ("peak", 3200, 1.0, 5)], "shape": (0.01, 0.04), "len": 0.2, "fade": 0.08, "ceil": 0.55},
  }},
  # ── TB · tabla: the bayan (the left hand's big drum) and the dayan (the right hand's small drum) ─────────────────
  "TB": {"dir": "tabla", "pads": {
    "kick":  {"name": "GHE", "s": L(TS("ghe1"), TS("ghe8")), "m": L(TS("ghe6"), TS("ghe3")), "h": L(TS("ghe2"), TS("ghe7")),
              "eq": [("hp", 35, .7, 0)], "len": 1.6, "fade": 0.8},
    "snare": {"name": "NA", "s": L(TS("na_s")), "m": L(TS("na")), "h": L(TS("na")),
              "eq": [("hp", 150, .7, 0)], "len": 0.6, "fade": 0.3},
    "ch":    {"name": "TE", "s": L(TS("te_m"), TS("te_ne")), "m": L(TS("te1"), TS("te2")), "h": L(TS("te1"), TS("te2")),
              "eq": [("hp", 90, .7, 0)], "len": 0.25, "fade": 0.1},
    "oh":    {"name": "TIN", "s": L(TS("tas1"), TS("tas2")), "m": L(TS("tas2"), TS("tas3")), "h": L(TS("tas3"), TS("tas2")),
              "eq": [("hp", 150, .7, 0)], "len": 1.0, "fade": 0.55},
    "clap":  {"name": "TUN", "s": L(TS("tun1"), TS("tun3")), "m": L(TS("tun2"), TS("tun3")), "h": L(TS("tun3"), TS("tun2")),
              "eq": [("hp", 120, .7, 0)], "len": 1.8, "fade": 0.9},
    "tom":   {"name": "GLIDE", "s": L(TS("ghe4")), "m": L(BEND("ghe6", 4.0, 0.45), BEND("ghe5", 4.0, 0.5)), "h": L(BEND("ghe6", 5.0, 0.4), BEND("ghe2", 5.0, 0.42)),
              "eq": [("hp", 35, .7, 0)], "len": 1.4, "fade": 0.6},
    "rim":   {"name": "KE", "s": L(TS("ke1"), TS("ke2")), "m": L(TS("ke2"), TS("ke3")), "h": L(TS("ke3"), TS("ke2")),
              "eq": [("hp", 40, .7, 0)], "len": 0.16, "fade": 0.06},
    "bell":  {"name": "DHA", "s": L(STACK((TAB("na_s"), 1.0, 0), (TAB("ghe1"), 0.45, 4)), STACK((TAB("na_s"), 1.0, 0), (TAB("ghe8"), 0.4, 3))),
              "m": L(STACK((TAB("na"), 1.0, 0), (TAB("ghe6"), 0.32, 5)), STACK((TAB("na"), 1.0, 0), (TAB("ghe3"), 0.38, 3))),
              "h": L(STACK((TAB("na"), 1.0, 0), (TAB("ghe2"), 0.36, 4)), STACK((TAB("na"), 1.0, 0), (TAB("ghe7"), 0.36, 5))),
              "eq": [("hp", 35, .7, 0)], "len": 1.5, "fade": 0.75},
  }},
}

# "ceil": the sharpest cracks (a woodblock, claves, a slap, the tumba's open tone) have their very tip rounded a little
# lower than other files (build.py safety), so even the hardest hit through the Drum Machine's ceiling never clips

# the loudness of each pad's normal file (K-weighted, loudest 400 ms), set beside the nearest pads of kits D, H and N
# (a shaker or a tambourine near -36, a clave or a block near -33, a conga near -25, a djembe near -22); the whole kit
# is then brought to the others' level in the Drum Machine by LEVEL (music-pads.html, tests/pads/level.js)
FILE_LU = {
  "HP": {"kick": -31.0, "snare": -32.0, "ch": -36.0, "oh": -35.0, "clap": -32.5, "tom": -32.0, "rim": -33.0, "bell": -29.5},
  "HD": {"kick": -22.5, "snare": -27.0, "ch": -35.5, "oh": -25.5, "clap": -31.0, "tom": -23.0, "rim": -27.0, "bell": -29.0},
  "HC": {"kick": -25.0, "snare": -27.5, "ch": -29.5, "oh": -25.0, "clap": -24.0, "tom": -28.0, "rim": -29.0, "bell": -30.0},
  "TB": {"kick": -21.0, "snare": -27.0, "ch": -31.0, "oh": -28.0, "clap": -26.0, "tom": -22.0, "rim": -28.5, "bell": -21.5},
}
