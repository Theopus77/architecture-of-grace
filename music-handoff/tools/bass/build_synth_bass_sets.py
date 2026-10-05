#!/usr/bin/env python3
# The bass page's two synth sounds, played by a real analog synthesizer (AOG-BASS-SYNTH-V1, 2026-10-04).
#
# Jimmy: "REAL EVERYTHING if possible". "Synth bass" and "Synth bass · acid squelch" played the bass voices of a 1983
# transistor organ (the cosmo set) through a filter made on the page. Now they play a real Roland SH-2, an analog
# monosynth from 1979, recorded from the hardware note by note by Modular Samples (modularsamples.com), who give the
# library to everyone as public domain:
#
#   synthbass   its "Filter Vel Bass" patch: a bass whose filter opens wider the harder a key is played (four strengths,
#               the library's own), then closes to a held tone. C1 to C3, every other key.
#   acidbass    its "Rezzy Saw Vel" patch: a sawtooth through the filter with its resonance turned up, the sound that
#               squelches in acid house; four strengths, the harder the brighter; each note dies away by itself.
#               C1 to C3, every other key.
#
#   https://github.com/publicsamples/Roland-SH-2  (the recordings are in its release 1.0, RolandSH-2.zip)
#   License: the Unlicense (the repository's LICENSE file): "This is free and unencumbered content released into the
#   public domain. Anyone is free to copy, modify, publish, use, compile, sell, or distribute this content, either in
#   source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means."
#
# The SH-2 recordings are one channel. Only the notes used are read out of the 1 GB archive (HTTP range requests, cached
# in AOG_SYNTH_CACHE). The library names each key above the pitch it sounds (measured): "Filter Vel Bass" an octave
# ("36C1" sounds C1, 32.7 Hz), "Rezzy Saw Vel" two octaves ("48C2" sounds C1; its keys under that sound lower than a
# bass plays, so they are left out). Every zone's "c" is its measured tuning, as for the other sets.
#
# The format is the other bass sets' (build_bass_sets.py: set.json and mono 128 kbps MP3s, the same shaping, levels
# and pitch measure), plus "play":"straight" in set.json: the page plays these recordings as they are (the synth's own
# filter and envelope are in them), not through the filter it puts on the organ's tones.
# A held "Filter Vel Bass" note keeps sounding: from 2.2 s, after its filter has closed, it repeats a stretch of about
# 1 s (a whole number of its waves, where it best matches itself), its last 30 ms blended into the 30 ms before the
# stretch's start so the turn is seamless. "Rezzy Saw Vel" notes are not looped: they die away, as they did on the SH-2.
#
# Each note's first 3 ms (6 ms on the deep, smooth "Filter Vel Bass") are eased in (the SH-2's gate opens in a sample,
# which an MP3 smears into the silence before it, a click; the page eases every note in over 3 ms anyway); a recording that stops just before its note has died away is
# faded over its last 0.25 s.
#
# usage: python3 music-handoff/tools/bass/build_synth_bass_sets.py [--only synthbass|acidbass]
# Check with: node music-handoff/tests/strings/bassets.js
import argparse, json, math, os, re, sys, zipfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.dirname(HERE))
import build_bass_sets as B
from piano_synth_sets import Parts, CACHE

