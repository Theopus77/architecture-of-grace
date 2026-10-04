"""Small DSP kit for the drum voicings: RBJ biquads, a feed-forward compressor, a synthetic room,
tuning by band-limited resampling, envelopes and K-weighted loudness. Float64 at 44.1 kHz.
(From the kits P to T, AOG-DRUM-REAL-V1; AOG-DRUM-REAL-V2 adds the dub echo, the gated room, the hand-moved
record for a scratch, and mixing at an offset.)
AOG-DRUM-STEREO-V1 (2026-10-04): every function also takes a stereo sound, shape (n, 2). A mono sound (shape (n,))
goes through exactly as before. On a stereo sound the two sides get the same treatment: the same filters, one
compressor that listens to both sides (so the picture never leans), the same room, and loudness as the average
of the two sides' power (a sound with two equal sides measures as its mono self)."""
import numpy as np
from scipy import signal

SR = 44100

# ---------- filters (RBJ cookbook) ----------
def _biquad(kind, f, q=0.707, gain=0.0, sr=SR):
    A = 10 ** (gain / 40)
    w = 2 * np.pi * f / sr
    cs, sn = np.cos(w), np.sin(w)
    alpha = sn / (2 * q)
    if kind == "peak":
        b = [1 + alpha * A, -2 * cs, 1 - alpha * A]; a = [1 + alpha / A, -2 * cs, 1 - alpha / A]
    elif kind == "lowshelf":
        sq = 2 * np.sqrt(A) * alpha
        b = [A * ((A + 1) - (A - 1) * cs + sq), 2 * A * ((A - 1) - (A + 1) * cs), A * ((A + 1) - (A - 1) * cs - sq)]
        a = [(A + 1) + (A - 1) * cs + sq, -2 * ((A - 1) + (A + 1) * cs), (A + 1) + (A - 1) * cs - sq]
    elif kind == "highshelf":
        sq = 2 * np.sqrt(A) * alpha
        b = [A * ((A + 1) + (A - 1) * cs + sq), -2 * A * ((A - 1) + (A + 1) * cs), A * ((A + 1) + (A - 1) * cs - sq)]
        a = [(A + 1) - (A - 1) * cs + sq, 2 * ((A - 1) - (A + 1) * cs), (A + 1) - (A - 1) * cs - sq]
    elif kind == "hp":
        b = [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2]; a = [1 + alpha, -2 * cs, 1 - alpha]
    elif kind == "lp":
        b = [(1 - cs) / 2, 1 - cs, (1 - cs) / 2]; a = [1 + alpha, -2 * cs, 1 - alpha]
    else:
        raise ValueError(kind)
    b = np.array(b) / a[0]; a = np.array(a) / a[0]
    return b, a

def eq(x, bands):
    """bands: list of (kind, freq, q, gain_db)"""
    y = np.asarray(x, dtype=np.float64)
    for kind, f, q, g in bands:
        b, a = _biquad(kind, f, q, g)
        y = signal.lfilter(b, a, y, axis=0)
    return y

# ---------- dynamics ----------
def comp(x, thr_db=-18.0, ratio=3.0, att_ms=5.0, rel_ms=100.0, knee_db=6.0, makeup_db=0.0):
    """feed-forward peak compressor with a soft knee; gain smoothing in dB"""
    x = np.asarray(x, dtype=np.float64)
    det = np.max(np.abs(x), axis=1) if x.ndim == 2 else np.abs(x)     # stereo: the louder side at each moment
    lvl = 20 * np.log10(det + 1e-9)
    over = lvl - thr_db
    gr = np.zeros_like(lvl)
    k = knee_db / 2
    m1 = over > k
    m2 = (over > -k) & ~m1
    gr[m1] = over[m1] * (1 - 1 / ratio)
    gr[m2] = ((over[m2] + k) ** 2 / (2 * knee_db)) * (1 - 1 / ratio)
    aa = np.exp(-1 / (SR * att_ms / 1000)); ar = np.exp(-1 / (SR * rel_ms / 1000))
    g = np.empty_like(gr); s = 0.0
    for i in range(len(gr)):          # gain reduction follower: fast up, slow down
        t = gr[i]
        s = aa * s + (1 - aa) * t if t > s else ar * s + (1 - ar) * t
        g[i] = s
    return x * _col(x, 10 ** ((makeup_db - g) / 20))

def sat(x, drive=1.0):
    """gentle tape-like saturation, level-matched at small signals"""
    if drive <= 0:
        return x
    return np.tanh(x * drive) / drive

