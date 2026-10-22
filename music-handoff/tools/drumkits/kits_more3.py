"""AOG-DRUM-CRUNCH-V1 (2026-10-22) — two more kits. Jimmy asked for kits that sound like the records he loves, then
"Do the tight thrash and the crunchy beat-machine". On screen they go by their sound, never by a band or a player.

  TH  Thrash metal, tight     MuldjordKit (Lars Muldjord, CC BY 4.0, FreePats version): a kick scooped in the middle
                              with its beater click brought up and its ring cut short, so fast double-kick runs stay
                              clear; a snare tuned up, cracking and dry, a short tight room; tight closed hats; a china,
                              the high rack tom, the ride (its bell on an accent) and a crash
  BM  Crunchy beat machine    Gogodze Phu Vol II (Karoryfer Samples, CC0), a small kit tuned like a 1973 record, through
                              its old "retro" microphone with the close ones; a side stick and the low tom; VCSL claps
                              and a tambourine. Every pad then goes through a late-1980s 12-bit sampler's grit (made
                              here, dsp.crush: a low sample rate held step by step, and 12 or 11 bits), with a little
                              tape drive and a dark top, the sound of beats made on those machines
Rooms and the crunch are made here (dsp.py), never recorded.
"""
from kits import T, L, G, VC, ID, ROOM_SMALL, ROOM_DUST


def M(inst, n, base=None):
    """MuldjordKit (FreePats version): samples/<inst>/<n>-<base>.flac, the higher n the harder the hit"""
    return T("muld:samples/%s/%d-%s.flac" % (inst, n, base or inst))


def MS(n, side=1):
    return M("Snare%d" % side, n, "Snare")


CLAPS = ID + "Claps/"
TAMB1 = ID + "Tambourine 1/"
TAMB2 = ID + "Tambourine 2/"

# the Gogodze microphones for each piece: the close one, the old "retro" one, a little of the overheads
GK = {"kick": 1.0, "retro": 0.8}
GS = {"snare": 1.0, "retro": 0.7, "oh": 0.35}
GH = {"oh": 1.0, "retro": 0.6}
GT = {"oh": 1.0, "retro": 0.7}
CR12, CR11 = (12, 22050), (11, 22050)       # the sampler: 12 or 11 bits, 22,050 values a second

