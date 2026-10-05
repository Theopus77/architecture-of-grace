"""The recorded kits of AOG-DRUM-REAL-V2 (2026-10-04): what every pad plays, and how it is shaped.

Jimmy wants every instrument to be a real recording. Two kinds of kit live here:
  * kits D to O that used to be made on the page and imitate real drums or percussion: rebuilt from recordings,
    keeping their letter, name and character (pad names stay, except where no real recording of that sound exists
    under a free licence: there the nearest real instrument plays and the pad says what it is);
  * five new kits, U to Y, after the drummers Jimmy named (named by style on screen, never by player):
    U jazz club (Buddy Rich), V brush ballad, W studio funk (Jeff Porcaro), X 1970s vintage (John Bonham),
    Y hip-hop break.
Kits A, B, C, F and L imitate electronic drum machines (the classic synth voices, electro, the 808, the 909): they stay
made on the page, as those machines make their sound electronically too. Kit M's synth tom ("SYNTOM") is the same: it
stays made on the page inside an otherwise recorded kit (made: True).

A pad: name shown on the pad; layers s/m/h (soft, normal, hard), each a list of takes; then the shaping, in this order:
tune (semitones), eq [(kind, Hz, q, dB)], comp (threshold re peak, ratio, attack ms, release ms), sat, room (spec,
wet dB, crush), gate (open s, close s), echo (gap s, repeats, feedback, low-pass Hz), shape (hold s, fall s),
len and fade (s), soft / hard (dB of those layers against the normal one; default -4 / +1.5).
A take: T(source, (source, weight), ..., start=s, swell=ms) mixes microphones of one hit; MAKE(...) builds a sound
from several recordings (a chord, a scratch, a slice of a long brush stir).
Engine targets (TARGET) are the loudness each pad must have through the machine (K-weighted, era 1987, a normal
hit): for a rebuilt kit the level its page-made pad had, so the kit keeps its balance (closed hats on drum kits no
quieter than -54, the recorded kits' level); for a new kit the levels of kits P to T, with kick and snare at kit A's.
"""
from sources import brd, virt, gogo

def T(*parts, **kw):
    t = {"parts": [(p, 1.0) if isinstance(p, str) else p for p in parts]}
    t.update(kw)
    return t

def MAKE(kind, **kw):
    t = {"make": kind}
    t.update(kw)
    return t

def L(*xs):
    return list(xs)

# ---------- rooms (made here, not recorded) ----------
ROOM_BIG = dict(rt60=1.9, pre_ms=16, damp_rt60_hi=1.0, er=10, seed=11)
ROOM_ARENA = dict(rt60=2.4, pre_ms=24, damp_rt60_hi=1.2, er=12, seed=21)
ROOM_MED = dict(rt60=1.0, pre_ms=9, damp_rt60_hi=0.6, er=8, seed=5, bright=1.0)
ROOM_SMALL = dict(rt60=0.45, pre_ms=5, damp_rt60_hi=0.3, er=6, seed=3)
ROOM_CLUB = dict(rt60=0.8, pre_ms=8, damp_rt60_hi=0.45, er=8, seed=13)
ROOM_DUST = dict(rt60=0.35, pre_ms=4, damp_rt60_hi=0.2, er=5, seed=17)

# ---------- library helpers ----------
# Big Rusty Drums (Karoryfer): the pieces kits P to T use
BR = {
    "kick": "kick_24/kick/{mic}/k_vl{vl}_rr{rr}.flac",
    "kickN": "kick_24_nodamp/kick/{mic}/k_nodamp_vl{vl}_rr{rr}.flac",
    "snare": "snare_14/center/{mic}/sn_center_vl{vl}_rr{rr}.flac",
    "rimshot": "snare_14/rimshot/{mic}/sn_rims_vl{vl}_rr{rr}.flac",
    "xstick": "snare_14/sidestick/{mic}/sn_ss_vl{vl}_rr{rr}.flac",
    "hat_cl": "hihat_14/cl/{mic}/ht_cl_vl{vl}_rr{rr}.flac",
    "hat_lc": "hihat_14/lc/{mic}/ht_lc_vl{vl}_rr{rr}.flac",
    "hat_ho": "hihat_14/ho/{mic}/ht_ho_vl{vl}_rr{rr}.flac",
    "hat_open": "hihat_14/open/{mic}/ht_open_vl{vl}_rr{rr}.flac",
    "tom15": "tom_15/center/{mic}/t15_vl{vl}_rr{rr}.flac",
    "tom18": "tom_18/center/{mic}/t18_vl{vl}_rr{rr}.flac",
    "crash": "crash_17/cr/{mic}/cr_vl{vl}_rr{rr}.flac",
}
BR_MICS = {"kick": {"kick": 1.0, "oh": 0.3}, "kickN": {"kick": 1.0, "oh": 0.6}, "snare": {"btm": 1.0, "top": 0.5, "oh": 0.6},
           "rimshot": {"btm": 1.0, "top": 0.5, "oh": 0.6}, "xstick": {"btm": 1.0, "top": 0.4, "oh": 0.4},
           "hat_cl": {"cl": 1.0, "oh": 0.4}, "hat_lc": {"cl": 0.9, "oh": 0.8}, "hat_ho": {"cl": 1.0, "oh": 0.5},
           "hat_open": {"cl": 1.0, "oh": 0.6}, "tom15": {"cl": 1.0, "oh": 0.6}, "tom18": {"cl": 1.0, "oh": 0.5},
           "crash": {"cl": 0.4, "oh": 1.0}}

def B(piece, vl, rr=1, mics=None):
    m = dict(BR_MICS[piece]); m.update(mics or {})
    return T(*[(brd(BR[piece], vl, rr, mic), w) for mic, w in m.items() if w > 0])

def F909(name, sid):
    """AOG-DRUM-909-V1: one hit of the TR-909 JGB pack on Freesound (altemark, user 19852; CC BY 4.0)"""
    return T("fs:altemark/%d_19852" % sid, name=name)

def V(art, vl, rr=None, mics=None):
    """Virtuosity Drums; rr only for the kick, hats, ride and crash"""
    m = mics or {"oh": 1.0}
    return T(*[(virt(art, vl, mic, rr), w) for mic, w in m.items() if w > 0])

def G(art, vl, rr=1, mics=None):
    m = mics or {"oh": 1.0}
    return T(*[(gogo(art, vl, rr, mic), w) for mic, w in m.items() if w > 0])

def SW(rel, **kw):
    return T("swirly:Samples/" + rel, **kw)

def SW2(rel_a, wa, rel_b, wb):
    return T(("swirly:Samples/" + rel_a, wa), ("swirly:Samples/" + rel_b, wb))

ID = "vcsl:Idiophones/Struck Idiophones/"
MB = "vcsl:Membranophones/Struck Membranophones/"
def VC(rel, **kw):
    return T(rel, **kw)

def VP(rel):
    """Virtuosity percussion (from VSCO 2 Pro, given with the library under CC0)"""
    return T("virt:Samples/perc/" + rel)

VOICE = "voice:Samples/vowel_sustain/a/vowel_a_%s.wav"
RHODES = "gm:Discord GM/Melodic/005-Electric Piano 1/%s"
UPRIGHT = "vsco:Keys/Upright Nr1/UR1_%s.wav"
BASS = "vsco:Strings/Solo Contrabass/Pizz/BKCtbss_Pizz_%s.wav"

