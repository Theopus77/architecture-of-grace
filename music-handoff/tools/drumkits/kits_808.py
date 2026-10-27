# AOG-DRUM-SHELF-V1 (2026-10-27) — Jimmy: "Let's get different types of bass, high hats, cymbals, closed hats, etc…".
# Kit BS · 808 bass, 8 kinds: the long, booming bass note of a TR-808 kick, the low end of trap and hip-hop. An 808 makes
# its sound electronically on the real machine too (as kits A, B, C and F), so these are made here, with math. No
# recording is borrowed; nothing to credit.
#
# Every 808 is tuned to C2 (65.4 Hz), the key of the Gospel Choir, so a pad's pitch knob moves it to any note. Each comes
# in three strengths (soft, normal, hard: a softer hit has less click and less grit), each as loud as the trap kit's own
# 808 boom (audio/drums/trap/boom-*.mp3, K-weighted, loudest 400 ms: -32.8, -28.8, -27.3 dB), so the kit plays at
# the trap kit's level (aog-drumkit.js: lvl "TR").
#
#   LONG   the classic: a quick drop into the note, then a long ring (2.2 s)
#   SHORT  the same, cut short (0.45 s), for fast bass lines
#   PUNCH  a hard click and a fast drop from high, then 1 s of ring
#   DIST   driven hard into distortion, so a phone's small speaker hears it
#   SUB    a pure, soft low note with no click: felt more than heard
#   SLIDE  starts a fifth above and slides down into the note (the trap glide)
#   GLIDE  starts a fourth below and rises into the note
#   WARM   round and warm: a little of its own octave and twelfth, the top rounded off
#
# Run:  python3 kits_808.py <aog-deploy/audio/drums>        Out: <that folder>/808s/<name>-<s|m|h>.mp3 (mono, 96 kbps)
import os, sys, subprocess, numpy as np
from scipy import signal
SR = 44100; F0 = 65.406                       # C2
OUT = os.path.join(sys.argv[1], "808s")
TARGET = {"s": -32.8, "m": -28.8, "h": -27.3}
rng = np.random.default_rng(808)

def tone(freq, secs):
    """a sine whose pitch follows freq(t) (an array), its phase carried along so it never clicks"""
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)

def env(secs, decay, hold=0.0, att=0.002):
    t = np.arange(int(secs * SR)) / SR
    e = np.minimum(1, t / att) * np.where(t < hold, 1.0, np.exp(-(t - hold) / decay))
    return e

def drop(secs, start_ratio, dur, to=F0):
    """from start_ratio times the note down (or up) to the note, eased over dur seconds"""
    t = np.arange(int(secs * SR)) / SR
    return to * (1 + (start_ratio - 1) * np.exp(-t / max(dur, 1e-4)))

def glide(secs, from_semis, dur):
    t = np.arange(int(secs * SR)) / SR; u = np.clip(t / dur, 0, 1); u = u * u * (3 - 2 * u)
    return F0 * 2 ** (from_semis * (1 - u) / 12)

def sat(x, drive):
    return np.tanh(drive * x) / np.tanh(drive) if drive > 0 else x

def click(secs, amount, bright=3000):
    n = int(secs * SR); c = np.zeros(n); k = int(0.004 * SR)
    b, a = signal.butter(2, bright / (SR / 2), "high"); c[:k] = signal.lfilter(b, a, rng.standard_normal(k)) * np.exp(-np.arange(k) / (0.0008 * SR))
    return c * amount

