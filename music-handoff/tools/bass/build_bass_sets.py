#!/usr/bin/env python3
# The recorded basses (AOG-REALBASS-V1): two sample sets in the shared string format
# (aog-deploy/audio/bass/<set>/set.json and its mono MP3s), made from free CC0 recordings.
#
#   growly   Growlybass by Karoryfer Samples: a Squier Jazz Bass with roundwound strings, recorded direct. Held notes
#            in two layers, short (staccato) notes, release noises and pick scrapes. The held notes are played with
#            the fingers, not a pick (measured): the first edge of each note rises over 0.8-1.5 ms (a pick lets go in
#            well under 0.2 ms), and the first 3 ms carry almost nothing above 4 kHz (-35 to -50 dB of their energy,
#            where a pick's click would be); the brightness of the loud layers comes later, in bursts once a cycle,
#            from the string slapping the frets. The pick only appears in the scrapes.
#   upright  A 1958 Otto Rubner double bass, plucked (pizzicato), by D. Smolken. The library has a note every 3 or 4
#            semitones; the four 4-semitone gaps are filled from Meatbass (Karoryfer Samples), the same bass and player
#            recorded in 2016, brightened to sit with the notes around them. Release noises: the player's string mutes.
#
# What every file gets (the format the engine helper and this tool share):
#   mono MP3, 44,100 Hz, 128 kbps; it starts 0.5 ms before the pluck (the lead-in faded up from silence), keeps its
#   natural decay up to 6 s (it ends earlier only once the note has died 60 dB under its loudest moment) and ends
#   with a 30 ms fade. Within a layer every note is brought to one loudness (K-weighted, loudest 400 ms); each layer
#   sits at the average loudness its notes were recorded at, so the steps between layers are the player's own.
#   Pitch is not changed: each zone's "c" is its measured offset (YIN over the steady part, as the checker does).
#
# Usage (needs ffmpeg with libmp3lame, numpy, scipy):
#   git clone --depth 1 https://github.com/sfzinstruments/karoryfer.growlybass     (and dsmolken.double-bass,
#   git clone --depth 1 https://github.com/sfzinstruments/karoryfer.meatbass)       into one folder, then
#   python3 build_bass_sets.py --libs <that folder> --out aog-deploy/audio/bass [--only growly|upright]
# Check the result with:  node music-handoff/tests/strings/bassets.js
import argparse, json, math, os, re, subprocess, sys
import numpy as np
from scipy.signal import lfilter
from scipy.interpolate import CubicSpline

SR = 44100
PRE = 22                      # lead-in before the pluck: 0.5 ms
FADE = int(0.030 * SR)        # the fade at the end
MAXLEN = 6.0                  # seconds, lead-in included
END_DB = -60.0                # a note has died away when its 50 ms level is this far under its loudest 50 ms
PEAK_MAX_DB = -1.0            # no sample louder than this before encoding (MP3 can overshoot a little)
NAMES = {'c': 0, 'db': 1, 'd': 2, 'eb': 3, 'e': 4, 'f': 5, 'gb': 6, 'g': 7, 'ab': 8, 'a': 9, 'bb': 10, 'b': 11}


# ---------------------------------------------------------------- audio in and out
def load(path):
    info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=channels', '-of', 'json', path],
                                     capture_output=True, text=True, check=True).stdout)
    ch = int(info['streams'][0]['channels'])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-acodec', 'pcm_f32le', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype='<f4').astype(np.float64).reshape(-1, ch)
    return x.mean(axis=1)


def encode(x, path):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                    '-codec:a', 'libmp3lame', '-b:a', '128k', '-ar', str(SR), '-ac', '1',
                    '-map_metadata', '-1', '-id3v2_version', '0', path],
                   input=x.astype('<f4').tobytes(), check=True)


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-acodec', 'pcm_f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


# ---------------------------------------------------------------- the measures (bassets.js does the same)
def onset(x):
    """The pluck: the first sample within 40 dB of the file's loudest sample."""
    a = np.abs(x)
    return int(np.argmax(a >= a.max() * 10 ** (-40 / 20)))


def k_coeffs(sr=SR):
    """BS.1770 K-weighting at any rate (the 48 kHz filters re-derived, as libebur128 does)."""
    f0, G, Q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    K = math.tan(math.pi * f0 / sr)
    Vh, a0 = 10 ** (G / 20.0), 1.0 + K / Q + K * K
    Vb = Vh ** 0.4996667741545416
    pb = [(Vh + Vb * K / Q + K * K) / a0, 2.0 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]
    pa = [1.0, 2.0 * (K * K - 1.0) / a0, (1.0 - K / Q + K * K) / a0]
    f0, Q = 38.13547087602444, 0.5003270373238773
    K = math.tan(math.pi * f0 / sr)
    d = 1.0 + K / Q + K * K
    return pb, pa, [1.0, -2.0, 1.0], [1.0, 2.0 * (K * K - 1.0) / d, (1.0 - K / Q + K * K) / d]


