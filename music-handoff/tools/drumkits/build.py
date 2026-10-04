"""Build the recorded kits of AOG-DRUM-REAL-V2 (kits.py) into aog-deploy/audio/drums/<dir>/.

Each pad gets a soft, a normal and a hard layer (each its own recording), and a second take of the sounds a beat
uses most. Each sound: the microphones of one hit mixed to one channel, the quiet moment before the hit trimmed
(2 ms kept), shaped (kits.py), cut to its length with a gentle fade, brought to its loudness, and saved as a mono
96 kbps MP3 at 44,100 samples a second, like kits P to T.

Loudness: levels.json holds, per kit and pad, the K-weighted loudness of the normal layer's file. calibrate.py
measures each pad through the machine itself (calib.js) and moves that number until the pad sits at its TARGET.
Soft and hard layers sit `soft` / `hard` dB from the normal one (default -4 / +1.5). Every take of a layer is
made equally loud. Peaks: a soft knee keeps every file under CEIL (and the normal hit of kits D to O under 0.78,
so the 1987 memory never clips).

usage: python3 build.py [--only D,E] [--out <aog-deploy/audio/drums>] [--wav <folder>]
"""
import os, sys, json, subprocess, argparse
from concurrent.futures import ThreadPoolExecutor
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sources, dsp
from dsp import SR
from kits import KITS, TARGET

OUT = os.path.abspath(os.path.join(HERE, "..", "..", "..", "aog-deploy", "audio", "drums"))
LEVELS = os.path.join(HERE, "levels.json")
LAYER_DB = {"s": -4.0, "m": 0.0, "h": 1.5}
# the first guess of file loudness from engine loudness, by pad (from kits P to T): the filter chip on pads 3 to 8
# takes more from bright sounds
GUESS = {"kick": 0.0, "snare": 0.7, "ch": -9.0, "oh": -4.0, "clap": -2.0, "tom": -1.2, "rim": -2.5, "bell": -1.5}
PEAK_M, CEIL = 0.78, 0.92


def onset(x, thr_db=-40.0):
    pk = np.max(np.abs(x)) + 1e-12
    idx = np.nonzero(np.abs(x) >= pk * 10 ** (thr_db / 20))[0]
    return int(idx[0]) if len(idx) else 0


def from_hit(x, preroll_ms=2.0):
    o = onset(x)
    return x[max(0, o - int(SR * preroll_ms / 1000)):]


def mixed(parts):
    sig = None
    for src, w in parts:
        x = sources.load(src) * w
        if sig is None:
            sig = x.copy()
        else:
            n = max(len(sig), len(x)); y = np.zeros(n); y[:len(sig)] += sig; y[:len(x)] += x; sig = y
    return sig


# ---------- sounds built from several recordings ----------
def make_slice(t):
    """a slice of a long recording (a brush stirring, a roll): from `at` seconds, swelling in over `swell` ms"""
    x = sources.load(t["src"])
    a = int(t["at"] * SR); n = int((t["dur"] + 0.3) * SR)
    return dsp.fade_in(x[a:a + n], t.get("swell", 20))


def make_chord(t):
    """a chord on the Rhodes: each note its own recording, moved to its pitch, the four struck together"""
    y = np.zeros(1)
    for i, (f, semis) in enumerate(t["notes"]):
        x = from_hit(sources.load(sources_rhodes(f)))
        x = dsp.tune(x, semis)
        y = dsp.mix_at(y, x, 0.0015 * i)
    if t.get("bright"):
        y = dsp.eq(y, [("highshelf", 1500, .7, t["bright"])])
    return y


def sources_rhodes(f):
    return "gm:Discord GM/Melodic/005-Electric Piano 1/" + f


def make_chop(t):
    """a piano chord chopped short, as a reggae skank plays it: the keys let go after 90 ms"""
    y = np.zeros(1)
    for i, (src, semis) in enumerate(t["notes"]):
        x = from_hit(sources.load(src))[: int(0.6 * SR)]
        x = dsp.tune(x, semis)
        y = dsp.mix_at(y, x, 0.002 * i)
    n = len(y); tt = np.arange(n) / SR
    env = np.where(tt < 0.09, 1.0, np.exp(-(tt - 0.09) / 0.025))
    return y * env


def make_scratch(t):
    """a real voice on a record, moved by hand: forward and back ("baby"), once more forward ("baby2"),
    or one push ("chirp"). The voice is recorded; only the hand's motion is made here."""
    x = sources.load(t["src"])
    a = int(t["at"] * SR); seg = x[a:a + int(2.5 * SR)]
    def stroke(dur, peak):
        n = int(dur * SR); return peak * np.sin(np.linspace(0, np.pi, n)) ** 1.5
    moves = {"chirp": [(0.15, 2.3)], "baby": [(0.11, 2.4), (0.12, -2.0)], "baby2": [(0.1, 2.5), (0.11, -2.1), (0.1, 2.4)]}[t["moves"]]
    speed = np.concatenate([stroke(d, p) for d, p in moves] + [np.zeros(int(0.03 * SR))])
    # the needle starts 0.35 s into the note, so a pull back has something to play
    y = dsp.varispeed(seg, speed, start=int(0.35 * SR))
    return dsp.fade_in(y, 3)


MAKERS = {"slice": make_slice, "chord": make_chord, "chop": make_chop, "scratch": make_scratch}


def raw_take(t):
    if "make" in t:
        x = MAKERS[t["make"]](t)
    else:
        x = from_hit(mixed(t["parts"]))
    if t.get("tune"):
        x = dsp.tune(x, t["tune"])
    return x


