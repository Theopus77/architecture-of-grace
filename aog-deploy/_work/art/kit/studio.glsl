/* AOG render kit — studio.glsl: still-life helpers for the pencil scenes (include after
   lib.glsl). A scene defines map() and float toneAlb(float id, vec3 p, vec3 n) (grey
   albedo 0..1, may paint marks) and renders with gbuf.js (normals, depth/id, tone). */
#ifndef KEYSOFT
#define KEYSOFT 10.
#endif
#ifndef AOS
#define AOS .25
#endif
/* ---- 2D glyphs: distance to the centre line of a letter/numeral in a -0.5..0.5 box ---- */
float seg(vec2 p,vec2 a,vec2 b){ return sdSeg2(p,a,b); }
float arc(vec2 p,vec2 c,float r,float a0,float a1){ /* arc from angle a0 to a1 (radians, ccw) */
  vec2 q=p-c; float a=atan(q.y,q.x); float m=(a0+a1)*.5, h=(a1-a0)*.5;
  float d=a-m; d=mod(d+PI,2.*PI)-PI;
  if(abs(d)<=h) return abs(length(q)-r);
  vec2 e0=c+r*vec2(cos(a0),sin(a0)), e1=c+r*vec2(cos(a1),sin(a1));
  return min(length(p-e0),length(p-e1)); }
float glyph(vec2 p,int g){
  if(g==65){ return min(min(seg(p,vec2(-.3,-.4),vec2(0.,.4)),seg(p,vec2(0.,.4),vec2(.3,-.4))),seg(p,vec2(-.17,-.08),vec2(.17,-.08))); }      /* A */
  if(g==66){ float d=seg(p,vec2(-.24,-.4),vec2(-.24,.4));
    d=min(d,seg(p,vec2(-.24,.4),vec2(.02,.4))); d=min(d,seg(p,vec2(-.24,.0),vec2(.05,.0))); d=min(d,seg(p,vec2(-.24,-.4),vec2(.05,-.4)));
    d=min(d,arc(p,vec2(.02,.2),.2,-PI*.5,PI*.5)); d=min(d,arc(p,vec2(.05,-.2),.2,-PI*.5,PI*.5)); return d; }                                  /* B */
  if(g==67){ return arc(p,vec2(0.),.36,.75,2.*PI-.75); }                                                                                  /* C */
  if(g==49){ return min(min(seg(p,vec2(.02,-.4),vec2(.02,.4)),seg(p,vec2(.02,.4),vec2(-.16,.24))),seg(p,vec2(-.16,-.4),vec2(.2,-.4))); }  /* 1 */
  if(g==50){ float d=arc(p,vec2(0.,.17),.21,-.75,PI); d=min(d,seg(p,vec2(.21*cos(-.75),.17+.21*sin(-.75)),vec2(-.22,-.4))); return min(d,seg(p,vec2(-.22,-.4),vec2(.24,-.4))); } /* 2 */
  if(g==51){ return min(arc(p,vec2(0.,.2),.19,-PI*.5,PI*.85),arc(p,vec2(0.,-.19),.21,-PI*.85,PI*.5)); }                                    /* 3 */
  return 1e3; }
/* engrave (cut) a glyph into a face: returns amount to subtract; w = stroke half width, dep = depth */
float carve(float d3,vec2 uv,int g,float sz,float w,float z,float dep){
  float gd=glyph(uv/sz,g)*sz-w; return max(d3,-max(gd,abs(z)-dep)); }
/* wood grain value along x */
float grain(vec3 p,float s){ return .5+.5*sin((p.z*s+fbm(p.xz*vec2(3.,40.))*3.)*6.2832); }