# ---------- the kits ----------
KITS = {
  # ── D · dusty breaks: the found percussion of a breakbeat. A thumping kick through the old "retro" microphone, a
  #       cracking rimshot, a shaker, a tambourine, a clap (there is no free recording of a finger snap), a timbale,
  #       a woodblock and a triangle; a small dry room and a dusty top end.
  "D": {"dir": "dusty2", "was": "dusty", "pads": {
    "kick":  {"name": "THUMP", "s": L(G("ks", 2, 1, {"retro": 1.0, "oh": 0.3})), "m": L(G("ks", 4, 1, {"retro": 1.0, "oh": 0.3}), G("ks", 4, 2, {"retro": 1.0, "oh": 0.3})),
              "h": L(G("ks", 6, 1, {"retro": 1.0, "oh": 0.3}), G("ks", 6, 2, {"retro": 1.0, "oh": 0.3})),
              "eq": [("hp", 35, .7, 0), ("peak", 70, 1.0, 2), ("peak", 380, 1.0, -3), ("peak", 2800, 1.2, 3), ("lp", 9000, .7, 0)],
              "comp": (-16, 3, 6, 90), "sat": 1.3, "shape": (0.12, 0.1), "len": 0.5, "fade": 0.25},
    "snare": {"name": "CRACK", "s": L(V("snare_rimshot", 4, mics={"lofi": 1.0, "oh": 0.5})),
              "m": L(V("snare_rimshot", 7, mics={"lofi": 1.0, "oh": 0.5}), V("snare_rimshot", 6, mics={"lofi": 1.0, "oh": 0.5})),
              "h": L(V("snare_rimshot", 12, mics={"lofi": 1.0, "oh": 0.5}), V("snare_rimshot", 11, mics={"lofi": 1.0, "oh": 0.5})),
              "eq": [("hp", 90, .7, 0), ("peak", 220, 1.0, 2), ("peak", 3500, 1.0, 2), ("lp", 9500, .7, 0)],
              "comp": (-16, 3, 3, 80), "sat": 1.2, "room": (ROOM_DUST, -14, None), "len": 0.55, "fade": 0.28},
    "ch":    {"name": "SHAKER", "s": L(VC(ID + "Shaker, Small/Mid_ShakerDouble_Up_rr1.wav")),
              "m": L(VC(ID + "Shaker, Small/Mid_ShakerHighFaster_Up_rr1.wav"), VC(ID + "Shaker, Small/Mid_ShakerLowFaster_Up_rr1.wav")),
              "h": L(VC(ID + "Shaker, Small/Mid_ShakerLowFaster_Up_rr2.wav")),
              "eq": [("hp", 400, .7, 0), ("lp", 11000, .7, 0)], "len": 0.22, "fade": 0.1},
    "oh":    {"name": "TAMB", "s": L(VC(ID + "Tambourine 1/Tamb1_Hit_v1_rr1_Mid.wav")), "m": L(VC(ID + "Tambourine 1/Tamb1_Hit_v2_rr1_Mid.wav")),
              "h": L(VC(ID + "Tambourine 2/Tamb2_Hit_v2_rr2_Mid.wav")),
              "eq": [("hp", 300, .7, 0), ("lp", 11000, .7, 0)], "len": 0.5, "fade": 0.3},
    "clap":  {"name": "CLAP", "s": L(VC(ID + "Claps/SoloClap_vl2.wav")), "m": L(VC(ID + "Claps/SoloClap_vl3.wav")), "h": L(VC(ID + "Claps/SoloClap_vl4.wav")),
              "eq": [("hp", 200, .7, 0), ("peak", 1200, 1.0, 2), ("lp", 9000, .7, 0)], "room": (ROOM_DUST, -12, None), "len": 0.3, "fade": 0.15},
    "tom":   {"name": "TIMBAL", "s": L(VP("oh/timbales/timb14_vl1_rr1.wav")), "m": L(VP("oh/timbales/timb14_vl3_rr1.wav"), VP("oh/timbales/timb14_vl3_rr2.wav")),
              "h": L(VP("oh/timbales/timb14_vl4_rr1.wav")),
              "eq": [("hp", 90, .7, 0), ("lp", 10000, .7, 0)], "len": 0.7, "fade": 0.4},
    "rim":   {"name": "BLOCK", "s": L(VC(ID + "Woodblock/wood_click_mp.wav")), "m": L(VC(ID + "Woodblock/wood_click_f_rr1.wav"), VC(ID + "Woodblock/wood_click_f_rr2.wav")),
              "h": L(VC(ID + "Woodblock/wood_click_ff.wav")), "eq": [("hp", 300, .7, 0)], "len": 0.3, "fade": 0.15},
    "bell":  {"name": "TRIANG", "s": L(VC(ID + "Triangles/Triangle1_Hit_v1_rr2_Mid.wav")), "m": L(VC(ID + "Triangles/Triangle1_Hit_v2_rr1_Mid.wav")),
              "h": L(VC(ID + "Triangles/Triangle1_Hit_v2_rr2_Mid.wav")), "eq": [("hp", 800, .7, 0)], "len": 1.4, "fade": 0.9},
  }},
  # ── E · boom bap: the 1990s sampler sound. A hard kick and a fat 14x8 snare (Big Rusty Drums), squeezed and
  #       warmed, dark hats, a crowd's clap, a low tom, a cross-stick, and a scratch: a real voice on a record,
  #       pushed forward and pulled back by hand (the hand moves on the page; the voice is a recording).
  "E": {"dir": "boombap2", "was": "boombap", "pads": {
    "kick":  {"name": "KICK", "s": L(B("kick", 6)), "m": L(B("kick", 11, 1), B("kick", 11, 2)), "h": L(B("kick", 14, 1), B("kick", 14, 2)),
              "eq": [("hp", 32, .7, 0), ("peak", 58, 1.0, 3), ("peak", 400, 1.0, -5), ("peak", 2500, 1.0, 2), ("lp", 9000, .7, 0)],
              "comp": (-20, 4, 10, 110), "sat": 1.6, "shape": (0.16, 0.14), "len": 0.6, "fade": 0.3},
    "snare": {"name": "SNARE", "s": L(B("snare", 4)), "m": L(B("snare", 8, 1), B("snare", 8, 2)), "h": L(B("snare", 10, 1), B("snare", 10, 2)),
              "eq": [("hp", 80, .7, 0), ("lowshelf", 220, .7, 3), ("peak", 900, 1.2, -2), ("highshelf", 6500, .7, -2.5)],
              "comp": (-20, 4, 4, 90), "sat": 1.5, "room": (ROOM_SMALL, -13, None), "len": 0.6, "fade": 0.3},
    "ch":    {"name": "HAT", "s": L(B("hat_cl", 3)), "m": L(B("hat_cl", 5, 1), B("hat_cl", 5, 2)), "h": L(B("hat_cl", 6)),
              "eq": [("hp", 300, .7, 0), ("highshelf", 7000, .7, -3)], "len": 0.3, "fade": 0.16},
    "oh":    {"name": "OPEN", "s": L(B("hat_ho", 2)), "m": L(B("hat_ho", 4)), "h": L(B("hat_open", 6)),
              "eq": [("hp", 300, .7, 0), ("highshelf", 7000, .7, -3)], "len": 0.8, "fade": 0.5},
    "clap":  {"name": "CLAP", "s": L(VC(ID + "Claps/Clap_rr1.wav")), "m": L(VC(ID + "Claps/Clap_rr2.wav"), VC(ID + "Claps/Clap_rr4.wav")),
              "h": L(VC(ID + "Claps/Clap_rr6.wav")),
              "eq": [("hp", 250, .7, 0), ("peak", 1300, 1.0, 2), ("highshelf", 7000, .7, -2)], "comp": (-14, 3, 2, 80),
              "room": (ROOM_SMALL, -11, None), "len": 0.45, "fade": 0.22},
    "tom":   {"name": "LOWTOM", "s": L(B("tom18", 4)), "m": L(B("tom18", 7)), "h": L(B("tom18", 8)),
              "eq": [("hp", 45, .7, 0), ("peak", 400, 1.0, -4), ("highshelf", 6000, .7, -2)], "comp": (-18, 3, 10, 120), "sat": 1.2,
              "shape": (0.3, 0.25), "len": 0.7, "fade": 0.35},
    "rim":   {"name": "STICK", "s": L(B("xstick", 2)), "m": L(B("xstick", 3)), "h": L(B("xstick", 4)),
              "eq": [("hp", 150, .7, 0), ("highshelf", 7000, .7, -2)], "len": 0.3, "fade": 0.15},
    "bell":  {"name": "SCRTCH", "s": L(MAKE("scratch", src=VOICE % "c4", at=1.0, moves="chirp")),
              "m": L(MAKE("scratch", src=VOICE % "c4", at=1.4, moves="baby"), MAKE("scratch", src=VOICE % "e4", at=1.2, moves="baby")),
              "h": L(MAKE("scratch", src=VOICE % "d4", at=1.6, moves="baby2")),
              "eq": [("hp", 180, .7, 0), ("lp", 7000, .7, 0)], "len": 0.42, "fade": 0.08},
  }},
  # ── G · lo-fi: everything soft and a little muffled. A felt kick, brushes, a tight hat that ticks, a loose hat that
  #       sizzles, a soft clap, a brushed tom, a rim click, and a chord on a real 1977 Rhodes (C major seven).
  "G": {"dir": "lofi", "pads": {
    "kick":  {"name": "SOFT", "s": L(SW2("marching_kick/marching_kick_vl4_rr1_beater.wav", 0.4, "marching_kick/marching_kick_vl4_rr1_reso.wav", 1.0)),
              "m": L(SW2("marching_kick/marching_kick_vl7_rr1_beater.wav", 0.4, "marching_kick/marching_kick_vl7_rr1_reso.wav", 1.0),
                     SW2("marching_kick/marching_kick_vl7_rr2_beater.wav", 0.4, "marching_kick/marching_kick_vl7_rr2_reso.wav", 1.0)),
              "h": L(SW2("marching_kick/marching_kick_vl10_rr1_beater.wav", 0.4, "marching_kick/marching_kick_vl10_rr1_reso.wav", 1.0)),
              "eq": [("hp", 32, .7, 0), ("peak", 65, 1.0, 2), ("lp", 3600, .7, 0)], "comp": (-16, 2.5, 10, 120), "shape": (0.2, 0.18), "len": 0.6, "fade": 0.3},
    "snare": {"name": "BRUSH", "s": L(SW2("snare_main/snare_hit_vl6_rr1_top.wav", 1.0, "snare_main/snare_hit_vl6_rr1_btm.wav", 0.6)),
              "m": L(SW2("snare_main/snare_hit_vl9_rr1_top.wav", 1.0, "snare_main/snare_hit_vl9_rr1_btm.wav", 0.6),
                     SW2("snare_main/snare_hit_vl9_rr2_top.wav", 1.0, "snare_main/snare_hit_vl9_rr2_btm.wav", 0.6)),
              "h": L(SW2("snare_main/snare_hit_vl11_rr1_top.wav", 1.0, "snare_main/snare_hit_vl11_rr1_btm.wav", 0.6)),
              "eq": [("hp", 100, .7, 0), ("lp", 3600, .7, 0)], "room": (ROOM_SMALL, -14, None), "len": 0.6, "fade": 0.3},
    "ch":    {"name": "TICK", "s": L(SW("hat_tight/hh_tight_vl5_rr1.wav")), "m": L(SW("hat_tight/hh_tight_vl9_rr1.wav"), SW("hat_tight/hh_tight_vl9_rr2.wav")),
              "h": L(SW("hat_tight/hh_tight_vl11_rr1.wav")), "eq": [("hp", 400, .7, 0), ("lp", 3600, .7, 0)], "len": 0.25, "fade": 0.12},
    "oh":    {"name": "SIZZLE", "s": L(SW("hat_sizzling/hh_sizzling_vl4_rr1.wav")), "m": L(SW("hat_sizzling/hh_sizzling_vl7_rr1.wav")),
              "h": L(SW("hat_sizzling/hh_sizzling_vl10_rr1.wav")), "eq": [("hp", 400, .7, 0), ("lp", 3600, .7, 0)], "len": 0.8, "fade": 0.45},
    "clap":  {"name": "CLAP", "s": L(VC(ID + "Claps/SoloClap_vl1.wav")), "m": L(VC(ID + "Claps/SoloClap_vl2.wav")), "h": L(VC(ID + "Claps/SoloClap_vl3.wav")),
              "eq": [("hp", 200, .7, 0), ("lp", 3600, .7, 0)], "room": (ROOM_SMALL, -12, None), "len": 0.3, "fade": 0.15},
    "tom":   {"name": "TOM", "s": L(SW("tom_mlow/tom_mlow_vl4_rr1.wav")), "m": L(SW("tom_mlow/tom_mlow_vl8_rr1.wav")), "h": L(SW("tom_mlow/tom_mlow_vl11_rr1.wav")),
              "eq": [("hp", 60, .7, 0), ("lp", 3600, .7, 0)], "len": 0.7, "fade": 0.35},
    "rim":   {"name": "RIM", "s": L(V("snare_crossstick", 6, mics={"lofi": 1.0})), "m": L(V("snare_crossstick", 10, mics={"lofi": 1.0})),
              "h": L(V("snare_crossstick", 13, mics={"lofi": 1.0})), "eq": [("hp", 200, .7, 0), ("lp", 3600, .7, 0)], "len": 0.3, "fade": 0.15},
    "bell":  {"name": "KEYS", "s": L(MAKE("chord", notes=[("A_059__B3_3.wav", 1), ("A_065__F4_3.wav", -1), ("A_065__F4_3.wav", 2), ("A_071__B4_4.wav", 0)], gain=-6)),
              "m": L(MAKE("chord", notes=[("A_059__B3_3.wav", 1), ("A_065__F4_3.wav", -1), ("A_065__F4_3.wav", 2), ("A_071__B4_4.wav", 0)])),
              "h": L(MAKE("chord", notes=[("A_062__D4_3.wav", -2), ("A_062__D4_3.wav", 2), ("A_065__F4_3.wav", 2), ("A_071__B4_4.wav", 0)], bright=3)),
              "eq": [("hp", 120, .7, 0), ("lp", 2600, .7, 0)], "len": 1.1, "fade": 0.6},
  }},
  # ── H · Latin percussion: a concert bass drum for the bombo, a 13-inch timbale, a güiro, a shaker, claves, a conga,
  #       a bongo and agogô bells (the low bell; an accent rings the high one). Dry, close and bright.
  "H": {"dir": "latin2", "was": "latin", "pads": {
    "kick":  {"name": "BOMBO", "s": L(VC(MB + "Bass Drum 1/BDrumNew_hit_v2_rr1_Sum.wav")), "m": L(VC(MB + "Bass Drum 1/BDrumNew_hit_v3_rr1_Sum.wav"), VC(MB + "Bass Drum 1/BDrumNew_hit_v3_rr2_Sum.wav")),
              "h": L(VC(MB + "Bass Drum 1/BDrumNew_hit_v5_rr1_Sum.wav")),
              "eq": [("hp", 35, .7, 0), ("peak", 90, 1.0, 2), ("peak", 600, 1.0, -2), ("peak", 3000, 1.0, 3)], "shape": (0.3, 0.25), "len": 0.75, "fade": 0.35},
    "snare": {"name": "TIMBAL", "s": L(VP("oh/timbales/timb13_vl2_rr1.wav")), "m": L(VP("oh/timbales/timb13_vl3_rr1.wav"), VP("oh/timbales/timb13_vl3_rr2.wav")),
              "h": L(VP("oh/timbales/timb13_vl5_rr1.wav")), "eq": [("hp", 120, .7, 0)], "len": 0.6, "fade": 0.35},
    "ch":    {"name": "GUIRO", "s": L(VC(ID + "Guiro/Guiro_Hit_rr1_Mid.wav")), "m": L(VC(ID + "Guiro/Guiro_Hit_rr2_Mid.wav")), "h": L(VC(ID + "Guiro/Guiro_Fast_rr1_Mid.wav")),
              "eq": [("hp", 300, .7, 0)], "len": 0.4, "fade": 0.18},
    "oh":    {"name": "SHAKER", "s": L(VC(ID + "Shaker, Large/LShaker_Hit_rr2_Mid.wav")), "m": L(VC(ID + "Shaker, Large/LShaker_Hit_rr1_Mid.wav")),
              "h": L(VC(ID + "Shaker, Large/LShaker_Shake1D_rr3_Mid.wav")), "eq": [("hp", 300, .7, 0)], "len": 0.35, "fade": 0.15},
    "clap":  {"name": "CLAVE", "s": L(VC(ID + "Claves/Claves1_Hit_v1_rr1_Mid.wav")), "m": L(VC(ID + "Claves/Claves1_Hit_v2_rr1_Mid.wav"), VC(ID + "Claves/Claves2_Hit_v2_rr1_Mid.wav")),
              "h": L(VC(ID + "Claves/Claves1_Hit_v3_rr1_Mid.wav")), "eq": [("hp", 400, .7, 0)], "len": 0.3, "fade": 0.15},
    "tom":   {"name": "CONGA", "s": L(VC(MB + "Conga/Conga_HitN_v1_rr2_Sum.wav")), "m": L(VC(MB + "Conga/Conga_HitN_v2_rr1_Sum.wav"), VC(MB + "Conga/Conga_HitN_v2_rr2_Sum.wav")),
              "h": L(VC(MB + "Conga/Conga_HitN_v3_rr1_Sum.wav")), "eq": [("hp", 60, .7, 0)], "len": 0.6, "fade": 0.3},
    "rim":   {"name": "BONGO", "s": L(VC(MB + "Bongos/BongoH_Hit1_v1_rr1_Mid.wav")), "m": L(VC(MB + "Bongos/BongoH_Hit1_v2_rr1_Mid.wav"), VC(MB + "Bongos/BongoH_Hit1_v2_rr2_Mid.wav")),
              "h": L(VC(MB + "Bongos/BongoH_Hit1_v3_rr1_Mid.wav")), "eq": [("hp", 120, .7, 0)], "len": 0.45, "fade": 0.22},
    "bell":  {"name": "AGOGO", "s": L(VC(ID + "Agogo Bells/Agogo_Low_v1_rr1_Mid.wav")), "m": L(VC(ID + "Agogo Bells/Agogo_Low_v2_rr1_Mid.wav")),
              "h": L(VC(ID + "Agogo Bells/Agogo_High_v3_rr1_Mid.wav")), "eq": [("hp", 400, .7, 0)], "len": 0.6, "fade": 0.35},
  }},
  # ── I · live drums: a real kit in a room (Virtuosity Drums, a Boston drum shop's club kit; close, overhead and room
  #       microphones): kick, snare, hats, cross-stick, floor tom, ride (its bell on an accent) and crash.
  "I": {"dir": "live2", "was": "live", "pads": {
    "kick":  {"name": "KICK", "s": L(V("kick_snon", 2, 1, {"kickmic": 1.0, "oh": 0.4, "room": 0.5})),
              "m": L(V("kick_snon", 3, 1, {"kickmic": 1.0, "oh": 0.4, "room": 0.5}), V("kick_snon", 3, 2, {"kickmic": 1.0, "oh": 0.4, "room": 0.5})),
              "h": L(V("kick_snon", 4, 1, {"kickmic": 1.0, "oh": 0.4, "room": 0.5}), V("kick_snon", 4, 2, {"kickmic": 1.0, "oh": 0.4, "room": 0.5})),
              "eq": [("hp", 35, .7, 0), ("peak", 70, 1.0, 2), ("peak", 420, 1.0, -4), ("peak", 3000, 1.0, 2)], "comp": (-18, 3, 10, 120), "len": 0.8, "fade": 0.4},
    "snare": {"name": "SNARE", "s": L(V("snare_center", 12, mics={"snaremic": 1.0, "oh": 0.6, "room": 0.6})),
              "m": L(V("snare_center", 25, mics={"snaremic": 1.0, "oh": 0.6, "room": 0.6}), V("snare_center", 24, mics={"snaremic": 1.0, "oh": 0.6, "room": 0.6})),
              "h": L(V("snare_center", 33, mics={"snaremic": 1.0, "oh": 0.6, "room": 0.6}), V("snare_center", 34, mics={"snaremic": 1.0, "oh": 0.6, "room": 0.6})),
              "eq": [("hp", 90, .7, 0), ("peak", 220, 1.0, 1.5), ("highshelf", 6000, .7, 1.5)], "comp": (-16, 2.5, 5, 100), "len": 0.9, "fade": 0.45},
    "ch":    {"name": "HAT", "s": L(V("hh_closed", 2, 1, {"oh": 1.0, "room": 0.3})), "m": L(V("hh_closed", 3, 1, {"oh": 1.0, "room": 0.3}), V("hh_closed", 3, 2, {"oh": 1.0, "room": 0.3})),
              "h": L(V("hh_closed", 4, 1, {"oh": 1.0, "room": 0.3})), "eq": [("hp", 300, .7, 0)], "len": 0.4, "fade": 0.2},
    "oh":    {"name": "OPEN", "s": L(V("hh_open", 2, 1, {"oh": 1.0, "room": 0.4})), "m": L(V("hh_open", 3, 1, {"oh": 1.0, "room": 0.4})),
              "h": L(V("hh_open", 4, 1, {"oh": 1.0, "room": 0.4})), "eq": [("hp", 300, .7, 0)], "len": 1.4, "fade": 0.9},
    "clap":  {"name": "XSTICK", "s": L(V("snare_crossstick", 7, mics={"snaremic": 1.0, "oh": 0.5, "room": 0.4})),
              "m": L(V("snare_crossstick", 10, mics={"snaremic": 1.0, "oh": 0.5, "room": 0.4}), V("snare_crossstick", 12, mics={"snaremic": 1.0, "oh": 0.5, "room": 0.4})),
              "h": L(V("snare_crossstick", 14, mics={"snaremic": 1.0, "oh": 0.5, "room": 0.4})), "eq": [("hp", 150, .7, 0)], "len": 0.45, "fade": 0.22},
    "tom":   {"name": "FLOOR", "s": L(V("ltom_center", 6, mics={"oh": 1.0, "room": 0.6})), "m": L(V("ltom_center", 11, mics={"oh": 1.0, "room": 0.6})),
              "h": L(V("ltom_center", 15, mics={"oh": 1.0, "room": 0.6})), "eq": [("hp", 45, .7, 0), ("peak", 400, 1.0, -3)], "comp": (-18, 2.5, 10, 150), "len": 1.3, "fade": 0.7},
    "rim":   {"name": "RIDE", "s": L(V("ride_ride", 1, 1, {"oh": 1.0, "room": 0.5})), "m": L(V("ride_ride", 2, 1, {"oh": 1.0, "room": 0.5}), V("ride_ride", 2, 2, {"oh": 1.0, "room": 0.5})),
              "h": L(V("ride_bell", 3, 1, {"oh": 1.0, "room": 0.5})), "eq": [("hp", 200, .7, 0)], "len": 2.2, "fade": 1.4},
    "bell":  {"name": "CRASH", "s": L(V("crash_crash", 1, 1, {"oh": 1.0, "room": 0.6})), "m": L(V("crash_crash", 2, 1, {"oh": 1.0, "room": 0.6})),
              "h": L(V("crash_crash", 3, 1, {"oh": 1.0, "room": 0.6})), "eq": [("hp", 150, .7, 0)], "len": 2.4, "fade": 1.6},
  }},
  # ── J · rock arena: a big open kick, a cracking snare in a huge room that a gate shuts (the 1980s gated sound), a crowd
  #       clapping, a big tom, a stomp (a foot pedal on a wooden box drum, a cajón: there is no free recording of a
  #       foot on a stage), and a crash, all in an arena.
  "J": {"dir": "arena2", "was": "arena", "pads": {
    "kick":  {"name": "KICK", "s": L(B("kickN", 3)), "m": L(B("kickN", 5, 1), B("kickN", 5, 2)), "h": L(B("kickN", 6, 1), B("kickN", 6, 2)),
              "eq": [("hp", 30, .7, 0), ("peak", 65, 0.9, 3), ("peak", 320, 1.0, -3), ("peak", 2600, 1.0, 3)], "comp": (-20, 3, 12, 160),
              "room": (ROOM_ARENA, -13, (-24, 6)), "len": 1.1, "fade": 0.6},
    "snare": {"name": "SNARE", "s": L(B("snare", 5)), "m": L(B("rimshot", 5, 1), B("rimshot", 5, 2)), "h": L(B("rimshot", 6, 1), B("rimshot", 6, 2)),
              "eq": [("hp", 90, .7, 0), ("peak", 200, 1.0, 2.5), ("highshelf", 6000, .7, 2)], "comp": (-18, 3, 5, 100),
              "room": (ROOM_ARENA, -2, (-26, 8)), "gate": (0.26, 0.05), "len": 0.42, "fade": 0.06},
    "ch":    {"name": "HAT", "s": L(B("hat_lc", 2)), "m": L(B("hat_lc", 4, 1), B("hat_lc", 4, 2)), "h": L(B("hat_lc", 6)),
              "eq": [("hp", 250, .7, 0)], "room": (ROOM_ARENA, -18, None), "len": 0.6, "fade": 0.35},
    "oh":    {"name": "OPEN", "s": L(B("hat_ho", 2)), "m": L(B("hat_open", 4)), "h": L(B("hat_open", 6)),
              "eq": [("hp", 250, .7, 0)], "room": (ROOM_ARENA, -16, None), "len": 1.6, "fade": 1.0},
    "clap":  {"name": "CLAPS", "s": L(VC(ID + "Claps/Clap_rr1.wav")), "m": L(VC(ID + "Claps/Clap_rr3.wav"), VC(ID + "Claps/Clap_rr5.wav")), "h": L(VC(ID + "Claps/Clap_rr6.wav")),
              "eq": [("hp", 250, .7, 0)], "room": (ROOM_ARENA, -6, (-24, 4)), "len": 0.9, "fade": 0.6},
    "tom":   {"name": "TOM", "s": L(B("tom15", 3)), "m": L(B("tom15", 6)), "h": L(B("tom15", 7)),
              "eq": [("hp", 50, .7, 0), ("peak", 380, 1.0, -3)], "comp": (-18, 3, 10, 150), "room": (ROOM_ARENA, -9, (-24, 6)), "len": 1.3, "fade": 0.7},
    "rim":   {"name": "STOMP", "s": L(SW("cajon_kick/cajon_kick_vl4_rr1_rear.wav")), "m": L(SW("cajon_kick/cajon_kick_vl8_rr1_rear.wav"), SW("cajon_kick/cajon_kick_vl8_rr2_rear.wav")),
              "h": L(SW("cajon_kick/cajon_kick_vl12_rr1_rear.wav")), "eq": [("hp", 40, .7, 0), ("peak", 90, 1.0, 3), ("lp", 6000, .7, 0)],
              "room": (ROOM_ARENA, -8, (-24, 6)), "len": 0.8, "fade": 0.45},
    "bell":  {"name": "CRASH", "s": L(B("crash", 3)), "m": L(B("crash", 4)), "h": L(B("crash", 5)),
              "eq": [("hp", 150, .7, 0)], "room": (ROOM_ARENA, -12, None), "len": 2.6, "fade": 1.7},
  }},
  # ── K · jazz brushes: a jazz trio's drummer, close and quiet (Swirly Drums, played with brushes): a felt kick, the
  #       brush tapped on the snare, the hi-hat foot, a short sweep round the snare, a brush slapped into the head, a
  #       tom, the ride, and a real double bass plucked on a low G (VSCO 2 Community Edition).
  "K": {"dir": "jazzbrush2", "was": "jazzbrush", "pads": {
    "kick":  {"name": "KICK", "s": L(SW2("marching_kick/marching_kick_vl3_rr1_beater.wav", 0.5, "marching_kick/marching_kick_vl3_rr1_reso.wav", 1.0)),
              "m": L(SW2("marching_kick/marching_kick_vl6_rr1_beater.wav", 0.5, "marching_kick/marching_kick_vl6_rr1_reso.wav", 1.0),
                     SW2("marching_kick/marching_kick_vl6_rr2_beater.wav", 0.5, "marching_kick/marching_kick_vl6_rr2_reso.wav", 1.0)),
              "h": L(SW2("marching_kick/marching_kick_vl9_rr1_beater.wav", 0.5, "marching_kick/marching_kick_vl9_rr1_reso.wav", 1.0)),
              "eq": [("hp", 35, .7, 0), ("peak", 70, 1.0, 2), ("peak", 500, 1.0, -2)], "shape": (0.2, 0.2), "len": 0.6, "fade": 0.3},
    "snare": {"name": "BRUSH", "s": L(SW2("snare_main/snare_hit_vl5_rr1_top.wav", 1.0, "snare_main/snare_hit_vl5_rr1_btm.wav", 0.6)),
              "m": L(SW2("snare_main/snare_hit_vl8_rr1_top.wav", 1.0, "snare_main/snare_hit_vl8_rr1_btm.wav", 0.6),
                     SW2("snare_main/snare_hit_vl8_rr2_top.wav", 1.0, "snare_main/snare_hit_vl8_rr2_btm.wav", 0.6)),
              "h": L(SW2("snare_main/snare_hit_vl10_rr1_top.wav", 1.0, "snare_main/snare_hit_vl10_rr1_btm.wav", 0.6)),
              "eq": [("hp", 100, .7, 0)], "room": (ROOM_SMALL, -18, None), "len": 0.6, "fade": 0.3},
    "ch":    {"name": "CHICK", "s": L(SW("hat_foot/hh_foot_vl2_rr1.wav")), "m": L(SW("hat_foot/hh_foot_vl4_rr1.wav"), SW("hat_foot/hh_foot_vl4_rr2.wav")),
              "h": L(SW("hat_foot/hh_foot_vl7_rr1.wav")), "eq": [("hp", 250, .7, 0)], "len": 0.3, "fade": 0.15},
    "oh":    {"name": "SWISH", "s": L(MAKE("slice", src="swirly:Samples/snare_stir/stir_dl1_rr1.wav", at=2.0, dur=0.45, swell=110)),
              "m": L(MAKE("slice", src="swirly:Samples/snare_stir/stir_dl2_rr1.wav", at=2.2, dur=0.45, swell=110),
                     MAKE("slice", src="swirly:Samples/snare_stir/stir_dl2_rr2.wav", at=3.1, dur=0.45, swell=110)),
              "h": L(MAKE("slice", src="swirly:Samples/snare_stir/stir_dl3_rr1.wav", at=2.6, dur=0.45, swell=90)),
              "eq": [("hp", 150, .7, 0)], "len": 0.45, "fade": 0.22},
    "clap":  {"name": "SLAP", "s": L(SW2("snare_dig/snare_dig_vl2_rr1_top.wav", 1.0, "snare_dig/snare_dig_vl2_rr1_btm.wav", 0.6)),
              "m": L(SW2("snare_dig/snare_dig_vl4_rr1_top.wav", 1.0, "snare_dig/snare_dig_vl4_rr1_btm.wav", 0.6),
                     SW2("snare_dig/snare_dig_vl4_rr2_top.wav", 1.0, "snare_dig/snare_dig_vl4_rr2_btm.wav", 0.6)),
              "h": L(SW2("snare_dig/snare_dig_vl6_rr1_top.wav", 1.0, "snare_dig/snare_dig_vl6_rr1_btm.wav", 0.6)),
              "eq": [("hp", 120, .7, 0)], "len": 0.5, "fade": 0.25},
    "tom":   {"name": "TOM", "s": L(SW("tom_mlow/tom_mlow_vl4_rr1.wav")), "m": L(SW("tom_mlow/tom_mlow_vl7_rr1.wav")), "h": L(SW("tom_mlow/tom_mlow_vl10_rr1.wav")),
              "eq": [("hp", 60, .7, 0)], "len": 0.8, "fade": 0.4},
    "rim":   {"name": "RIDE", "s": L(SW("ride/ride_vl5_rr1.wav")), "m": L(SW("ride/ride_vl9_rr1.wav"), SW("ride/ride_vl9_rr2.wav")), "h": L(SW("ride/ride_vl12_rr1.wav")),
              "eq": [("hp", 200, .7, 0)], "len": 2.0, "fade": 1.3},
    "bell":  {"name": "BASS", "s": L(T(BASS % "F#1_v1_rr2", tune=1)), "m": L(T(BASS % "G#1_v1_rr1", tune=-1), T(BASS % "G#1_v1_rr2", tune=-1)),
              "h": L(T(BASS % "F#1_v1_rr1", tune=1)), "eq": [("hp", 40, .7, 0), ("lp", 5000, .7, 0)], "len": 1.0, "fade": 0.5},
  }},
  # ── M · reggae and dub: a round kick, a high snare with a dub echo (the echo made here, as on a mixing desk), hats, a
  #       synth tom (made on the page: a synth drum is electronic on the real instrument too), a tom, the one drop's
  #       cross-stick, and the skank: a real upright piano chord chopped short, with its echo.
  # AOG-DRUM-909-V1 (2026-10-05) — kit L, "909 house", is a real Roland TR-909 now: "TR-909 JGB pack" (Freesound pack
  # 1643), sampled by Janne G:son Berg from his own machine, posted by altemark, CC BY 4.0 (sources.py). The pack holds
  # each voice at many knob settings; a pad's takes are neighbouring settings (so a pad played twice is not a copy), its
  # soft and accent layers the settings either side. The machine has no chord: STAB stays made on the page (made), like
  # kit M's synth tom. Takes (Freesound sound ids): kick bd08-bd12, snare sn32-sn35 (the snappy ones), hats ch07-ch10,
  # open hat oh02-oh05, clap clp04-clp07 (the dry ones), tom lt09-lt12 (the low tom near the old 130 Hz), ride ride01-04.
  "L": {"dir": "house909", "pads": {
    "kick":  {"name": "909", "s": L(F909("bd08", 26494)), "m": L(F909("bd10", 26496), F909("bd11", 26497)), "h": L(F909("bd12", 26498)),
              "eq": [("hp", 25, .7, 0)], "len": 0.7, "fade": 0.3},
    "snare": {"name": "SNARE", "s": L(F909("sn32", 26705)), "m": L(F909("sn33", 26706), F909("sn34", 26707)), "h": L(F909("sn35", 26708)),
              "eq": [("hp", 90, .7, 0)], "len": 0.45, "fade": 0.2},
    "ch":    {"name": "HAT", "s": L(F909("ch07", 26526)), "m": L(F909("ch08", 26527), F909("ch09", 26528)), "h": L(F909("ch10", 26529)),
              "eq": [("hp", 300, .7, 0)], "len": 0.25, "fade": 0.12},
    "oh":    {"name": "OPEN", "s": L(F909("oh04", 26646)), "m": L(F909("oh03", 26645)), "h": L(F909("oh02", 26644)),
              "eq": [("hp", 300, .7, 0)], "len": 0.8, "fade": 0.4},
    "clap":  {"name": "CLAP", "s": L(F909("clp04", 26555)), "m": L(F909("clp05", 26556), F909("clp06", 26557)), "h": L(F909("clp07", 26558)),
              "eq": [("hp", 150, .7, 0)], "len": 0.5, "fade": 0.25},
    "tom":   {"name": "TOM", "s": L(F909("lt09", 26604)), "m": L(F909("lt10", 26605)), "h": L(F909("lt11", 26606)),
              "eq": [("hp", 45, .7, 0)], "len": 0.7, "fade": 0.35},
    "rim":   {"name": "RIDE", "s": L(F909("ride01", 26658)), "m": L(F909("ride02", 26659), F909("ride03", 26660)), "h": L(F909("ride04", 26661)),
              "eq": [("hp", 300, .7, 0)], "len": 1.4, "fade": 0.6},
    "bell":  {"name": "STAB", "made": True},
  }},
  "M": {"dir": "reggae2", "was": "reggae", "pads": {
    "kick":  {"name": "KICK", "s": L(V("kick_snoff", 2, 1, {"kickmic": 1.0, "oh": 0.4})),
              "m": L(V("kick_snoff", 3, 1, {"kickmic": 1.0, "oh": 0.4}), V("kick_snoff", 3, 2, {"kickmic": 1.0, "oh": 0.4})),
              "h": L(V("kick_snoff", 4, 1, {"kickmic": 1.0, "oh": 0.4}), V("kick_snoff", 4, 2, {"kickmic": 1.0, "oh": 0.4})),
              "tune": -2, "eq": [("hp", 30, .7, 0), ("peak", 60, 1.0, 3), ("peak", 450, 1.0, -4), ("lp", 4500, .7, 0)], "comp": (-18, 3, 12, 140),
              "len": 0.65, "fade": 0.3},
    "snare": {"name": "SNARE", "s": L(V("snare_center", 12, mics={"snaremic": 1.0, "oh": 0.4})),
              "m": L(V("snare_center", 23, mics={"snaremic": 1.0, "oh": 0.4}), V("snare_center", 22, mics={"snaremic": 1.0, "oh": 0.4})),
              "h": L(V("snare_rimshot", 7, mics={"snaremic": 1.0, "oh": 0.4})),
              "tune": 2, "eq": [("hp", 140, .7, 0), ("peak", 4000, 1.0, 2)], "comp": (-16, 3, 3, 80),
              "echo": (0.2, 3, 0.4, 3000.0), "len": 1.0, "fade": 0.35},
    "ch":    {"name": "HAT", "s": L(V("hh_closed", 2, 1)), "m": L(V("hh_closed", 3, 1), V("hh_closed", 3, 2)), "h": L(V("hh_closed", 4, 1)),
              "eq": [("hp", 350, .7, 0)], "len": 0.3, "fade": 0.15},
    "oh":    {"name": "OPEN", "s": L(V("hh_open", 2, 1)), "m": L(V("hh_open", 3, 1)), "h": L(V("hh_open", 4, 1)),
              "eq": [("hp", 300, .7, 0)], "len": 0.9, "fade": 0.5},
    "clap":  {"name": "SYNTOM", "made": True},
    "tom":   {"name": "TOM", "s": L(V("htom_center", 6, mics={"oh": 1.0, "room": 0.3})), "m": L(V("htom_center", 10, mics={"oh": 1.0, "room": 0.3})),
              "h": L(V("htom_center", 14, mics={"oh": 1.0, "room": 0.3})), "eq": [("hp", 70, .7, 0)], "len": 0.7, "fade": 0.35},
    "rim":   {"name": "XSTICK", "s": L(V("snare_crossstick", 8, mics={"snaremic": 1.0, "oh": 0.5})),
              "m": L(V("snare_crossstick", 11, mics={"snaremic": 1.0, "oh": 0.5}), V("snare_crossstick", 12, mics={"snaremic": 1.0, "oh": 0.5})),
              "h": L(V("snare_crossstick", 15, mics={"snaremic": 1.0, "oh": 0.5})), "eq": [("hp", 150, .7, 0)], "len": 0.35, "fade": 0.18},
    "bell":  {"name": "SKANK", "s": L(MAKE("chop", notes=[(UPRIGHT % "G3_pp_RR1", 2), (UPRIGHT % "C4_pp_RR1", 0), (UPRIGHT % "G4_pp_RR1", -3)])),
              "m": L(MAKE("chop", notes=[(UPRIGHT % "G3_mf_RR1", 2), (UPRIGHT % "C4_mf_RR1", 0), (UPRIGHT % "G4_mf_RR1", -3)]),
                     MAKE("chop", notes=[(UPRIGHT % "G3_mf_RR2", 2), (UPRIGHT % "C4_mf_RR2", 0), (UPRIGHT % "G4_mf_RR2", -3)])),
              "h": L(MAKE("chop", notes=[(UPRIGHT % "G3_f_RR1", 2), (UPRIGHT % "C4_f_RR1", 0), (UPRIGHT % "G4_f_RR1", -3)])),
              "eq": [("hp", 180, .7, 0), ("lp", 4000, .7, 0)], "echo": (0.21, 2, 0.35, 2600.0), "len": 0.75, "fade": 0.25},
  }},
  # ── N · afrobeat: a tight funk kit, a cabasa (the modern shekere, a gourd of beads), hats, a djembe (there is no
  #       free recording of a talking drum), a quinto conga, two sticks (claves) and an iron cowbell.
  "N": {"dir": "afrobeat2", "was": "afrobeat", "pads": {
    "kick":  {"name": "KICK", "s": L(V("kick_snoff", 2, 1, {"kickmic": 1.0, "oh": 0.3})),
              "m": L(V("kick_snoff", 3, 1, {"kickmic": 1.0, "oh": 0.3}), V("kick_snoff", 3, 2, {"kickmic": 1.0, "oh": 0.3})),
              "h": L(V("kick_snoff", 4, 1, {"kickmic": 1.0, "oh": 0.3})),
              "eq": [("hp", 40, .7, 0), ("peak", 75, 1.0, 2), ("peak", 400, 1.0, -5), ("peak", 3200, 1.0, 3)], "comp": (-18, 3, 8, 90), "shape": (0.12, 0.1),
              "len": 0.45, "fade": 0.22},
    "snare": {"name": "SNARE", "s": L(V("snare_center", 10, mics={"snaremic": 1.0, "oh": 0.4})),
              "m": L(V("snare_center", 21, mics={"snaremic": 1.0, "oh": 0.4}), V("snare_center", 20, mics={"snaremic": 1.0, "oh": 0.4})),
              "h": L(V("snare_center", 30, mics={"snaremic": 1.0, "oh": 0.4})),
              "tune": 1, "eq": [("hp", 120, .7, 0), ("peak", 3000, 1.0, 2)], "comp": (-16, 3, 4, 80), "shape": (0.15, 0.12), "len": 0.5, "fade": 0.25},
    "ch":    {"name": "SHAKER", "s": L(VC(ID + "Cabasa/Cabasa1_Rub_v1_rr1_Mid.wav")), "m": L(VC(ID + "Cabasa/Cabasa1_Hit_rr1_Mid.wav"), VC(ID + "Cabasa/Cabasa1_Hit_rr2_Mid.wav")),
              "h": L(VC(ID + "Cabasa/Cabasa1_Rub_v2_rr1_Mid.wav")), "eq": [("hp", 400, .7, 0)], "len": 0.25, "fade": 0.12},
    "oh":    {"name": "OPEN", "s": L(V("hh_open", 2, 1)), "m": L(V("hh_open", 3, 1)), "h": L(V("hh_open", 4, 1)),
              "eq": [("hp", 300, .7, 0)], "len": 0.9, "fade": 0.5},
    "clap":  {"name": "DJEMBE", "s": L(SW("djembe/djembe_vl4_rr1.wav")), "m": L(SW("djembe/djembe_vl8_rr1.wav"), SW("djembe/djembe_vl8_rr2.wav")),
              "h": L(SW("djembe/djembe_vl12_rr1.wav")), "eq": [("hp", 50, .7, 0)], "len": 0.6, "fade": 0.3},
    "tom":   {"name": "CONGA", "s": L(VC(MB + "Conga/Quinto_HitN_v1_rr1_Sum.wav")), "m": L(VC(MB + "Conga/Quinto_HitN_v2_rr1_Sum.wav"), VC(MB + "Conga/Quinto_HitN_v2_rr2_Sum.wav")),
              "h": L(VC(MB + "Conga/Quinto_HitN_v3_rr2_Sum.wav")), "eq": [("hp", 70, .7, 0)], "len": 0.55, "fade": 0.28},
    "rim":   {"name": "STICKS", "s": L(VC(ID + "Claves/Claves2_Hit_v1_rr1_Mid.wav")), "m": L(VC(ID + "Claves/Claves2_Hit_v2_rr1_Mid.wav")),
              "h": L(VC(ID + "Claves/Claves2_Hit_v3_rr1_Mid.wav")), "eq": [("hp", 400, .7, 0)], "len": 0.3, "fade": 0.15},
    "bell":  {"name": "BELL", "s": L(VC(ID + "Cowbells/Cowbell1_Normal_v2_rr1_Mid.wav")), "m": L(VC(ID + "Cowbells/Cowbell1_Normal_v3_rr1_Mid.wav")),
              "h": L(VC(ID + "Cowbells/Cowbell1_Hit_v4_rr1_Mid.wav")), "eq": [("hp", 300, .7, 0)], "len": 0.5, "fade": 0.28},
  }},
  # ── O · marching band: a 20-inch marching bass drum, a marching snare, its sticks clicked, hand cymbals crashed, a
  #       snare roll that swells and lets go, a tenor drum, a rimshot, and the bells (a glockenspiel on a high G).
  "O": {"dir": "marching2", "was": "marching", "pads": {
    "kick":  {"name": "BASS", "s": L(SW2("marching_kick/marching_kick_vl6_rr1_beater.wav", 0.7, "marching_kick/marching_kick_vl6_rr1_reso.wav", 1.0)),
              "m": L(SW2("marching_kick/marching_kick_vl10_rr1_beater.wav", 0.7, "marching_kick/marching_kick_vl10_rr1_reso.wav", 1.0),
                     SW2("marching_kick/marching_kick_vl10_rr2_beater.wav", 0.7, "marching_kick/marching_kick_vl10_rr2_reso.wav", 1.0)),
              "h": L(SW2("marching_kick/marching_kick_vl14_rr1_beater.wav", 0.7, "marching_kick/marching_kick_vl14_rr1_reso.wav", 1.0)),
              "eq": [("hp", 30, .7, 0), ("peak", 70, 1.0, 2)], "room": (ROOM_SMALL, -16, None), "len": 0.9, "fade": 0.45},
    "snare": {"name": "SNARE", "s": L(VC(MB + "Legacy Snares/drum3_marching/snare3_mp_rr1.wav")),
              "m": L(VC(MB + "Legacy Snares/drum3_marching/snare3_f_rr1.wav"), VC(MB + "Legacy Snares/drum3_marching/snare3_f_rr2.wav")),
              "h": L(VC(MB + "Legacy Snares/drum3_marching/snare3_fff_rr1.wav")),
              "eq": [("hp", 120, .7, 0), ("highshelf", 5000, .7, 2)], "room": (ROOM_SMALL, -16, None), "len": 0.45, "fade": 0.22},
    "ch":    {"name": "CLICK", "s": L(VC(MB + "Legacy Snares/drum3_marching/snare3_click_rr2.wav")), "m": L(VC(MB + "Legacy Snares/drum3_marching/snare3_click_rr1.wav")),
              "h": L(VC(MB + "Snare Drum, Modern 3/Snare4_stick_v3_rr2_Mid.wav")), "eq": [("hp", 400, .7, 0)], "len": 0.22, "fade": 0.1},
    "oh":    {"name": "CYMBAL", "s": L(VC(ID + "Clash Cymbals 1/cymbal_crash1_mp1.wav")), "m": L(VC(ID + "Clash Cymbals 1/cymbal_crash1_mf2.wav")),
              "h": L(VC(ID + "Clash Cymbals 1/cymbal_crash1_ff3.wav")), "eq": [("hp", 200, .7, 0)], "len": 1.6, "fade": 1.0},
    "clap":  {"name": "ROLL", "s": L(MAKE("slice", src=MB + "Snare Drum, Modern 1/Snare2_rollSN_v2_rr1_Mid.wav", at=1.5, dur=0.6, swell=180)),
              "m": L(MAKE("slice", src=MB + "Snare Drum, Modern 1/Snare2_rollSN_v4_rr1_Mid.wav", at=1.5, dur=0.6, swell=180),
                     MAKE("slice", src=MB + "Snare Drum, Modern 1/Snare2_rollSN_v4_rr1_Mid.wav", at=3.0, dur=0.6, swell=180)),
              "h": L(MAKE("slice", src=MB + "Snare Drum, Modern 1/Snare2_rollSN_v5_rr2_Mid.wav", at=1.5, dur=0.6, swell=150)),
              "eq": [("hp", 150, .7, 0), ("highshelf", 5000, .7, 1)], "len": 0.6, "fade": 0.3},
    "tom":   {"name": "TENOR", "s": L(VC(MB + "Legacy Toms/tenor_higher/tenorH_mp_rr1.wav")),
              "m": L(VC(MB + "Legacy Toms/tenor_higher/tenorH_f_rr1.wav"), VC(MB + "Legacy Toms/tenor_higher/tenorH_f_rr3.wav")),
              "h": L(VC(MB + "Legacy Toms/tenor_higher/tenorH_ff_rr1.wav")), "eq": [("hp", 70, .7, 0)], "len": 0.6, "fade": 0.3},
    "rim":   {"name": "RIM", "s": L(VC(MB + "Snare Drum, Modern 3/Snare4_rimshot_v4_rr1_Mid.wav")), "m": L(VC(MB + "Legacy Snares/drum3_marching/snare3_rimshot_f_rr1.wav")),
              "h": L(VC(MB + "Legacy Snares/drum3_marching/snare3_rimshot_ff_rr1.wav")), "eq": [("hp", 150, .7, 0)], "len": 0.35, "fade": 0.18},
    "bell":  {"name": "BELLS", "s": L(VC(ID + "Glockenspiel/glock_soft_G6_01.wav")), "m": L(VC(ID + "Glockenspiel/glock_medium_G6_01.wav")),
              "h": L(T(ID + "Glockenspiel/glock_loud_G#6_01.wav", tune=-1)), "eq": [("hp", 600, .7, 0)], "len": 1.3, "fade": 0.8},
  }},
  # ── U · jazz club (Buddy Rich): Virtuosity Drums as recorded, a Boston drum shop's house kit set up for a club: a small
  #       kick for the "bombs", a crisp snare, hats, the hi-hat foot, a tom, the ride and a crash.
  "U": {"dir": "jazzclub2", "was": "jazzclub", "pads": {
    "kick":  {"name": "KICK", "s": L(V("kick_snon", 2, 1, {"kickmic": 0.8, "oh": 0.7, "room": 0.5})),
              "m": L(V("kick_snon", 3, 1, {"kickmic": 0.8, "oh": 0.7, "room": 0.5}), V("kick_snon", 3, 2, {"kickmic": 0.8, "oh": 0.7, "room": 0.5})),
              "h": L(V("kick_snon", 4, 1, {"kickmic": 0.8, "oh": 0.7, "room": 0.5}), V("kick_snon", 4, 2, {"kickmic": 0.8, "oh": 0.7, "room": 0.5})),
              "eq": [("hp", 40, .7, 0), ("peak", 80, 1.0, 1.5), ("peak", 450, 1.0, -2)], "comp": (-18, 2, 10, 120), "len": 0.9, "fade": 0.45, "soft": -6},
    "snare": {"name": "SNARE", "s": L(V("snare_center", 10, mics={"snaremic": 0.8, "oh": 0.8, "room": 0.5})),
              "m": L(V("snare_center", 22, mics={"snaremic": 0.8, "oh": 0.8, "room": 0.5}), V("snare_center", 23, mics={"snaremic": 0.8, "oh": 0.8, "room": 0.5})),
              "h": L(V("snare_center", 31, mics={"snaremic": 0.8, "oh": 0.8, "room": 0.5}), V("snare_center", 32, mics={"snaremic": 0.8, "oh": 0.8, "room": 0.5})),
              "eq": [("hp", 100, .7, 0), ("highshelf", 6000, .7, 1)], "comp": (-16, 2, 5, 100), "len": 0.9, "fade": 0.45, "soft": -7},
    "ch":    {"name": "HAT", "s": L(V("hh_closed", 2, 1, {"oh": 1.0, "room": 0.3})), "m": L(V("hh_closed", 3, 1, {"oh": 1.0, "room": 0.3}), V("hh_closed", 3, 2, {"oh": 1.0, "room": 0.3})),
              "h": L(V("hh_closed", 4, 1, {"oh": 1.0, "room": 0.3})), "eq": [("hp", 300, .7, 0)], "len": 0.4, "fade": 0.2},
    "oh":    {"name": "OPEN", "s": L(V("hh_half", 2, 1, {"oh": 1.0, "room": 0.3})), "m": L(V("hh_half", 3, 1, {"oh": 1.0, "room": 0.3})),
              "h": L(V("hh_34", 4, 1, {"oh": 1.0, "room": 0.3})), "eq": [("hp", 300, .7, 0)], "len": 1.2, "fade": 0.8},
    "clap":  {"name": "PEDAL", "hat": 1, "s": L(V("hh_pedal", 1, 1, {"oh": 1.0, "room": 0.3})),
              "m": L(V("hh_pedal", 2, 1, {"oh": 1.0, "room": 0.3}), V("hh_pedal", 2, 2, {"oh": 1.0, "room": 0.3})),
              "h": L(V("hh_pedal", 3, 1, {"oh": 1.0, "room": 0.3})), "eq": [("hp", 250, .7, 0)], "len": 0.35, "fade": 0.18},
    "tom":   {"name": "TOM", "s": L(V("htom_center", 5, mics={"oh": 1.0, "room": 0.5})), "m": L(V("htom_center", 9, mics={"oh": 1.0, "room": 0.5})),
              "h": L(V("htom_center", 13, mics={"oh": 1.0, "room": 0.5})), "eq": [("hp", 70, .7, 0)], "len": 1.0, "fade": 0.5},
    "rim":   {"name": "RIDE", "s": L(V("ride_ride", 1, 1, {"oh": 1.0, "room": 0.4})), "m": L(V("ride_ride", 2, 1, {"oh": 1.0, "room": 0.4}), V("ride_ride", 2, 2, {"oh": 1.0, "room": 0.4})),
              "h": L(V("ride_ride", 3, 1, {"oh": 1.0, "room": 0.4})), "eq": [("hp", 200, .7, 0)], "len": 2.4, "fade": 1.5},
    "bell":  {"name": "CRASH", "s": L(V("crash_crash", 1, 1, {"oh": 1.0, "room": 0.5})), "m": L(V("crash_crash", 2, 1, {"oh": 1.0, "room": 0.5})),
              "h": L(V("crash_crash", 3, 1, {"oh": 1.0, "room": 0.5})), "eq": [("hp", 150, .7, 0)], "len": 2.4, "fade": 1.6},
  }},
  # ── V · brush ballad: Swirly Drums with brushes, in a warm room: a soft kick, the brush on the snare, the hi-hat foot,
  #       the brushed open hat, a long stir round the snare (the slow-song sound), a floor tom, the ride, and a flutter.
  "V": {"dir": "brushes", "pads": {
    "kick":  {"name": "KICK", "s": L(SW2("marching_kick/marching_kick_vl3_rr2_beater.wav", 0.4, "marching_kick/marching_kick_vl3_rr2_reso.wav", 1.0)),
              "m": L(SW2("marching_kick/marching_kick_vl5_rr1_beater.wav", 0.4, "marching_kick/marching_kick_vl5_rr1_reso.wav", 1.0),
                     SW2("marching_kick/marching_kick_vl5_rr2_beater.wav", 0.4, "marching_kick/marching_kick_vl5_rr2_reso.wav", 1.0)),
              "h": L(SW2("marching_kick/marching_kick_vl8_rr1_beater.wav", 0.4, "marching_kick/marching_kick_vl8_rr1_reso.wav", 1.0)),
              "eq": [("hp", 35, .7, 0), ("peak", 70, 1.0, 2), ("peak", 500, 1.0, -2)], "room": (ROOM_MED, -16, None), "len": 0.8, "fade": 0.4},
    "snare": {"name": "SNARE", "s": L(SW2("snare_main/snare_hit_vl4_rr2_top.wav", 1.0, "snare_main/snare_hit_vl4_rr2_btm.wav", 0.6)),
              "m": L(SW2("snare_main/snare_hit_vl7_rr1_top.wav", 1.0, "snare_main/snare_hit_vl7_rr1_btm.wav", 0.6),
                     SW2("snare_main/snare_hit_vl7_rr2_top.wav", 1.0, "snare_main/snare_hit_vl7_rr2_btm.wav", 0.6)),
              "h": L(SW2("snare_edge/snare_edge_vl8_rr1_top.wav", 1.0, "snare_edge/snare_edge_vl8_rr1_btm.wav", 0.6)),
              "eq": [("hp", 100, .7, 0)], "room": (ROOM_MED, -13, None), "len": 0.8, "fade": 0.4},
    "ch":    {"name": "CHICK", "s": L(SW("hat_foot/hh_foot_vl1_rr2.wav")), "m": L(SW("hat_foot/hh_foot_vl3_rr1.wav"), SW("hat_foot/hh_foot_vl3_rr2.wav")),
              "h": L(SW("hat_foot/hh_foot_vl6_rr1.wav")), "eq": [("hp", 250, .7, 0)], "room": (ROOM_MED, -18, None), "len": 0.35, "fade": 0.18},
    "oh":    {"name": "OPEN", "s": L(SW("hat_open/hh_open_vl3_rr1.wav")), "m": L(SW("hat_open/hh_open_vl6_rr1.wav")), "h": L(SW("hat_open/hh_open_vl9_rr1.wav")),
              "eq": [("hp", 250, .7, 0)], "room": (ROOM_MED, -16, None), "len": 1.4, "fade": 0.9},
    "clap":  {"name": "STIR", "s": L(MAKE("slice", src="swirly:Samples/snare_stir/stir_dl1_rr2.wav", at=1.5, dur=1.6, swell=80)),
              "m": L(MAKE("slice", src="swirly:Samples/snare_stir/stir_dl2_rr3.wav", at=1.5, dur=1.6, swell=80),
                     MAKE("slice", src="swirly:Samples/snare_stir/stir_dl2_rr4.wav", at=2.4, dur=1.6, swell=80)),
              "h": L(MAKE("slice", src="swirly:Samples/snare_stir/stir_dl3_rr2.wav", at=1.8, dur=1.6, swell=60)),
              "eq": [("hp", 150, .7, 0)], "room": (ROOM_MED, -16, None), "len": 1.7, "fade": 0.7},
    "tom":   {"name": "TOM", "s": L(SW("tom_floor/tom_floor_vl4_rr1.wav")), "m": L(SW("tom_floor/tom_floor_vl8_rr1.wav")), "h": L(SW("tom_floor/tom_floor_vl11_rr1.wav")),
              "eq": [("hp", 50, .7, 0)], "room": (ROOM_MED, -14, None), "len": 1.0, "fade": 0.5},
    "rim":   {"name": "RIDE", "s": L(SW("ride/ride_vl4_rr2.wav")), "m": L(SW("ride/ride_vl8_rr1.wav"), SW("ride/ride_vl8_rr2.wav")), "h": L(SW("ride/ride_vl11_rr1.wav")),
              "eq": [("hp", 200, .7, 0)], "room": (ROOM_MED, -18, None), "len": 2.2, "fade": 1.4},
    "bell":  {"name": "FLUTTR", "s": L(MAKE("slice", src="swirly:Samples/snare_flutter/flutter_rr1.wav", at=0.0, dur=0.9, swell=5)),
              "m": L(MAKE("slice", src="swirly:Samples/snare_flutter/flutter_rr2.wav", at=0.0, dur=0.9, swell=5)),
              "h": L(MAKE("slice", src="swirly:Samples/snare_flutter/flutter_rr3.wav", at=0.0, dur=0.9, swell=5)),
              "eq": [("hp", 150, .7, 0)], "room": (ROOM_MED, -16, None), "len": 1.0, "fade": 0.4},
  }},
  # ── W · studio funk (Jeff Porcaro): the Virtuosity kit up close and dry: a tight kick, a snare made for ghost notes
  #       (a rimshot on the accent), crisp hats, the barking half-open hat, cross-stick, a tom, the ride (bell on the
  #       accent) and a crash.
  "W": {"dir": "funk2", "was": "funk", "pads": {
    "kick":  {"name": "KICK", "s": L(V("kick_snoff", 2, 1, {"kickmic": 1.0, "oh": 0.25})),
              "m": L(V("kick_snoff", 3, 1, {"kickmic": 1.0, "oh": 0.25}), V("kick_snoff", 3, 2, {"kickmic": 1.0, "oh": 0.25})),
              "h": L(V("kick_snoff", 4, 1, {"kickmic": 1.0, "oh": 0.25}), V("kick_snoff", 4, 2, {"kickmic": 1.0, "oh": 0.25})),
              "eq": [("hp", 35, .7, 0), ("peak", 65, 1.0, 2.5), ("peak", 380, 1.2, -6), ("peak", 3500, 1.0, 4)], "comp": (-18, 3.5, 8, 100), "shape": (0.12, 0.12),
              "len": 0.5, "fade": 0.25},
    "snare": {"name": "SNARE", "s": L(V("snare_center", 9, mics={"snaremic": 1.0, "oh": 0.35})),
              "m": L(V("snare_center", 24, mics={"snaremic": 1.0, "oh": 0.35}), V("snare_center", 25, mics={"snaremic": 1.0, "oh": 0.35})),
              "h": L(V("snare_rimshot", 10, mics={"snaremic": 1.0, "oh": 0.35}), V("snare_rimshot", 11, mics={"snaremic": 1.0, "oh": 0.35})),
              "eq": [("hp", 90, .7, 0), ("peak", 220, 1.0, 2), ("peak", 900, 1.2, -2), ("highshelf", 5000, .7, 3)], "comp": (-16, 3, 4, 90), "shape": (0.18, 0.16),
              "soft": -8, "len": 0.6, "fade": 0.3},
    "ch":    {"name": "HAT", "s": L(V("hh_closed", 2, 1, {"oh": 1.0})), "m": L(V("hh_closed", 3, 1, {"oh": 1.0}), V("hh_closed", 3, 2, {"oh": 1.0})),
              "h": L(V("hh_closed", 4, 1, {"oh": 1.0})), "eq": [("hp", 300, .7, 0), ("highshelf", 8000, .7, 2)], "len": 0.3, "fade": 0.16},
    "oh":    {"name": "OPEN", "s": L(V("hh_half", 2, 1, {"oh": 1.0})), "m": L(V("hh_half", 3, 1, {"oh": 1.0})), "h": L(V("hh_half", 4, 1, {"oh": 1.0})),
              "eq": [("hp", 300, .7, 0), ("highshelf", 8000, .7, 1.5)], "len": 0.8, "fade": 0.45},
    "clap":  {"name": "XSTICK", "s": L(V("snare_crossstick", 8, mics={"snaremic": 1.0, "oh": 0.4})),
              "m": L(V("snare_crossstick", 11, mics={"snaremic": 1.0, "oh": 0.4}), V("snare_crossstick", 12, mics={"snaremic": 1.0, "oh": 0.4})),
              "h": L(V("snare_crossstick", 14, mics={"snaremic": 1.0, "oh": 0.4})), "eq": [("hp", 150, .7, 0), ("highshelf", 5000, .7, 1.5)], "len": 0.4, "fade": 0.2},
    "tom":   {"name": "TOM", "s": L(V("htom_center", 6, mics={"oh": 1.0, "mid": 0.6})), "m": L(V("htom_center", 10, mics={"oh": 1.0, "mid": 0.6})),
              "h": L(V("htom_center", 14, mics={"oh": 1.0, "mid": 0.6})), "eq": [("hp", 70, .7, 0), ("peak", 400, 1.0, -3)], "comp": (-16, 3, 10, 120), "len": 0.8, "fade": 0.4},
    "rim":   {"name": "RIDE", "s": L(V("ride_ride", 1, 1, {"oh": 1.0})), "m": L(V("ride_ride", 2, 1, {"oh": 1.0}), V("ride_ride", 2, 2, {"oh": 1.0})),
              "h": L(V("ride_bell", 3, 1, {"oh": 1.0})), "eq": [("hp", 220, .7, 0)], "len": 2.0, "fade": 1.3},
    "bell":  {"name": "CRASH", "s": L(V("crash_crash", 1, 1, {"oh": 1.0})), "m": L(V("crash_crash", 2, 1, {"oh": 1.0})), "h": L(V("crash_crash", 3, 1, {"oh": 1.0})),
              "eq": [("hp", 180, .7, 0)], "len": 2.2, "fade": 1.4},
  }},
  # ── X · 1970s vintage (John Bonham): Gogodze Phu Vol II, a kit tuned to sound like a 1973 record, through its close,
  #       front, overhead and window microphones, warm and a little worn: kick, snare, hats, a tom, a floor tom, the
  #       hi-hat foot, and a crash (from Big Rusty Drums, made darker to match).
  "X": {"dir": "vintage70-2", "was": "vintage70", "pads": {
    "kick":  {"name": "KICK", "s": L(G("ks", 2, 1, {"kick": 1.0, "front": 0.6, "oh": 0.4})),
              "m": L(G("ks", 4, 1, {"kick": 1.0, "front": 0.6, "oh": 0.4}), G("ks", 4, 2, {"kick": 1.0, "front": 0.6, "oh": 0.4})),
              "h": L(G("ks", 6, 1, {"kick": 1.0, "front": 0.6, "oh": 0.4}), G("ks", 6, 2, {"kick": 1.0, "front": 0.6, "oh": 0.4})),
              "eq": [("hp", 35, .7, 0), ("peak", 80, 1.0, 2), ("peak", 400, 1.0, -2), ("highshelf", 6000, .7, -4)], "sat": 1.3, "len": 0.9, "fade": 0.45},
    "snare": {"name": "SNARE", "s": L(G("sc", 2, 1, {"snare": 1.0, "oh": 0.6, "wndw": 0.5})),
              "m": L(G("sc", 4, 1, {"snare": 1.0, "oh": 0.6, "wndw": 0.5}), G("sc", 4, 2, {"snare": 1.0, "oh": 0.6, "wndw": 0.5})),
              "h": L(G("sc", 6, 1, {"snare": 1.0, "oh": 0.6, "wndw": 0.5}), G("sc", 6, 2, {"snare": 1.0, "oh": 0.6, "wndw": 0.5})),
              "eq": [("hp", 80, .7, 0), ("peak", 230, 1.0, 2), ("highshelf", 7000, .7, -3)], "sat": 1.25, "len": 1.0, "fade": 0.5},
    "ch":    {"name": "HAT", "s": L(G("hc", 2, 1, {"oh": 1.0, "wndw": 0.3})), "m": L(G("hc", 3, 1, {"oh": 1.0, "wndw": 0.3}), G("hc", 3, 2, {"oh": 1.0, "wndw": 0.3})),
              "h": L(G("hc", 4, 1, {"oh": 1.0, "wndw": 0.3})), "eq": [("hp", 250, .7, 0), ("highshelf", 8000, .7, -2)], "len": 0.5, "fade": 0.25},
    "oh":    {"name": "OPEN", "s": L(G("hh", 2, 1, {"oh": 1.0, "wndw": 0.4})), "m": L(G("ho", 3, 1, {"oh": 1.0, "wndw": 0.4})),
              "h": L(G("ho", 4, 1, {"oh": 1.0, "wndw": 0.4})), "eq": [("hp", 250, .7, 0), ("highshelf", 8000, .7, -2)], "len": 1.6, "fade": 1.0},
    "clap":  {"name": "TOM", "s": L(G("th", 2, 1, {"oh": 1.0, "front": 0.6, "wndw": 0.4})), "m": L(G("th", 4, 1, {"oh": 1.0, "front": 0.6, "wndw": 0.4})),
              "h": L(G("th", 5, 1, {"oh": 1.0, "front": 0.6, "wndw": 0.4})), "eq": [("hp", 60, .7, 0), ("highshelf", 6000, .7, -3)], "sat": 1.2, "len": 1.2, "fade": 0.6},
    "tom":   {"name": "FLOOR", "s": L(G("tl", 2, 1, {"oh": 1.0, "front": 0.6, "wndw": 0.4})), "m": L(G("tl", 4, 1, {"oh": 1.0, "front": 0.6, "wndw": 0.4})),
              "h": L(G("tl", 5, 1, {"oh": 1.0, "front": 0.6, "wndw": 0.4})), "eq": [("hp", 40, .7, 0), ("highshelf", 6000, .7, -3)], "sat": 1.2, "len": 1.6, "fade": 0.8},
    "rim":   {"name": "PEDAL", "hat": 1, "s": L(G("hf", 1, 1, {"oh": 1.0, "wndw": 0.3})), "m": L(G("hf", 2, 1, {"oh": 1.0, "wndw": 0.3}), G("hf", 2, 2, {"oh": 1.0, "wndw": 0.3})),
              "h": L(G("hf", 3, 1, {"oh": 1.0, "wndw": 0.3})), "eq": [("hp", 250, .7, 0)], "len": 0.35, "fade": 0.18},
    "bell":  {"name": "CRASH", "s": L(B("crash", 3)), "m": L(B("crash", 4)), "h": L(B("crash", 5)),
              "eq": [("hp", 150, .7, 0), ("highshelf", 7000, .7, -4)], "sat": 1.15, "room": (ROOM_MED, -16, None), "len": 2.4, "fade": 1.6},
  }},
  # ── Y · hip-hop break: the same 1973-style kit through its "retro" microphone, the way a break sounds when it is
  #       sampled from an old record: squeezed, warm, a little dusty. Kick, snare, hats, cross-stick, a tom, a floor
  #       tom, and a crash (from Big Rusty Drums, through the same worn sound).
  "Y": {"dir": "break2", "was": "break", "pads": {
    "kick":  {"name": "KICK", "s": L(G("ks", 2, 1, {"retro": 1.0})), "m": L(G("ks", 4, 1, {"retro": 1.0}), G("ks", 4, 2, {"retro": 1.0})),
              "h": L(G("ks", 6, 1, {"retro": 1.0}), G("ks", 6, 2, {"retro": 1.0})),
              "eq": [("hp", 40, .7, 0), ("peak", 90, 1.0, 2), ("lp", 8500, .7, 0)], "comp": (-18, 3, 8, 100), "sat": 1.3, "len": 0.6, "fade": 0.3},
    "snare": {"name": "SNARE", "s": L(G("sc", 2, 1, {"retro": 1.0})), "m": L(G("sc", 4, 1, {"retro": 1.0}), G("sc", 4, 2, {"retro": 1.0})),
              "h": L(G("sc", 6, 1, {"retro": 1.0}), G("sc", 6, 2, {"retro": 1.0})),
              "eq": [("hp", 90, .7, 0), ("peak", 200, 1.0, 2), ("lp", 8500, .7, 0)], "comp": (-16, 3, 4, 90), "sat": 1.3, "len": 0.6, "fade": 0.3},
    "ch":    {"name": "HAT", "s": L(G("hc", 2, 1, {"retro": 1.0})), "m": L(G("hc", 3, 1, {"retro": 1.0}), G("hc", 3, 2, {"retro": 1.0})),
              "h": L(G("hc", 4, 1, {"retro": 1.0})), "eq": [("hp", 300, .7, 0), ("lp", 9000, .7, 0)], "len": 0.3, "fade": 0.15},
    "oh":    {"name": "OPEN", "s": L(G("hh", 2, 1, {"retro": 1.0})), "m": L(G("hh", 3, 1, {"retro": 1.0})), "h": L(G("hh", 4, 1, {"retro": 1.0})),
              "eq": [("hp", 300, .7, 0), ("lp", 9000, .7, 0)], "len": 0.9, "fade": 0.5},
    "clap":  {"name": "XSTICK", "s": L(G("ss", 2, 1, {"retro": 1.0})), "m": L(G("ss", 3, 1, {"retro": 1.0}), G("ss", 3, 2, {"retro": 1.0})),
              "h": L(G("ss", 4, 1, {"retro": 1.0})), "eq": [("hp", 150, .7, 0), ("lp", 9000, .7, 0)], "len": 0.4, "fade": 0.2},
    "tom":   {"name": "TOM", "s": L(G("tm", 2, 1, {"retro": 1.0})), "m": L(G("tm", 4, 1, {"retro": 1.0})), "h": L(G("tm", 5, 1, {"retro": 1.0})),
              "eq": [("hp", 60, .7, 0), ("lp", 8500, .7, 0)], "sat": 1.2, "len": 0.9, "fade": 0.45},
    "rim":   {"name": "FLOOR", "s": L(G("tl", 2, 1, {"retro": 1.0})), "m": L(G("tl", 4, 1, {"retro": 1.0})), "h": L(G("tl", 5, 1, {"retro": 1.0})),
              "eq": [("hp", 45, .7, 0), ("lp", 8500, .7, 0)], "sat": 1.2, "len": 1.2, "fade": 0.6},
    "bell":  {"name": "CRASH", "s": L(B("crash", 3)), "m": L(B("crash", 4)), "h": L(B("crash", 5)),
              "eq": [("hp", 200, .7, 0), ("lp", 8000, .7, 0)], "comp": (-14, 3, 3, 120), "sat": 1.3, "len": 2.0, "fade": 1.3},
  }},
}

