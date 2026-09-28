/* Crosswalk Matrix, Universal — a large grid sheet on the table with two clear overlay sheets laid on top at small angles, and a ruler. */
#define CAM_POS vec3(-0.3199,0.1651,-0.4501)
#define CAM_TGT vec3(-0.1514,-0.0657,0.0365)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define SH vec3(.0,0.,.06)
vec3 s0(vec3 p){ return P(p,SH,.05); }
vec3 s1(vec3 p){ return P(p,SH+vec3(.03,.0028,-.025),-.06); }
vec3 s2(vec3 p){ return P(p,SH+vec3(.06,.0056,-.05),.14); }
float sheet(vec3 q,float y,vec2 s){ return sdRBox(q-vec3(0.,y,0.),vec3(s.x,.0008,s.y),.0005); }
float grid(vec2 u,float c,vec2 s){ if(abs(u.x)>s.x-.01||abs(u.y)>s.y-.01) return 1.;
  vec2 g=fract((u+s)/c); return (g.x<.06||g.y<.06)?0.:1.; }

#define RL vec3(-.02,0.,-.13)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,sheet(s0(p),.0012,vec2(.15,.12)),3.); r=U(r,sheet(s1(p),.0012,vec2(.12,.1)),4.); r=U(r,sheet(s2(p),.0012,vec2(.1,.08)),5.);
  r=U(r,xwRulerD(P(p,RL,.12),.13),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.){ vec2 u=s0(p).xz; float g=grid(u,.03,vec2(.15,.12)); if(u.y>.08&&abs(u.x)<.14) g=min(g,.72); return g<.5?.4:.95; }
  if(id==4.){ vec2 u=s1(p).xz; float g=grid(u,.045,vec2(.12,.1)); return g<.5?.3:.88; }
  if(id==5.){ vec2 u=s2(p).xz; if(abs(u.x)<.09&&abs(u.y)<.07&&abs(fract((u.x+u.y)/.02)-.5)<.08) return .6; return .84; }
  if(id==6.) return xwRulerT(P(p,RL,.12),.13);
  return .7; }