def loud400(x):
    """Loudness of the loudest 400 ms, K-weighted (LUFS scale), 10 ms steps."""
    pb, pa, rb, ra = k_coeffs()
    y = lfilter(rb, ra, lfilter(pb, pa, x)) ** 2
    n = int(0.4 * SR)
    if len(y) < n:
        y = np.concatenate([y, np.zeros(n - len(y))])
    c = np.concatenate([[0.0], np.cumsum(y)])
    st = np.arange(0, len(y) - n + 1, int(0.01 * SR))
    return -0.691 + 10 * np.log10(((c[st + n] - c[st]) / n).max() + 1e-20)


def rbj_lowpass(fc):
    w = 2 * math.pi * fc / SR
    al = math.sin(w) / (2 * (1 / math.sqrt(2)))
    cw = math.cos(w)
    b = np.array([(1 - cw) / 2, 1 - cw, (1 - cw) / 2]) / (1 + al)
    a = np.array([1.0, -2 * cw / (1 + al), (1 - al) / (1 + al)])
    return b, a


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


STEADY = {'sus': (0.3, 2.0, 30.0), 'stac': (0.04, 0.4, 15.0)}   # from, at most to, ends when the level drops this far


def steady_end(x, on, ta, tmax, drop):
    w = int(0.02 * SR)
    n = (len(x) - on) // w
    e = np.array([np.sqrt(np.mean(x[on + k * w:on + (k + 1) * w] ** 2)) for k in range(n)])
    edb = 20 * np.log10(e + 1e-12)
    top = edb.max()
    for k in range(int(round(ta / 0.02)), n):
        if edb[k] < top - drop:
            return min(k * 0.02, tmax)
    return min(n * 0.02, tmax)


def yin_frame(fr, W, tmin, tmax):
    """YIN on one frame: difference function over W samples, cumulative-mean normalised, threshold 0.15, parabolic."""
    x = fr - fr.mean()
    c = np.concatenate([[0.0], np.cumsum(x * x)])
    N = 1 << int(math.ceil(math.log2(len(x) + W)))
    r = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(x[:W][::-1], N), N)[W - 1:W + tmax]
    d = (c[W] - c[0]) + (c[np.arange(tmax + 1) + W] - c[np.arange(tmax + 1)]) - 2 * r
    d[0] = 0.0
    cm = np.cumsum(d[1:])
    dp = np.ones(tmax + 1)
    dp[1:] = d[1:] * np.arange(1, tmax + 1) / np.maximum(cm, 1e-30)
    t = -1
    for k in range(max(tmin, 2), tmax):
        if dp[k] < 0.15:
            while k + 1 < tmax and dp[k + 1] < dp[k]:
                k += 1
            t = k
            break
    if t < 0:
        t = max(tmin, 2) + int(np.argmin(dp[max(tmin, 2):tmax]))
    den = d[t - 1] - 2 * d[t] + d[t + 1]
    off = 0.5 * (d[t - 1] - d[t + 1]) / den if den != 0 else 0.0
    return SR / (t + off), dp[t]


def pitch_cents(x, m, kind):
    """Cents off MIDI note m over the steady part (sus 0.3-2 s, stac 0.04-0.4 s, ending early when the note dies),
    YIN after a low-pass at 6x the note (capped at 4 kHz), 10 ms steps, the median of the clear frames."""
    on = onset(x)
    f0 = midi_hz(m)
    b, a = rbj_lowpass(min(6 * f0, 4000.0))
    y = lfilter(b, a, x)
    ta, tm, drop = STEADY[kind]
    tb = steady_end(x, on, ta, tm, drop)
    fmin, fmax = f0 * 2 ** (-4 / 12), f0 * 2 ** (4 / 12)
    tmax, tmin, W = int(math.ceil(SR / fmin)), int(math.floor(SR / fmax)), int(math.ceil(2.5 * SR / fmin))
    res = []
    s, last = on + int(round(ta * SR)), on + int(round(tb * SR))
    while s <= last and s + W + tmax + 1 <= len(y):
        res.append(yin_frame(y[s:s + W + tmax + 1], W, tmin, tmax))
        s += int(0.01 * SR)
    good = [f for f, ap in res if ap < 0.2]
    if len(good) < 5:
        good = [f for f, ap in sorted(res, key=lambda r: r[1])[:5] if ap < 0.5]
    if not good:
        return float('nan'), 0, []
    cents = [1200 * math.log2(f / f0) for f in good]
    return float(np.median(cents)), len(good), cents


