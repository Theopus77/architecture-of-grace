#!/usr/bin/env python3
"""THE STARTER CRATE — ten short original tracks for the turntables.

Everything here is made from scratch: sine waves and noise shaped into drums,
bass and chords, in the spirit of the drum machine's voices (music-drums.html).
No samples, no recordings, nothing borrowed.

Every track keeps an exact, steady tempo (each hit sits on a whole-sample grid
computed from the BPM), is built in 8-bar phrases, and starts on beat one:
  bars 1-4   drums only   (a clean place to set a cue and to count)
  bars 5-8   + bass
  bars 9+    + chords; the last bar of every 8 has a small fill
  (24-bar tracks) bars 17-20 a breakdown without the kick, bars 21-24 all in.

Run:   python3 make_crate.py            (needs numpy; lameenc for .mp3)
       pip install --target=pylib lameenc ; PYTHONPATH=pylib python3 make_crate.py
Out:   ../../audio/crate/*.mp3  and  ../../audio/crate/crate.json
"""
import json, math, os, sys
import numpy as np

SR = 22050
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "audio", "crate")
rng = np.random.default_rng(7)

def env(n, dec, att=0.002):
    t = np.arange(n) / SR
    a = np.minimum(1.0, t / att) if att > 0 else 1.0
    return a * np.exp(-t / dec)

def hp(x):   # a gentle high-pass: the difference of neighbours
    return np.concatenate([[0.0], np.diff(x)])

def noise(n):
    return rng.uniform(-1, 1, n)

def sweep(f0, f1, dur, n):
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def voice(name):
    n = int(SR * 0.9)
    if name == "kick":
        return 0.95 * sweep(96, 42, 0.05, n) * env(n, 0.16) + 0.25 * hp(noise(n)) * env(n, 0.004)
    if name == "snare":
        return 0.55 * hp(noise(n)) * env(n, 0.07) + 0.35 * sweep(230, 180, 0.05, n) * env(n, 0.05)
    if name == "ch":
        return 0.28 * hp(hp(noise(n))) * env(n, 0.018)
    if name == "oh":
        return 0.22 * hp(hp(noise(n))) * env(n, 0.12)
    if name == "shaker":
        return 0.16 * hp(hp(noise(n))) * env(n, 0.03, att=0.012)
    if name == "clap":
        x = np.zeros(n); b = hp(noise(n))
        for k, d in enumerate((0, 0.011, 0.022)):
            s = int(d * SR); e = int(0.009 * SR)
            x[s:s + e] += b[s:s + e] * (1 - k * 0.15)
        x += b * env(n, 0.09) * 0.6 * (np.arange(n) > int(0.03 * SR))
        return 0.5 * x
    if name == "rim":
        return 0.45 * sweep(1900, 1700, 0.01, n) * env(n, 0.012) + 0.2 * hp(noise(n)) * env(n, 0.006)
    if name == "tom":
        return 0.7 * sweep(170, 105, 0.08, n) * env(n, 0.2)
    if name == "tomhi":
        return 0.6 * sweep(240, 165, 0.08, n) * env(n, 0.16)
    if name == "bell":
        t = np.arange(n) / SR
        return 0.22 * (np.sin(2 * np.pi * 540 * t) + 0.7 * np.sin(2 * np.pi * 800 * t) + 0.3 * np.sin(2 * np.pi * 1320 * t)) * env(n, 0.22)
    raise KeyError(name)

VOICES = {v: voice(v) for v in ("kick", "snare", "ch", "oh", "shaker", "clap", "rim", "tom", "tomhi", "bell")}

def hz(semi):  # semitones above A1 (55 Hz)
    return 55.0 * 2 ** (semi / 12)

