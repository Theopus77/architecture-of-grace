"""AOG-DRUM-MORE-V1 (2026-10-18) — the drum-set styles and the electronic kits (kits_more.py has the others).

  GS  Gospel and church       MuldjordKit (Lars Muldjord, CC BY 4.0, FreePats version): kick, a snare tuned up a little,
                              hi-hats, toms and crash; VCSL: a crowd clapping and a tambourine
  MT  Motown and 60s soul     Virtuosity Drums through its "lo-fi" microphone (one old-sounding microphone); the snare
                              doubled with a tambourine (VCSL) as the Motown records did; a foot on a wooden board
                              (body_percussion's stomp), hand claps and a tambourine shake (VCSL)
  DS  Disco                   Big Rusty Drums, close and dry: a damped kick, the half-open hi-hat, a deep tom; VCSL
                              hand claps and a cowbell
  PK  Punk and garage         MuldjordKit in a small loud room, pushed hard: a trashy china, the floor tom, the ride
  PO  1980s pop               MuldjordKit with the big gated room (made here: a room that stops short); VCSL hi-hats
                              and claps; a synth tom from FreePats "synthesizer percussion" (made by a synthesizer, so
                              its name says so)
  JG  Drum and bass, jungle   Virtuosity Drums tuned up, squeezed and a little crunchy, as a sped-up break sounds; a
                              ghost-note snare
  RG  Reggaeton               Sonic Pi's drum-machine samples (CC0, Freesound): a club kick, a snare, hats and a long
                              808 boom; a Virtuosity timbale and cross-stick; VCSL claps
  TR  Trap                    Sonic Pi's samples (CC0, Freesound): an 808 kick and the long 808 boom, a snare, crisp
                              hats for rolls, finger snaps, a click; VCSL claps
Rooms, gates and echoes are made here (dsp.py), never recorded.
"""
from kits import T, MAKE, L, ID, MB, VC, B, V, ROOM_BIG, ROOM_MED, ROOM_SMALL, ROOM_CLUB
from sources import virt

def M(inst, n, base=None):
    """MuldjordKit (FreePats version): samples/<inst>/<n>-<base>.flac, the higher n the harder the hit"""
    return T("muld:samples/%s/%d-%s.flac" % (inst, n, base or inst))

def MS(n, side=1):
    return M("Snare%d" % side, n, "Snare")

def BO(n):
    return T("body:Samples/body/%s.wav" % n)

def SP(n):
    return T("spi:etc/samples/%s.flac" % n)

def SYN(n):
    return T("synp:samples/%s.flac" % n)

def VP(rel):
    return T("virt:Samples/perc/" + rel)

CLAPS = ID + "Claps/"
TAMB1 = ID + "Tambourine 1/"
TAMB2 = ID + "Tambourine 2/"
HH = ID + "Hi-Hat Cymbal/"
COW = ID + "Cowbells/"

def LO(art, vl, rr=None):
    """Virtuosity through its lo-fi microphone only"""
    return V(art, vl, rr, {"lofi": 1.0})

def VJ(art, vl, rr=None):
    """Virtuosity, close and overhead microphones, for the jungle kit"""
    if art.startswith("snare"):
        return V(art, vl, rr, {"snaremic": 1.0, "oh": 0.5})
    if art.startswith("kick"):
        return V(art, vl, rr, {"kickmic": 1.0, "oh": 0.2})
    return V(art, vl, rr, {"oh": 1.0})

def MOTSN(vl, tvl):
    """the Motown snare: the lo-fi snare and a tambourine struck together (build.py make_stack)"""
    return MAKE("stack", stack=[(virt("snare_center", vl, "lofi"), 1.0, 0), (TAMB1 + "Tamb1_Hit_v%d_rr1_Mid.wav" % tvl, 0.55, 2)])

GATED = (dict(rt60=1.6, pre_ms=10, damp_rt60_hi=0.9, er=10, seed=31), -3.0, (-10, 4))

