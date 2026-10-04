"""Build the five Big Rusty kits of AOG-DRUM-REAL-V1 (P to T) into aog-deploy/audio/drums/<dir>/.

Kits P to T are one real kit, Big Rusty Drums by Karoryfer Samples (CC0), mixed and shaped five ways (recipes.py):
P studio session, dry; Q big room rock; R big-band swing; S prog rock, many toms; T groove metal. This is the builder
they were made with (it lived in a helper's scratch folder until AOG-DRUM-STEREO-V1 brought it here); run as it is, it
writes the same files byte for byte.

Each pad: soft, normal and hard layers (lists of takes: piece, velocity layer, round robin), the microphones mixed by
the recipe's weights, then tune, EQ, compression, saturation, a room (made here), an envelope, its length and fade.
Loudness: the normal layer at START + the engine calibration (gains.json), soft -4 dB (or the pad's own), hard +1.5 dB;
every take of a layer equally loud. Peaks: a soft knee under 0.97.

AOG-DRUM-STEREO-V1 (2026-10-04) — Jimmy: "REAL EVERYTHING if possible". The overhead microphones (oh) are a stereo
pair that stands apart: its two sides hear a cymbal or a hi-hat differently (they agree -0.2 to +0.1), so adding them
into one channel cancelled some pitches and not others, a hollow, phasey sound. Each pad is now measured first (as in
../build.py): its normal hit's microphones mixed in two channels (the pair keeps its sides, a close microphone sits in
the middle). A pad whose sides agree less than 0.9 (or less than 0.5 above 2 kHz) is built in true stereo, at the
same loudness (the average of the two sides' power), and saved as a stereo MP3 at 192 kbps (96 a side); every other
pad as before, mono at 96 kbps. A kit with any stereo pad goes in a new folder (recipes.py "dir"). A kit marked
"stereo": False in recipes.py (kit T, groove metal) is left exactly as it was: built mono, byte for byte.

With --match-old <folder> (the drums folder as it was), each stereo file is then brought to the loudness of the mono
file it replaces (recipes.py "was": its old folder), as both decode, within 0.05 dB (../build.py, write_matched).

usage: python3 build_pt.py [--only P,Q] [--out <aog-deploy/audio/drums>] [--wav <folder>] [--match-old <folder>]
"""
import os, sys, json, subprocess, argparse
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.dirname(HERE))
import sources, dsp
from dsp import SR
from recipes import KITS

OUT = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", "aog-deploy", "audio", "drums"))
GAINS = os.path.join(HERE, "gains.json")          # per kit, per pad, dB — from the engine calibration
STEREO_KBPS = 192
STEREO_CORR, STEREO_CORR_HI = 0.9, 0.5