def bass_note(semi, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(semi)
    w = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)
    e = np.minimum(1, t / 0.006) * np.exp(-t / max(0.12, dur * 0.8))
    e[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return 0.5 * w * e

def chord(root, kind, dur, style):
    n = int(dur * SR); t = np.arange(n) / SR
    iv = {"maj": (0, 4, 7, 11), "min": (0, 3, 7, 10), "dom": (0, 4, 7, 10)}[kind]
    x = np.zeros(n)
    for i in iv:
        f = hz(root + 24 + i)
        x += np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.2)
    if style == "stab":
        e = np.minimum(1, t / 0.004) * np.exp(-t / 0.09)
    elif style == "pad":
        e = np.minimum(1, t / 0.25) * np.exp(-t / (dur * 1.5))
    else:  # keys
        e = np.minimum(1, t / 0.01) * np.exp(-t / 0.6)
    e[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR))
    return 0.07 * x * e

def P(s):  # "x...x..." -> hits; x = full, o = soft
    return [1.0 if c == "x" else 0.55 if c == "o" else 0.0 for c in s.replace(" ", "")]

FILL = {"snare": P("........ ..o.xoxx"), "kick": P("x....... ........")}

TRACKS = [
  dict(file="01-paper-kites", title="Paper Kites", title_es="Cometas de papel", bpm=90, style="Boom-bap", style_es="Boom-bap",
       swing=0.12, key=5, prog=[(0, "min"), (0, "min"), (5, "min"), (3, "maj")], chords="keys",
       drums={"kick": P("x......x ..x....."), "snare": P("....x... ....x..."), "ch": P("x.x.x.x. x.x.x.x.")},
       bass=P("x......x ..x.....")),
  dict(file="02-porch-light", title="Porch Light", title_es="Luz del porche", bpm=80, style="Slow jam", style_es="Balada lenta",
       swing=0.18, key=3, prog=[(0, "maj"), (5, "maj"), (2, "min"), (7, "dom")], chords="pad",
       drums={"kick": P("x.....x. ..x....."), "snare": P("....x... ....x..."), "shaker": P("x.xxx.xx x.xxx.xx"), "rim": P("........ ......o.")},
       bass=P("x.....x. ..x.....")),
  dict(file="03-island-morning", title="Island Morning", title_es="Mañana en la isla", bpm=84, style="Reggae one-drop", style_es="Reggae one-drop",
       swing=0.0, key=7, prog=[(0, "maj"), (5, "maj"), (0, "maj"), (7, "maj")], chords="stab",
       drums={"kick": P("........ x......."), "rim": P("........ x......."), "ch": P("x.x.x.x. x.x.x.x."), "oh": P("........ ......o.")},
       bass=P("x..x.... ..x.x..."), skank=P("....x... ....x...")),
  dict(file="04-sunday-clap", title="Sunday Clap", title_es="Aplauso del domingo", bpm=100, style="Clap-along", style_es="Para aplaudir",
       swing=0.0, key=0, prog=[(0, "maj"), (5, "maj"), (7, "maj"), (5, "maj")], chords="keys",
       drums={"kick": P("x.......x......."), "clap": P("....x.......x..."), "ch": P("x.x.x.x.x.x.x.x.")},
       bass=P("x.......x.......")),
  dict(file="05-practice-pair", title="Practice Pair", title_es="Pareja de práctica", bpm=102, style="Soul groove", style_es="Groove soul",
       swing=0.08, key=2, prog=[(0, "min"), (5, "dom"), (0, "min"), (5, "dom")], chords="keys",
       drums={"kick": P("x.....x.x......."), "snare": P("....x.......x..."), "ch": P("x.x.x.x.x.x.x.x."), "oh": P("..............o.")},
       bass=P("x.....x.x.....x.")),
  dict(file="06-brass-bus", title="Brass Bus", title_es="Autobús de metales", bpm=106, style="Funk", style_es="Funk",
       swing=0.0, key=10, prog=[(0, "dom"), (0, "dom"), (5, "dom"), (0, "dom")], chords="stab",
       drums={"kick": P("x.x...x...x..x.."), "snare": P("....x..o.o..x..."), "ch": P("xxxxxxxxxxxxxxxx")},
       bass=P("x.xx..x...x..xx."), skank=P("..x...x..x...x..")),
  dict(file="07-bell-garden", title="Bell Garden", title_es="Jardín de campanas", bpm=110, style="Bell and tom groove", style_es="Groove de campana y tom",
       swing=0.0, key=9, prog=[(0, "min"), (3, "maj"), (5, "min"), (3, "maj")], chords="pad",
       drums={"kick": P("x.......x......."), "bell": P("x..x..x...x.x..."), "tom": P("......x.......x."), "tomhi": P("...x.......x...."), "shaker": P("xxxxxxxxxxxxxxxx")},
       bass=P("x..x..x...x....."), ),
  dict(file="08-rooftop-break", title="Rooftop Break", title_es="Break en la azotea", bpm=114, style="Breakbeat", style_es="Breakbeat",
       swing=0.0, key=4, prog=[(0, "min"), (0, "min"), (3, "maj"), (5, "min")], chords="stab",
       drums={"kick": P("x.x.......xx...."), "snare": P("....x..x.x..x..."), "ch": P("x.x.x.x.x.x.x.x."), "oh": P("..o.......o.....")},
       bass=P("x.x.......x....."), skank=P("........x.......")),
  dict(file="09-blue-lamp", title="Blue Lamp", title_es="Lámpara azul", bpm=120, style="House", style_es="House",
       swing=0.0, key=6, prog=[(0, "min"), (0, "min"), (8, "maj"), (10, "maj")], chords="stab",
       drums={"kick": P("x...x...x...x..."), "clap": P("....x.......x..."), "ch": P("..x...x...x...x."), "shaker": P("xxxxxxxxxxxxxxxx")},
       bass=P("..x...x...x...x."), skank=P("...x.....x......")),
  dict(file="10-night-market", title="Night Market", title_es="Mercado de noche", bpm=124, style="House", style_es="House",
       swing=0.0, key=1, prog=[(0, "min"), (5, "min"), (8, "maj"), (7, "maj")], chords="pad",
       drums={"kick": P("x...x...x...x..."), "clap": P("....x.......x..."), "oh": P("..x...x...x...x."), "ch": P("x.xxx.xxx.xxx.xx")},
       bass=P("..x...x...x...xx")),
  dict(file="11-fast-lane", title="Fast Lane", title_es="Carril rápido", bpm=128, style="House", style_es="House",
       swing=0.0, key=11, prog=[(0, "min"), (3, "maj"), (10, "maj"), (5, "min")], chords="stab",
       drums={"kick": P("x...x...x...x..."), "snare": P("....x.......x..."), "ch": P("x.x.x.x.x.x.x.x."), "oh": P("..x...x...x...x.")},
       bass=P("..x.x.x...x.x.x."), skank=P("..x.....x.......")),
]