# ---------------------------------------------------------------- repair and shaping
def clipped_runs(x):
    """Runs of 2 or more samples stuck at the file's peak (the recorder clipped them flat)."""
    a = np.abs(x)
    lev = a.max()
    m = a >= lev * 0.9995
    runs, i = [], 0
    while i < len(x):
        if m[i]:
            j = i
            while j + 1 < len(x) and m[j + 1] and np.sign(x[j + 1]) == np.sign(x[i]):
                j += 1
            if j > i:
                runs.append((i, j))
            i = j + 1
        else:
            i += 1
    return runs, lev


def _ar_fill(x, i, j, p=40, ctx=400):
    lo, hi = max(0, i - ctx), min(len(x), j + 1 + ctx)
    seg = x[lo:hi]
    miss = np.zeros(len(seg), bool)
    miss[i - lo:j + 1 - lo] = True
    good = seg[~miss] - seg[~miss].mean()
    r = np.correlate(good, good, 'full')[len(good) - 1:len(good) + p]
    R = np.array([[r[abs(u - v)] for v in range(p)] for u in range(p)]) + np.eye(p) * r[0] * 1e-6
    a = np.concatenate([[1.0], -np.linalg.solve(R, r[1:p + 1])])
    n = len(seg)
    A = np.zeros((n - p, n))
    for k in range(n - p):
        A[k, k:k + p + 1] = a[::-1]
    sm, *_ = np.linalg.lstsq(A[:, miss], -A[:, ~miss] @ seg[~miss], rcond=None)
    return sm


def declip(x):
    """Rebuild flat-topped (clipped) peaks: short runs (up to 12 samples) by least-squares AR interpolation, longer
    ones by a cubic spline through 8 good samples on each side (the better method for each length, measured by
    clipping clean notes on purpose). The rebuilt wave is never inside the clip level, nor more than twice it."""
    runs, lev = clipped_runs(x)
    y = x.copy()
    for i, j in runs:
        s = np.sign(x[i])
        seg = None
        if j - i + 1 <= 12:
            try:
                seg = _ar_fill(y, i, j)
                if np.abs(seg).max() > 2 * lev:
                    seg = None
            except np.linalg.LinAlgError:
                seg = None
        if seg is None:
            idx = np.r_[max(0, i - 8):i, j + 1:min(len(x), j + 9)]
            seg = CubicSpline(idx, y[idx])(np.arange(i, j + 1))
        y[i:j + 1] = s * np.clip(np.abs(seg), lev, 2 * lev)
    return y, runs


def peaking(fc, gain_db, q=1.41):
    A = 10 ** (gain_db / 40)
    w = 2 * math.pi * fc / SR
    al = math.sin(w) / (2 * q)
    cw = math.cos(w)
    b = np.array([1 + al * A, -2 * cw, 1 - al * A])
    a = np.array([1 + al / A, -2 * cw, 1 - al / A])
    return b / a[0], a / a[0]


def lowshelf(fc, gain_db):
    A = 10 ** (gain_db / 40)
    w = 2 * math.pi * fc / SR
    al = math.sin(w) / (2 * (1 / math.sqrt(2)))
    cw = math.cos(w)
    sq = 2 * math.sqrt(A) * al
    b = np.array([A * ((A + 1) - (A - 1) * cw + sq), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - sq)])
    a = np.array([(A + 1) + (A - 1) * cw + sq, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - sq])
    return b / a[0], a / a[0]