def make(name, layer):
    v = {"s": 0.0, "m": 0.5, "h": 1.0}[layer]          # how hard
    if name == "LONG":
        L = 2.4; x = tone(drop(L, 2.2, 0.012), L) * env(L, 0.55, hold=0.35); x = sat(x, 1.2 + 0.8 * v) + click(L, 0.05 + 0.1 * v)
    elif name == "SHORT":
        L = 0.6; x = tone(drop(L, 2.2, 0.012), L) * env(L, 0.11, hold=0.12); x = sat(x, 1.2 + 0.8 * v) + click(L, 0.05 + 0.1 * v)
    elif name == "PUNCH":
        L = 1.2; x = tone(drop(L, 6.0, 0.018), L) * env(L, 0.28, hold=0.12); x = sat(x, 1.8 + 1.5 * v) + click(L, 0.2 + 0.3 * v, 2000)
    elif name == "DIST":
        L = 1.8; x = tone(drop(L, 2.5, 0.015), L) * env(L, 0.45, hold=0.25)
        x = sat(x * (1 + 0.15 * np.sin(2 * np.pi * F0 * 2 * np.arange(len(x)) / SR)), 4.0 + 4.0 * v)
        b, a = signal.butter(2, 3500 / (SR / 2)); x = signal.lfilter(b, a, x) + click(L, 0.08 + 0.1 * v)
    elif name == "SUB":
        L = 2.0; x = tone(np.full(int(L * SR), F0), L) * env(L, 0.5, hold=0.3, att=0.006); x = sat(x, 0.6 + 0.4 * v)
    elif name == "SLIDE":
        L = 1.9; f = glide(L, 7, 0.26); x = tone(f, L) * env(L, 0.5, hold=0.35); x = sat(x, 1.4 + 1.0 * v) + click(L, 0.05 + 0.1 * v)
    elif name == "GLIDE":
        L = 1.9; f = glide(L, -5, 0.14); x = tone(f, L) * env(L, 0.5, hold=0.35); x = sat(x, 1.4 + 1.0 * v) + click(L, 0.05 + 0.1 * v)
    elif name == "WARM":
        L = 1.6; f = drop(L, 1.6, 0.02); ph = 2 * np.pi * np.cumsum(f) / SR
        x = (np.sin(ph) + 0.22 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)) * env(L, 0.4, hold=0.2, att=0.003)
        x = sat(x, 1.0 + 0.6 * v); b, a = signal.butter(2, 900 / (SR / 2)); x = signal.lfilter(b, a, x)
    fo = int(0.03 * SR); x[-fo:] *= np.linspace(1, 0, fo) ** 2
    return x

def kw(y):
    """how loud, as the site's tests hear it: a 60 Hz high-pass, +4 dB above 1.5 kHz, the loudest 400 ms (dB)"""
    def rbj(kind, f, q, db):
        A = 10 ** (db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q); c = np.cos(w)
        if kind == "hp": b = [(1 + c) / 2, -(1 + c), (1 + c) / 2]; a = [1 + al, -2 * c, 1 - al]
        else:
            sq = 2 * np.sqrt(A) * al
            b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]
            a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
        return np.array(b) / a[0], np.array(a) / a[0]
    for k in (("hp", 60, 0.5, 0), ("sh", 1500, 0.707, 4)): b, a = rbj(*k); y = signal.lfilter(b, a, y)
    n = int(0.4 * SR); q = np.concatenate([[0.0], np.cumsum(y * y)])
    return 10 * np.log10(np.max(q[n:] - q[:-n]) / n + 1e-12) if len(y) > n else 10 * np.log10(np.mean(y * y) + 1e-12)

os.makedirs(OUT, exist_ok=True)
for name in ("LONG", "SHORT", "PUNCH", "DIST", "SUB", "SLIDE", "GLIDE", "WARM"):
    row = []
    for layer in ("s", "m", "h"):
        x = make(name, layer); x *= 10 ** ((TARGET[layer] - kw(x)) / 20)
        pk = np.max(np.abs(x))
        if pk > 0.95: x *= 0.95 / pk
        path = os.path.join(OUT, "%s-%s.mp3" % (name.lower(), layer))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "96k", path],
                       input=x.astype(np.float32).tobytes(), check=True)
        row.append("%s %.1f dB pk %.2f" % (layer, kw(x), np.max(np.abs(x))))
    print("%-6s %s" % (name, " · ".join(row)))
