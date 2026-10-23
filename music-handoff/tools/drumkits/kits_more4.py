"""AOG-DRUM-BARKER-V1 (2026-10-23) — two more kits. Jimmy asked for kits influenced by a favourite pop-punk / hip-hop
crossover drummer. On screen they go by their sound, never by a band or a player.

  PP  Pop-punk, fast and cracking   a snare tuned high, popping and dry with a short ring, a rimshot on the accent
                                    (Virtuosity Drums, CC0, its close snare microphone with a little of the overheads);
                                    a punchy 24" kick with its beater click brought up and its ring cut short, so fast
                                    eighths stay clear (Big Rusty Drums, CC0); tight crisp hi-hats, an open hi-hat, a
                                    stack (a china laid on a crash, struck together and choked short: made here from two
                                    real hits), a floor tom, a ride (its bell on an accent: pop-punk choruses ride the
                                    bell) and a crash (MuldjordKit, CC BY 4.0, credited); a small, tight room made here.
                                    Eight pads only: Jimmy chose the ride over the rack tom (2026-10-23). The floor tom
                                    sits in the tom slot and the ride in the rim slot, as in the punk and thrash kits, so
                                    the Drum Kit draws the ride as a cymbal.
  HL  Live hip-hop on a real kit    a real kit played like a breakbeat (Big Rusty Drums, CC0): a fat, round, open 24"
                                    kick; the deep 14x8 snare with its softest hits as ghost notes; tight hi-hats short
                                    enough for 16th and 32nd rolls; a half-open hi-hat; a stack (MuldjordKit's china on
                                    Big Rusty's crash); a tom; a flam (made here from two real snare hits, the soft one
                                    30 ms before the hard one, as two sticks land); a crash. A little tape drive and a
                                    parallel squash on the drums (made here, dsp.squash), a small room; no sampler grit,
                                    so it stays clearly a live kit.
Rooms, the stack's choke, the flam's timing, the punch and the squash are made here (dsp.py), never recorded.
"""
from kits import T, L, B, BR, BR_MICS, V, MAKE, ROOM_SMALL
from sources import brd


def M(inst, n, base=None):
    """MuldjordKit (FreePats version): samples/<inst>/<n>-<base>.flac, the higher n the harder the hit"""
    return T("muld:samples/%s/%d-%s.flac" % (inst, n, base or inst))


def MSRC(inst, n):
    return "muld:samples/%s/%d-%s.flac" % (inst, n, inst)


def STACK(china, crash, crash_src=None, g=0.55):
    """a stack: a china laid on a crash, struck together (both real hits, sounded at once; the choke is the pad's shape)"""
    return MAKE("stack", stack=[(MSRC("China", china), 1.0, 0), (crash_src or MSRC("CrashL", crash), g, 0)])


def FLAM(soft, hard, rr=1, gap_ms=30, g=0.45):
    """a flam made from two real hits of Big Rusty's snare: the soft grace note, then the main stroke gap_ms later,
    every microphone of each (the snare's own mix, kits.BR_MICS)"""
    st = []
    for mic, w in BR_MICS["snare"].items():
        st.append((brd(BR["snare"], soft, rr, mic), w * g, 0))
        st.append((brd(BR["snare"], hard, rr, mic), w, gap_ms))
    return MAKE("stack", stack=st)


def BRC(vl, rr):
    """Big Rusty's crash, its overhead microphone only (one recording, for the stack)"""
    return brd(BR["crash"], vl, rr, "oh")


PS = {"snaremic": 1.0, "oh": 0.45}         # PP's snare: the close microphone, a little of the overheads
PK_K = {"kick": 1.0, "oh": 0.45}           # PP's kick: the inside microphone, some overheads for the beater's click
HK = {"kick": 1.0, "oh": 0.35}             # HL's open kick
HH = {"cl": 1.0, "oh": 0.25}               # HL's tight hats: mostly the close microphone