def shape(pad, x):
    if pad.get("tune"):
        x = dsp.tune(x, pad["tune"])
    if pad.get("eq"):
        x = dsp.eq(x, pad["eq"])
    if pad.get("comp"):
        t, r, a, rl = pad["comp"]
        x = dsp.comp(x, dsp.peak_db(x) + t + 6, r, a, rl, 6.0)
    if pad.get("sat"):
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
        x = dsp.sat(x, pad["sat"])
    if pad.get("room"):
        spec, wet, crush = pad["room"]
        x = dsp.add_room(x, dsp.room_ir(**spec), wet, (dsp.peak_db(x) + crush[0], crush[1]) if crush else None)
    if pad.get("gate"):
        x = dsp.gate(x, *pad["gate"])
    if pad.get("echo"):
        gap, n, fb, lp = pad["echo"]
        x = dsp.echo(x, gap, n, fb, lp)
    if pad.get("shape"):
        x = dsp.env_shape(x, *pad["shape"])
    return dsp.cut(x, pad["len"], pad["fade"])


def safety(x, ceil):
    pk = np.max(np.abs(x))
    if pk <= ceil * 0.8:
        return x
    k = 0.8 * ceil
    y = x.copy(); m = np.abs(y) > k
    y[m] = np.sign(y[m]) * (k + (ceil - k) * np.tanh((np.abs(y[m]) - k) / (ceil - k)))
    return y


def write_mp3(x, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pcm = np.clip(x, -1, 1).astype(np.float32).tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "96k", "-ar", str(SR), "-ac", "1", "-map_metadata", "-1", path],
                   input=pcm, check=True)


def all_sources(kit):
    out = []
    for pad in kit["pads"].values():
        for lay in "smh":
            for t in pad.get(lay, []):
                if "parts" in t:
                    out += [s for s, _ in t["parts"]]
                if "src" in t:
                    out.append(t["src"])
                for n in t.get("notes", []):
                    out.append(n[0] if ":" in n[0] else sources_rhodes(n[0]))
    return sorted(set(out))


def levels():
    lv = json.load(open(LEVELS)) if os.path.exists(LEVELS) else {}
    for k, pads in TARGET.items():
        lv.setdefault(k, {})
        for p, tg in pads.items():
            if tg is not None and p not in lv[k]:
                lv[k][p] = round(tg - GUESS[p], 2)
    return lv


def build_kit(kid, out, lv, wav=None):
    kit = KITS[kid]
    d = os.path.join(out, kit["dir"])
    if os.path.isdir(d):
        for f in os.listdir(d):
            if f.endswith(".mp3"):
                os.remove(os.path.join(d, f))
    man, rep = {"dir": kit["dir"], "pads": {}}, []
    for pid, pad in kit["pads"].items():
        if pad.get("made"):
            man["pads"][pid] = {"name": pad["name"], "made": True}
            continue
        base = pad["name"].lower()
        target_m = lv[kid][pid]
        n = []
        for lay in "smh":
            takes = pad[lay]
            n.append(len(takes))
            off = pad.get("soft", LAYER_DB["s"]) if lay == "s" else pad.get("hard", LAYER_DB["h"]) if lay == "h" else 0.0
            for i, t in enumerate(takes):
                x = shape(pad, raw_take(t))
                x = x * 10 ** ((target_m + off - dsp.momentary(x)) / 20)
                x = safety(x, PEAK_M if (lay == "m" and kid < "P") else CEIL)
                nm = f"{base}-{lay}{i + 1 if len(takes) > 1 else ''}"
                write_mp3(x, os.path.join(d, nm + ".mp3"))
                if wav:
                    import scipy.io.wavfile as wf
                    os.makedirs(os.path.join(wav, kit["dir"]), exist_ok=True)
                    wf.write(os.path.join(wav, kit["dir"], nm + ".wav"), SR, x.astype(np.float32))
                rep.append(f"{kid} {pid:5s} {nm:12s} LU {dsp.momentary(x):6.1f} pk {dsp.peak_db(x):6.1f} len {len(x) / SR:.2f}s")
        man["pads"][pid] = {"name": pad["name"], "n": n}
        if pad.get("hat"):
            man["pads"][pid]["hat"] = 1
    size = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d) if f.endswith(".mp3"))
    man["bytes"] = size
    rep.append(f"{kid} {kit['dir']}: {sum(1 for f in os.listdir(d) if f.endswith('.mp3'))} files, {size / 1e6:.2f} MB")
    return kid, man, rep


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--out", default=OUT)
    ap.add_argument("--wav", default="")
    ap.add_argument("--jobs", type=int, default=3)
    a = ap.parse_args()
    only = [k for k in a.only.split(",") if k] or list(KITS)
    srcs = sorted(set(s for k in only for s in all_sources(KITS[k])))
    with ThreadPoolExecutor(8) as ex:          # fetch whatever is not on this machine yet
        list(ex.map(sources.path_of, srcs))
    lv = levels()
    json.dump(lv, open(LEVELS, "w"), indent=1, sort_keys=True)
    mpath = os.path.join(HERE, "manifest.json")
    man = json.load(open(mpath)) if os.path.exists(mpath) else {}
    with ThreadPoolExecutor(a.jobs) as ex:
        for kid, m, rep in ex.map(lambda k: build_kit(k, a.out, lv, a.wav or None), only):
            man[kid] = m
            print("\n".join(rep), flush=True)
    json.dump(man, open(mpath, "w"), indent=1, sort_keys=True)


if __name__ == "__main__":
    main()