SR = B.SR
OUT = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'aog-deploy', 'audio', 'bass'))
URL = 'https://github.com/publicsamples/Roland-SH-2/releases/download/1.0/RolandSH-2.zip'
SRC = 'Roland-SH-2 release 1.0: '
LICENSE = 'Unlicense'
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
DEFS = {
    'synthbass': dict(folder='sh2/Audio/Filter Vel Bass/', off=-12, attack=0.006, loop=True, maxShift=19,
                      name={'en': 'Recorded analog synth bass (for "Synth bass")', 'es': 'Bajo de sintetizador analógico grabado (para "Bajo de sintetizador")'},
                      source='A Roland SH-2 analog synthesizer (1979), its "Filter Vel Bass" patch, recorded by Modular Samples'),
    'acidbass': dict(folder='sh2/Audio/Rezzy Saw Vel/', off=-24, attack=0.003, loop=False, maxShift=19,
                     name={'en': 'Recorded analog synth bass, resonant (for the acid sound)', 'es': 'Bajo de sintetizador analógico grabado, resonante (para el sonido ácido)'},
                     source='A Roland SH-2 analog synthesizer (1979), its "Rezzy Saw Vel" patch, recorded by Modular Samples'),
}
VEL = [0, 0.26, 0.51, 0.75]           # the library's velocity splits (1-32, 33-64, 65-95, 96-127) as the page's 0-1
LOOP_AT, LOOP_LEN, XF = 2.2, 1.0, 0.03
ATTACK = 0.003                         # the synth's gate opens in one sample; eased over 3 ms (as the page's own player does)
TAIL = 0.25


def attack(x, sec=ATTACK):
    """the note's first 3 ms eased in (a raised cosine from where it starts): the SH-2's gate opens at once, and an MP3
    smears so sharp a step into the silence before it; the page eases every note in over 3 ms anyway"""
    on = B.onset(x)
    n = int(sec * SR)
    y = x.copy()
    y[on:on + n] *= np.sin(np.linspace(0, np.pi / 2, n)) ** 2
    return y

_zip = None
def archive():
    global _zip
    if _zip is None:
        _zip = zipfile.ZipFile(Parts([URL]))
    return _zip


def cached(info):
    p = os.path.join(CACHE, 'sh2', info.filename)
    if not (os.path.exists(p) and os.path.getsize(p) == info.file_size):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with archive().open(info) as s, open(p + '.part', 'wb') as d:
            d.write(s.read())
        os.replace(p + '.part', p)
    return p


def layers_of(folder):
    """{key: [member, ...]}; the four takes of a key are its four strengths, told apart (as the library's own mapping
    does) by how loud and bright each is: sorted by loudness"""
    out = {}
    for i in archive().infolist():
        if not i.filename.startswith(folder) or i.is_dir():
            continue
        m = re.match(r'^(\d+)([A-G]#?)(-?\d)-[A-Z0-9]+\.(aif|wav)$', i.filename.rsplit('/', 1)[-1])
        if m:
            out.setdefault(int(m.group(1)), []).append(i)
    return out


def sfz_order(name):
    """the library's own mapping (its SFZ): for each key, its files from the softest strength to the hardest"""
    import urllib.request, urllib.parse
    p = os.path.join(CACHE, 'raw', 'Roland-SH-2', 'SFZ', name + '.sfz')
    if not os.path.exists(p):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        url = 'https://raw.githubusercontent.com/publicsamples/Roland-SH-2/master/SFZ/' + urllib.parse.quote(name + '.sfz')
        open(p, 'wb').write(urllib.request.urlopen(url, timeout=120).read())
    order = {}
    for line in open(p, encoding='utf-8', errors='replace'):
        m = re.search(r'lovel=(\d+).*sample=.*/((\d+)[A-G]#?-?\d-[A-Z0-9]+\.(?:aif|wav))', line)
        if m:
            order.setdefault(int(m.group(3)), []).append((int(m.group(1)), m.group(2)))
    return {k: [f for _, f in sorted(v)] for k, v in order.items()}


def loop_points(x, m):
    """a stretch of about LOOP_LEN s from LOOP_AT s after the onset: a whole number of the note's waves, nudged to where
    the 30 ms before its end best matches the 30 ms before its start; then that end blended into the start (XF), so the
    turn is seamless. Returns (x with the blend, (start, end) in samples, end included)"""
    on = B.onset(x)
    period = SR / B.midi_hz(m)
    ls = on + int(LOOP_AT * SR)
    W = int(XF * SR)
    k = max(1, round(LOOP_LEN * SR / period))
    best = None
    for kk in range(max(1, k - 3), k + 4):
        for d in range(-3, 4):
            le = ls + int(round(kk * period)) + d
            if le + 2 >= len(x):
                continue
            a, b = x[le - W:le], x[ls - W:ls]
            r = float(np.dot(a, b) / math.sqrt(np.dot(a, a) * np.dot(b, b) + 1e-30))
            if best is None or r > best[0]:
                best = (r, le)
    r, le = best
    y = x.copy()
    w = np.sin(np.linspace(0, np.pi / 2, W)) ** 2
    y[le - W:le] = x[le - W:le] * (1 - w) + x[ls - W:ls] * w
    return y, (ls, le - 1), r


