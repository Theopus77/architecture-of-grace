#!/usr/bin/env python3
"""Write the SEL room banner scenes (kit/scenes/sel<room>-u<n>-still.glsl) and their
pencil/params-sel.json entries (kept apart from params2.json, which other courses share). Each unit of each SEL room gets one calm still life, built from
kit/selparts.glsl. Re-run safely: a scene file whose camera frame.py has already fitted
keeps its camera (only the objects are rewritten). Run from aog-deploy/_work/art."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.join(HERE, '..', 'kit', 'scenes')
# object kinds: (distance expr, tone expr) in the part's local frame q
K = {
 'mug':    ('mug(q,{r},{h})', 'mugT(q,{r},{h},.72)'),
 'bowl':   ('bowl(q,{R},{H})', 'bowlT(q,{R},{H},.8,{seams})'),
 'chair':  ('chair(q,{sh})', 'chairT(q,{sh})'),
 'ball':   ('ball(q,{r})', 'ballT(q,{r})'),
 'apple':  ('apple(q,{r},{pear})', 'appleT(q,{r})'),
 'basket': ('basket(q,{R},{H})', 'basketT(q,{R},{H})'),
 'pot':    ('pot(q,{r},{h})', 'potT(q,{r},{h})'),
 'sprout': ('sprout(q,{sh},{ll},{n})', '.5'),
 'wcan':   ('wcan(q,{r},{h})', 'wcanT(q,{r},{h})'),
 'bookC':  ('bookC(q,vec3({hx},{hy},{hz})).x', '.45'),
 'pages':  ('bookC(q,vec3({hx},{hy},{hz})).y', 'bookCT(q,vec3({hx},{hy},{hz}),.45)'),
 'bookO':  ('bookO(q,{w},{dd}).x', 'pageT(q,{w},{dd},{seed})'),
 'cover':  ('bookO(q,{w},{dd}).y', '.42'),
 'pencil': ('pencilL(q,{L})', 'pencilT(q,{L})'),
 'compass':('compass(q,{R})', 'compassT(q,{R})'),
 'map':    ('mapS(q,{hx},{hz})', 'mapT(q)'),
 'lantern':('lantern(q,{w},{h})', 'lanternT(q,{w},{h})'),
 'timer':  ('timer(q,{r},{h})', 'timerT(q,{r},{h})'),
 'boat':   ('boat(q,{L})', 'boatT(q,{L})'),
 'mirror': ('mirror(q,{R})', 'mirrorT(q,{R})'),
 'teapot': ('teapot(q,{r})', 'teapotT(q,{r})'),
 'trowel': ('trowel(q)', 'trowelT(q)'),
 'lamp':   ('lampD(q,{s})', 'lampT(q)'),
 'key':    ('key(q,{L})', '.4'),
 'crate':  ('crate(q,vec3({hx},{hy},{hz}))', 'crateT(q,vec3({hx},{hy},{hz}))'),
 'brush':  ('brush(q,{L})', 'brushT(q,{L})'),
 'jar':    ('jar(q,{r},{h})', '.55'),
 'blanket':('blanket(q,vec3({hx},{hy},{hz}))', 'blanketT(q)'),
 'pframe': ('pframe(q,vec2({hx},{hy}))', 'pframeT(q,vec2({hx},{hy}))'),
 'stones': ('stones(q,{r})', '.5'),
}
def o(kind, x, y, z, ry=0., val=None, **a): return dict(kind=kind, c=(x, y, z), ry=ry, val=val, a=a)
def book(x, y, z, ry, hx, hy, hz): return [o('bookC', x, y, z, ry, .45, hx=hx, hy=hy, hz=hz), o('pages', x, y, z, ry, .88, hx=hx, hy=hy, hz=hz)]
def journal(x, y, z, ry, w, dd, seed): return [o('bookO', x, y, z, ry, .92, w=w, dd=dd, seed=seed), o('cover', x, y, z, ry, .42, w=w, dd=dd)]
def plant(x, z, r, h, sh, ll, n): return [o('pot', x, 0, z, 0, .6, r=r, h=h), o('sprout', x, h - .016, z, .4, .5, sh=sh, ll=ll, n=n)]
H = 1.5708
S = {
 # Room 12 (K-2): Knowing & Accepting Yourself / Self-Compassion / Empathy & Forgiving / Grace & Generosity
 'sel12-u1': ('a round standing mirror, a small potted plant and a pencil',
   [o('mirror', 0, 0, .05, .3, .8, R=.1)] + plant(.17, -.02, .05, .07, .09, .035, 3) + [o('pencil', -.05, .0066, -.12, .4, .55, L=.09)]),
 'sel12-u2': ('a watering can beside a young sprout in a clay pot',
   [o('wcan', -.03, 0, .04, .2, .66, r=.06, h=.1)] + plant(.2, -.03, .045, .065, .07, .03, 2)),
 'sel12-u3': ('two small wooden chairs facing each other, with a ball between them',
   [o('chair', -.1, 0, 0, -H, .6, sh=.1), o('chair', .1, 0, 0, H, .6, sh=.1), o('ball', 0, 0, -.05, 0, .7, r=.03)]),
 'sel12-u4': ('a basket of apples, with one apple set out to share',
   [o('basket', 0, 0, .03, .3, .6, R=.1, H=.07), o('apple', -.04, .04, .03, 0, .5, r=.035, pear=0.), o('apple', .035, .04, .05, 1., .5, r=.035, pear=0.),
    o('apple', 0, .045, -.01, 2., .5, r=.035, pear=0.), o('apple', .16, 0, -.08, .5, .5, r=.035, pear=0.)]),
 # Room 18
 'sel18-u1': ('a pocket compass lying on a closed journal, with a pencil beside it',
   book(0, .018, .02, .15, .11, .018, .075) + [o('compass', .01, .036, 0, .3, .6, R=.045), o('pencil', .16, .0066, -.08, -.5, .55, L=.09)]),
 'sel18-u2': ('a candle lantern, a warm mug and a folded blanket',
   [o('lantern', -.02, 0, .05, .5, .35, w=.05, h=.17), o('mug', .12, 0, -.04, 2.4, .72, r=.035, h=.08), o('blanket', -.17, 0, -.03, .2, .65, hx=.1, hy=.03, hz=.07)]),
 'sel18-u3': ('a teapot with two cups set side by side, ready to share',
   [o('teapot', 0, 0, .06, .2, .6, r=.06), o('mug', -.11, 0, -.05, 2.6, .72, r=.032, h=.07), o('mug', .12, 0, -.06, -.4, .72, r=.032, h=.07)]),
 'sel18-u4': ('a wooden crate of pears, with one pear set out to share',
   [o('crate', 0, 0, .04, .15, .6, hx=.12, hy=.05, hz=.08), o('apple', -.05, .05, .04, 0, .5, r=.03, pear=1.), o('apple', .03, .05, .06, 1., .5, r=.03, pear=1.),
    o('apple', 0, .05, .0, 2., .5, r=.03, pear=1.), o('apple', .18, 0, -.08, .5, .5, r=.03, pear=1.)]),
 # Room 36
 'sel36-u1': ('an oval standing mirror beside two stacked books and a small plant',
   [o('mirror', .02, 0, .06, .25, .8, R=.11)] + book(-.14, .016, -.02, .2, .09, .016, .065) + book(-.135, .048, -.02, -.1, .08, .016, .06)
   + plant(.17, -.05, .04, .06, .07, .03, 2)),
 'sel36-u2': ('a desk lamp shining on an open feelings journal, with a pencil',
   [o('lamp', -.1, 0, .07, .3, .42, s=1.)] + journal(.05, .005, -.02, .1, .075, .07, 60) + [o('pencil', .1, .0066, -.13, .5, .55, L=.09)]),
 'sel36-u3': ('two chairs turned to face each other, with a small lantern between them',
   [o('chair', -.11, 0, 0, -H, .6, sh=.11), o('chair', .11, 0, 0, H, .6, sh=.11), o('lantern', 0, 0, .03, .4, .35, w=.028, h=.09)]),
 'sel36-u4': ('a candle lantern, an old key and a closed book',
   [o('lantern', 0, 0, .04, .5, .35, w=.05, h=.17), o('key', .12, 0, -.09, .4, .4, L=.14)] + book(-.13, .02, -.01, .25, .09, .02, .065)),
 # Room 104
 'sel104-u1': ('a small framed drawing of a hill and sun, a sketchbook and a pencil',
   [o('pframe', -.02, 0, .05, .2, .4, hx=.07, hy=.09)] + book(.13, .012, -.04, -.2, .1, .012, .07) + [o('pencil', .13, .031, -.04, .5, .55, L=.08)]),
 'sel104-u2': ('a mended bowl with gold seams and a small teacup',
   [o('bowl', 0, 0, .02, .5, .8, R=.09, H=.07, seams=1.), o('mug', .15, 0, -.06, .5, .72, r=.03, h=.05)]),
 'sel104-u3': ('two mugs facing each other across a sand timer',
   [o('mug', -.09, 0, 0, 0., .72, r=.032, h=.075), o('mug', .09, 0, -.02, 3.14, .72, r=.032, h=.075), o('timer', 0, 0, .08, .3, .5, r=.035, h=.11)]),
 'sel104-u4': ('a stack of well-read books with a young plant on top, and a small lantern',
   book(0, .02, .02, 0., .11, .02, .08) + book(.01, .058, .02, .15, .1, .018, .07) + plant(.0, .02, .04, .055, .07, .03, 2)[:0]
   + [o('pot', 0, .076, .02, 0, .6, r=.04, h=.055), o('sprout', 0, .115, .02, .4, .5, sh=.07, ll=.03, n=2), o('lantern', .18, 0, -.03, .4, .35, w=.035, h=.12)]),
 # Room 207
 'sel207-u1': ('a brass compass resting on an unrolled map, with a pencil',
   [o('map', 0, 0, .02, .05, .9, hx=.16, hz=.1), o('compass', .04, .002, 0, .2, .6, R=.05), o('pencil', -.08, .0086, -.04, .9, .55, L=.08)]),
 'sel207-u2': ('a mended bowl with gold seams, a fine brush and a small jar',
   [o('bowl', 0, 0, .03, .3, .8, R=.1, H=.075, seams=1.), o('brush', .13, 0, -.08, .4, .4, L=.16), o('jar', -.13, 0, -.02, 0, .55, r=.025, h=.04)]),
 'sel207-u3': ('a folded paper boat and a candle lantern',
   [o('boat', .03, 0, -.02, .3, .88, L=.16), o('lantern', -.12, 0, .08, .5, .35, w=.045, h=.16)]),
 'sel207-u4': ('a young tree in a clay pot, a garden trowel and an apple',
   plant(0, .04, .06, .09, .15, .05, 4) + [o('trowel', .14, 0, -.08, -.4, .5), o('apple', -.13, 0, -.06, 0, .5, r=.035, pear=0.)]),
}
HEAD = '''/* SEL {uid} — pencil still life: {desc}. Built from selparts.glsl by pencil/sel_scenes.py. */
#define CAM_POS vec3(-0.4500,0.5000,-1.0000)
#define CAM_TGT vec3(-0.1500,0.0000,0.1000)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
'''
def g(v): return repr(round(float(v), 4))
def main():
    base = json.load(open(os.path.join(HERE, 'params2.json')))['ela-u1']
    pp = os.path.join(HERE, 'params-sel.json'); P = {}
    for uid, (desc, objs) in S.items():
        f = os.path.join(KIT, uid + '-still.glsl')
        head = HEAD.format(uid=uid, desc=desc)
        if os.path.exists(f):   # keep a fitted camera
            old = open(f).read()
            for k in ('CAM_POS', 'CAM_TGT'):
                m = re.search(r'#define ' + k + r' vec3\([^)]*\)', old)
                if m: head = re.sub(r'#define ' + k + r' vec3\([^)]*\)', m.group(0), head)
        mp = ['vec2 map(vec3 p){', '  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.); vec3 q;']
        tn = ['float toneAlb(float id,vec3 p,vec3 n){', '  if(id==1.) return .7;', '  if(id==2.) return .9;', '  vec3 q;']
        mat = {'1': [0.99, 0.8], '2': [0.97, 0.3]}; tex = {}
        for i, ob in enumerate(objs):
            mid = i + 3; a = {k: g(v) for k, v in ob['a'].items()}
            de, te = K[ob['kind']]; de = de.format(**a); te = te.format(**a)
            c = 'vec3(%s,%s,%s)' % tuple(g(x) for x in ob['c'])
            mp.append('  q=P(p,%s,%s); r=U(r,%s,%d.);' % (c, g(ob['ry']), de, mid))
            tn.append('  if(id==%d.){ q=P(p,%s,%s); return %s; }' % (mid, c, g(ob['ry']), te))
            mat[str(mid)] = [ob['val'] or .6, 1.3, None, .9]
            if ob['kind'] == 'bowl': mat[str(mid)] = [.93, 1.0, None, .55]; tex[str(mid)] = [0.08, 0.3, 1.0]; continue
            if ob['kind'] in ('pages', 'bookO', 'compass', 'map', 'basket', 'bowl', 'mirror', 'pframe', 'timer', 'blanket', 'mug'):
                tex[str(mid)] = [0.12, 0.4, 0.8]
        mp += ['  return r; }']; tn += ['  return .7; }']
        open(f, 'w').write(head + '\n'.join(mp) + '\n' + '\n'.join(tn) + '\n')
        e = dict(base); e.update(scene=uid + '-still', mat=mat, texlines=tex)
        P[uid] = e
    json.dump(P, open(pp, 'w'), indent=1)
    print('wrote', len(S), 'SEL scenes')
if __name__ == '__main__': main()
