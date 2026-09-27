/* Room m39 "Algebra I: Functions and Linear Models" — pencil still life: a gumball machine
   (a function machine: put one coin in, get one gumball out) with a coin and a gumball on the
   table in front, and beside it a candle standing against an upright ruler (it burns down by
   the same amount each hour, a linear model). */
#define CAM_POS vec3(-0.4212,0.2985,-0.9447)
#define CAM_TGT vec3(-0.1807,0.0252,0.0936)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define GR .078
vec3 gmQ(vec3 p){ return place(p,vec3(0.,0.,.06),.25); }
float gmBody(vec3 q){
  float base=sdCone(q-vec3(0.,.012,0.),.06,.052,.012)-.002;
  float body=sdRBox(q-vec3(0.,.062,0.),vec3(.046,.04,.042),.008);
  float neck=sdCylY(q-vec3(0.,.106,0.),.04,.006)-.002;
  float d=min(min(base,body),neck);
  d=max(d,-sdRBox(q-vec3(0.,.036,-.045),vec3(.016,.012,.012),.003));                 /* chute mouth */
  d=min(d,sdRBox(q-vec3(0.,.026,-.05),vec3(.019,.003,.012),.002));                    /* chute lip */
  float cap=sdCylY(q-vec3(0.,.1+2.*GR-.004,0.),.026,.008)-.002;
  cap=min(cap,length(q-vec3(0.,.1+2.*GR+.012,0.))-.009);
  return min(d,cap); }
float gmKnob(vec3 q){ vec3 k=q-vec3(0.,.07,-.044);
  float d=sdCylZ(k,.019,.004)-.002;
  d=min(d,sdRBox(k-vec3(0.,0.,-.008),vec3(.02,.004,.004),.002));
  return d; }
float gmGlobe(vec3 q){ return length(q-vec3(0.,.1+GR,0.))-GR; }
/* gumballs painted inside the globe: 3D cells */
vec2 cell3(vec3 p){ vec3 i=floor(p),f=fract(p); float d1=8.,d2=8.,id=0.;
  for(int z=-1;z<=1;z++)for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){ vec3 o=vec3(x,y,z);
    vec3 r=o+vec3(h13(i+o),h13(i+o+17.1),h13(i+o+31.7))*.3+.35-f; float d=dot(r,r);
    if(d<d1){ d2=d1; d1=d; id=h13(i+o+5.3); } else if(d<d2) d2=d; }
  return vec2(sqrt(d1),id); }
/* candle on a saucer, against an upright ruler */
vec3 cdQ(vec3 p){ return place(p,vec3(.25,0.,-.03),0.); }
float candle(vec3 q){ float H=.13,R=.016;
  float d=sdCylY(q-vec3(0.,.008+H*.5,0.),R-.002,H*.5)-.002;
  d=max(d,-(length(q-vec3(0.,.008+H+.016,0.))-.02));
  float wick=sdCapsule(q,vec3(0.,.008+H-.006,0.),vec3(.001,.008+H+.01,0.),.0012);
  return min(d,wick); }
float saucer(vec3 q){ float d=sdCone(q-vec3(0.,.005,0.),.03,.04,.005)-.001; return max(d,-sdCylY(q-vec3(0.,.011,0.),.033,.003)); }
vec3 rlQ(vec3 p){ return place(p,vec3(.3,0.,.025),-.2); }
float rulerUp(vec3 q){ return sdRBox(q-vec3(0.,.1,0.),vec3(.016,.1,.003),.0012); }
vec3 coinQ(vec3 p){ return place(p,vec3(-.07,0.,-.11),0.); }
vec3 ballQ(vec3 p){ return p-vec3(.06,.014,-.12); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.6-dot(p.xz-CAM_TGT.xz,normalize(CAM_TGT.xz-CAM_POS.xz)),2.);
  vec3 g=gmQ(p);
  r=U(r,gmBody(g),3.);
  r=U(r,gmKnob(g),4.);
  r=U(r,gmGlobe(g),5.);
  vec3 c=cdQ(p);
  r=U(r,candle(c),6.);
  r=U(r,saucer(c),7.);
  r=U(r,rulerUp(rlQ(p)),8.);
  r=U(r,sdCylY(coinQ(p)-vec3(0.,.0015,0.),.012,.0012)-.0006,9.);
  r=U(r,length(ballQ(p))-.014,10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gmQ(p); if(q.y>.2) return .4; return .36; }
  if(id==4.) return .72;
  if(id==5.){ vec3 q=gmQ(p)-vec3(0.,.1+GR,0.); if(q.y>GR*.8) return .92;      /* air at the top */
    vec2 c=cell3(q/.026); if(c.x>.5) return .42; if(c.x>.44) return .15;   /* round gumballs, dark gaps */
    return .38+.42*c.y+.1*step(length(vec2(c.x,0.)),.12); }
  if(id==6.){ vec3 q=cdQ(p); return q.y>.13?.2:.9; }
  if(id==7.) return .6;
  if(id==8.){ vec3 q=rlQ(p); if(q.z>-.002) return .8; float y=q.y-.01; float f=fract(y/.01);
    if(y>0.&&y<.18&&q.x>.004&&(f<.12||f>.88)) return .2;
    if(y>0.&&y<.18&&q.x>-.004&&fract(y/.05+.02)<.04) return .2;
    return .82; }
  if(id==9.) return .45;
  if(id==10.) return .4;
  return .7; }