MORE2 = {
  # ── GS · gospel and church: a tight modern kit with the congregation's claps and a tambourine ──────────────────────
  "GS": {"dir": "gospel", "pads": {
    "kick":  {"name": "KICK", "s": L(M("KdrumL", 10), M("KdrumR", 11)), "m": L(M("KdrumL", 17), M("KdrumR", 17), M("KdrumL", 19)),
              "h": L(M("KdrumL", 23), M("KdrumR", 24)),
              "eq": [("hp", 35, .7, 0), ("peak", 62, 1.0, 2), ("peak", 400, 1.2, -4), ("peak", 4000, 1.0, 2)], "comp": (-16, 3, 6, 90),
              "len": 0.5, "fade": 0.25, "ceil": 0.42},
    "snare": {"name": "SNARE", "s": L(MS(30), MS(30, 2)), "m": L(MS(42), MS(42, 2), MS(45)), "h": L(MS(53), MS(55, 2)),
              "tune": 1.0, "eq": [("hp", 100, .7, 0), ("peak", 900, 1.2, -2), ("highshelf", 5000, .7, 2.5)], "comp": (-16, 3, 4, 90),
              "room": (ROOM_MED, -16.0, None), "len": 0.55, "fade": 0.25, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(M("HihatClosed", 12), M("HihatClosed", 14)), "m": L(M("HihatClosed", 20), M("HihatClosed", 22), M("HihatClosed", 24)),
              "h": L(M("HihatClosed", 27), M("HihatClosed", 28)), "eq": [("hp", 300, .7, 0)], "len": 0.3, "fade": 0.14},
    "oh":    {"name": "OPEN", "s": L(M("HihatOpen", 12), M("HihatOpen", 14)), "m": L(M("HihatOpen", 20), M("HihatOpen", 22)),
              "h": L(M("HihatOpen", 28), M("HihatOpen", 29)), "eq": [("hp", 300, .7, 0)], "len": 0.9, "fade": 0.5},
    "clap":  {"name": "CLAPS", "s": L(VC(CLAPS + "Clap_rr1.wav"), VC(CLAPS + "Clap_rr2.wav")), "m": L(VC(CLAPS + "Clap_rr3.wav"), VC(CLAPS + "Clap_rr4.wav"), VC(CLAPS + "Clap_rr5.wav")),
              "h": L(VC(CLAPS + "Clap_rr6.wav"), VC(CLAPS + "Clap_rr1.wav")), "eq": [("hp", 200, .7, 0)], "len": 0.45, "fade": 0.2, "ceil": 0.55},
    "tom":   {"name": "TOM", "s": L(M("Tom2", 5), M("Tom2", 6)), "m": L(M("Tom2", 9), M("Tom2", 10)), "h": L(M("Tom2", 12), M("Tom2", 13)),
              "eq": [("hp", 60, .7, 0), ("peak", 400, 1.0, -3)], "comp": (-16, 3, 8, 120), "len": 0.8, "fade": 0.4, "ceil": 0.55},
    "rim":   {"name": "TAMB", "s": L(VC(TAMB1 + "Tamb1_Hit_v1_rr1_Mid.wav"), VC(TAMB2 + "Tamb2_Hit_v1_rr1_Mid.wav")),
              "m": L(VC(TAMB1 + "Tamb1_Hit_v2_rr1_Mid.wav"), VC(TAMB2 + "Tamb2_Hit_v2_rr2_Mid.wav")),
              "h": L(VC(TAMB2 + "Tamb2_Hit_v2_rr2_Mid.wav"), VC(TAMB1 + "Tamb1_Hit_v2_rr1_Mid.wav")), "eq": [("hp", 250, .7, 0)], "len": 0.6, "fade": 0.35},
    "bell":  {"name": "CRASH", "s": L(M("CrashR", 4)), "m": L(M("CrashR", 7), M("CrashR", 8)), "h": L(M("CrashR", 11), M("CrashR", 12)),
              "eq": [("hp", 200, .7, 0)], "len": 2.2, "fade": 1.3},
  }},
  # ── MT · Motown and 60s soul: one old microphone, the snare and a tambourine together, a foot on a board ───────────
  "MT": {"dir": "motown", "pads": {
    "kick":  {"name": "KICK", "s": L(LO("kick_snoff", 2, 1)), "m": L(LO("kick_snoff", 3, 1), LO("kick_snoff", 3, 2)), "h": L(LO("kick_snoff", 4, 1), LO("kick_snoff", 4, 2)),
              "eq": [("hp", 40, .7, 0), ("peak", 90, 1.0, 3), ("lp", 7000, .7, 0)], "comp": (-14, 3, 8, 120), "len": 0.55, "fade": 0.3, "ceil": 0.7},
    "snare": {"name": "SNTAMB", "s": L(MOTSN(14, 1)), "m": L(MOTSN(22, 2), MOTSN(23, 2)), "h": L(MOTSN(30, 2), MOTSN(31, 2)),
              "eq": [("hp", 110, .7, 0), ("lp", 8500, .7, 0)], "comp": (-14, 3, 4, 90), "room": (ROOM_MED, -12.0, None), "sat": 1.2,
              "len": 0.7, "fade": 0.35, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(LO("hh_closed", 2, 1)), "m": L(LO("hh_closed", 3, 1), LO("hh_closed", 3, 2)), "h": L(LO("hh_closed", 4, 1), LO("hh_closed", 4, 2)),
              "eq": [("hp", 300, .7, 0), ("lp", 8000, .7, 0)], "len": 0.3, "fade": 0.14},
    "oh":    {"name": "OPEN", "s": L(LO("hh_half", 2, 1)), "m": L(LO("hh_half", 3, 1), LO("hh_half", 3, 2)), "h": L(LO("hh_half", 4, 1), LO("hh_half", 4, 2)),
              "eq": [("hp", 300, .7, 0), ("lp", 8000, .7, 0)], "len": 0.8, "fade": 0.45},
    "clap":  {"name": "CLAPS", "s": L(VC(CLAPS + "SoloClap_vl1.wav"), VC(CLAPS + "SoloClap_vl2.wav")), "m": L(VC(CLAPS + "SoloClap_vl3.wav"), VC(CLAPS + "SoloClap_vl2.wav")),
              "h": L(VC(CLAPS + "SoloClap_vl4.wav"), VC(CLAPS + "SoloClap_vl3.wav")),
              "eq": [("hp", 200, .7, 0), ("lp", 8000, .7, 0)], "room": (ROOM_MED, -10.0, None), "len": 0.5, "fade": 0.25, "ceil": 0.55},
    "tom":   {"name": "TOM", "s": L(LO("htom_center", 5)), "m": L(LO("htom_center", 9), LO("htom_center", 10)), "h": L(LO("htom_center", 13), LO("htom_center", 14)),
              "eq": [("hp", 70, .7, 0), ("lp", 7500, .7, 0)], "len": 0.8, "fade": 0.4, "ceil": 0.55},
    "rim":   {"name": "STOMP", "s": L(BO("stomp_l_vl1_rr1"), BO("stomp_r_vl1_rr2")), "m": L(BO("stomp_l_vl2_rr2"), BO("stomp_r_vl2_rr2"), BO("stomp_l_vl2_rr3")),
              "h": L(BO("stomp_l_vl2_rr5"), BO("stomp_r_vl2_rr5")), "eq": [("hp", 45, .7, 0), ("peak", 1200, 1.0, 3), ("lp", 7000, .7, 0)],
              "room": (ROOM_MED, -10.0, None), "len": 0.6, "fade": 0.3, "ceil": 0.55},
    "bell":  {"name": "TAMB", "s": L(VC(TAMB1 + "Tamb1_Shake_rr1_Mid.wav")), "m": L(VC(TAMB2 + "Tamb2_Shake_rr3_Mid.wav"), VC(TAMB1 + "Tamb1_Shake_rr2_Mid.wav")),
              "h": L(VC(TAMB2 + "Tamb2_Shake_rr4_Mid.wav"), VC(TAMB2 + "Tamb2_Shake_rr3_Mid.wav")), "eq": [("hp", 300, .7, 0), ("lp", 9000, .7, 0)],
              "len": 0.55, "fade": 0.3},
  }},
  # ── DS · disco: close, dry and tight; the half-open hat on the off-beat, claps, a cowbell ──────────────────────────
  "DS": {"dir": "disco", "pads": {
    "kick":  {"name": "KICK", "s": L(B("kick", 7)), "m": L(B("kick", 11, 1), B("kick", 11, 2)), "h": L(B("kick", 14, 1), B("kick", 14, 2)),
              "eq": [("hp", 38, .7, 0), ("peak", 70, 1.0, 3), ("peak", 350, 1.2, -6), ("peak", 3000, 1.0, 3)], "comp": (-18, 4, 6, 80), "shape": (0.1, 0.1),
              "len": 0.45, "fade": 0.2, "ceil": 0.42},
    "snare": {"name": "SNARE", "s": L(B("snare", 5)), "m": L(B("snare", 8, 1), B("snare", 8, 2)), "h": L(B("snare", 10, 1), B("snare", 10, 2)),
              "eq": [("hp", 120, .7, 0), ("peak", 200, 1.0, 2), ("highshelf", 6000, .7, 3)], "comp": (-18, 4, 3, 70), "shape": (0.12, 0.1),
              "len": 0.45, "fade": 0.2, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(B("hat_cl", 3)), "m": L(B("hat_cl", 5, 1), B("hat_cl", 5, 2)), "h": L(B("hat_cl", 6)),
              "eq": [("hp", 400, .7, 0), ("highshelf", 8000, .7, 2)], "len": 0.25, "fade": 0.12},
    "oh":    {"name": "OPEN", "s": L(B("hat_ho", 2)), "m": L(B("hat_ho", 4)), "h": L(B("hat_ho", 4), B("hat_open", 4)),
              "eq": [("hp", 400, .7, 0), ("highshelf", 8000, .7, 2)], "len": 0.45, "fade": 0.22},
    "clap":  {"name": "CLAP", "s": L(VC(CLAPS + "Clap_rr2.wav"), VC(CLAPS + "Clap_rr4.wav")), "m": L(VC(CLAPS + "Clap_rr1.wav"), VC(CLAPS + "Clap_rr3.wav"), VC(CLAPS + "Clap_rr5.wav")),
              "h": L(VC(CLAPS + "Clap_rr6.wav"), VC(CLAPS + "Clap_rr3.wav")), "eq": [("hp", 250, .7, 0), ("peak", 1500, 1.0, 2)],
              "room": (ROOM_SMALL, -12.0, None), "len": 0.4, "fade": 0.2, "ceil": 0.55},
    "tom":   {"name": "TOM", "s": L(B("tom15", 3)), "m": L(B("tom15", 6)), "h": L(B("tom15", 7)), "tune": -2.0,
              "eq": [("hp", 50, .7, 0), ("peak", 400, 1.0, -4)], "comp": (-16, 3, 8, 120), "len": 0.9, "fade": 0.45, "ceil": 0.55},
    "rim":   {"name": "COWBEL", "s": L(VC(COW + "Cowbell1_Hit_v2_rr1_Mid.wav")), "m": L(VC(COW + "Cowbell1_Hit_v3_rr1_Mid.wav")), "h": L(VC(COW + "Cowbell1_Hit_v4_rr1_Mid.wav")),
              "eq": [("hp", 400, .7, 0)], "len": 0.45, "fade": 0.22, "ceil": 0.55},
    "bell":  {"name": "CRASH", "s": L(B("crash", 3)), "m": L(B("crash", 4)), "h": L(B("crash", 5)),
              "eq": [("hp", 250, .7, 0)], "len": 2.0, "fade": 1.2},
  }},
  # ── PK · punk and garage: a small loud room, everything pushed, a trashy china ─────────────────────────────────────
  "PK": {"dir": "punk", "pads": {
    "kick":  {"name": "KICK", "s": L(M("KdrumR", 13), M("KdrumL", 13)), "m": L(M("KdrumL", 19), M("KdrumR", 19)), "h": L(M("KdrumL", 24), M("KdrumR", 25)),
              "eq": [("hp", 40, .7, 0), ("peak", 80, 1.0, 2), ("peak", 2500, 1.0, 3)], "sat": 1.5, "room": (ROOM_SMALL, -10.0, (-8, 4)),
              "len": 0.55, "fade": 0.25, "ceil": 0.7},
    "snare": {"name": "SNARE", "s": L(MS(33), MS(33, 2)), "m": L(MS(45), MS(45, 2)), "h": L(MS(55), MS(56, 2)),
              "eq": [("hp", 120, .7, 0), ("peak", 250, 1.0, 2), ("peak", 2000, 1.0, 2)], "sat": 1.6, "room": (ROOM_SMALL, -8.0, (-8, 4)),
              "len": 0.6, "fade": 0.3, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(M("HihatClosed", 14), M("HihatClosed", 16)), "m": L(M("HihatClosed", 22), M("HihatClosed", 24)),
              "h": L(M("HihatClosed", 28), M("HihatClosed", 29)), "eq": [("hp", 350, .7, 0)], "sat": 1.3, "len": 0.3, "fade": 0.14},
    "oh":    {"name": "OPEN", "s": L(M("HihatOpen", 16)), "m": L(M("HihatOpen", 22), M("HihatOpen", 24)), "h": L(M("HihatOpen", 29), M("HihatOpen", 30)),
              "eq": [("hp", 350, .7, 0)], "sat": 1.3, "len": 0.9, "fade": 0.5},
    "clap":  {"name": "CHINA", "s": L(M("China", 5)), "m": L(M("China", 8), M("China", 9)), "h": L(M("China", 11), M("China", 12)),
              "eq": [("hp", 250, .7, 0)], "len": 1.8, "fade": 1.0},
    "tom":   {"name": "FLOOR", "s": L(M("Tom4", 8), M("Tom4", 10)), "m": L(M("Tom4", 14), M("Tom4", 15)), "h": L(M("Tom4", 18), M("Tom4", 19)),
              "eq": [("hp", 45, .7, 0), ("peak", 350, 1.0, -3)], "sat": 1.3, "room": (ROOM_SMALL, -10.0, (-8, 4)), "len": 1.0, "fade": 0.5, "ceil": 0.55},
    "rim":   {"name": "RIDE", "s": L(M("RideR", 3), M("RideR", 4)), "m": L(M("RideR", 6), M("RideR", 7)), "h": L(M("RideRBell", 6), M("RideRBell", 7)),
              "eq": [("hp", 250, .7, 0)], "len": 1.8, "fade": 1.0},
    "bell":  {"name": "CRASH", "s": L(M("CrashR", 5)), "m": L(M("CrashR", 8), M("CrashR", 9)), "h": L(M("CrashR", 11), M("CrashR", 12)),
              "eq": [("hp", 200, .7, 0)], "sat": 1.2, "len": 2.0, "fade": 1.2},
  }},
  # ── PO · 1980s pop: the big gated room on the snare, the claps and the toms; a synth tom ───────────────────────────
  "PO": {"dir": "pop80s", "pads": {
    "kick":  {"name": "KICK", "s": L(M("KdrumR", 11), M("KdrumL", 12)), "m": L(M("KdrumR", 17), M("KdrumL", 17)), "h": L(M("KdrumR", 23), M("KdrumL", 23)),
              "eq": [("hp", 35, .7, 0), ("peak", 70, 1.0, 3), ("peak", 350, 1.2, -5), ("peak", 3500, 1.0, 3)], "comp": (-16, 4, 6, 90),
              "len": 0.5, "fade": 0.25, "ceil": 0.42},
    "snare": {"name": "GATED", "s": L(MS(33, 2), MS(36)), "m": L(MS(45, 2), MS(48)), "h": L(MS(53, 2), MS(55)),
              "eq": [("hp", 110, .7, 0), ("peak", 200, 1.0, 3), ("highshelf", 5000, .7, 3)], "comp": (-16, 3, 3, 80), "room": GATED,
              "gate": (0.24, 0.05), "len": 0.45, "fade": 0.08, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(VC(HH + "HiHat_HitC_v1_rr1_Mid.wav"), VC(HH + "HiHat_HitC_v1_rr2_Mid.wav")),
              "m": L(VC(HH + "HiHat_HitC_v3_rr1_Mid.wav"), VC(HH + "HiHat_HitC_v3_rr2_Mid.wav")),
              "h": L(VC(HH + "HiHat_HitC_v4_rr1_Mid.wav"), VC(HH + "HiHat_HitC_v4_rr2_Mid.wav")), "eq": [("hp", 400, .7, 0)], "len": 0.28, "fade": 0.12},
    "oh":    {"name": "OPEN", "s": L(VC(HH + "HiHat_HitO_rr1_Mid.wav")), "m": L(VC(HH + "HiHat_HitO_rr1_Mid.wav"), VC(HH + "HiHat_HitO_rr2_Mid.wav")),
              "h": L(VC(HH + "HiHat_HitO_rr2_Mid.wav"), VC(HH + "HiHat_HitO_rr1_Mid.wav")), "eq": [("hp", 400, .7, 0)], "len": 0.9, "fade": 0.5},
    "clap":  {"name": "CLAP", "s": L(VC(CLAPS + "Clap_rr1.wav"), VC(CLAPS + "Clap_rr2.wav")), "m": L(VC(CLAPS + "Clap_rr3.wav"), VC(CLAPS + "Clap_rr4.wav")),
              "h": L(VC(CLAPS + "Clap_rr5.wav"), VC(CLAPS + "Clap_rr6.wav")), "eq": [("hp", 250, .7, 0)], "room": GATED, "gate": (0.2, 0.05),
              "len": 0.4, "fade": 0.08, "ceil": 0.55},
    "tom":   {"name": "TOM", "s": L(M("Tom3", 6), M("Tom3", 7)), "m": L(M("Tom3", 10), M("Tom3", 11)), "h": L(M("Tom3", 13), M("Tom3", 14)),
              "eq": [("hp", 50, .7, 0), ("peak", 400, 1.0, -3)], "comp": (-16, 3, 8, 120), "room": GATED, "gate": (0.35, 0.06),
              "len": 0.6, "fade": 0.1, "ceil": 0.55},
    "rim":   {"name": "SYNTOM", "s": L(SYN("HighTom02-01")), "m": L(SYN("MidTom02-01"), SYN("MidTom02-02")), "h": L(SYN("LowTom02-01"), SYN("LowTom02-02")),
              "eq": [("hp", 50, .7, 0)], "len": 0.8, "fade": 0.4, "ceil": 0.55},
    "bell":  {"name": "CRASH", "s": L(M("CrashR", 5)), "m": L(M("CrashR", 8), M("CrashR", 9)), "h": L(M("CrashR", 11), M("CrashR", 12)),
              "eq": [("hp", 200, .7, 0)], "room": (ROOM_BIG, -14.0, None), "len": 2.2, "fade": 1.3},
  }},
  # ── JG · drum and bass, jungle: a break kit tuned up, squeezed and a little crunchy ─────────────────────────────────
  "JG": {"dir": "jungle", "pads": {
    "kick":  {"name": "KICK", "s": L(VJ("kick_snoff", 2, 1)), "m": L(VJ("kick_snoff", 3, 1), VJ("kick_snoff", 3, 2)), "h": L(VJ("kick_snoff", 4, 1), VJ("kick_snoff", 4, 2)),
              "tune": 1.0, "eq": [("hp", 40, .7, 0), ("peak", 75, 1.0, 3), ("peak", 3500, 1.0, 3)], "comp": (-16, 4, 6, 80), "sat": 1.3,
              "len": 0.4, "fade": 0.2, "ceil": 0.7},
    "snare": {"name": "SNARE", "s": L(VJ("snare_center", 20)), "m": L(VJ("snare_center", 28), VJ("snare_center", 29)), "h": L(VJ("snare_rimshot", 10), VJ("snare_rimshot", 11)),
              "tune": 3.0, "eq": [("hp", 140, .7, 0), ("peak", 240, 1.0, 3), ("highshelf", 5000, .7, 3)], "comp": (-18, 4, 3, 70), "sat": 1.4,
              "len": 0.35, "fade": 0.15, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(VJ("hh_closed", 2, 1)), "m": L(VJ("hh_closed", 3, 1), VJ("hh_closed", 3, 2)), "h": L(VJ("hh_closed", 4, 1), VJ("hh_closed", 4, 2)),
              "tune": 1.0, "eq": [("hp", 400, .7, 0), ("highshelf", 8000, .7, 2)], "sat": 1.2, "len": 0.22, "fade": 0.1},
    "oh":    {"name": "OPEN", "s": L(VJ("hh_half", 2, 1)), "m": L(VJ("hh_half", 3, 1), VJ("hh_half", 3, 2)), "h": L(VJ("hh_open", 4, 1), VJ("hh_open", 4, 2)),
              "tune": 1.0, "eq": [("hp", 400, .7, 0)], "len": 0.6, "fade": 0.3},
    "clap":  {"name": "GHOST", "s": L(VJ("snare_center", 6)), "m": L(VJ("snare_center", 10), VJ("snare_center", 11)), "h": L(VJ("snare_center", 14), VJ("snare_center", 15)),
              "tune": 3.0, "eq": [("hp", 140, .7, 0), ("highshelf", 5000, .7, 3)], "comp": (-18, 4, 3, 70), "sat": 1.3, "len": 0.3, "fade": 0.12, "ceil": 0.55},
    "tom":   {"name": "TOM", "s": L(VJ("htom_center", 6)), "m": L(VJ("htom_center", 10), VJ("htom_center", 11)), "h": L(VJ("htom_center", 14), VJ("htom_center", 15)),
              "tune": 2.0, "eq": [("hp", 70, .7, 0)], "comp": (-16, 3, 8, 100), "sat": 1.2, "len": 0.6, "fade": 0.3, "ceil": 0.55},
    "rim":   {"name": "RIDE", "s": L(VJ("ride_ride", 1, 1)), "m": L(VJ("ride_ride", 2, 1), VJ("ride_ride", 2, 2)), "h": L(VJ("ride_bell", 3, 1), VJ("ride_bell", 3, 2)),
              "tune": 1.0, "eq": [("hp", 300, .7, 0)], "len": 1.4, "fade": 0.8},
    "bell":  {"name": "CRASH", "s": L(VJ("crash_crash", 1, 1)), "m": L(VJ("crash_crash", 2, 1), VJ("crash_crash", 2, 2)), "h": L(VJ("crash_crash", 3, 1), VJ("crash_crash", 3, 2)),
              "tune": 1.0, "eq": [("hp", 300, .7, 0)], "len": 1.8, "fade": 1.0},
  }},
  # ── RG · reggaeton: a club kick, a snare, the dembow's timbale and cross-stick, the long 808 boom ──────────────────
  "RG": {"dir": "reggaeton", "pads": {
    "kick":  {"name": "KICK", "s": L(SP("bd_haus")), "m": L(SP("bd_haus")), "h": L(SP("bd_haus")),
              "eq": [("hp", 32, .7, 0)], "len": 0.35, "fade": 0.12, "ceil": 0.7},
    "snare": {"name": "SNARE", "s": L(SP("sn_zome")), "m": L(SP("sn_zome")), "h": L(SP("sn_zome")),
              "eq": [("hp", 140, .7, 0)], "len": 0.45, "fade": 0.18, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(SP("hat_raw")), "m": L(SP("hat_raw")), "h": L(SP("hat_raw")),
              "eq": [("hp", 500, .7, 0)], "len": 0.2, "fade": 0.08},
    "oh":    {"name": "OPEN", "s": L(SP("hat_metal")), "m": L(SP("hat_metal")), "h": L(SP("hat_metal")),
              "eq": [("hp", 500, .7, 0)], "len": 0.7, "fade": 0.35},
    "clap":  {"name": "CLAP", "s": L(VC(CLAPS + "Clap_rr1.wav"), VC(CLAPS + "Clap_rr2.wav")), "m": L(VC(CLAPS + "Clap_rr3.wav"), VC(CLAPS + "Clap_rr4.wav")),
              "h": L(VC(CLAPS + "Clap_rr5.wav"), VC(CLAPS + "Clap_rr6.wav")), "eq": [("hp", 250, .7, 0)], "room": (ROOM_CLUB, -12.0, None),
              "len": 0.4, "fade": 0.18, "ceil": 0.55},
    "tom":   {"name": "TIMBAL", "s": L(VP("oh/timbales/timb14_vl1_rr1.wav")), "m": L(VP("oh/timbales/timb14_vl3_rr1.wav"), VP("oh/timbales/timb14_vl3_rr2.wav")),
              "h": L(VP("oh/timbales/timb14_vl4_rr1.wav")), "eq": [("hp", 120, .7, 0)], "len": 0.6, "fade": 0.3, "ceil": 0.55},
    "rim":   {"name": "XSTICK", "s": L(V("snare_crossstick", 8, mics={"snaremic": 1.0, "oh": 0.4})),
              "m": L(V("snare_crossstick", 11, mics={"snaremic": 1.0, "oh": 0.4}), V("snare_crossstick", 12, mics={"snaremic": 1.0, "oh": 0.4})),
              "h": L(V("snare_crossstick", 14, mics={"snaremic": 1.0, "oh": 0.4})), "eq": [("hp", 150, .7, 0)], "len": 0.35, "fade": 0.15, "ceil": 0.55},
    "bell":  {"name": "BOOM", "s": L(SP("bd_boom")), "m": L(SP("bd_boom")), "h": L(SP("bd_boom")),
              "eq": [("hp", 28, .7, 0)], "len": 1.6, "fade": 0.6, "ceil": 0.7},
  }},
  # ── TR · trap: the 808 kick and its long boom, a snare, crisp hats for rolls, finger snaps, claps ────────────────────
  "TR": {"dir": "trap", "pads": {
    "kick":  {"name": "KICK", "s": L(SP("bd_808")), "m": L(SP("bd_808")), "h": L(SP("bd_808")),
              "eq": [("hp", 28, .7, 0)], "len": 0.55, "fade": 0.15, "ceil": 0.42},
    "snare": {"name": "SNARE", "s": L(SP("sn_dolf")), "m": L(SP("sn_dolf")), "h": L(SP("sn_dolf")),
              "eq": [("hp", 140, .7, 0)], "room": (ROOM_CLUB, -14.0, None), "len": 0.45, "fade": 0.18, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(SP("hat_snap")), "m": L(SP("hat_snap")), "h": L(SP("hat_snap")),
              "eq": [("hp", 600, .7, 0)], "len": 0.16, "fade": 0.06},
    "oh":    {"name": "OPEN", "s": L(SP("hat_cats")), "m": L(SP("hat_cats")), "h": L(SP("hat_cats")),
              "eq": [("hp", 500, .7, 0)], "len": 0.4, "fade": 0.2},
    "clap":  {"name": "CLAP", "s": L(VC(CLAPS + "Clap_rr1.wav"), VC(CLAPS + "Clap_rr2.wav")), "m": L(VC(CLAPS + "Clap_rr3.wav"), VC(CLAPS + "Clap_rr4.wav")),
              "h": L(VC(CLAPS + "Clap_rr5.wav"), VC(CLAPS + "Clap_rr6.wav")), "eq": [("hp", 250, .7, 0)], "room": (ROOM_CLUB, -10.0, None),
              "len": 0.45, "fade": 0.2, "ceil": 0.55},
    "tom":   {"name": "SNAP", "s": L(SP("perc_snap"), SP("perc_snap2")), "m": L(SP("perc_snap"), SP("perc_snap2")), "h": L(SP("perc_snap2"), SP("perc_snap")),
              "eq": [("hp", 400, .7, 0)], "room": (ROOM_CLUB, -12.0, None), "len": 0.35, "fade": 0.15, "ceil": 0.55},
    "rim":   {"name": "CLICK", "s": L(SP("elec_wood")), "m": L(SP("elec_wood")), "h": L(SP("elec_wood")),
              "eq": [("hp", 300, .7, 0)], "len": 0.35, "fade": 0.15, "ceil": 0.55},
    "bell":  {"name": "BOOM", "s": L(SP("bd_boom")), "m": L(SP("bd_boom")), "h": L(SP("bd_boom")),
              "eq": [("hp", 28, .7, 0)], "len": 1.7, "fade": 0.6, "ceil": 0.7},
  }},
}

