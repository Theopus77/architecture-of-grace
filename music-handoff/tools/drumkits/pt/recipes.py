"""The five recorded kits (voicings) of the drum machine, after Jimmy's list of drummers. On screen they are named by
style, never by player: P a polished studio session kit, Q a huge room, R big-band swing, S prog with stepped toms,
T groove metal. All of them come from the same recordings (Big Rusty Drums, Karoryfer Samples, CC0).

A pad: name shown on the pad; layers s/m/h (soft, normal, hard) as lists of takes (piece, velocity layer, round robin);
mics (weights); tune (semitones); eq; comp (threshold re peak, ratio, attack ms, release ms); sat; room (spec, wet dB,
crush); shape (hold, fall); len and fade (seconds); soft (dB of the soft layer under the normal one, default -4)."""

ROOM_BIG = dict(rt60=1.9, pre_ms=16, damp_rt60_hi=1.0, er=10, seed=11)
ROOM_MED = dict(rt60=1.0, pre_ms=9, damp_rt60_hi=0.6, er=8, seed=5, bright=1.0)
ROOM_SMALL = dict(rt60=0.45, pre_ms=5, damp_rt60_hi=0.3, er=6, seed=3)
ROOM_TIGHT = dict(rt60=0.6, pre_ms=7, damp_rt60_hi=0.45, er=6, seed=9, bright=2.0)

def L(*xs):
    return [tuple(x) for x in xs]