def place(buf, snd, at, gain):
    e = min(len(buf), at + len(snd))
    if at < len(buf):
        buf[at:e] += gain * snd[:e - at]

def render(T):
    bpm = T["bpm"]
    phrases = max(2, min(3, int(55 * bpm / 240 / 8)))
    bars = 8 * phrases
    beat = 60.0 / bpm
    step = beat / 4
    n = int(round(bars * 4 * beat * SR))
    mix = np.zeros(n + SR)
    def at(bar, s):
        sw = T["swing"] * step if s % 2 == 1 else 0.0
        return int(round((bar * 16 + s) * step * SR + sw * SR))
    for bar in range(bars):
        breakdown = phrases == 3 and 16 <= bar < 20
        fill = bar % 8 == 7 and bar > 0
        for v, pat in T["drums"].items():
            if breakdown and v == "kick":
                continue
            for s, g in enumerate(pat):
                if fill and v == "snare" and s >= 8:
                    continue
                if g:
                    place(mix, VOICES[v], at(bar, s), g)
        if fill:
            for s, g in enumerate(FILL["snare"]):
                if g and s >= 8:
                    place(mix, VOICES["snare"] if "snare" in T["drums"] else VOICES["clap"], at(bar, s), g * 0.8)
        root, kind = T["prog"][bar % 4]
        if bar >= 4:
            for s, g in enumerate(T["bass"]):
                if g:
                    nxt = next((k for k in range(s + 1, 16) if T["bass"][k]), 16)
                    semi = T["key"] + root + (12 if (s % 8 == 7 and T["bpm"] > 100) else 0)
                    place(mix, bass_note(semi, (nxt - s) * step * 0.92), at(bar, s), 0.9 * g)
        if bar >= 8:
            if T.get("skank"):
                for s, g in enumerate(T["skank"]):
                    if g:
                        place(mix, chord(T["key"] + root, kind, step * 1.6, "stab"), at(bar, s), 1.0)
            elif T["chords"] == "pad":
                place(mix, chord(T["key"] + root, kind, 4 * beat, "pad"), at(bar, 0), 1.0)
            else:
                for s in (0, 6, 10):
                    place(mix, chord(T["key"] + root, kind, 3 * step, "keys"), at(bar, s), 0.8)
    mix = mix[:n]
    mix = np.tanh(1.1 * mix / (np.max(np.abs(mix)) + 1e-9)) * 0.89 / math.tanh(1.1)
    mix[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    return mix, bars

def encode(pcm, path):
    data = (np.clip(pcm, -1, 1) * 32767).astype("<i2").tobytes()
    try:
        import lameenc
        e = lameenc.Encoder(); e.set_bit_rate(64); e.set_in_sample_rate(SR)
        e.set_channels(1); e.set_quality(2)
        with open(path + ".mp3", "wb") as f:
            f.write(e.encode(data) + e.flush())
        return path + ".mp3"
    except ImportError:
        import wave
        with wave.open(path + ".wav", "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)
        return path + ".wav"

def main():
    os.makedirs(OUT, exist_ok=True)
    listing = []
    for T in TRACKS:
        pcm, bars = render(T)
        p = encode(pcm, os.path.join(OUT, T["file"]))
        size = os.path.getsize(p)
        sec = len(pcm) / SR
        listing.append(dict(file=os.path.basename(p), title=T["title"], title_es=T["title_es"], bpm=T["bpm"],
                            style=T["style"], style_es=T["style_es"], bars=bars, seconds=round(sec, 1), bytes=size))
        print(f'{os.path.basename(p):24s} {T["bpm"]:4d} BPM  {bars} bars  {sec:5.1f}s  {size/1024:6.0f} KB  {T["style"]}')
    # the scripture records (KJV readings from LibriVox, cut by _work/scripture/build.py) stay in the crate
    sp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripture", "scripture.json")
    if os.path.exists(sp):
        with open(sp) as f: listing += json.load(f)
    # and FDR's speeches (_work/fdr/fdrbuild.py)
    fp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fdr", "fdr.json")
    if os.path.exists(fp):
        with open(fp) as f: listing += json.load(f)
    # and JFK's and Reagan's speeches (_work/speeches/build.py)
    jp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "speeches", "speeches.json")
    if os.path.exists(jp):
        with open(jp) as f: listing += json.load(f)
    # and the famous voices read by LibriVox volunteers (_work/voices/build.py)
    vp = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "voices", "voices.json")
    if os.path.exists(vp):
        with open(vp) as f: listing += json.load(f)
    with open(os.path.join(OUT, "crate.json"), "w") as f:
        json.dump(listing, f, ensure_ascii=False, indent=1)
    print("total", round(sum(x["bytes"] for x in listing) / 1048576, 2), "MB")

if __name__ == "__main__":
    main()