FILE_LU2 = {
  "GS": {"kick": -23.0, "snare": -34.0, "ch": -43.5, "oh": -42.0, "clap": -36.0, "tom": -27.0, "rim": -35.0, "bell": -32.0},
  "MT": {"kick": -24.0, "snare": -34.0, "ch": -44.0, "oh": -42.0, "clap": -37.0, "tom": -28.0, "rim": -32.0, "bell": -38.0},
  "DS": {"kick": -23.0, "snare": -34.5, "ch": -43.0, "oh": -40.0, "clap": -36.0, "tom": -27.0, "rim": -36.0, "bell": -32.0},
  "PK": {"kick": -23.0, "snare": -33.5, "ch": -43.0, "oh": -41.0, "clap": -33.0, "tom": -27.0, "rim": -37.0, "bell": -31.0},
  "PO": {"kick": -23.0, "snare": -33.0, "ch": -43.0, "oh": -41.0, "clap": -35.0, "tom": -27.0, "rim": -29.0, "bell": -32.0},
  "JG": {"kick": -24.0, "snare": -34.0, "ch": -44.0, "oh": -42.0, "clap": -40.0, "tom": -28.0, "rim": -37.0, "bell": -32.0},
  "RG": {"kick": -23.0, "snare": -33.0, "ch": -42.0, "oh": -41.0, "clap": -36.0, "tom": -31.0, "rim": -37.0, "bell": -26.0},
  "TR": {"kick": -23.0, "snare": -33.0, "ch": -42.0, "oh": -41.0, "clap": -35.0, "tom": -36.0, "rim": -37.0, "bell": -26.0},
}