# ---------- the recordings (Big Rusty Drums: Samples/<piece>/<mic>/...) ----------
PIECES = {
    "kick":     ("kick_24/kick/{mic}/k_vl{vl}_rr{rr}.flac",               {"kick": 1.0, "oh": 0.0}),
    "kickN":    ("kick_24_nodamp/kick/{mic}/k_nodamp_vl{vl}_rr{rr}.flac",  {"kick": 1.0, "oh": 0.0}),
    "snare":    ("snare_14/center/{mic}/sn_center_vl{vl}_rr{rr}.flac",     {"btm": 1.0, "top": 0.4, "oh": 0.6}),
    "rimshot":  ("snare_14/rimshot/{mic}/sn_rims_vl{vl}_rr{rr}.flac",      {"btm": 1.0, "top": 0.4, "oh": 0.6}),
    "xstick":   ("snare_14/sidestick/{mic}/sn_ss_vl{vl}_rr{rr}.flac",      {"btm": 1.0, "top": 0.4, "oh": 0.6}),
    "hat_tc":   ("hihat_14/tc/{mic}/ht_tc_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.5}),
    "hat_cl":   ("hihat_14/cl/{mic}/ht_cl_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.5}),
    "hat_lc":   ("hihat_14/lc/{mic}/ht_lc_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.5}),
    "hat_shank":("hihat_14/cl_s/{mic}/ht_cl_s_vl{vl}_rr{rr}.flac",         {"cl": 1.0, "oh": 0.5}),
    "hat_qo":   ("hihat_14/qo/{mic}/ht_qo_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.6}),
    "hat_ho":   ("hihat_14/ho/{mic}/ht_ho_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.6}),
    "hat_open": ("hihat_14/open/{mic}/ht_open_vl{vl}_rr{rr}.flac",         {"cl": 1.0, "oh": 0.6}),
    "pedal":    ("hihat_14/chik/{mic}/ht_chik_vl{vl}_rr{rr}.flac",         {"cl": 1.0, "oh": 0.5}),
    "tom14":    ("tom_14/center/{mic}/t14_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.5}),
    "tom15":    ("tom_15/center/{mic}/t15_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.5}),
    "tom18":    ("tom_18/center/{mic}/t18_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.5}),
    "tom22":    ("tom_22/center/{mic}/t22_vl{vl}_rr{rr}.flac",             {"cl": 1.0, "oh": 0.5}),
    "ride":     ("ride_22/rd/{mic}/rd_vl{vl}_rr{rr}.flac",                 {"cl": 0.4, "oh": 1.0}),
    "bell":     ("ride_22/bl/{mic}/rd_bl_vl{vl}_rr{rr}.flac",              {"cl": 0.5, "oh": 1.0}),
    "crash":    ("crash_17/cr/{mic}/cr_vl{vl}_rr{rr}.flac",                {"cl": 0.4, "oh": 1.0}),
    "china":    ("china_18/cn/{mic}/cn_vl{vl}_rr{rr}.flac",                {"cl": 0.5, "oh": 1.0}),
    "sizzle":   ("ride_sizzle_19/rd/{mic}/rds_vl{vl}_rr{rr}.flac",         {"cl": 0.4, "oh": 1.0}),
    "sizzle_ed":("ride_sizzle_19/ed/{mic}/rds_ed_vl{vl}_rr{rr}.flac",      {"cl": 0.4, "oh": 1.0}),
}

_cache = {}
def load(rel):
    """rel like 'kick_24/kick/kick/k_vl10_rr1.flac' -> float32 array (n, ch) at 44.1 kHz, as recorded"""
    if rel in _cache:
        return _cache[rel]
    p = sources.path_of("brd:Samples/" + rel)
    ch = int(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=channels", "-of", "csv=p=0", p],
                            capture_output=True, text=True, check=True).stdout.strip().split(",")[0])
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", str(ch), "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()
    _cache[rel] = a
    return a

def onset(x, thr_db=-40.0):
    """first index where the sound (stereo: its louder side) rises above thr relative to the peak"""
    a = np.max(np.abs(x), axis=1) if x.ndim == 2 else np.abs(x)
    pk = np.max(a) + 1e-12
    idx = np.nonzero(a >= pk * 10 ** (thr_db / 20))[0]
    return int(idx[0]) if len(idx) else 0

def raw_mix(piece, vl, rr, mics, stereo=False):
    tpl = PIECES[piece][0]
    sig = None
    for mic, w in mics.items():
        if w <= 0:
            continue
        a = load(tpl.format(mic=mic, vl=vl, rr=rr))
        if stereo:          # a pair keeps its two sides; a close microphone sits in the middle
            x = (np.repeat(a, 2, axis=1) if a.shape[1] == 1 else a[:, :2]).astype(np.float64) * w
        else:               # as before: the sides of a pair added together
            x = (a.mean(axis=1)).astype(np.float64) * w
        sig = x if sig is None else (sig[:len(x)] + x[:len(sig)] if len(sig) != len(x) else sig + x)
    return sig

def take(piece, vl, rr, mics=None, preroll_ms=2.0, start=None, stereo=False):
    """the mixed microphones of one take, from 2 ms before the hit (or from `start`); returns (signal, start)"""
    m = dict(PIECES[piece][1]); m.update(mics or {})
    x = raw_mix(piece, vl, rr, m, stereo)
    if start is None:
        o = onset(x, -40.0)
        start = max(0, o - int(SR * preroll_ms / 1000))
    return x[start:], start

# loudness (file, K-weighted momentary, normal layer) to start from before the engine calibration
START = {"kick": -11.0, "snare": -14.0, "ch": -27.0, "oh": -23.0, "clap": -19.0, "tom": -13.0, "rim": -21.0, "bell": -17.0}
LAYER_DB = {"s": -4.0, "m": 0.0, "h": 1.5}

def with_click(pad, x, piece, vl, rr, st, stereo):
    if not pad.get("click"):
        return x
    # the beater, as the overheads heard it: its first few milliseconds, high-passed, laid on top of the kick
    hz, amt, ms = pad["click"]
    oh, _ = take(piece, vl, rr, {"kick": 0.0, "oh": 1.0}, start=st, stereo=stereo)
    oh = dsp.eq(oh, [("hp", hz, .7, 0), ("hp", hz, .7, 0)])
    # the overheads hear the beater a few milliseconds late: line its click up with the close microphone
    lag = onset(oh, -24.0) - int(SR * 0.002)
    if lag > 0:
        oh = np.concatenate([oh[lag:], np.zeros((lag,) + oh.shape[1:])])
    n = int(SR * ms / 1000)
    w = np.zeros(len(oh)); w[:n] = np.hanning(2 * n)[n:] if n > 0 else 0
    w[:max(1, n // 6)] = 1.0
    click = oh * dsp._col(oh, w)
    pk = np.max(np.abs(x[: int(0.03 * SR)])) + 1e-9
    click *= amt * pk / (np.max(np.abs(click)) + 1e-9)
    m = min(len(x), len(click)); x = x.copy(); x[:m] += click[:m]
    return x

def render(pad, piece, vl, rr, stereo=False):
    x, st = take(piece, vl, rr, pad.get("mics"), stereo=stereo)
    x = with_click(pad, x, piece, vl, rr, st, stereo)
    if pad.get("tune"):
        x = dsp.tune(x, pad["tune"])
    if pad.get("eq"):
        x = dsp.eq(x, pad["eq"])
    if pad.get("comp"):
        t, r, a, rl = pad["comp"]
        # set the threshold relative to this hit's peak, so soft and hard hits are shaped alike
        pk = dsp.peak_db(x)
        x = dsp.comp(x, pk + t + 6, r, a, rl, 6.0)
    if pad.get("sat"):
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
        x = dsp.sat(x, pad["sat"])
    if pad.get("room"):
        spec, wet, crush = pad["room"]
        ir = dsp.room_ir(**spec)
        crush2 = None
        if crush:
            crush2 = (dsp.peak_db(x) + crush[0], crush[1])
        x = dsp.add_room(x, ir, wet, crush2)
    if pad.get("shape"):
        x = dsp.env_shape(x, *pad["shape"])
    x = dsp.cut(x, pad["len"], pad["fade"])
    return x

def _corr(a, b):
    return float(np.sum(a * b) / (np.sqrt(np.sum(a * a) * np.sum(b * b)) + 1e-30))

def side_agreement(pad):
    """AOG-DRUM-STEREO-V1: how alike the two sides of the pad's normal hit are (the microphones and the beater click,
    before any shaping): the correlation of left and right over the hit (at most 1 s), and above 2 kHz.
    None when every microphone the pad uses is mono."""
    piece, vl, rr = pad["m"][0]
    m = dict(PIECES[piece][1]); m.update(pad.get("mics") or {})
    used = [mic for mic, w in m.items() if w > 0]
    if pad.get("click"):
        used.append("oh")
    if all(load(PIECES[piece][0].format(mic=mic, vl=vl, rr=rr)).shape[1] == 1 for mic in used):
        return None
    x, st = take(piece, vl, rr, pad.get("mics"), stereo=True)
    x = with_click(pad, x, piece, vl, rr, st, True)
    o = onset(x, -40.0); seg = x[o:o + int(min(pad["len"], 1.0) * SR)]
    hi = dsp.eq(seg, [("hp", 2000, 0.707, 0), ("hp", 2000, 0.707, 0)])
    return _corr(seg[:, 0], seg[:, 1]), _corr(hi[:, 0], hi[:, 1])

def is_stereo(pad):
    a = side_agreement(pad)
    return bool(a is not None and (a[0] < STEREO_CORR or a[1] < STEREO_CORR_HI)), a

def safety(x, ceil=0.97):
    pk = np.max(np.abs(x))
    if pk <= ceil:
        return x
    # a soft knee above 0.8 of the ceiling, so nothing hard-clips
    k = 0.8 * ceil
    y = x.copy(); m = np.abs(y) > k
    over = (np.abs(y[m]) - k) / (ceil - k)
    y[m] = np.sign(y[m]) * (k + (ceil - k) * np.tanh(over))
    return y

def write_mp3(x, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pcm = np.clip(x, -1, 1).astype(np.float32).tobytes()
    ch, kb = (2, STEREO_KBPS) if x.ndim == 2 else (1, 96)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(ch), "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "%dk" % kb, "-ar", str(SR), "-ac", str(ch), "-map_metadata", "-1", path],
                   input=pcm, check=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--out", default=OUT)
    ap.add_argument("--wav", default="")
    ap.add_argument("--match-old", default="")
    a = ap.parse_args()
    from build import write_matched
    gains = json.load(open(GAINS)) if os.path.exists(GAINS) else {}
    only = [k for k in a.only.split(",") if k]
    report = []
    for kid, kit in KITS.items():
        if only and kid not in only:
            continue
        d = os.path.join(a.out, kit["dir"])
        if os.path.isdir(d):
            for f in os.listdir(d):
                if f.endswith(".mp3"):
                    os.remove(os.path.join(d, f))
        for pid, pad in kit["pads"].items():
            base = pad["name"].lower()
            stereo, agree = is_stereo(pad)
            if kit.get("stereo") is False:    # a kit kept as it was (kit T, by request: its kick is being rebuilt elsewhere)
                stereo = False
            if agree is not None:
                report.append(f"{kid} {pid:5s} sides agree {agree[0]:+.2f} (above 2 kHz {agree[1]:+.2f}): {'STEREO' if stereo else 'mono, as before'}")
            rendered = {lay: [render(pad, *tk, stereo=stereo) for tk in pad[lay]] for lay in ("s", "m", "h")}
            # loudness: the normal layer to its target, the others offset; each take of a layer the same
            target_m = START[pid] + gains.get(kid, {}).get(pid, 0.0)
            for lay in ("s", "m", "h"):
                for i, x in enumerate(rendered[lay]):
                    off = pad.get("soft", LAYER_DB["s"]) if lay == "s" else LAYER_DB[lay]
                    x = x * 10 ** ((target_m + off - dsp.momentary(x)) / 20)
                    x = safety(x)
                    nm = f"{base}-{lay}{i+1 if len(rendered[lay]) > 1 else ''}"
                    old = os.path.join(a.match_old, kit.get("was", kit["dir"]), nm + ".mp3") if a.match_old else None
                    if stereo and old and os.path.exists(old):
                        x, was_db, now_db = write_matched(x, os.path.join(d, nm + ".mp3"), old, safety, write_mp3)
                        report.append(f"{kid} {pid:5s} {nm:12s} stereo, as loud as the old file: {was_db:6.2f} -> {now_db:6.2f} LU")
                    else:
                        write_mp3(x, os.path.join(d, nm + ".mp3"))
                    if a.wav:
                        import scipy.io.wavfile as wf
                        os.makedirs(os.path.join(a.wav, kit["dir"]), exist_ok=True)
                        wf.write(os.path.join(a.wav, kit["dir"], nm + ".wav"), SR, x.astype(np.float32))
                    report.append(f"{kid} {pid:5s} {nm:12s} LU {dsp.momentary(x):6.1f} pk {dsp.peak_db(x):6.1f} len {len(x)/SR:.2f}s{' stereo' if x.ndim == 2 else ''}")
        size = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d) if f.endswith(".mp3"))
        report.append(f"{kid} {kit['dir']}: {sum(1 for f in os.listdir(d) if f.endswith('.mp3'))} files, {size / 1e6:.2f} MB")
    print("\n".join(report))

if __name__ == "__main__":
    main()
