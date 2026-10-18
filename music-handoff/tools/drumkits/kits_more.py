"""AOG-DRUM-MORE-V1 (2026-10-18) — more recorded kits. Jimmy: "Can we get more drum kits produced?", then "Choose them all!"

Each kit is built like the hand-drum kits (kits_perc.py, build.py): eight pads, each a soft, a normal and a hard layer,
two or three takes of a layer wherever the library has them, a per-pad peak limit ("ceil") so the hardest hit never
clips, and each pad's normal file set to a loudness (FILE_LU) beside the nearest pads of the kits already there; the
whole kit is then brought to the others' level by LEVEL.kit in music-pads.html (tests/pads/morekits.js --table) and by
KIT_LEVEL in music-kit.html (--kittable). Credits: aog-deploy/audio/drums/CREDITS.txt.

  OR  Orchestral percussion   VCSL: concert bass drum, snare drum, triangle, suspended cymbal, crash cymbals, timpani
                              (low and high, a fourth apart: F sharp and B), gong
  ME  Middle Eastern          FreePats World percussion: the darbuka's doum, tek and slap (pa), a tambourine's jingles
                              (the riq is a tambourine); VCSL: a second darbuka's tek as the ka (the other hand), two
                              frame drums and finger cymbals (zills)
  SB  Samba / batucada        VCSL: a rope-tension snare drum (the caixa), a large shaker (the ganzá), an agogô bell and
                              a whistle (the apito); the surdo, second surdo, repinique and tamborim parts are played
                              by the nearest real drums (a bass drum, a tom with mallets, a tom with sticks, a small
                              frame drum), as no free recording of those drums was found, and the pads say so
  BP  Body percussion         body_percussion (sfzinstruments, CC0): stomp, hand clap, finger snap, finger clap, chest,
                              tummy, heel, cheek
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
DARB = MB + "Darbuka/"
FRAME = MB + "Frame Drum/"
BD1 = MB + "Bass Drum 1/"
ROPE = MB + "Snare Drum, Rope Tension/"
SHK = ID + "Shaker, Large/"
TOM1 = MB + "Tom 1/"
TOM2 = MB + "Tom 2/"
def BO(n):
    return T("body:Samples/body/%s.wav" % n)

WHIS = "vcsl:Aerophones/Edge-blown Aerophones/Ball Whistle/"

def FPS(rel, **kw):
    return T("fp:samples/" + rel, **kw)

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
  # ── ME · Middle Eastern percussion: the darbuka (doum, tek, ka, slap), a tambourine's jingles, frame drums, zills ───
  "ME": {"dir": "mideast", "pads": {
    "kick":  {"name": "DOUM", "s": L(FPS("Darbuka/doom_01_05.flac"), FPS("Darbuka/doom_01_12.flac")),
              "m": L(FPS("Darbuka/doom_01_06.flac"), FPS("Darbuka/doom_01_08.flac"), FPS("Darbuka/doom_01_09.flac")),
              "h": L(FPS("Darbuka/doom_01_02.flac"), FPS("Darbuka/doom_01_03.flac")),
              "eq": [("hp", 40, .7, 0)], "len": 0.8, "fade": 0.35, "ceil": 0.6},
    "snare": {"name": "TEK", "s": L(FPS("Darbuka/tak_02_01.flac"), FPS("Darbuka/tak_02_04.flac")),
              "m": L(FPS("Darbuka/tak_02_05.flac"), FPS("Darbuka/tak_02_06.flac"), FPS("Darbuka/tak_02_07.flac")),
              "h": L(FPS("Darbuka/tak_02_02.flac"), FPS("Darbuka/tak_02_03.flac")),
              "eq": [("hp", 150, .7, 0)], "len": 0.45, "fade": 0.2, "ceil": 0.5},
    "ch":    {"name": "KA", "s": L(VC(DARB + "Darbuka_2_hit_vl1_rr1.wav"), VC(DARB + "Darbuka_2_hit_vl1_rr2.wav")),
              "m": L(VC(DARB + "Darbuka_2_hit_vl2_rr1.wav"), VC(DARB + "Darbuka_2_hit_vl2_rr2.wav")),
              "h": L(VC(DARB + "Darbuka_2_hit_vl2_rr2.wav"), VC(DARB + "Darbuka_2_hit_vl2_rr1.wav")),
              "eq": [("hp", 200, .7, 0)], "len": 0.4, "fade": 0.18, "ceil": 0.5},
    "oh":    {"name": "JINGLE", "s": L(FPS("Tambourine/fast_03.wav"), FPS("Tambourine/fast_04.wav")),
              "m": L(FPS("Tambourine/fast_06.wav"), FPS("Tambourine/fast_08.wav"), FPS("Tambourine/fast_10.wav")),
              "h": L(FPS("Tambourine/fast_12.wav"), FPS("Tambourine/fast_14.wav")),
              "eq": [("hp", 2000, .7, 0)], "len": 0.25, "fade": 0.1},
    "clap":  {"name": "PA", "s": L(FPS("Darbuka/pa_03_05.flac"), FPS("Darbuka/pa_03_03.flac")),
              "m": L(FPS("Darbuka/pa_03_01.flac"), FPS("Darbuka/pa_03_02.flac"), FPS("Darbuka/pa_03_04.flac")),
              "h": L(FPS("Darbuka/pa_03_07.flac"), FPS("Darbuka/pa_03_01.flac")),
              "eq": [("hp", 120, .7, 0)], "len": 0.4, "fade": 0.18, "ceil": 0.5},
    "tom":   {"name": "FRAMLO", "s": L(VC(FRAME + "HDrumL_Hit_v2_rr1_Sum.wav"), VC(FRAME + "HDrumL_Hit_v2_rr2_Sum.wav")),
              "m": L(VC(FRAME + "HDrumL_Hit_v3_rr1_Sum.wav"), VC(FRAME + "HDrumL_Hit_v3_rr2_Sum.wav")),
              "h": L(VC(FRAME + "HDrumL_Hit_v3_rr2_Sum.wav"), VC(FRAME + "HDrumL_Hit_v3_rr1_Sum.wav")),
              "eq": [("hp", 40, .7, 0)], "len": 1.0, "fade": 0.5},
    "rim":   {"name": "FRAMHI", "s": L(VC(FRAME + "HDrumS_Hit_v2_rr1_Sum.wav"), VC(FRAME + "HDrumS_Hit_v2_rr2_Sum.wav")),
              "m": L(VC(FRAME + "HDrumS_Hit_v3_rr1_Sum.wav"), VC(FRAME + "HDrumS_Hit_v3_rr2_Sum.wav")),
              "h": L(VC(FRAME + "HDrumS_Hit_v3_rr2_Sum.wav"), VC(FRAME + "HDrumS_Hit_v3_rr1_Sum.wav")),
              "eq": [("hp", 70, .7, 0)], "len": 0.8, "fade": 0.4},
    "bell":  {"name": "ZILLS", "s": L(VC(ID + "Finger Cymbals/Fing_Cymb.wav")), "m": L(VC(ID + "Finger Cymbals/Fing_Cymb.wav")),
              "h": L(VC(ID + "Finger Cymbals/Fing_Cymb.wav")),
              "eq": [("hp", 1500, .7, 0)], "len": 1.6, "fade": 1.0},
  }},
  # ── SB · samba / batucada: the parts of a samba school's drum line. No free recording of a surdo, repinique or
  # tamborim was found, so the nearest real drums play those parts, and each pad says so ───────────────────────────────
  "SB": {"dir": "samba", "pads": {
    "kick":  {"name": "SURDO", "s": L(VC(BD1 + "BDrumNew_hit_v2_rr1_Sum.wav"), VC(BD1 + "BDrumNew_hit_v2_rr2_Sum.wav")),
              "m": L(VC(BD1 + "BDrumNew_hit_v5_rr1_Sum.wav"), VC(BD1 + "BDrumNew_hit_v5_rr2_Sum.wav")),
              "h": L(VC(BD1 + "BDrumNew_hit_v7_rr1_Sum.wav"), VC(BD1 + "BDrumNew_hit_v7_rr2_Sum.wav")),
              "eq": [("hp", 32, .7, 0), ("peak", 85, 1.0, 2)], "len": 1.3, "fade": 0.6},
    "snare": {"name": "CAIXA", "s": L(VC(ROPE + "Hi/RopeSnare_hi_sn_Main_vl1_rr1.wav"), VC(ROPE + "Hi/RopeSnare_hi_sn_Main_vl1_rr2.wav")),
              "m": L(VC(ROPE + "Hi/RopeSnare_hi_sn_Main_vl3_rr1.wav"), VC(ROPE + "Hi/RopeSnare_hi_sn_Main_vl3_rr3.wav")),
              "h": L(VC(ROPE + "Hi/RopeSnare_hi_sn_Main_vl4_rr1.wav"), VC(ROPE + "Hi/RopeSnare_hi_sn_Main_vl4_rr2.wav")),
              "eq": [("hp", 150, .7, 0)], "len": 0.45, "fade": 0.2, "ceil": 0.55},
    "ch":    {"name": "GANZA", "s": L(VC(SHK + "LShaker_Shake1U_rr1_Mid.wav"), VC(SHK + "LShaker_Shake1U_rr4_Mid.wav")),
              "m": L(VC(SHK + "LShaker_Shake1D_rr2_Mid.wav"), VC(SHK + "LShaker_Shake1D_rr3_Mid.wav")),
              "h": L(VC(SHK + "LShaker_Hit_rr1_Mid.wav"), VC(SHK + "LShaker_Hit_rr2_Mid.wav")),
              "eq": [("hp", 600, .7, 0)], "len": 0.35, "fade": 0.15},
    "oh":    {"name": "TAMBOR", "s": L(VC(FRAME + "HDrumS_HitMuted_v2_rr1_Sum.wav"), VC(FRAME + "HDrumS_HitMuted_v2_rr2_Sum.wav")),
              "m": L(VC(FRAME + "HDrumS_HitMuted_v3_rr1_Sum.wav"), VC(FRAME + "HDrumS_HitMuted_v3_rr2_Sum.wav")),
              "h": L(VC(FRAME + "HDrumS_HitMuted_v3_rr2_Sum.wav"), VC(FRAME + "HDrumS_HitMuted_v3_rr1_Sum.wav")),
              "eq": [("hp", 250, .7, 0), ("peak", 2500, 1.0, 3)], "len": 0.3, "fade": 0.12, "ceil": 0.55},
    "clap":  {"name": "REPIQ", "s": L(VC(TOM1 + "Stick/TomH_HitS_v2_rr1_Mid.wav"), VC(TOM1 + "Stick/TomH_HitS_v2_rr2_Mid.wav")),
              "m": L(VC(TOM1 + "Stick/TomH_HitS_v3_rr1_Mid.wav"), VC(TOM1 + "Stick/TomH_HitS_v3_rr2_Mid.wav")),
              "h": L(VC(TOM1 + "TomH_rimS_v4_rr1_Mid.wav"), VC(TOM1 + "TomH_rimS_v4_rr2_Mid.wav")),
              "eq": [("hp", 90, .7, 0)], "len": 0.6, "fade": 0.3, "ceil": 0.55},
    "tom":   {"name": "SURDO2", "s": L(VC(TOM2 + "Mallet/TomL_HitM_v2_rr1_Mid.wav"), VC(TOM2 + "Mallet/TomL_HitM_v2_rr2_Mid.wav")),
              "m": L(VC(TOM2 + "Mallet/TomL_HitM_v3_rr1_Mid.wav"), VC(TOM2 + "Mallet/TomL_HitM_v3_rr2_Mid.wav")),
              "h": L(VC(TOM2 + "Mallet/TomL_HitM_v4_rr1_Mid.wav"), VC(TOM2 + "Mallet/TomL_HitM_v4_rr2_Mid.wav")),
              "eq": [("hp", 40, .7, 0)], "len": 1.0, "fade": 0.5, "ceil": 0.5},
    "rim":   {"name": "AGOGO", "s": L(VC(ID + "Agogo Bells/Agogo_High_v1_rr1_Mid.wav")), "m": L(VC(ID + "Agogo Bells/Agogo_High_v2_rr1_Mid.wav")),
              "h": L(VC(ID + "Agogo Bells/Agogo_High_v3_rr1_Mid.wav")),
              "eq": [("hp", 500, .7, 0)], "len": 0.6, "fade": 0.3},
    "bell":  {"name": "APITO", "s": L(VC(WHIS + "Main_BallWhistle_Short-001.wav")), "m": L(VC(WHIS + "Main_BallWhistle_Short-001.wav")),
              "h": L(VC(WHIS + "Main_BallWhistle_Long-001.wav")),
              "eq": [("hp", 600, .7, 0)], "len": 1.1, "fade": 0.3},
  }},
  # ── BP · body percussion: stomps, claps, snaps and pats, all a body can play ────────────────────────────────────────
  "BP": {"dir": "body", "pads": {
    "kick":  {"name": "STOMP", "s": L(BO("stomp_l_vl1_rr1"), BO("stomp_r_vl1_rr1")), "m": L(BO("stomp_l_vl2_rr1"), BO("stomp_r_vl2_rr1"), BO("stomp_l_vl2_rr2")),
              "h": L(BO("stomp_l_vl2_rr4"), BO("stomp_r_vl2_rr4")), "eq": [("hp", 35, .7, 0)], "len": 0.6, "fade": 0.3},
    "snare": {"name": "CLAP", "s": L(BO("handclap_vl1_rr1"), BO("handclap_vl1_rr2")), "m": L(BO("handclap_vl2_rr1"), BO("handclap_vl2_rr2"), BO("handclap_vl2_rr3")),
              "h": L(BO("handclap_vl2_rr4"), BO("handclap_vl2_rr5")), "eq": [("hp", 150, .7, 0)], "len": 0.45, "fade": 0.2, "ceil": 0.55},
    "ch":    {"name": "SNAP", "s": L(BO("snap_l_rr1"), BO("snap_r_rr1")), "m": L(BO("snap_l_rr2"), BO("snap_r_rr2"), BO("snap_l_rr3")),
              "h": L(BO("snap_l_rr4"), BO("snap_r_rr4")), "eq": [("hp", 400, .7, 0)], "len": 0.35, "fade": 0.15, "ceil": 0.55},
    "oh":    {"name": "FCLAP", "s": L(BO("fingerclap_vl1_rr1"), BO("fingerclap_vl1_rr2")), "m": L(BO("fingerclap_vl2_rr1"), BO("fingerclap_vl2_rr2"), BO("fingerclap_vl2_rr3")),
              "h": L(BO("fingerclap_vl2_rr4"), BO("fingerclap_vl2_rr5")), "eq": [("hp", 300, .7, 0)], "len": 0.35, "fade": 0.15, "ceil": 0.55},
    "clap":  {"name": "CHEST", "s": L(BO("chestthump_l_vl1_rr1"), BO("chestthump_l_vl1_rr2")), "m": L(BO("chestthump_l_vl2_rr1"), BO("chestthump_l_vl2_rr2")),
              "h": L(BO("chestthump_l_vl2_rr3"), BO("chestthump_l_vl2_rr4")), "eq": [("hp", 50, .7, 0)], "len": 0.45, "fade": 0.2, "ceil": 0.3},
    "tom":   {"name": "BELLY", "s": L(BO("bellycenter_l_vl1_rr1"), BO("bellycenter_r_vl1_rr1")), "m": L(BO("bellycenter_l_vl2_rr1"), BO("bellycenter_r_vl2_rr1")),
              "h": L(BO("bellycenter_l_vl2_rr3"), BO("bellycenter_r_vl2_rr3")), "eq": [("hp", 50, .7, 0)], "len": 0.45, "fade": 0.2, "ceil": 0.3},
    "rim":   {"name": "HEEL", "s": L(BO("heel_l_vl1_rr1"), BO("heel_r_vl1_rr1")), "m": L(BO("heel_l_vl2_rr1"), BO("heel_r_vl2_rr1"), BO("heel_l_vl2_rr2")),
              "h": L(BO("heel_l_vl2_rr4"), BO("heel_r_vl2_rr4")), "eq": [("hp", 50, .7, 0)], "len": 0.4, "fade": 0.18},
    "bell":  {"name": "CHEEK", "s": L(BO("cheek_lout_rr1"), BO("cheek_rout_rr1")), "m": L(BO("cheek_lout_rr2"), BO("cheek_rout_rr2")),
              "h": L(BO("cheek_lout_rr4"), BO("cheek_rout_rr4")), "eq": [("hp", 150, .7, 0)], "len": 0.35, "fade": 0.15, "ceil": 0.3},
  }},
}

# the loudness of each pad's normal file (K-weighted, loudest 400 ms), beside the nearest pads of the kits already there
FILE_LU = {
  "OR": {"kick": -22.5, "snare": -33.0, "ch": -38.0, "oh": -31.0, "clap": -29.0, "tom": -27.0, "rim": -28.0, "bell": -26.0},
  "SB": {"kick": -23.0, "snare": -32.0, "ch": -38.0, "oh": -31.0, "clap": -31.0, "tom": -28.5, "rim": -31.0, "bell": -32.0},
  "BP": {"kick": -24.0, "snare": -31.0, "ch": -34.0, "oh": -35.0, "clap": -31.5, "tom": -32.0, "rim": -30.0, "bell": -34.5},
  "ME": {"kick": -23.0, "snare": -29.0, "ch": -32.0, "oh": -37.0, "clap": -29.0, "tom": -25.0, "rim": -28.0, "bell": -33.0},
}