KITS = {
  # ── P · studio session, dry (the polished Los Angeles session sound): dead and tight, a snare made for ghost notes,
  #       a crisp hat that takes its accents on the shoulder, no room
  "P": {"dir": "studio2", "was": "studio", "pads": {
    "kick":  {"name": "KICK", "s": L(("kick", 6, 1)), "m": L(("kick", 11, 1), ("kick", 11, 2)), "h": L(("kick", 14, 1), ("kick", 14, 2)),
              "mics": {"kick": 1.0, "oh": 0.2}, "eq": [("hp", 32, .7, 0), ("peak", 62, 1.0, 2), ("peak", 340, 1.2, -5), ("peak", 3200, 1.0, 3)],
              "comp": (-16, 3, 8, 110), "shape": (0.14, 0.14), "len": 0.6, "fade": 0.3},
    "snare": {"name": "SNARE", "s": L(("snare", 2, 1)), "m": L(("snare", 7, 1), ("snare", 7, 2)), "h": L(("snare", 10, 1), ("snare", 10, 2)),
              "mics": {"btm": 1.0, "top": 0.4, "oh": 0.3}, "eq": [("hp", 80, .7, 0), ("peak", 210, 1.0, 2), ("peak", 900, 1.4, -2.5), ("highshelf", 5000, .7, 3)],
              "comp": (-16, 3, 4, 90), "shape": (0.2, 0.18), "soft": -8, "len": 0.7, "fade": 0.35},
    "ch":    {"name": "HAT", "s": L(("hat_cl", 3, 1)), "m": L(("hat_cl", 5, 1), ("hat_cl", 5, 2)), "h": L(("hat_shank", 4, 1)),
              "mics": {"cl": 1.0, "oh": 0.3}, "eq": [("hp", 300, .7, 0), ("peak", 600, 1.0, -2), ("highshelf", 8000, .7, 2.5)], "len": 0.42, "fade": 0.22},
    "oh":    {"name": "OPEN", "s": L(("hat_ho", 2, 1)), "m": L(("hat_ho", 4, 1)), "h": L(("hat_open", 6, 1)),
              "mics": {"cl": 1.0, "oh": 0.4}, "eq": [("hp", 300, .7, 0), ("highshelf", 8000, .7, 2)], "len": 1.3, "fade": 0.8},
    "clap":  {"name": "XSTICK", "s": L(("xstick", 2, 1)), "m": L(("xstick", 3, 1)), "h": L(("xstick", 4, 1)),
              "mics": {"btm": 1.0, "top": 0.4, "oh": 0.3}, "eq": [("hp", 150, .7, 0), ("highshelf", 5000, .7, 1.5)], "len": 0.4, "fade": 0.22},
    "tom":   {"name": "FLOOR", "s": L(("tom18", 4, 1)), "m": L(("tom18", 7, 1)), "h": L(("tom18", 8, 1)),
              "mics": {"cl": 1.0, "oh": 0.35}, "eq": [("hp", 45, .7, 0), ("peak", 400, 1.0, -5), ("peak", 4000, 1.0, 2)],
              "comp": (-16, 3, 10, 120), "shape": (0.35, 0.3), "len": 1.1, "fade": 0.55},
    "rim":   {"name": "RIDE", "s": L(("ride", 4, 1)), "m": L(("ride", 7, 1), ("ride", 7, 2)), "h": L(("bell", 4, 1)),
              "mics": {"cl": 0.5, "oh": 1.0}, "eq": [("hp", 220, .7, 0), ("highshelf", 8000, .7, 1)], "len": 2.0, "fade": 1.3},
    "bell":  {"name": "CRASH", "s": L(("crash", 3, 1)), "m": L(("crash", 4, 1)), "h": L(("crash", 5, 1)),
              "mics": {"cl": 0.4, "oh": 1.0}, "eq": [("hp", 180, .7, 0), ("highshelf", 8000, .7, 1)], "len": 2.3, "fade": 1.5},
  }},
  # ── Q · big room rock (the huge 1970s room): the open kick, the far microphones up, a huge room squeezed hard,
  #       a snare that rings
  "Q": {"dir": "bigroom2", "was": "bigroom", "pads": {
    "kick":  {"name": "KICK", "s": L(("kickN", 3, 1)), "m": L(("kickN", 5, 1), ("kickN", 5, 2)), "h": L(("kickN", 6, 1), ("kickN", 6, 2)),
              "mics": {"kick": 1.0, "oh": 0.8}, "eq": [("hp", 28, .7, 0), ("peak", 70, 0.9, 3), ("peak", 300, 1.0, -2), ("peak", 2500, 1.0, 2)],
              "comp": (-20, 2.5, 15, 200), "room": (ROOM_BIG, -9, (-24, 6)), "len": 1.9, "fade": 1.1},
    "snare": {"name": "SNARE", "s": L(("snare", 5, 1)), "m": L(("snare", 9, 1), ("snare", 9, 2)), "h": L(("rimshot", 6, 1), ("rimshot", 6, 2)),
              "mics": {"btm": 1.0, "top": 0.6, "oh": 0.9}, "eq": [("hp", 80, .7, 0), ("peak", 200, 1.0, 2.5), ("highshelf", 6000, .7, 1.5)],
              "comp": (-18, 2.5, 8, 150), "room": (ROOM_BIG, -5, (-24, 6)), "len": 1.9, "fade": 1.2},
    "ch":    {"name": "HAT", "s": L(("hat_lc", 2, 1)), "m": L(("hat_lc", 4, 1), ("hat_lc", 4, 2)), "h": L(("hat_lc", 6, 1)),
              "mics": {"cl": 0.8, "oh": 0.8}, "eq": [("hp", 220, .7, 0)], "room": (ROOM_BIG, -16, None), "len": 0.8, "fade": 0.45},
    "oh":    {"name": "OPEN", "s": L(("hat_ho", 2, 1)), "m": L(("hat_open", 4, 1)), "h": L(("hat_open", 6, 1)),
              "mics": {"cl": 0.8, "oh": 0.8}, "eq": [("hp", 220, .7, 0)], "room": (ROOM_BIG, -14, None), "len": 1.9, "fade": 1.2},
    "clap":  {"name": "HITOM", "s": L(("tom14", 3, 1)), "m": L(("tom14", 5, 1)), "h": L(("tom14", 6, 1)),
              "mics": {"cl": 0.9, "oh": 1.0}, "tune": -1, "eq": [("hp", 55, .7, 0), ("peak", 350, 1.0, -2)],
              "comp": (-18, 2.5, 10, 200), "room": (ROOM_BIG, -7, (-24, 6)), "len": 1.9, "fade": 1.1},
    "tom":   {"name": "FLOOR", "s": L(("tom18", 4, 1)), "m": L(("tom18", 7, 1)), "h": L(("tom18", 8, 1)),
              "mics": {"cl": 0.9, "oh": 1.0}, "tune": -1, "eq": [("hp", 40, .7, 0), ("peak", 350, 1.0, -2)],
              "comp": (-18, 2.5, 10, 200), "room": (ROOM_BIG, -7, (-24, 6)), "len": 2.1, "fade": 1.2},
    "rim":   {"name": "RIDE", "s": L(("ride", 4, 1)), "m": L(("ride", 7, 1), ("ride", 7, 2)), "h": L(("bell", 4, 1)),
              "mics": {"cl": 0.3, "oh": 1.0}, "eq": [("hp", 200, .7, 0)], "room": (ROOM_BIG, -14, None), "len": 2.3, "fade": 1.5},
    "bell":  {"name": "CRASH", "s": L(("crash", 3, 1)), "m": L(("crash", 4, 1)), "h": L(("crash", 5, 1)),
              "mics": {"cl": 0.3, "oh": 1.0}, "eq": [("hp", 150, .7, 0)], "room": (ROOM_BIG, -12, None), "len": 2.6, "fade": 1.7},
  }},
  # ── R · big-band swing: a small bass drum tuned up, a crisp snare (rimshots on the accents), tight hats, the hi-hat
  #       foot on pad 5, a dark ride whose accents stay on the bow, and a sizzle cymbal on pad 8; a small room
  "R": {"dir": "bigband2", "was": "bigband", "pads": {
    "kick":  {"name": "KICK", "s": L(("kickN", 2, 1)), "m": L(("kickN", 4, 1), ("kickN", 4, 2)), "h": L(("kickN", 6, 1), ("kickN", 6, 2)),
              "mics": {"kick": 1.0, "oh": 0.6}, "tune": 6, "eq": [("hp", 45, .7, 0), ("peak", 420, 1.0, -2), ("highshelf", 4000, .7, 1)],
              "comp": (-18, 2, 10, 120), "room": (ROOM_SMALL, -14, None), "shape": (0.18, 0.2), "soft": -6, "len": 0.75, "fade": 0.4},
    "snare": {"name": "SNARE", "s": L(("snare", 3, 1)), "m": L(("snare", 7, 1), ("snare", 7, 2)), "h": L(("rimshot", 5, 1), ("rimshot", 5, 2)),
              "mics": {"btm": 1.0, "top": 0.5, "oh": 0.5}, "tune": 1, "eq": [("hp", 110, .7, 0), ("peak", 260, 1.0, 1), ("highshelf", 5000, .7, 3.5)],
              "comp": (-16, 2.5, 4, 80), "room": (ROOM_SMALL, -13, None), "soft": -7, "len": 0.7, "fade": 0.35},
    "ch":    {"name": "HAT", "s": L(("hat_tc", 3, 1)), "m": L(("hat_tc", 6, 1), ("hat_tc", 6, 2)), "h": L(("hat_tc", 8, 1)),
              "mics": {"cl": 1.0, "oh": 0.4}, "eq": [("hp", 300, .7, 0), ("highshelf", 8000, .7, 1.5)], "len": 0.3, "fade": 0.16},
    "oh":    {"name": "OPEN", "s": L(("hat_qo", 2, 1)), "m": L(("hat_ho", 3, 1)), "h": L(("hat_open", 5, 1)),
              "mics": {"cl": 1.0, "oh": 0.5}, "eq": [("hp", 300, .7, 0)], "room": (ROOM_SMALL, -16, None), "len": 1.3, "fade": 0.8},
    "clap":  {"name": "PEDAL", "hat": 1, "s": L(("pedal", 2, 1)), "m": L(("pedal", 4, 1), ("pedal", 4, 2)), "h": L(("pedal", 5, 1)),
              "mics": {"cl": 1.0, "oh": 0.5}, "eq": [("hp", 250, .7, 0)], "len": 0.38, "fade": 0.2},
    "tom":   {"name": "TOM", "s": L(("tom14", 3, 1)), "m": L(("tom14", 5, 1)), "h": L(("tom14", 6, 1)),
              "mics": {"cl": 1.0, "oh": 0.5}, "tune": 3, "eq": [("hp", 70, .7, 0), ("peak", 400, 1.0, -2), ("highshelf", 5000, .7, 1.5)],
              "room": (ROOM_SMALL, -13, None), "len": 1.0, "fade": 0.55},
    "rim":   {"name": "RIDE", "s": L(("ride", 4, 1)), "m": L(("ride", 6, 1), ("ride", 6, 2)), "h": L(("ride", 9, 1)),
              "mics": {"cl": 0.5, "oh": 1.0}, "eq": [("hp", 200, .7, 0), ("highshelf", 7000, .7, -2.5)], "room": (ROOM_SMALL, -16, None), "len": 2.2, "fade": 1.4},
    "bell":  {"name": "SIZZLE", "s": L(("sizzle", 4, 1)), "m": L(("sizzle", 6, 1)), "h": L(("sizzle_ed", 3, 1)),
              "mics": {"cl": 0.4, "oh": 1.0}, "eq": [("hp", 200, .7, 0), ("highshelf", 8000, .7, -1)], "room": (ROOM_SMALL, -16, None), "len": 2.4, "fade": 1.6},
  }},
  # ── S · prog rock, many toms: three toms tuned a fourth apart on pads 5, 6 and 7, an articulate kick with a click,
  #       a bright snare (rimshots on the accents), crisp hats and crash, a lively room
  "S": {"dir": "prog2", "was": "prog", "pads": {
    "kick":  {"name": "KICK", "s": L(("kick", 6, 1)), "m": L(("kick", 11, 1), ("kick", 11, 2)), "h": L(("kick", 14, 1), ("kick", 14, 2)),
              "mics": {"kick": 1.0, "oh": 0.3}, "eq": [("hp", 35, .7, 0), ("peak", 70, 1.0, 2), ("peak", 380, 1.0, -4), ("peak", 3200, 1.0, 4)],
              "comp": (-18, 3, 8, 100), "room": (ROOM_MED, -17, None), "len": 0.7, "fade": 0.35},
    "snare": {"name": "SNARE", "s": L(("snare", 4, 1)), "m": L(("snare", 8, 1), ("snare", 8, 2)), "h": L(("rimshot", 6, 1), ("rimshot", 6, 2)),
              "mics": {"btm": 1.0, "top": 0.4, "oh": 0.5}, "tune": 1.5, "eq": [("hp", 100, .7, 0), ("peak", 230, 1.0, 1), ("highshelf", 5000, .7, 4)],
              "comp": (-16, 3, 4, 90), "room": (ROOM_MED, -12, None), "soft": -6, "len": 0.9, "fade": 0.5},
    "ch":    {"name": "HAT", "s": L(("hat_cl", 3, 1)), "m": L(("hat_cl", 5, 1), ("hat_cl", 5, 2)), "h": L(("hat_cl", 6, 1)),
              "mics": {"cl": 1.0, "oh": 0.4}, "eq": [("hp", 280, .7, 0), ("highshelf", 8000, .7, 2.5)], "room": (ROOM_MED, -18, None), "len": 0.45, "fade": 0.25},
    "oh":    {"name": "OPEN", "s": L(("hat_ho", 2, 1)), "m": L(("hat_open", 4, 1)), "h": L(("hat_open", 6, 1)),
              "mics": {"cl": 1.0, "oh": 0.5}, "eq": [("hp", 280, .7, 0), ("highshelf", 8000, .7, 2)], "room": (ROOM_MED, -16, None), "len": 1.5, "fade": 0.9},
    "clap":  {"name": "HITOM", "s": L(("tom14", 3, 1)), "m": L(("tom14", 5, 1)), "h": L(("tom14", 6, 1)),
              "mics": {"cl": 1.0, "oh": 0.5}, "tune": 3, "eq": [("hp", 70, .7, 0), ("peak", 400, 1.0, -3), ("peak", 4000, 1.0, 2)],
              "comp": (-18, 2.5, 10, 150), "room": (ROOM_MED, -12, None), "len": 1.2, "fade": 0.65},
    "tom":   {"name": "MIDTOM", "s": L(("tom15", 3, 1)), "m": L(("tom15", 6, 1)), "h": L(("tom15", 7, 1)),
              "mics": {"cl": 1.0, "oh": 0.5}, "tune": -1, "eq": [("hp", 55, .7, 0), ("peak", 400, 1.0, -3), ("peak", 4000, 1.0, 2)],
              "comp": (-18, 2.5, 10, 150), "room": (ROOM_MED, -12, None), "len": 1.3, "fade": 0.7},
    "rim":   {"name": "FLOOR", "s": L(("tom18", 4, 1)), "m": L(("tom18", 7, 1)), "h": L(("tom18", 8, 1)),
              "mics": {"cl": 1.0, "oh": 0.5}, "eq": [("hp", 40, .7, 0), ("peak", 400, 1.0, -3), ("peak", 4000, 1.0, 2)],
              "comp": (-18, 2.5, 10, 150), "room": (ROOM_MED, -12, None), "len": 1.5, "fade": 0.8},
    "bell":  {"name": "CRASH", "s": L(("crash", 3, 1)), "m": L(("crash", 4, 1)), "h": L(("crash", 5, 1)),
              "mics": {"cl": 0.5, "oh": 1.0}, "eq": [("hp", 200, .7, 0), ("highshelf", 8000, .7, 2)], "room": (ROOM_MED, -16, None), "len": 2.3, "fade": 1.5},
  }},
  # ── T · groove metal: a clicky, punchy kick for double-kick runs (four takes of the normal hit), a big cracking
  #       rimshot snare in a bright room, tight hats, a China on pad 5, gated toms, the ride bell on accents
  "T": {"dir": "groovemetal", "stereo": False, "pads": {
    "kick":  {"name": "KICK", "s": L(("kick", 9, 1)), "m": L(("kick", 12, 1), ("kick", 12, 2), ("kick", 12, 3), ("kick", 12, 4)), "h": L(("kick", 14, 1), ("kick", 14, 2)),
              "mics": {"kick": 1.0, "oh": 0.0}, "click": (2600, 0.75, 18), "tune": 1,
              "eq": [("hp", 40, .7, 0), ("peak", 72, 1.2, 3), ("peak", 350, 1.0, -7), ("peak", 4500, 1.2, 9), ("peak", 9000, 1.0, 3)],
              "comp": (-26, 6, 6, 60), "shape": (0.08, 0.08), "len": 0.38, "fade": 0.18},
    "snare": {"name": "SNARE", "s": L(("snare", 6, 1)), "m": L(("rimshot", 5, 1), ("rimshot", 5, 2)), "h": L(("rimshot", 6, 1), ("rimshot", 6, 2)),
              "mics": {"btm": 1.0, "top": 0.4, "oh": 0.6}, "eq": [("hp", 90, .7, 0), ("peak", 200, 1.0, 3), ("peak", 700, 1.2, -3), ("peak", 5000, 1.0, 3), ("highshelf", 9000, .7, 1)],
              "comp": (-18, 4, 3, 80), "room": (ROOM_TIGHT, -8, (-22, 5)), "len": 0.9, "fade": 0.5},
    "ch":    {"name": "HAT", "s": L(("hat_tc", 4, 1)), "m": L(("hat_tc", 6, 1), ("hat_tc", 6, 2)), "h": L(("hat_tc", 8, 1)),
              "mics": {"cl": 1.0, "oh": 0.3}, "eq": [("hp", 300, .7, 0), ("highshelf", 8000, .7, 2)], "len": 0.32, "fade": 0.18},
    "oh":    {"name": "OPEN", "s": L(("hat_qo", 2, 1)), "m": L(("hat_ho", 3, 1)), "h": L(("hat_open", 5, 1)),
              "mics": {"cl": 1.0, "oh": 0.4}, "eq": [("hp", 300, .7, 0), ("highshelf", 8000, .7, 1.5)], "len": 1.2, "fade": 0.8},
    "clap":  {"name": "CHINA", "s": L(("china", 3, 1)), "m": L(("china", 4, 1)), "h": L(("china", 5, 1)),
              "mics": {"cl": 0.5, "oh": 1.0}, "eq": [("hp", 250, .7, 0)], "len": 1.8, "fade": 1.2},
    "tom":   {"name": "TOM", "s": L(("tom15", 3, 1)), "m": L(("tom15", 6, 1)), "h": L(("tom15", 7, 1)),
              "mics": {"cl": 1.0, "oh": 0.3}, "tune": 1, "eq": [("hp", 60, .7, 0), ("peak", 400, 1.0, -5), ("peak", 5000, 1.0, 4)],
              "comp": (-18, 4, 6, 80), "shape": (0.2, 0.2), "len": 0.85, "fade": 0.4},
    "rim":   {"name": "RIDE", "s": L(("ride", 5, 1)), "m": L(("ride", 8, 1), ("ride", 8, 2)), "h": L(("bell", 4, 1)),
              "mics": {"cl": 0.6, "oh": 1.0}, "eq": [("hp", 250, .7, 0), ("highshelf", 7000, .7, 1.5)], "len": 1.8, "fade": 1.2},
    "bell":  {"name": "CRASH", "s": L(("crash", 3, 1)), "m": L(("crash", 4, 1)), "h": L(("crash", 5, 1)),
              "mics": {"cl": 0.5, "oh": 1.0}, "eq": [("hp", 200, .7, 0)], "len": 2.0, "fade": 1.3},
  }},
}

# AOG-DRUM-STEREO-V1: pads that, once in stereo, measured louder through the machine than before (see ../kits.py):
# each stereo file sits this many dB under the old file's level, so the pad plays as loud as before
STEREO_TRIM = {"P": {"ch": -0.7}, "R": {"ch": -0.8, "clap": -1.1}}