# ---------- loudness through the machine (K-weighted momentary, era 1987, a normal hit), per pad ----------
# Rebuilt kits: the page-made kit's own level (measured before the change); closed hats on drum kits no quieter than -54.
# Kits J to O also keep the rule their tests set when they were made on the page: a normal hit peaks at 0.05 or more in
# the twelve-bit memory. A recording is less peaky than a page-made blip of the same loudness, so J's hats (-51, -46.7),
# K's hi-hat foot (-49) and O's roll (-43.3) sit 1 to 5 dB above their page-made level for it.
# New kits: kick and snare at kit A's level (-22.3, -35.2; kits P to T sit at -22.2, -33.5) and the rest like P to T.
TARGET = {
  "D": {"kick": -25.9, "snare": -37.4, "ch": -54.8, "oh": -43.1, "clap": -44.7, "tom": -28.8, "rim": -36.7, "bell": -30.6},
  "E": {"kick": -22.7, "snare": -35.6, "ch": -56.4, "oh": -46.5, "clap": -39.5, "tom": -24.6, "rim": -41.9, "bell": -42.7},
  "G": {"kick": -23.7, "snare": -37.6, "ch": -46.4, "oh": -44.6, "clap": -44.3, "tom": -26.7, "rim": -37.9, "bell": -28.7},
  "H": {"kick": -21.9, "snare": -30.0, "ch": -44.0, "oh": -49.4, "clap": -36.1, "tom": -26.6, "rim": -32.5, "bell": -31.7},
  "I": {"kick": -22.8, "snare": -33.7, "ch": -54.0, "oh": -47.5, "clap": -40.8, "tom": -23.1, "rim": -42.0, "bell": -31.3},
  "J": {"kick": -21.5, "snare": -32.9, "ch": -51.0, "oh": -46.7, "clap": -38.8, "tom": -22.7, "rim": -27.1, "bell": -28.8},
  "K": {"kick": -23.7, "snare": -42.3, "ch": -49.0, "oh": -35.4, "clap": -37.5, "tom": -26.3, "rim": -38.5, "bell": -23.5},
  # L: the page-made 909 kit's levels (calib.js, 2026-10-05: kick -19.9, snare -38.8, ch -67.2, oh -56.3, clap -38.3,
  # tom -25.3, ride -51.5); its nearly silent hats and quiet ride lifted, as on the other rebuilt kits, so a normal hit
  # still peaks at 0.05 or more in the 1987 memory
  "L": {"kick": -19.9, "snare": -38.8, "ch": -51.5, "oh": -45.5, "clap": -38.3, "tom": -25.3, "rim": -41.5, "bell": None},
  "M": {"kick": -21.9, "snare": -38.5, "ch": -54.0, "oh": -48.0, "clap": None, "tom": -26.6, "rim": -40.0, "bell": -41.4},
  "N": {"kick": -24.6, "snare": -38.3, "ch": -46.3, "oh": -48.9, "clap": -25.6, "tom": -28.3, "rim": -36.4, "bell": -32.6},
  "O": {"kick": -20.6, "snare": -40.8, "ch": -42.6, "oh": -35.4, "clap": -43.3, "tom": -26.9, "rim": -40.2, "bell": -26.5},
  "U": {"kick": -22.3, "snare": -34.5, "ch": -52.0, "oh": -46.0, "clap": -50.0, "tom": -26.0, "rim": -40.0, "bell": -31.0},
  "V": {"kick": -23.5, "snare": -37.0, "ch": -52.0, "oh": -46.0, "clap": -38.0, "tom": -27.0, "rim": -40.0, "bell": -40.0},
  "W": {"kick": -22.3, "snare": -34.0, "ch": -52.0, "oh": -46.0, "clap": -40.0, "tom": -26.0, "rim": -40.0, "bell": -31.0},
  "X": {"kick": -22.3, "snare": -34.0, "ch": -52.0, "oh": -46.0, "clap": -26.0, "tom": -26.0, "rim": -50.0, "bell": -31.0},
  "Y": {"kick": -22.3, "snare": -34.5, "ch": -52.0, "oh": -46.0, "clap": -40.0, "tom": -26.0, "rim": -26.0, "bell": -32.0},
}

# AOG-DRUM-STEREO-V1: pads that, once in stereo, measured louder through the machine than before (its 8.5 kHz filter
# chip, pads 3 to 8, kept more of a stereo cymbal or hat than of the old one-channel mix, whose low partials had
# partly cancelled). Each stereo file of the pad sits this many dB under the old file's level, so the pad plays as
# loud as before (calib.js, a normal hit, 1987; every other pad moved less than 0.5 dB).
STEREO_TRIM = {"D": {"bell": -1.7}, "M": {"ch": -0.6}, "N": {"ch": -0.8}, "U": {"clap": -0.6, "rim": -0.6}, "W": {"ch": -0.7}}