def highpass(fc):
    w = 2 * math.pi * fc / SR
    al = math.sin(w) / (2 * (1 / math.sqrt(2)))
    cw = math.cos(w)
    b = np.array([(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]) / (1 + al)
    a = np.array([1.0, -2 * cw / (1 + al), (1 - al) / (1 + al)])
    return b, a


THIRDS = 1000 * 2 ** (np.arange(-15, 14) / 3.0)     # 1/3-octave centres, 31 Hz to 20 kHz
EQ_CENTRES = [250, 500, 1000, 2000, 4000]


WINDOWS = {'attack': (0.0, 0.1), 'ring': (0.3, 1.0)}   # seconds after the pluck


def _spectrum(x, t0, t1):
    on = onset(x)
    y = x[on + int(t0 * SR):on + int(t1 * SR)]
    N = 1 << 17
    return np.fft.rfftfreq(N, 1 / SR), np.abs(np.fft.rfft(y * np.hanning(len(y)), N)) ** 2


def third_octaves(x, t0, t1):
    """1/3-octave levels (dB) of a stretch of a note, relative to that stretch's whole energy (its tone, not its level)."""
    f, S = _spectrum(x, t0, t1)
    tot = S[f > 25].sum()
    return np.array([10 * np.log10(S[(f >= c * 2 ** (-1 / 6)) & (f < c * 2 ** (1 / 6))].sum() / tot + 1e-20) for c in THIRDS])


def mid_share(xs, t0, t1):
    """How much of a stretch's energy lies between 400 Hz and 3 kHz (dB), averaged over takes: the brightness."""
    out = []
    for x in xs:
        f, S = _spectrum(x, t0, t1)
        out.append(10 * np.log10(S[(f > 400) & (f < 3000)].sum() / S[f > 25].sum()))
    return float(np.mean(out))


def match_eq(fill, neighbours):
    """Octave-spaced peaking filters (250 Hz to 4 kHz) that bring a fill note's tone (1/3-octave balance) toward the
    notes on either side. Fitted from 200 Hz to 6.3 kHz: below that each note's own fundamental rules, above it there
    is little but hiss. Gains are solved by least squares on a 1.7-octave smoothed difference, within +/-8 dB."""
    diff = np.mean(neighbours, axis=0) - np.mean(fill, axis=0)
    sm = np.convolve(np.pad(diff, 2, mode='edge'), np.ones(5) / 5, mode='valid')
    use = (THIRDS >= 198) & (THIRDS <= 6400)
    target = sm[use] - np.mean(sm[use])            # tone only: loudness is matched afterwards
    freqs = THIRDS[use]
    from scipy.signal import freqz
    basis = []
    for fc in EQ_CENTRES:
        b, a = peaking(fc, 6.0)
        _, h = freqz(b, a, worN=freqs, fs=SR)
        basis.append(20 * np.log10(np.abs(h)) / 6.0)
    B = np.array(basis).T
    g, *_ = np.linalg.lstsq(B, target, rcond=None)
    for _ in range(3):                               # refine: the peaking shapes do not add exactly
        resp = np.zeros(len(freqs))
        for fc, gg in zip(EQ_CENTRES, g):
            b, a = peaking(fc, float(np.clip(gg, -8, 8)))
            _, h = freqz(b, a, worN=freqs, fs=SR)
            resp += 20 * np.log10(np.abs(h))
        g = g + np.linalg.lstsq(B, target - resp, rcond=None)[0] * 0.8
    return [(fc, float(np.clip(gg, -8, 8))) for fc, gg in zip(EQ_CENTRES, g)]


def apply_eq(x, bands):
    y = x
    for fc, gdb in bands:
        b, a = peaking(fc, gdb)
        y = lfilter(b, a, y)
    return y


def match_fill(fills, refs, f0):
    """Bring a Meatbass note's tone to the Smolken notes around it, its attack (first 0.1 s) and its ring (0.3-1 s)
    each on their own: per stretch, the 250 Hz-4 kHz balance (match_eq) and a low shelf under the third harmonic
    that sets how much of the note is its fundamental, solved so the 400 Hz-3 kHz share lands on the neighbours'.
    The attack's correction holds for 60 ms, then hands over to the ring's by 250 ms."""
    hpf = highpass(0.55 * f0)                  # Meatbass carries a low rumble under the note; Smolken's does not
    raw = [lfilter(*hpf, x) for x in fills]
    fc = 2.5 * f0
    stages, report = {}, {}
    for name, (t0, t1) in WINDOWS.items():
        bands = match_eq([third_octaves(x, t0, t1) for x in raw], [third_octaves(x, t0, t1) for x in refs])
        shaped = [apply_eq(x, bands) for x in raw]
        want = mid_share(refs, t0, t1)

        def share_at(g):
            return mid_share([lfilter(*lowshelf(fc, g), x) for x in shaped], t0, t1)
        lo_g, hi_g = -10.0, 6.0               # the share falls as the shelf rises
        if share_at(lo_g) <= want:
            g = lo_g
        elif share_at(hi_g) >= want:
            g = hi_g
        else:
            for _ in range(24):
                mid_g = (lo_g + hi_g) / 2
                if share_at(mid_g) > want:
                    lo_g = mid_g
                else:
                    hi_g = mid_g
            g = (lo_g + hi_g) / 2
        stages[name] = (bands, round(g, 2))
        report[name] = (mid_share(raw, t0, t1), want)
    outs = []
    for x in raw:
        xa = lfilter(*lowshelf(fc, stages['attack'][1]), apply_eq(x, stages['attack'][0]))
        xr = lfilter(*lowshelf(fc, stages['ring'][1]), apply_eq(x, stages['ring'][0]))
        t = (np.arange(len(x)) - onset(x)) / SR
        w = np.clip((t - 0.06) / 0.19, 0.0, 1.0)
        w = 0.5 - 0.5 * np.cos(np.pi * w)
        outs.append(xa * (1 - w) + xr * w)
    for name, (t0, t1) in WINDOWS.items():
        report[name] = report[name] + (mid_share(outs, t0, t1),)
    return outs, stages, report, fc


def natural_end(y):
    w = int(0.05 * SR)
    n = len(y) // w
    if n < 2:
        return len(y)
    e = np.array([np.sqrt(np.mean(y[k * w:(k + 1) * w] ** 2)) for k in range(n)])
    alive = np.nonzero(e >= e.max() * 10 ** (END_DB / 20))[0]
    if alive[-1] == n - 1:          # still sounding at the end of the recording: keep all of it
        return len(y)
    return min(len(y), (alive[-1] + 1) * w + FADE)


def shape(x, maxlen=MAXLEN):
    """Start 0.5 ms before the pluck (faded up from silence), keep the natural decay up to maxlen, fade the last 30 ms."""
    on = onset(x)
    if on >= PRE:
        y = x[on - PRE:].copy()
    else:
        y = np.concatenate([np.zeros(PRE - on), x])
    y[:PRE] *= 0.5 - 0.5 * np.cos(np.pi * np.arange(PRE) / PRE)
    n = min(natural_end(y), int(maxlen * SR), len(y))
    y = y[:n].copy()
    y[-FADE:] *= 0.5 + 0.5 * np.cos(np.pi * np.arange(1, FADE + 1) / FADE)
    return y


# ---------------------------------------------------------------- what goes in each set
def label_midi(name):
    m = re.match(r'([a-g]b?)(\d)', name)
    return NAMES[m.group(1)] + 12 * (int(m.group(2)) + 1)


# Growlybass names its notes an octave above where they sound ("e2" is the open low E, MIDI 28: measured).
# String and fret: the library does not say, so they were measured. A string's overtones run a little sharp
# (f_n = n f0 sqrt(1 + B n^2)); on one string B grows by 2^(fret/6) as the speaking length shrinks, and a thicker string
# has a larger B. log2(B) - midi/6 then sits at one height per string: held notes -18.25 (E), -19.65 (A), -21.05 (D),
# -22.35 (G), each note's takes within 0.1 of their string and a factor 2.5-2.7 (in B) from the next one.
GROWLY_NOTES = [  # name, sounding MIDI, string, fret
    ('e2', 28, 0, 0), ('gb2', 30, 0, 2), ('a2', 33, 0, 5), ('c3', 36, 0, 8), ('eb3', 39, 0, 11),
    ('gb3', 42, 1, 9), ('a3', 45, 1, 12), ('c4', 48, 2, 10), ('eb4', 51, 2, 13), ('gb4', 54, 3, 11), ('a4', 57, 3, 14)]
# The staccato notes are stopped after 0.1-0.25 s: from D#2 up their overtones put them on the same strings as the
# held notes; E1 and F#1 can only be on the E string; A1 and C2 ring too briefly to tell (null).
STAC_STRING = {28: 0, 30: 0, 33: None, 36: None, 39: 0, 42: 1, 45: 1, 48: 2, 51: 2, 54: 3, 57: 3}
GROWLY_LAYERS = [('p', 1), ('f', 2)]      # the library's p (velocity 61-95) and f (96-120)
GROWLY_RELEASE = ['a4_rel_rr1', 'a4_rel_rr2', 'a4_rel_rr3', 'a4_rel_rr4', 'a4_rel_rr5']   # the least ringing
GROWLY_SCRAPES = ['scrape_1_rr1', 'scrape_2_rr1', 'scrape_3_rr1', 'scrape_4_rr1']
GROWLY_RELEASE_G = round(10 ** (-4 / 20), 3)   # the library plays its releases 4 dB down

# The double bass (D. Smolken names notes as they sound). "meat": the in-between notes from Meatbass.
UPRIGHT_NOTES = [  # name, MIDI, library
    ('eb1', 27, 'dsm'), ('gb1', 30, 'meat'), ('g1', 31, 'dsm'), ('bb1', 34, 'dsm'), ('c2', 36, 'meat'),
    ('d2', 38, 'dsm'), ('f2', 41, 'dsm'), ('gb2', 42, 'meat'), ('a2', 45, 'dsm'), ('c3', 48, 'dsm'),
    ('eb3', 51, 'meat'), ('e3', 52, 'dsm'), ('g3', 55, 'dsm'), ('a3', 57, 'dsm')]
UPRIGHT_LAYERS = [('m', '3', 1), ('f', '4', 2)]   # Smolken's m and f; Meatbass's layers 3 and 4
OPEN_STRINGS = (24, 31, 38, 45)                   # C1 G1 D2 A2: the double bass is tuned in fifths
UPRIGHT_RELEASE = ['mute_d', 'mute_d2', 'mute_g4', 'mute_a', 'mute_g3']   # the player stopping a string: least ringing
UPRIGHT_RELEASE_G = round(10 ** (-12 / 20), 3)  # they are played as hard as a note; as a release they sit 12 dB down


def rr_needed(m):
    return 2 if m <= 45 else 1      # two takes in the low and middle range, one up high (size)


def pick(cands, n, kind, m):
    """Choose n takes: typical loudness and pitch for the note, a steady pitch, nothing clipped."""
    info = []
    for c in cands:
        x = c['x']
        cents, cnt, fr = pitch_cents(x, m, kind)
        q = np.percentile(fr, 75) - np.percentile(fr, 25) if len(fr) > 3 else 20.0
        clip = c['clip0'] if 'clip0' in c else sum(j - i + 1 for i, j in clipped_runs(x)[0])
        info.append(dict(c, L=loud400(x[onset(x):]), cents=cents, spread=q, clip=clip))
    mL = np.median([i['L'] for i in info])
    mc = np.nanmedian([i['cents'] for i in info])
    for i in info:
        i['score'] = abs(i['L'] - mL) / 1.5 + abs((i['cents'] if i['cents'] == i['cents'] else mc + 20) - mc) / 5 + i['spread'] / 10 + i['clip'] / 10
    info.sort(key=lambda i: i['score'])
    return info[:n]


def build_growly(libs):
    root = os.path.join(libs, 'karoryfer.growlybass')
    items = []      # dict(out, kind, m, s, v, r, src, x, layer)
    for name, m, s, fret in GROWLY_NOTES:
        assert label_midi(name) - 12 == m
        for lay, v in GROWLY_LAYERS:
            cands = [dict(src='sustain/%s_%s_rr%d.wav' % (name, lay, r)) for r in range(1, 5)]
            for c in cands:
                c['x'] = load(os.path.join(root, c['src']))
            for r, c in enumerate(pick(cands, rr_needed(m), 'sus', m), 1):
                items.append(dict(out='s%df%02d_v%d_r%d.mp3' % (s, fret, v, r), kind='sus', m=m, s=s, v=v, r=r, src=c['src'],
                                  x=c['x'], layer=('sus', v)))
        cands = [dict(src='staccato/%s_staccato_rr%d.wav' % (name, r)) for r in range(1, 6)]
        for c in cands:
            c['x'], c['runs'] = declip(load(os.path.join(root, c['src'])))
            c['clip0'] = sum(j - i + 1 for i, j in c['runs'])
        for r, c in enumerate(pick(cands, 2, 'stac', m), 1):
            items.append(dict(out='m%d_st_r%d.mp3' % (m, r), kind='stac', m=m, s=STAC_STRING[m], v=1, r=r, src=c['src'],
                              x=c['x'], layer=('sus', 2), declipped=len(c['runs'])))
    for r, nm in enumerate(GROWLY_RELEASE, 1):
        items.append(dict(out='rel_r%d.mp3' % r, kind='release', r=r, src='release/%s.wav' % nm,
                          x=load(os.path.join(root, 'release', nm + '.wav')), g=GROWLY_RELEASE_G))
    for r, nm in enumerate(GROWLY_SCRAPES, 1):
        items.append(dict(out='scrape_r%d.mp3' % r, kind='scrape', r=r, src='scrape/%s.wav' % nm,
                          x=load(os.path.join(root, 'scrape', nm + '.wav')), g=1.0))
    meta = dict(id='growly', instrument='bass', name={'en': 'Recorded electric bass', 'es': 'Bajo eléctrico grabado'},
                source='Growlybass by Karoryfer Samples', license='CC0-1.0', tuning=[28, 33, 38, 43],
                vel=[0, 0.75], maxShift=3)
    return items, meta


def build_upright(libs):
    dsm = os.path.join(libs, 'dsmolken.double-bass', 'pizz')
    meat = os.path.join(libs, 'karoryfer.meatbass', 'Samples', 'pizz')
    items = []
    picked = {}
    for name, m, lib in UPRIGHT_NOTES:
        for dl, ml, v in UPRIGHT_LAYERS:
            if lib == 'dsm':
                cands = [dict(src='pizz/pizz_%s_%s%s.wav' % (name, dl, r), path=os.path.join(dsm, 'pizz_%s_%s%s.wav' % (name, dl, r)))
                         for r in 'abcd']
            else:
                cands = [dict(src='Samples/pizz/%s_vl%s_rr%d.wav' % (name, ml, r), path=os.path.join(meat, '%s_vl%s_rr%d.wav' % (name, ml, r)))
                         for r in range(1, 5)]
            cands = [c for c in cands if os.path.exists(c['path'])]
            for c in cands:
                c['x'] = load(c['path'])
                assert label_midi(name) == m
            picked[(m, v)] = pick(cands, rr_needed(m), 'sus', m)
    # Tone match for the Meatbass notes, layer by layer (match_fill). Every fill is a stopped note (none is an open
    # string), so it is matched to the nearest stopped Smolken notes below and above it (an open string rings brighter).
    stopped = [m for _, m, lib in UPRIGHT_NOTES if lib == 'dsm' and m not in OPEN_STRINGS]
    for name, m, lib in UPRIGHT_NOTES:
        if lib != 'meat':
            continue
        lo = max(k for k in stopped if k < m)
        hi = min(k for k in stopped if k > m)
        for _, _, v in UPRIGHT_LAYERS:
            refs = [c['x'] for k in (lo, hi) for c in picked[(k, v)]]
            outs, stages, rep, fc = match_fill([c['x'] for c in picked[(m, v)]], refs, midi_hz(m))
            for c, x in zip(picked[(m, v)], outs):
                c['x'] = x
                c['eq'] = {k: dict(bands=[[f, round(g, 1)] for f, g in b], lowshelf_hz=round(fc), lowshelf_db=g2,
                                   brightness_db=[round(q, 1) for q in rep[k]]) for k, (b, g2) in stages.items()}
            print('upright fill %d v%d (Smolken %d and %d): 400 Hz-3 kHz share, attack %.1f -> %.1f dB (theirs %.1f), '
                  'ring %.1f -> %.1f dB (theirs %.1f); shelf %+.1f / %+.1f dB at %.0f Hz; EQ attack %s; ring %s' % (
                      m, v, lo, hi, rep['attack'][0], rep['attack'][2], rep['attack'][1], rep['ring'][0], rep['ring'][2],
                      rep['ring'][1], stages['attack'][1], stages['ring'][1], fc,
                      ' '.join('%d:%+.1f' % b for b in stages['attack'][0]), ' '.join('%d:%+.1f' % b for b in stages['ring'][0])),
                  flush=True)
    for name, m, lib in UPRIGHT_NOTES:
        for _, _, v in UPRIGHT_LAYERS:
            for r, c in enumerate(picked[(m, v)], 1):
                items.append(dict(out='m%d_v%d_r%d.mp3' % (m, v, r), kind='sus', m=m, s=None, v=v, r=r,
                                  src=('dsmolken.double-bass/' if lib == 'dsm' else 'karoryfer.meatbass/') + c['src'],
                                  x=c['x'], layer=('sus', v), eq=c.get('eq'), ref=(lib == 'dsm')))
    for r, nm in enumerate(UPRIGHT_RELEASE, 1):
        items.append(dict(out='rel_r%d.mp3' % r, kind='release', r=r, src='dsmolken.double-bass/pizz/noises/pizz_noise_%s.wav' % nm,
                          x=load(os.path.join(dsm, 'noises', 'pizz_noise_%s.wav' % nm)), g=UPRIGHT_RELEASE_G))
    meta = dict(id='upright', instrument='bass', name={'en': 'Recorded upright bass', 'es': 'Contrabajo grabado'},
                source='Double bass by D. Smolken, with Meatbass by Karoryfer Samples', license='CC0-1.0',
                tuning=[24, 31, 38, 45], vel=[0, 0.8], maxShift=3)
    return items, meta


def render(items, meta, out_dir, report):
    os.makedirs(out_dir, exist_ok=True)
    for it in items:
        it['y'] = shape(it['x'])
        it['L0'] = loud400(it['y'])
        it['pk0'] = 20 * np.log10(np.abs(it['y']).max())
    # each layer at the average loudness its notes were recorded at (staccato sits with the hard layer: the library
    # evened its staccato takes out, so their own level says nothing; the upright's Meatbass notes were recorded at
    # another level, so only Smolken's own notes set the layer)
    layers = sorted(set(it['layer'] for it in items if it['kind'] == 'sus'))
    layer_db = {ly: float(np.mean([it['L0'] for it in items if it['kind'] == 'sus' and it['layer'] == ly and it.get('ref', True)]))
                for ly in layers}
    # one offset for the whole set: as loud as it can be with every peak under PEAK_MAX_DB
    def gain_rel(it):
        return (layer_db[it['layer']] - it['L0']) if it['kind'] in ('sus', 'stac') else 0.0
    off = min(PEAK_MAX_DB - (it['pk0'] + gain_rel(it)) for it in items)
    off = min(off, -18.0 - max(layer_db.values()))    # and the loudest layer no louder than -18 LUFS (400 ms)
    zones, noise = [], []
    for it in items:
        gdb = gain_rel(it) + off
        y = it['y'] * 10 ** (gdb / 20)
        path = os.path.join(out_dir, it['out'])
        encode(y, path)
        d = decode(path)
        rec = dict(out=it['out'], src=it['src'], kind=it['kind'], gain_db=round(gdb, 2), seconds=round(len(d) / SR, 3),
                   onset_ms=round(onset(d) / SR * 1000, 2), L=round(loud400(d), 2), peak_db=round(20 * np.log10(np.abs(d).max()), 2),
                   bytes=os.path.getsize(path))
        if it.get('declipped'):
            rec['declipped_runs'] = it['declipped']
        if it.get('eq'):
            rec['tone_match'] = it['eq']
        if it['kind'] in ('sus', 'stac'):
            cents, n, _ = pitch_cents(d, it['m'], it['kind'])
            rec.update(m=it['m'], cents=round(cents, 1), frames=n)
            zones.append(dict(f=it['out'], m=it['m'], c=round(cents, 1), s=it['s'], v=it['v'], r=it['r'], k=it['kind'], g=1.0))
        else:
            noise.append(dict(f=it['out'], k=it['kind'], r=it['r'], g=it['g']))
        report.append(rec)
        print('%-8s %-20s <- %-52s gain %+6.1f dB  %5.2f s  onset %.2f ms  L %6.1f  peak %5.1f  %s' % (
            meta['id'], it['out'], it['src'], gdb, rec['seconds'], rec['onset_ms'], rec['L'], rec['peak_db'],
            ('c %+5.1f (%d frames)' % (rec['cents'], rec['frames'])) if 'cents' in rec else ''), flush=True)
    zones.sort(key=lambda z: (z['k'] != 'sus', z['m'], z['v'], z['r']))
    out = dict(id=meta['id'], instrument=meta['instrument'], name=meta['name'], source=meta['source'], license=meta['license'],
               tuning=meta['tuning'], zones=zones, vel=meta['vel'], noise=noise, maxShift=meta['maxShift'])
    with open(os.path.join(out_dir, 'set.json'), 'w', encoding='utf-8') as fh:
        fh.write(json_text(out))
    return layer_db, off


def json_text(o):
    """The set.json layout: one zone or noise per line, so a diff shows what changed."""
    head = {k: v for k, v in o.items() if k not in ('zones', 'noise', 'vel', 'maxShift')}
    s = '{' + ', '.join('%s:%s' % (json.dumps(k), json.dumps(v, ensure_ascii=False)) for k, v in head.items()) + ',\n'
    s += '"zones":[\n' + ',\n'.join('  ' + json.dumps(z, separators=(',', ':')) for z in o['zones']) + '\n],\n'
    s += '"vel":%s,\n' % json.dumps(o['vel'], separators=(',', ':'))
    s += '"noise":[\n' + ',\n'.join('  ' + json.dumps(z, separators=(',', ':')) for z in o['noise']) + '\n],\n'
    s += '"maxShift":%d }\n' % o['maxShift']
    json.loads(s)
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--libs', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--only', choices=['growly', 'upright'])
    ap.add_argument('--report', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sources.json'))
    a = ap.parse_args()
    try:
        allrep = json.load(open(a.report))
    except (OSError, ValueError):
        allrep = {}
    for sid, fn in (('growly', build_growly), ('upright', build_upright)):
        if a.only and a.only != sid:
            continue
        items, meta = fn(a.libs)
        d = os.path.join(a.out, sid)
        if os.path.isdir(d):
            for f in os.listdir(d):
                if f.endswith('.mp3') or f == 'set.json':
                    os.remove(os.path.join(d, f))
        rep = []
        layer_db, off = render(items, meta, d, rep)
        allrep[sid] = dict(layers_recorded_lufs={'%s v%d' % ly: round(v, 2) for ly, v in layer_db.items()},
                           set_offset_db=round(off, 2), files=rep)
        size = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d))
        print('%s: %d files, %d bytes (%.2f MB)' % (sid, len(os.listdir(d)), size, size / 1e6))
    with open(a.report, 'w') as fh:
        json.dump(allrep, fh, indent=1)


if __name__ == '__main__':
    main()