MORE3 = {
  # ── TH · thrash metal, tight: a clicky kick for double-kick runs, a dry cracking snare, a china ─────────────────────
  "TH": {"dir": "thrash", "pads": {
    "kick":  {"name": "KICK", "s": L(M("KdrumL", 13), M("KdrumR", 14)), "m": L(M("KdrumL", 19), M("KdrumR", 20), M("KdrumL", 21)),
              "h": L(M("KdrumL", 24), M("KdrumR", 25)),
              "eq": [("hp", 45, .7, 0), ("peak", 85, 1.0, 2), ("peak", 380, 1.2, -7), ("peak", 4500, 1.0, 7)], "comp": (-18, 4, 3, 60),
              "shape": (0.06, 0.07), "len": 0.3, "fade": 0.1, "ceil": 0.6},
    "snare": {"name": "SNARE", "s": L(MS(33), MS(34, 2)), "m": L(MS(45), MS(46, 2), MS(47)), "h": L(MS(54), MS(55, 2)),
              "tune": 1.0, "eq": [("hp", 120, .7, 0), ("peak", 220, 1.0, 2), ("peak", 550, 1.2, -3), ("highshelf", 5000, .7, 4)],
              "comp": (-18, 4, 2, 70), "room": (ROOM_SMALL, -15.0, None), "shape": (0.12, 0.08), "len": 0.4, "fade": 0.15, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(M("HihatClosed", 14), M("HihatClosed", 16)), "m": L(M("HihatClosed", 22), M("HihatClosed", 24), M("HihatClosed", 26)),
              "h": L(M("HihatClosed", 28), M("HihatClosed", 29)), "eq": [("hp", 400, .7, 0), ("highshelf", 9000, .7, 2)], "len": 0.18, "fade": 0.08},
    "oh":    {"name": "OPEN", "s": L(M("HihatOpen", 16)), "m": L(M("HihatOpen", 22), M("HihatOpen", 24)), "h": L(M("HihatOpen", 28), M("HihatOpen", 29)),
              "eq": [("hp", 400, .7, 0)], "len": 0.7, "fade": 0.4},
    "clap":  {"name": "CHINA", "s": L(M("China", 5)), "m": L(M("China", 8), M("China", 9)), "h": L(M("China", 11), M("China", 12)),
              "eq": [("hp", 300, .7, 0)], "len": 1.4, "fade": 0.8},
    "tom":   {"name": "TOM", "s": L(M("Tom1", 5), M("Tom1", 6)), "m": L(M("Tom1", 8), M("Tom1", 9)), "h": L(M("Tom1", 10), M("Tom1", 11)),
              "eq": [("hp", 80, .7, 0), ("peak", 400, 1.0, -3), ("peak", 4000, 1.0, 3)], "comp": (-16, 3, 6, 100),
              "len": 0.55, "fade": 0.25, "ceil": 0.55},
    "rim":   {"name": "RIDE", "s": L(M("RideR", 3), M("RideR", 4)), "m": L(M("RideR", 6), M("RideR", 7)), "h": L(M("RideRBell", 6), M("RideRBell", 7)),
              "eq": [("hp", 250, .7, 0)], "len": 1.6, "fade": 0.9},
    "bell":  {"name": "CRASH", "s": L(M("CrashR", 5)), "m": L(M("CrashR", 8), M("CrashR", 9)), "h": L(M("CrashR", 11), M("CrashR", 12)),
              "eq": [("hp", 200, .7, 0)], "len": 1.8, "fade": 1.0},
  }},
  # ── BM · crunchy beat machine: a 1973-tuned kit through an old microphone, then a 12-bit sampler's grit ───────────────
  "BM": {"dir": "crunch", "pads": {
    "kick":  {"name": "KICK", "s": L(G("ks", 2, 1, GK)), "m": L(G("ks", 4, 1, GK), G("ks", 4, 2, GK)), "h": L(G("ks", 6, 1, GK), G("ks", 6, 2, GK)),
              "tune": -1.0, "eq": [("hp", 35, .7, 0), ("peak", 60, 1.0, 4), ("peak", 320, 1.2, -3), ("lp", 9000, .7, 0)],
              "comp": (-16, 3, 10, 120), "sat": 1.6, "crush": CR12, "len": 0.5, "fade": 0.25, "ceil": 0.7},
    "snare": {"name": "SNARE", "s": L(G("sc", 2, 1, GS)), "m": L(G("sc", 4, 1, GS), G("sc", 4, 2, GS)), "h": L(G("sc", 6, 1, GS), G("sc", 6, 2, GS)),
              "eq": [("hp", 110, .7, 0), ("peak", 200, 1.0, 3), ("peak", 1800, 1.0, 2), ("lp", 10000, .7, 0)], "comp": (-16, 4, 4, 90),
              "sat": 1.5, "room": (ROOM_DUST, -14.0, None), "crush": CR11, "len": 0.45, "fade": 0.2, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(G("hc", 1, 1, GH)), "m": L(G("hc", 3, 1, GH), G("hc", 3, 2, GH)), "h": L(G("hc", 4, 1, GH), G("hc", 4, 2, GH)),
              "eq": [("hp", 350, .7, 0), ("lp", 9500, .7, 0)], "sat": 1.2, "crush": CR11, "len": 0.2, "fade": 0.1},
    "oh":    {"name": "OPEN", "s": L(G("ho", 2, 1, GH)), "m": L(G("ho", 3, 1, GH), G("ho", 3, 2, GH)), "h": L(G("ho", 5, 1, GH), G("ho", 5, 2, GH)),
              "eq": [("hp", 350, .7, 0), ("lp", 9500, .7, 0)], "sat": 1.2, "crush": CR11, "len": 0.6, "fade": 0.3},
    "clap":  {"name": "CLAP", "s": L(VC(CLAPS + "Clap_rr1.wav"), VC(CLAPS + "Clap_rr2.wav")), "m": L(VC(CLAPS + "Clap_rr3.wav"), VC(CLAPS + "Clap_rr4.wav")),
              "h": L(VC(CLAPS + "Clap_rr5.wav"), VC(CLAPS + "Clap_rr6.wav")), "eq": [("hp", 250, .7, 0), ("lp", 9000, .7, 0)],
              "sat": 1.3, "room": (ROOM_DUST, -12.0, None), "crush": CR11, "len": 0.4, "fade": 0.18, "ceil": 0.55},
    "tom":   {"name": "LOWTOM", "s": L(G("tl", 2, 1, GT)), "m": L(G("tl", 3, 1, GT), G("tl", 3, 2, GT)), "h": L(G("tl", 5, 1, GT), G("tl", 5, 2, GT)),
              "tune": -1.0, "eq": [("hp", 50, .7, 0), ("lp", 8000, .7, 0)], "sat": 1.3, "crush": CR12, "len": 0.6, "fade": 0.3, "ceil": 0.55},
    "rim":   {"name": "RIM", "s": L(G("ss", 2, 1, GS)), "m": L(G("ss", 3, 1, GS), G("ss", 3, 2, GS)), "h": L(G("ss", 4, 1, GS), G("ss", 4, 2, GS)),
              "eq": [("hp", 200, .7, 0), ("lp", 9000, .7, 0)], "sat": 1.2, "crush": CR11, "len": 0.3, "fade": 0.12, "ceil": 0.55},
    "bell":  {"name": "TAMB", "s": L(VC(TAMB1 + "Tamb1_Hit_v1_rr1_Mid.wav"), VC(TAMB2 + "Tamb2_Hit_v1_rr1_Mid.wav")),
              "m": L(VC(TAMB1 + "Tamb1_Hit_v2_rr1_Mid.wav"), VC(TAMB2 + "Tamb2_Hit_v2_rr2_Mid.wav")),
              "h": L(VC(TAMB2 + "Tamb2_Hit_v2_rr2_Mid.wav"), VC(TAMB1 + "Tamb1_Hit_v2_rr1_Mid.wav")),
              "eq": [("hp", 300, .7, 0), ("lp", 9000, .7, 0)], "crush": CR11, "len": 0.45, "fade": 0.25},
  }},
}

FILE_LU3 = {
  "TH": {"kick": -23.0, "snare": -33.5, "ch": -43.0, "oh": -41.0, "clap": -33.0, "tom": -27.0, "rim": -37.0, "bell": -31.0},
  "BM": {"kick": -23.0, "snare": -33.5, "ch": -43.0, "oh": -41.0, "clap": -36.0, "tom": -27.0, "rim": -35.0, "bell": -37.0},
}