def env_shape(x, hold=0.1, decay=0.15, start=0.0):
    """after `hold` seconds, an extra exponential fall with time constant `decay` (a gate that closes gently)"""
    n = len(x); t = np.arange(n) / SR
    e = np.ones(n)
    m = t > start + hold
    e[m] = np.exp(-(t[m] - start - hold) / decay)
    return x * _col(x, e)

def attack_boost(x, db=4.0, ms=12.0):
    """lift the first `ms` of the hit (a transient shaper), fading back to unity"""
    n = int(SR * ms / 1000)
    g = np.ones(len(x))
    ramp = 10 ** (db / 20) - (10 ** (db / 20) - 1) * (np.arange(n) / max(1, n))
    g[:min(n, len(x))] = ramp[:min(n, len(x))]
    return x * _col(x, g)

# ---------- room ----------
def room_ir(rt60=1.2, pre_ms=12.0, damp_rt60_hi=None, er=8, length=None, seed=7, bright=0.0):
    """a synthetic mono room: early reflections, then a dense tail whose highs die sooner"""
    rng = np.random.default_rng(seed)
    if damp_rt60_hi is None:
        damp_rt60_hi = rt60 * 0.5
    L = int(SR * (length or min(3.2, rt60 * 1.4 + pre_ms / 1000)))
    t = np.arange(L) / SR
    noise = rng.standard_normal(L)
    # split into low (<1.5 kHz) and high parts, each decaying at its own rate
    lo = signal.lfilter(*_biquad("lp", 1500, 0.707), noise)
    hi = noise - lo
    d0 = int(SR * pre_ms / 1000)
    env_lo = np.exp(-6.91 * np.maximum(0, t - pre_ms / 1000) / rt60)
    env_hi = np.exp(-6.91 * np.maximum(0, t - pre_ms / 1000) / damp_rt60_hi)
    tail = lo * env_lo + hi * env_hi * (10 ** (bright / 20))
    # build-up over the first 25 ms after the pre-delay
    rise = np.clip((t - pre_ms / 1000) / 0.025, 0, 1)
    tail *= rise
    tail[:d0] = 0
    # early reflections: a handful of discrete taps, softened
    ir = tail * 0.5
    for i in range(er):
        tt = pre_ms / 1000 * (0.5 + rng.random() * 2.2) + 0.003 * i
        k = int(tt * SR)
        if k < L:
            ir[k] += (0.9 - 0.08 * i) * (1 if rng.random() > 0.3 else -1)
    ir = signal.lfilter(*_biquad("lp", 9000, 0.707), ir)
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-12      # unit energy: wet level is set by the mix
    return ir

def add_room(x, ir, wet_db=-10.0, crush=None, hp=150.0, extra=0.0):
    """x + its room. crush=(thr_db, ratio) squeezes the room the way a big rock record does
    (stereo: each side through the same room)"""
    if x.ndim == 2:
        wet = np.stack([signal.fftconvolve(np.concatenate([x[:, c], np.zeros(int(len(ir)))]), ir)[: len(x) + len(ir)]
                        for c in range(x.shape[1])], axis=1)
    else:
        wet = signal.fftconvolve(np.concatenate([x, np.zeros(int(len(ir)))]), ir)[: len(x) + len(ir)]
    if hp:
        wet = eq(wet, [("hp", hp, 0.707, 0)])
    if crush:
        wet = comp(wet, crush[0], crush[1], 2.0, 250.0, 6.0)
    # match: wet level relative to the dry signal's RMS over its first 200 ms
    n = min(len(x), int(0.2 * SR))
    rd = np.sqrt(np.mean(x[:n] ** 2)) + 1e-12
    rw = np.sqrt(np.mean(wet[:n + int(0.2 * SR)] ** 2)) + 1e-12
    wet *= (rd / rw) * 10 ** (wet_db / 20)
    y = np.concatenate([x, np.zeros((len(wet) - len(x),) + x.shape[1:])]) + wet
    return y

# ---------- tuning ----------
def tune(x, semis):
    """pitch by resampling (the way a sampler retunes): +12 = an octave up and half as long"""
    if abs(semis) < 1e-6:
        return x
    r = 2 ** (semis / 12)
    n = int(round(len(x) / r))
    # band-limited resample with a polyphase filter at a rational approximation
    from fractions import Fraction
    fr = Fraction(1 / r).limit_denominator(400)
    return signal.resample_poly(x, fr.numerator, fr.denominator, axis=0)[:n]

# ---------- length and fades ----------
def cut(x, length, fade):
    n = int(SR * length)
    y = np.zeros((n,) + x.shape[1:])
    m = min(n, len(x)); y[:m] = x[:m]
    f = int(SR * fade)
    if f > 0:
        w = np.ones(n)
        w[n - f:] = 0.5 * (1 + np.cos(np.linspace(0, np.pi, f)))
        y *= _col(y, w)
    return y