MORE4 = {
  # ── PP · pop-punk, fast and cracking: a high popping snare, a clicky short kick, crisp hats, a stack ─────────────────
  "PP": {"dir": "poppunk", "pads": {
    "kick":  {"name": "KICK", "s": L(B("kick", 8, 1, PK_K), B("kick", 8, 2, PK_K)),
              "m": L(B("kick", 11, 1, PK_K), B("kick", 11, 2, PK_K), B("kick", 12, 1, PK_K)),
              "h": L(B("kick", 14, 1, PK_K), B("kick", 14, 2, PK_K)),
              "eq": [("hp", 40, .7, 0), ("peak", 68, 1.0, 2.5), ("peak", 380, 1.1, -6), ("peak", 3000, 0.7, 14), ("peak", 5500, 1.2, 5), ("highshelf", 9000, .7, -2)],
              "comp": (-18, 4, 4, 70), "shape": (0.08, 0.08), "len": 0.32, "fade": 0.1, "ceil": 0.6},
    "snare": {"name": "SNARE", "s": L(V("snare_center", 16, mics=PS), V("snare_center", 18, mics=PS)),
              "m": L(V("snare_center", 27, mics=PS), V("snare_center", 29, mics=PS), V("snare_center", 31, mics=PS)),
              "h": L(V("snare_rimshot", 11, mics=PS), V("snare_rimshot", 12, mics=PS)),
              "tune": 1.0, "eq": [("hp", 150, .7, 0), ("peak", 240, 1.0, 1.5), ("peak", 600, 1.2, -3), ("peak", 2600, 1.0, 2), ("highshelf", 6000, .7, 3)],
              "comp": (-16, 4, 2, 60), "punch": (3.0, 8.0), "room": (ROOM_SMALL, -17.0, None), "shape": (0.09, 0.06),
              "len": 0.38, "fade": 0.14, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(M("HihatClosed", 14), M("HihatClosed", 16)),
              "m": L(M("HihatClosed", 21), M("HihatClosed", 23), M("HihatClosed", 25)), "h": L(M("HihatClosed", 27), M("HihatClosed", 28)),
              "eq": [("hp", 450, .7, 0), ("highshelf", 8000, .7, 2.5)], "len": 0.13, "fade": 0.06},
    "oh":    {"name": "OPEN", "s": L(M("HihatOpen", 16)), "m": L(M("HihatOpen", 22), M("HihatOpen", 24)), "h": L(M("HihatOpen", 28), M("HihatOpen", 29)),
              "eq": [("hp", 400, .7, 0), ("highshelf", 8000, .7, 1)], "len": 0.8, "fade": 0.45},
    "clap":  {"name": "STACK", "s": L(STACK(5, 3)), "m": L(STACK(8, 5), STACK(9, 6)), "h": L(STACK(11, 8), STACK(12, 9)),
              "eq": [("hp", 350, .7, 0), ("peak", 3500, 1.0, 2)], "sat": 1.3, "shape": (0.05, 0.13), "len": 0.6, "fade": 0.25, "ceil": 0.6},
    "tom":   {"name": "FLOOR", "s": L(M("Tom4", 8), M("Tom4", 10)), "m": L(M("Tom4", 14), M("Tom4", 15)), "h": L(M("Tom4", 18), M("Tom4", 19)),
              "eq": [("hp", 50, .7, 0), ("peak", 90, 1.0, 2), ("peak", 400, 1.0, -4), ("peak", 4000, 1.0, 3)], "comp": (-16, 4, 4, 100),
              "punch": (3.0, 10.0), "room": (ROOM_SMALL, -18.0, None), "shape": (0.18, 0.18), "len": 0.7, "fade": 0.3, "ceil": 0.55},
    "rim":   {"name": "RIDE", "s": L(M("RideL", 3), M("RideL", 4)), "m": L(M("RideL", 6), M("RideL", 7)),
              "h": L(M("RideLBell", 2), M("RideLBell", 3)), "eq": [("hp", 250, .7, 0), ("highshelf", 8000, .7, 1)], "len": 1.6, "fade": 0.9},
    "bell":  {"name": "CRASH", "s": L(M("CrashL", 3)), "m": L(M("CrashL", 5), M("CrashL", 6)), "h": L(M("CrashL", 8), M("CrashL", 9)),
              "eq": [("hp", 250, .7, 0)], "len": 1.6, "fade": 0.9},
  }},
  # ── HL · live hip-hop on a real kit: a fat open kick, a deep snare with ghost notes, tight hats, tape and squash ───────
  "HL": {"dir": "hiphoplive", "pads": {
    "kick":  {"name": "KICK", "s": L(B("kickN", 3, 1, HK)), "m": L(B("kickN", 5, 1, HK), B("kickN", 5, 2, HK)),
              "h": L(B("kickN", 6, 1, HK), B("kickN", 6, 2, HK)),
              "eq": [("hp", 30, .7, 0), ("peak", 55, 1.0, 3.5), ("peak", 300, 1.0, -4), ("peak", 2200, 1.0, 1.5), ("lp", 10000, .7, 0)],
              "comp": (-20, 4, 12, 120), "squash": (-30, 8, -5), "sat": 1.4, "shape": (0.2, 0.18), "len": 0.65, "fade": 0.3, "ceil": 0.7},
    "snare": {"name": "SNARE", "s": L(B("snare", 1, 1), B("snare", 2, 1), B("snare", 2, 2)),
              "m": L(B("snare", 7, 1), B("snare", 7, 2)), "h": L(B("snare", 10, 1), B("snare", 10, 2)),
              "eq": [("hp", 90, .7, 0), ("peak", 200, 1.0, 3), ("peak", 800, 1.2, -2), ("peak", 5000, 1.0, 1.5)],
              "comp": (-20, 4, 4, 90), "squash": (-32, 10, -6), "sat": 1.4, "room": (ROOM_SMALL, -15.0, None),
              "soft": -10.0, "len": 0.5, "fade": 0.22, "ceil": 0.6},
    "ch":    {"name": "HAT", "s": L(B("hat_cl", 3, 1, HH), B("hat_cl", 3, 2, HH)),
              "m": L(B("hat_cl", 5, 1, HH), B("hat_cl", 5, 2, HH), B("hat_cl", 5, 3, HH)), "h": L(B("hat_cl", 6, 1, HH), B("hat_cl", 6, 2, HH)),
              "eq": [("hp", 400, .7, 0), ("highshelf", 7000, .7, -1)], "sat": 1.15, "shape": (0.03, 0.04), "len": 0.12, "fade": 0.05},
    "oh":    {"name": "OPEN", "s": L(B("hat_ho", 2)), "m": L(B("hat_ho", 3, 1), B("hat_ho", 3, 2)), "h": L(B("hat_ho", 4, 1), B("hat_ho", 4, 2)),
              "eq": [("hp", 300, .7, 0), ("highshelf", 7000, .7, -2)], "sat": 1.15, "len": 0.6, "fade": 0.35},
    "clap":  {"name": "STACK", "s": L(STACK(5, 0, BRC(3, 1), 0.5)), "m": L(STACK(8, 0, BRC(4, 1), 0.5), STACK(9, 0, BRC(4, 2), 0.5)),
              "h": L(STACK(11, 0, BRC(5, 1), 0.5), STACK(12, 0, BRC(5, 2), 0.5)),
              "eq": [("hp", 350, .7, 0), ("lp", 9000, .7, 0)], "sat": 1.4, "shape": (0.04, 0.1), "len": 0.5, "fade": 0.2, "ceil": 0.6},
    "tom":   {"name": "TOM", "s": L(B("tom15", 3, 1), B("tom15", 3, 2)), "m": L(B("tom15", 6, 1), B("tom15", 6, 2)), "h": L(B("tom15", 7, 1), B("tom15", 7, 2)),
              "eq": [("hp", 60, .7, 0), ("peak", 400, 1.0, -4), ("highshelf", 6000, .7, -1)], "comp": (-18, 3, 10, 120),
              "squash": (-30, 6, -8), "sat": 1.3, "shape": (0.25, 0.2), "len": 0.8, "fade": 0.35, "ceil": 0.55},
    "rim":   {"name": "FLAM", "s": L(FLAM(2, 5)), "m": L(FLAM(3, 7, 1), FLAM(3, 7, 2)), "h": L(FLAM(4, 10, 1), FLAM(4, 10, 2)),
              "eq": [("hp", 90, .7, 0), ("peak", 200, 1.0, 3), ("peak", 800, 1.2, -2), ("peak", 5000, 1.0, 1.5)],
              "comp": (-20, 4, 4, 90), "squash": (-32, 10, -6), "sat": 1.4, "room": (ROOM_SMALL, -15.0, None),
              "len": 0.55, "fade": 0.22, "ceil": 0.6},
    "bell":  {"name": "CRASH", "s": L(B("crash", 3)), "m": L(B("crash", 4, 1), B("crash", 4, 2)), "h": L(B("crash", 5, 1), B("crash", 5, 2)),
              "eq": [("hp", 180, .7, 0), ("highshelf", 8000, .7, -2)], "sat": 1.2, "len": 2.0, "fade": 1.2},
  }},
}

FILE_LU4 = {
  "PP": {"kick": -23.0, "snare": -32.0, "ch": -42.0, "oh": -41.0, "clap": -34.0, "tom": -27.0, "rim": -37.0, "bell": -31.0},
  "HL": {"kick": -22.5, "snare": -33.5, "ch": -44.0, "oh": -41.0, "clap": -35.0, "tom": -27.0, "rim": -33.5, "bell": -32.0},
}
