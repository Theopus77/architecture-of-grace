#!/usr/bin/env python3
"""AOG-SPT-MAR-PENCIL-V1 — the pencil still lifes for Sports History (spt) and The Measured Step (mar).

Objects only (GUIDE.md, HANDOFF-HISTORY-BOOKS.md §5): equipment at rest, papers, books and a
shopfront model. Nobody is drawn, nothing is mid-strike. Each scene is a short list of objects from
kit/sptmar.glsl; this script writes kit/scenes/<id>-still.glsl, the params (params_sptmar.json) and
the alt texts (alt_sptmar.json), and can run the whole pipeline for one id or all of them.

  python3 pencil/sptmar_scenes.py write            # scenes, params, alt texts
  python3 pencil/sptmar_scenes.py render ID|all [--final]   # frame, g-buffers, pencil proof (and export)
Run from aog-deploy/_work/art/.
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, '..', 'kit')

# (object, x, z, ry, scale, k, y)
S = {
 'spt-u1': ("a big rubber playground ball, a foam swim kickboard and a coach's whistle",
   [('kickboard', -.22, .12, 1.2, 1, 0, 0), ('playball', .05, .02, 0, 1, 0, 0), ('whistle', .2, -.1, .6, 1, 0, 0)]),
 'spt-u2': ("a field cone standing on a sheet with a field plan drawn on it, and a stick of chalk",
   [('plan', 0, 0, .12, 1, 1, 0), ('cone', .08, .03, 0, 1, 0, .0024), ('chalk', -.11, -.08, .5, 1, 0, .0024)]),
 'spt-u3': ("an old suitcase standing on its edge, with a baseball and a tennis ball on the table in front of it",
   [('suitcase', 0, .08, .1, 1, 0, 0), ('baseball', .19, -.07, 0, 1, 0, 0), ('tennisball', -.16, -.09, 0, 1, 0, 0)]),
 'spt-u4': ("an open scorebook with a grid of little diamonds, a baseball resting on it and a wooden bat behind",
   [('bat', .02, .22, -.9, 1, 0, 0), ('scorebook', 0, 0, .1, 1, 0, 0), ('baseball', .09, -.02, 0, 1, 0, .012)]),
 'spt-u5': ("a wooden peach basket with a basketball beside it",
   [('basket', 0, .05, 0, 1, 0, 0), ('basketball', .22, -.1, .4, 1, 0, 0)]),
 'spt-u6': ("a leather football, a soccer ball with its dark patches and an old leather football helmet",
   [('helmet', .0, .2, .3, 1, 0, 0), ('football', -.13, -.03, .4, 1, 0, 0), ('soccer', .15, .0, 0, 1, 0, 0)]),
 'spt-u7': ("a track hurdle, a stopwatch, a wooden tennis racket and a tennis ball",
   [('hurdle', 0, .14, 0, 1, 0, 0), ('racket', -.1, -.08, -.3, 1, 0, 0), ('stopwatch', .14, -.1, .5, 1, 0, 0), ('tennisball', .3, -.02, 0, 1, 0, 0)]),
 'spt-u8': ("a closed record book with a baseball on its cover, and a padlock beside it",
   [('book', 0, 0, .15, 1, .025, 0), ('baseball', -.03, -.03, 0, 1, 0, .05), ('padlock', .2, -.06, -.3, 1, 0, 0)]),
 'spt-u9': ("a folded newspaper, a basketball and a ticket stub",
   [('newspaper', -.05, .05, .25, 1, 0, 0), ('basketball', .22, .02, 0, 1, 0, 0), ('ticket', -.08, -.17, .3, 1, 0, .009)]),
 'spt-u10': ("a trophy, a thick closed rulebook and a judge's gavel on its block",
   [('trophy', 0, .06, 0, 1.25, 0, 0), ('book', -.2, -.08, .3, .9, .03, 0), ('gavel', .2, -.1, .3, 1, 0, 0)]),
 'spt-u11': ("a racing wheelchair wheel lying flat, a small trophy and a ticket stub",
   [('wheel', 0, .02, 0, 1, 0, 0), ('trophy', .24, -.02, 0, 1, 0, 0), ('ticket', -.18, -.15, -.3, 1, 0, 0)]),
 'spt-u12': ("a signed contract, a fountain pen and a small stack of coins",
   [('contract', 0, 0, .1, 1, 0, 0), ('pen', .03, -.07, .5, 1, 0, .002), ('coins', .17, -.09, 0, 1, 7, 0)]),
 'spt-u13': ("an old television set with rabbit-ear antennas, a radio microphone on its stand and a record book",
   [('tv', 0, .06, .25, 1, 0, 0), ('mic', .25, -.04, 0, 1, 0, 0), ('book', -.14, -.17, .3, .8, .015, 0)]),
 'spt-u14': ("two trophies, one taller than the other, and a few coins",
   [('trophy', -.06, .02, 0, 1.25, 0, 0), ('trophy', .1, -.03, .3, .8, 0, 0), ('coins', .21, -.1, 0, 1, 4, 0)]),
 'spt-u15': ("a thick rulebook, two ticket stubs and a stack of coins",
   [('book', 0, 0, .2, 1, .032, 0), ('ticket', .19, -.1, .4, 1, 0, 0), ('ticket', .21, -.14, -.2, 1, 0, .0018), ('coins', -.18, -.1, 0, 1, 5, 0)]),
 'spt-u16': ("a doctor's beam scale, a clipboard with a checklist and a tape measure",
   [('scale', 0, .05, .3, 1, 0, 0), ('clipboard', -.25, -.05, .2, 1, 0, 0), ('tape', .2, -.12, -.4, 1, 0, 0)]),
 'spt-u17': ("a sheet with a running track drawn on it, a magnifying glass and a pencil",
   [('plan', 0, 0, .05, 1, 2, 0), ('magnifier', .06, -.02, .5, 1, 0, .0024), ('pencil', -.1, -.07, .3, 1, 0, .0024)]),
 'sports-hub': ("a basketball, a baseball, a wooden bat and a whistle",
   [('bat', -.02, .26, -.9, 1, 0, 0), ('basketball', 0, .04, 0, 1, 0, 0), ('baseball', .18, -.08, 0, 1, 0, 0), ('whistle', -.18, -.1, .4, 1, 0, 0)]),

 'mar-u1': ("a sheet with a circle drawn on it, a pair of straw sandals on the sheet and a tatami mat behind",
   [('tatami', .02, .28, 0, 1, 0, 0), ('plan', 0, 0, 0, 1, 3, 0), ('zori', .1, -.02, .12, 1, 0, .0024), ('zori', .21, -.02, -.1, 1, 0, .0024)]),
 'mar-u2': ("a folded white practice jacket with a dark belt laid across it",
   [('gi', 0, 0, .2, 1, 0, 0), ('belt', 0, 0, .2, 1, 0, 0)]),
 'mar-u3': ("a sand timer and a whistle on a tatami mat",
   [('tatami', 0, .05, 0, 1, 0, 0), ('hourglass', .05, .04, 0, 1, 0, .06), ('whistle', .2, -.06, .5, 1, 0, .06)]),
 'mar-u4': ("a rolled-up wrestling mat and a trophy",
   [('rolledmat', 0, .06, .2, 1, 0, 0), ('trophy', .22, -.08, 0, 1, 0, 0)]),
 'mar-u5': ("a wooden board of blank name tags and a closed rulebook",
   [('nafuda', 0, .12, 0, 1, 0, 0), ('book', .05, -.08, .2, 1, .022, 0)]),
 'mar-u6': ("a globe on its stand and a rolled-up belt",
   [('globe', 0, .02, 0, 1, 0, 0), ('beltcoil', .19, -.08, .3, 1, 0, 0)]),
 'mar-u7': ("a berimbau bow with its gourd, a pandeiro tambourine and a round ring bell",
   [('berimbau', 0, .2, .1, 1, 0, 0), ('pandeiro', .02, -.02, 0, 1, 0, 0), ('ringbell', .27, -.05, .3, 1, 0, 0)]),
 'mar-u8': ("a paper lantern, a rolled scroll and a tea bowl",
   [('lantern', 0, .04, 0, 1, 0, 0), ('scroll', .19, -.09, -.3, 1, 0, 0), ('teabowl', -.16, -.06, 0, 1, 0, 0)]),
 'mar-u9': ("a travel suitcase, a map sheet with a dotted route and a ticket",
   [('suitcase', 0, .1, .15, 1, 0, 0), ('plan', .1, -.13, .2, 1, 5, 0), ('ticket', .14, -.12, -.3, 1, 0, .0024)]),
 'mar-u10': ("a gavel and its block on a tatami mat, with a key beside the mat",
   [('tatami', 0, .06, 0, 1, 0, 0), ('gavel', .02, .06, .3, 1, 0, .06), ('key', .27, -.15, .4, 1, 0, 0)]),
 'mar-u11': ("a small model of a storefront school with an awning, a key and a few coins",
   [('shopfront', 0, .05, .25, 1, 0, 0), ('key', .19, -.1, .3, 1, 0, 0), ('coins', -.17, -.1, 0, 1, 3, 0)]),
 'mar-u12': ("a certificate with a round seal, a wooden seal stamp and a rolled scroll",
   [('scroll', -.08, .16, .1, 1, 0, 0), ('certificate', 0, 0, .1, 1, 0, 0), ('stamp', .14, -.05, 0, 1, 0, 0)]),
 'mar-u13': ("an old film camera with two reels on top, a film reel lying flat and a ticket",
   [('camera', 0, .05, .35, 1, 0, 0), ('filmreel', .2, -.07, 0, 1, 0, 0), ('ticket', -.16, -.12, .3, 1, 0, 0)]),
 'mar-u14': ("a clipboard with a checklist, a whistle on it and a field cone",
   [('clipboard', 0, 0, .15, 1, 0, 0), ('whistle', .03, -.06, .5, 1, 0, .01), ('cone', .24, .06, 0, 1, 0, 0)]),
 'mar-u15': ("a signed contract, a fountain pen and a wooden seal stamp",
   [('contract', 0, 0, .05, 1, 0, 0), ('pen', .02, -.06, .4, 1, 0, .002), ('stamp', .17, -.02, 0, 1, 0, 0)]),
 'mar-u16': ("a balance scale with two empty pans, and a closed book",
   [('balance', 0, .03, 0, 1, 0, 0), ('book', .25, -.1, .3, .8, .015, 0)]),
 'mar-u17': ("a sheet with a floor plan of mats drawn on it, a ruler and a pencil",
   [('plan', 0, 0, .05, 1, 4, 0), ('ruler', .03, -.12, .1, 1, 0, .0024), ('pencil', .12, -.02, .5, 1, 0, .0024)]),
 'martial-arts-hub': ("a sand timer and a rolled-up belt on a tatami mat, with a tea bowl beside the mat",
   [('tatami', 0, .06, 0, 1, 0, 0), ('hourglass', -.04, .06, 0, 1.2, 0, .06), ('beltcoil', .12, .02, .3, 1, 0, .06), ('teabowl', .3, -.12, 0, 1, 0, 0)]),
}
BOOK = {'spt': ('Sports History', 'Sports History'), 'mar': ('The Measured Step', 'The Measured Step')}

# median tone per object for the params file
VAL = {'bat': .75, 'basketball': .45, 'helmet': .4, 'football': .4, 'tv': .5, 'camera': .35, 'beltcoil': .3, 'belt': .3, 'padlock': .5,
       'plan': .92, 'sheet': .92, 'contract': .92, 'certificate': .9, 'newspaper': .82, 'ticket': .9, 'gi': .9, 'chalk': .95,
       'kickboard': .85, 'baseball': .85, 'tennisball': .75, 'soccer': .75, 'playball': .6, 'clipboard': .75, 'scorebook': .85,
       'lantern': .8, 'scroll': .8, 'hourglass': .75, 'nafuda': .6, 'tatami': .7}
TEX = {'plan', 'contract', 'certificate', 'newspaper', 'ticket', 'scorebook', 'clipboard', 'ruler', 'stopwatch', 'baseball',
       'basketball', 'soccer', 'gi', 'belt', 'tatami', 'nafuda', 'racket', 'book', 'tape', 'radio', 'tv', 'mic', 'filmreel', 'hurdle', 'shopfront'}

GROW = {'whistle': 1.8, 'stopwatch': 1.6, 'key': 1.8, 'coins': 2.2, 'ticket': 1.6, 'chalk': 1.6, 'medal': 1.5, 'pen': 1.4,
        'padlock': 1.6, 'tennisball': 1.4, 'baseball': 1.4, 'zori': 1.3, 'tape': 1.5, 'stamp': 1.4, 'magnifier': 1.3, 'pencil': 1.2}
HIGH = {'spt-u2', 'spt-u4', 'spt-u9', 'spt-u12', 'spt-u17', 'mar-u1', 'mar-u9', 'mar-u12', 'mar-u14', 'mar-u15', 'mar-u17'}

def glsl(uid):
    desc, objs = S[uid]
    objs = [(o, x, z, ry, s * GROW.get(o, 1), k, y) for (o, x, z, ry, s, k, y) in objs]
    L = ['/* %s — pencil still life (AOG-SPT-MAR-PENCIL-V1): %s. Objects only. Written by pencil/sptmar_scenes.py. */' % (uid, desc),
         '#define CAM_POS vec3(-0.2200,0.5500,-0.8500)' if uid in HIGH else '#define CAM_POS vec3(-0.2200,0.3000,-0.9500)', '#define CAM_TGT vec3(0.0000,0.0400,0.0200)', '#define CAM_FOV 30.',
         '#define SUN_DIR vec3(-.7,.85,-.3)', '#define MAXT 8.', '#define EXPOSURE 1.', '#define STEPS 220', '#define SHADOW_MAXSTEP .02',
         '#include "lib.glsl"', '#include "studio.glsl"', '#include "sptmar.glsl"']
    for i, (o, x, z, ry, s, k, y) in enumerate(objs):
        L.append('vec3 Q%d(vec3 p){ vec3 q=p-vec3(%.4f,%.4f,%.4f); q.xz=rot(%.4f)*q.xz; return q/%.4f; }' % (i, x, y, z, ry, s))
    L.append('vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);')
    for i, (o, x, z, ry, s, k, y) in enumerate(objs):
        L.append('  r=U(r,o_%s(Q%d(p),%.4f)*%.4f,%d.);' % (o, i, k, s, i + 3))
    L.append('  return r; }')
    L.append('float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;')
    for i, (o, x, z, ry, s, k, y) in enumerate(objs):
        L.append('  if(id==%d.) return t_%s(Q%d(p),%.4f);' % (i + 3, o, i, k))
    L.append('  return .7; }')
    return '\n'.join(L) + '\n'

def params(uid):
    objs = S[uid][1]
    mat = {"1": [0.99, 0.8], "2": [0.97, 0.3]}; tex = {}
    for i, (o, *_r) in enumerate(objs):
        v = VAL.get(o, .6); mat[str(i + 3)] = [v, 1.0 if v > .85 else 1.3, None, 0.9]
        if o in TEX: tex[str(i + 3)] = [0.12, 0.4, 0.75]
    return {"scene": uid + "-still", "mat": mat, "texlines": tex, "focus": [0.7, 0.35, 0.4, 0.9], "fmin": 0.15, "far0": 0.6, "far1": 0.95,
            "aerial": 0.5, "cn0": 0.3, "cn1": 0.9, "cons": [[[0.0, 0.27], [1.0, 0.25], 45]], "proc": True, "ck": 1.0, "cw": 1.3,
            "smudge": 0.3, "slice": True, "bg": [0, 1, 2], "ridge": True, "vigx": 0.03}

def write():
    P, A = {}, {}
    for uid in S:
        f = os.path.join(KIT, 'scenes', uid + '-still.glsl')
        old = open(f).read() if os.path.exists(f) else ''
        new = glsl(uid)
        if old:   # keep a camera that frame.py already fitted
            import re
            for key in ('CAM_POS', 'CAM_TGT'):
                m = re.search(r'#define %s vec3\([^)]*\)' % key, old)
                if m: new = re.sub(r'#define %s vec3\([^)]*\)' % key, m.group(0), new)
        open(f, 'w').write(new)
        P[uid] = params(uid); A[uid] = 'A pencil drawing of ' + S[uid][0]
    json.dump(P, open(os.path.join(HERE, 'params_sptmar.json'), 'w'), indent=1)
    json.dump(A, open(os.path.join(HERE, 'alt_sptmar.json'), 'w'), indent=1, ensure_ascii=False)
    print('wrote %d scenes' % len(S))

def render(uid, final, tmp):
    os.makedirs(tmp, exist_ok=True)
    subprocess.run(['python3', os.path.join(HERE, 'frame.py'), uid, '--iters', '5'], check=True)
    subprocess.run(['node', 'gbuf.js', uid + '-still', tmp], cwd=KIT, check=True)
    for f in ('n', 'd', 'photo', 't'):
        os.replace(os.path.join(tmp, '%s-still-%s.png' % (uid, f)), os.path.join(tmp, '%s-%s.png' % (uid, f)))
    cmd = ['python3', os.path.join(HERE, 'pencil.py'), uid, '--gbuf', tmp, '--out', tmp, '--params', os.path.join(HERE, 'params_sptmar.json')]
    if final: cmd.append('--final')
    subprocess.run(cmd, check=True)

if __name__ == '__main__':
    if sys.argv[1] == 'write': write()
    else:
        ids = list(S) if sys.argv[2] == 'all' else sys.argv[2].split(',')
        for uid in ids: render(uid, '--final' in sys.argv, '/tmp/claude-0/pencil-sptmar')
