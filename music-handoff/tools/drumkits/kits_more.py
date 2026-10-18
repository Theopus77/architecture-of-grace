"""AOG-DRUM-MORE-V1 (2026-10-18) — more recorded kits. Jimmy: "Can we get more drum kits produced?", then "Choose them all!"

Each kit is built like the hand-drum kits (kits_perc.py, build.py): eight pads, each a soft, a normal and a hard layer,
two or three takes of a layer wherever the library has them, a per-pad peak limit ("ceil") so the hardest hit never
clips, and each pad's normal file set to a loudness (FILE_LU) beside the nearest pads of the kits already there; the
whole kit is then brought to the others' level by LEVEL.kit in music-pads.html (tests/pads/morekits.js --table) and by
KIT_LEVEL in music-kit.html (--kittable). Credits: aog-deploy/audio/drums/CREDITS.txt.

  OR  Orchestral percussion   VCSL: concert bass drum, snare drum, triangle, suspended cymbal, crash cymbals, timpani
                              (low and high, a fourth apart: F sharp and B), gong
More kits follow below, one block each.

Where the recordings come from: vcsl (Versilian Community Sample Library, CC0) and the others named in sources.py.
"""
from kits import T, MAKE, L, ID, MB, VC

def VCS(rel, **kw):
    return VC(rel, **kw)

TIMP = MB + "Timpani 1/Hit/"
BD2 = MB + "Bass Drum 2/"
SN1 = MB + "Snare Drum, Modern 1/"
CL1 = ID + "Clash Cymbals 1/"
SUS = ID + "Suspended Cymbal 1/"
GONG = ID + "Gong 1/"
TRI = ID + "Triangles/"

def TP(drum, v, rr):
    return VC(TIMP + "Timpani%d_Hit_v%d_rr%d_Sum.wav" % (drum, v, rr))

MORE = {
  # ── OR · orchestral percussion: the back row of an orchestra ───────────────────────────────────────────────────────
  "OR": {"dir": "orchestra", "pads": {
    "kick":  {"name": "BASSDR", "s": L(VC(BD2 + "bassdrum_hit_pp1.wav"), VC(BD2 + "bassdrum_hit_pp2.wav")),
              "m": L(VC(BD2 + "bassdrum_hit_mf1.wav"), VC(BD2 + "bassdrum_hit_mf2.wav")),
              "h": L(VC(BD2 + "bassdrum_hit_ff.wav"), VC(BD2 + "bassdrum_hit_f.wav")),
              "eq": [("hp", 28, .7, 0)], "len": 2.0, "fade": 1.1},
    "snare": {"name": "SNARE", "s": L(VC(SN1 + "Snare2_HitSN_v5_rr1_Mid.wav"), VC(SN1 + "Snare2_HitSN_v5_rr2_Mid.wav")),
              "m": L(VC(SN1 + "Snare2_HitSN_v7_rr1_Mid.wav"), VC(SN1 + "Snare2_HitSN_v7_rr2_Mid.wav")),
              "h": L(VC(SN1 + "Snare2_HitSN_v9_rr1_Mid.wav"), VC(SN1 + "Snare2_HitSN_v9_rr2_Mid.wav")),
              "eq": [("hp", 90, .7, 0)], "len": 0.9, "fade": 0.4, "ceil": 0.6},
    "ch":    {"name": "TRIANG", "s": L(VC(TRI + "Triangle1_Hit_v1_rr2_Mid.wav")),
              "m": L(VC(TRI + "Triangle1_Hit_v2_rr1_Mid.wav"), VC(TRI + "Triangle1_Hit_v2_rr2_Mid.wav")),
              "h": L(VC(TRI + "Triangle1_Hit_v2_rr2_Mid.wav"), VC(TRI + "Triangle1_Hit_v2_rr1_Mid.wav")),
              "eq": [("hp", 900, .7, 0)], "len": 1.6, "fade": 1.0},
    "oh":    {"name": "SUSCYM", "s": L(VC(SUS + "susCymb1_hit_mp1.wav")), "m": L(VC(SUS + "susCymb1_hit_f1.wav")),
              "h": L(VC(SUS + "susCymb1_hit_fff1.wav")),
              "eq": [("hp", 180, .7, 0)], "len": 2.4, "fade": 1.4},
    "clap":  {"name": "CYMBAL", "s": L(VC(CL1 + "cymbal_crash1_mp2.wav")),
              "m": L(VC(CL1 + "cymbal_crash1_mf1.wav"), VC(CL1 + "cymbal_crash1_mf2.wav")),
              "h": L(VC(CL1 + "cymbal_crash1_ff2.wav"), VC(CL1 + "cymbal_crash1_ff3.wav")),
              "eq": [("hp", 200, .7, 0)], "len": 2.6, "fade": 1.6},
    "tom":   {"name": "TIMPLO", "s": L(TP(1, 2, 1)), "m": L(TP(1, 3, 3), TP(1, 3, 4)), "h": L(TP(1, 4, 1), TP(1, 4, 2)),
              "eq": [("hp", 35, .7, 0)], "len": 2.3, "fade": 1.3, "ceil": 0.55},
    "rim":   {"name": "TIMPHI", "s": L(TP(2, 2, 1)), "m": L(TP(2, 3, 1), TP(2, 3, 2)), "h": L(TP(2, 4, 1), TP(2, 4, 2)),
              "eq": [("hp", 45, .7, 0)], "len": 2.2, "fade": 1.3, "ceil": 0.55},
    "bell":  {"name": "GONG", "s": L(VC(GONG + "gong_p.wav")), "m": L(VC(GONG + "gong_mf.wav")), "h": L(VC(GONG + "gong_fff.wav")),
              "eq": [("hp", 40, .7, 0)], "len": 3.8, "fade": 2.4},
  }},
}

# the loudness of each pad's normal file (K-weighted, loudest 400 ms), beside the nearest pads of the kits already there
FILE_LU = {
  "OR": {"kick": -22.5, "snare": -33.0, "ch": -38.0, "oh": -31.0, "clap": -29.0, "tom": -27.0, "rim": -28.0, "bell": -26.0},
}