# ---------- loudness ----------
def _k_sos(fs=SR):
    f0 = 1681.974450955533; G = 3.999843853973347; Q = 0.7071752369554196
    K = np.tan(np.pi * f0 / fs); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416
    a0 = 1 + K / Q + K * K
    s1 = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0, 1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    f0 = 38.13547087602444; Q = 0.5003270373238773; K = np.tan(np.pi * f0 / fs); a0 = 1 + K / Q + K * K
    s2 = [1, -2, 1, 1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    return np.array([s1, s2])

def momentary(x):
    """max K-weighted loudness over 400 ms windows (LUFS-like, no gating)"""
    k = signal.sosfilt(_k_sos(), x, axis=0)
    p = np.mean(k * k, axis=1) if k.ndim == 2 else k * k     # stereo: the average of the two sides' power
    cs = np.concatenate([[0], np.cumsum(p)])
    W = int(0.4 * SR)
    if len(k) <= W:
        ms = cs[-1] / W
    else:
        ms = np.max((cs[W:] - cs[:-W]) / W)
    return -0.691 + 10 * np.log10(ms + 1e-12)

def peak_db(x):
    return 20 * np.log10(np.max(np.abs(x)) + 1e-12)

# ---------- AOG-DRUM-REAL-V2 additions ----------
def mix_at(base, x, at_s=0.0, gain=1.0):
    """base + x placed `at_s` seconds in (base grows if x runs past its end)"""
    k = int(round(at_s * SR))
    n = max(len(base), k + len(x))
    if base.ndim != x.ndim:           # a mono part laid into a stereo sound sits in the middle
        base, x = as_stereo(base), as_stereo(x)
    y = np.zeros((n,) + x.shape[1:]); y[:len(base)] += base
    y[k:k + len(x)] += x * gain
    return y

def echo(x, gap_s=0.2, n=3, fb=0.4, lp_hz=3000.0, hp_hz=200.0):
    """a dub echo: the hit again, softer and darker each time (a tape delay into its own low-pass)"""
    y = np.array(x, dtype=np.float64)
    tap = np.array(x, dtype=np.float64)
    for k in range(1, n + 1):
        tap = eq(tap, [("lp", max(400.0, lp_hz / k), 0.707, 0), ("hp", hp_hz, 0.707, 0)])
        y = mix_at(y, tap, gap_s * k, fb ** k)
    return y

def gate(x, open_s=0.25, close_s=0.04, floor_db=-60.0):
    """a noise gate that holds open, then shuts fast: the 1980s gated room"""
    n = len(x); t = np.arange(n) / SR
    g = np.ones(n)
    m = t > open_s
    g[m] = np.maximum(10 ** (floor_db / 20), np.exp(-(t[m] - open_s) / max(1e-3, close_s / 6.91)))
    return x * _col(x, g)

def varispeed(x, speed, start=0):
    """play x through a hand-moved record: speed[i] is the rate (1 = as recorded, negative = backwards) at output
    sample i, the needle starting `start` samples in. Linear interpolation; the needle stays inside the recording."""
    pos = start + np.cumsum(np.concatenate([[0.0], speed[:-1]]))
    pos = np.clip(pos, 0, len(x) - 2)
    i = pos.astype(np.int64); f = _col(x, pos - i)
    return x[i] * (1 - f) + x[i + 1] * f

def fade_in(x, ms=2.0):
    n = min(len(x), int(SR * ms / 1000))
    y = np.array(x, dtype=np.float64)
    if n > 1:
        w = 0.5 * (1 - np.cos(np.linspace(0, np.pi, n)))
        y[:n] *= w[:, None] if y.ndim == 2 else w
    return y

def pitch_hz(x, lo=30.0, hi=2000.0, start_s=0.03, dur_s=0.5):
    """the strongest spectral peak between lo and hi Hz, after the attack"""
    if x.ndim == 2:
        x = x.mean(axis=1)
    a = int(start_s * SR); seg = x[a:a + int(dur_s * SR)]
    if len(seg) < 256:
        seg = x
    nfft = 1 << 17
    sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), nfft)); f = np.fft.rfftfreq(nfft, 1 / SR)
    m = (f > lo) & (f < hi)
    return float(f[m][np.argmax(sp[m])])


# ---------- AOG-DRUM-STEREO-V1 helpers ----------
def _col(x, g):
    """a gain curve g (one value per sample) shaped to multiply x, mono or stereo"""
    return g[:, None] if np.ndim(x) == 2 else g

def as_stereo(x):
    """a mono sound as two equal sides; a stereo sound as it is"""
    x = np.asarray(x, dtype=np.float64)
    return np.stack([x, x], axis=1) if x.ndim == 1 else x
