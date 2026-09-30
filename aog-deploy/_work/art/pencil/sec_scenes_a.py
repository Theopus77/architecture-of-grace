#!/usr/bin/env python3
"""AOG-SEC-PENCIL-A — pencil still lifes for Secret Societies, K-12 (sec), units 1-9.

Objects only (GUIDE.md): no people, no faces, no emblems, no flags, no readable text. Each scene is a
short list of objects from kit/secparts_a.glsl (plus kit/sptmar.glsl). This script writes
kit/scenes/<id>-still.glsl, pencil/params_secA.json and pencil/alt_secA.json, and runs the pipeline
for one id at a time.

  python3 pencil/sec_scenes_a.py write
  python3 pencil/sec_scenes_a.py render ID [--final]
Run from aog-deploy/_work/art/.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.join(HERE, '..', 'kit')
TMP = '/tmp/claude-0/pencil-secA'

# (object, x, z, ry, scale, k, y)
S = {
 'sec-u1': ("a wooden club sign standing on two little feet, with rows of painted strokes for its hand-lettered words, "
            "a small tin box with a keyhole and an old key lying in front",
   [('sign', 0, .06, .1, 1, 0, 0), ('tin', .23, -.05, -.35, 1, 0, 0), ('skey', .1, -.14, .5, 1.3, 0, 0)]),
 'sec-u2': ("a school slate propped up with a simple code grid and an X drawn on it in chalk, some cells marked with dots, "
            "a stick of chalk and a folded note closed with a round wax seal",
   [('slate', 0, .04, .12, 1, 0, 0), ('chalk', -.03, -.1, .45, 1.2, 0, 0), ('sealnote', .21, -.07, -.3, 1.45, 0, 0)]),
 'sec-u3': ("a squared building stone with chiselled faces and a small carved mason's mark, a steel square standing against it, "
            "a round wooden mallet and a chisel",
   [('stone', 0, .04, .35, 1, 0, 0), ('msq', -0.0040, -0.0658, .35, 1, 1, 0), ('mallet', .14, -.15, -.25, 1, 0, 0),
    ('chisel', -.12, -.13, .3, 1, 0, 0)]),
 'sec-u4': ("a small clay jar with painted bands, an old clay oil lamp and a tied sheaf of wheat",
   [('jar', 0, .06, 0, 1.1, 0, 0), ('lamp', .19, -.08, -.45, 1.2, 0, 0), ('wheat', -.13, -.1, .15, 1.3, 0, 0)]),
 'sec-u5': ("a folded plain cloak with a sword in its sheath lying across it, and a rolled parchment standing on end, tied with a ribbon "
            "and hung with a round wax seal",
   [('mantle', -.06, .04, .15, 1, 0, 0), ('sword', -.04, .02, .42, 1, 0, 0), ('proll', .16, -.02, .3, 1.1, 1, 0)]),
 'sec-u6': ("an open ledger book with ruled columns and rows of entries, an inkwell holding a feather quill "
            "and a small wooden gavel",
   [('ledger', 0, 0, .08, 1.6, 0, 0), ('inkwell', .26, .09, 0, 1.2, 0, 0), ('gavel2', .27, -.12, -.9, 1.3, 0, 0)]),
 'sec-u7': ("a wooden cipher wheel standing on its little stand, its two rings marked with A, B, C and 1, 2, 3, "
            "in front of a thick old leather-bound book with clasps, and a magnifying glass",
   [('manu', -.05, .12, .3, 1, 0, 0), ('cdisk', .07, -.03, -.15, 1.15, 0, 0), ('magnifier', .23, -.13, .6, 1, 0, 0)]),
 'sec-u8': ("a drawing compass standing open on a drafting plan of a stone arch, with a set square and a pencil",
   [('aplan', 0, 0, .05, 1, 0, 0), ('divid', .13, .03, -.15, 1.1, 0, .0016), ('setsq', -.16, -.1, .3, .8, 0, .0016),
    ('pencil', .1, -.135, -.12, 1, 0, .0016)]),
 'sec-u9': ("a carved wooden stool with a raffia fringe hanging from each end, a round gourd bowl with carved bands "
            "and a folded length of strip-woven patterned cloth",
   [('stool', 0, .05, .15, 1.1, 0, 0), ('gourd', .25, -.04, 0, 1, 0, 0), ('kcloth', -.12, -.15, .2, 1, 0, 0)]),
}
VAL = {'sign': .62, 'tin': .5, 'skey': .45, 'slate': .38, 'chalk': .95, 'sealnote': .85, 'stone': .72, 'msq': .5,
       'mallet': .55, 'chisel': .45, 'jar': .5, 'lamp': .55, 'wheat': .65, 'mantle': .9, 'sword': .4, 'proll': .8,
       'ledger': .88, 'inkwell': .35, 'gavel2': .48, 'cdisk': .68, 'manu': .38, 'magnifier': .6, 'aplan': .92,
       'divid': .55, 'setsq': .8, 'pencil': .6, 'stool': .45, 'gourd': .62, 'kcloth': .55}
TEX = {'sign', 'tin', 'slate', 'sealnote', 'stone', 'msq', 'jar', 'lamp', 'wheat', 'sword', 'proll', 'ledger', 'inkwell',
       'cdisk', 'manu', 'aplan', 'setsq', 'stool', 'gourd', 'kcloth', 'gavel2'}
HIGH = {'sec-u3', 'sec-u5', 'sec-u6', 'sec-u8'}

def glsl(uid):
    desc, objs = S[uid]
    L = ['/* %s — pencil still life (AOG-SEC-PENCIL-A): %s. Objects only. Written by pencil/sec_scenes_a.py. */' % (uid, desc),
         '#define CAM_POS vec3(-0.2200,0.5500,-0.8500)' if uid in HIGH else '#define CAM_POS vec3(-0.2200,0.3000,-0.9500)',
         '#define CAM_TGT vec3(0.0000,0.0400,0.0200)', '#define CAM_FOV 30.',
         '#define SUN_DIR vec3(-.7,.85,-.3)', '#define MAXT 8.', '#define EXPOSURE 1.', '#define STEPS 220', '#define SHADOW_MAXSTEP .02',
         '#include "lib.glsl"', '#include "studio.glsl"', '#include "sptmar.glsl"', '#include "secparts_a.glsl"']
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
        if o in TEX: tex[str(i + 3)] = [0.12, 0.4, 0.8]
    return {"scene": uid + "-still", "mat": mat, "texlines": tex, "focus": [0.7, 0.35, 0.4, 0.9], "fmin": 0.15, "far0": 0.6, "far1": 0.95,
            "aerial": 0.5, "cn0": 0.3, "cn1": 0.9, "cons": [[[0.0, 0.27], [1.0, 0.25], 45]], "proc": True, "ck": 1.0, "cw": 1.3,
            "smudge": 0.3, "slice": True, "bg": [0, 1, 2], "ridge": True, "vigx": 0.03}

def write(only=None):
    pf, af = os.path.join(HERE, 'params_secA.json'), os.path.join(HERE, 'alt_secA.json')
    P = json.load(open(pf)) if os.path.exists(pf) else {}
    A = json.load(open(af)) if os.path.exists(af) else {}
    for uid in S:
        if only and uid not in only: continue
        f = os.path.join(KIT, 'scenes', uid + '-still.glsl')
        old = open(f).read() if os.path.exists(f) else ''
        new = glsl(uid)
        if old:   # keep a camera that frame.py already fitted
            for key in ('CAM_POS', 'CAM_TGT'):
                m = re.search(r'#define %s vec3\([^)]*\)' % key, old)
                if m: new = re.sub(r'#define %s vec3\([^)]*\)' % key, m.group(0), new)
        open(f, 'w').write(new)
        if uid not in P: P[uid] = params(uid)
        A[uid] = 'A pencil drawing of ' + S[uid][0] + '.'
    json.dump(P, open(pf, 'w'), indent=1)
    json.dump(A, open(af, 'w'), indent=1, ensure_ascii=False)

def render(uid, final, frame=True):
    os.makedirs(TMP, exist_ok=True)
    if frame: subprocess.run(['python3', os.path.join(HERE, 'frame.py'), uid, '--iters', '4'], check=True)
    subprocess.run(['node', 'gbuf.js', uid + '-still', TMP], cwd=KIT, check=True)
    for f in ('n', 'd', 'photo', 't'):
        os.replace(os.path.join(TMP, '%s-still-%s.png' % (uid, f)), os.path.join(TMP, '%s-%s.png' % (uid, f)))
    cmd = ['python3', os.path.join(HERE, 'pencil.py'), uid, '--gbuf', TMP, '--out', TMP, '--params', os.path.join(HERE, 'params_secA.json')]
    if final: cmd.append('--final')
    subprocess.run(cmd, check=True)

if __name__ == '__main__':
    if sys.argv[1] == 'write': write(sys.argv[2].split(',') if len(sys.argv) > 2 else None)
    else: render(sys.argv[2], '--final' in sys.argv, '--noframe' not in sys.argv)