def build(sid):
    d = DEFS[sid]
    keys = layers_of(d['folder'])
    order = sfz_order({'synthbass': 'Filter Vel Bass', 'acidbass': 'Rezzy Saw Vel'}[sid])
    items, seams = [], []
    keys = {k: v for k, v in keys.items() if k + d['off'] >= 24}      # from C1 up (the bass's lowest notes)
    # every other key (no note more than one key from a recording), so a set of four strengths stays small enough for a
    # phone; on the keys where every strength was recorded ("Filter Vel Bass" has only three on its "48C2")
    full = lambda k: len(order.get(k) or keys[k]) == len(VEL)
    lo = next(a for a in (min(keys), min(keys) + 1) if all(full(k) for k in keys if (k - a) % 2 == 0 and k >= a))
    for key in sorted(keys):
        if key < lo or (key - lo) % 2:
            continue
        by_name = {i.filename.rsplit('/', 1)[-1]: i for i in keys[key]}
        names = order.get(key) or sorted(by_name)
        m = key + d['off']
        for v, nm in enumerate(names, 1):
            if nm not in by_name:
                raise SystemExit('%s: %s is in the mapping but not in the archive' % (sid, nm))
            path = cached(by_name[nm])
            x = attack(B.load(path), d['attack'])
            it = dict(out='m%d_v%d_r1.mp3' % (m, v), kind='sus', m=m, s=None, v=v, r=1, src=SRC + by_name[nm].filename,
                      x=x, layer=('sus', v))
            if d['loop']:
                it['x'], it['lp'], r = loop_points(x, m)
                seams.append(r)
            else:
                it['tail'] = TAIL            # the recording stops just before the note has quite died away: faded out
            items.append(it)
    meta = dict(id=sid, instrument='bass', name=d['name'], source=d['source'], license=LICENSE, tuning=[28, 33, 38, 43],
                vel=VEL, maxShift=d['maxShift'])
    return items, meta, seams


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', choices=list(DEFS))
    ap.add_argument('--report', default=os.path.join(HERE, 'synth_sources.json'))
    a = ap.parse_args()
    try:
        allrep = json.load(open(a.report))
    except (OSError, ValueError):
        allrep = {}
    for sid in DEFS:
        if a.only and a.only != sid:
            continue
        items, meta, seams = build(sid)
        d = os.path.join(OUT, sid)
        if os.path.isdir(d):
            for f in os.listdir(d):
                if f.endswith('.mp3') or f == 'set.json':
                    os.remove(os.path.join(d, f))
        rep = []
        layer_db, off = B.render(items, meta, d, rep)
        # the page plays these recordings as they are (their own filter and envelope)
        jf = os.path.join(d, 'set.json')
        S = json.load(open(jf, encoding='utf-8'))
        S['play'] = 'straight'
        open(jf, 'w', encoding='utf-8').write(B.json_text(S))
        allrep[sid] = dict(layers_recorded_lufs={'%s v%d' % ly: round(v, 2) for ly, v in layer_db.items()},
                           set_offset_db=round(off, 2), loop_seam_match_min=round(min(seams), 4) if seams else None, files=rep)
        size = sum(os.path.getsize(os.path.join(d, f)) for f in os.listdir(d))
        print('%s: %d files, %d bytes (%.2f MB)' % (sid, len(os.listdir(d)), size, size / 1e6))
    with open(a.report, 'w') as fh:
        json.dump(allrep, fh, indent=1)


if __name__ == '__main__':
    main()
