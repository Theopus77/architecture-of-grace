/* Social Studies Unit 9 "Money, Markets and Regions" — pencil still life: a wooden market
   crate full of apples, an old shop scale with a pan, and a stack of coins. */
#define CAM_POS vec3(-0.3134,0.1984,-0.8582)
#define CAM_TGT vec3(-0.1902,-0.0179,0.0688)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define KC vec3(.02,0.,.14)
#define KRY -.25
vec3 kq(vec3 p){ vec3 q=p-KC; q.xz=rot(KRY)*q.xz; return q; }
float apples(vec3 q){
  float d=1e5;
  for(int i=0;i<4;i++) for(int j=0;j<3;j++){
    vec2 o=(h22(vec2(float(i),float(j)))-.5)*.012;
    vec3 c=vec3(-.09+float(i)*.06+o.x,.128+o.y*.8,-.045+float(j)*.045+o.y);
    d=min(d,length((q-c)*vec3(1.,1.1,1.))-.027); }
  return d; }
vec2 crate(vec3 p){
  vec3 q=kq(p);
  float c=crateD(q,vec3(.13,.05,.075));
  float hand=sdBox(q-vec3(0.,.075,-.075),vec3(.03,.008,.01));        /* hand hole on the front */
  c=max(c,-hand);
  return vec2(c,apples(q)); }
vec3 sq(vec3 p){ vec3 q=p-vec3(.32,0.,.05); q.xz=rot(-.35)*q.xz; return q; }
vec2 scale(vec3 p){
  vec3 q=sq(p);
  float base=sdRBox(q-vec3(0.,.015,0.),vec3(.06,.015,.045),.006);
  float body=sdCone(q-vec3(0.,.05,0.),.04,.028,.02)-.003;
  float dial=sdCylZ(q-vec3(0.,.07,-.03),.035,.008)-.002;
  float post=sdCylY(q-vec3(0.,.1,0.),.008,.02);
  vec3 pn=q-vec3(0.,.128,0.);
  float pan=max(abs(length(pn*vec3(1.,2.6,1.)+vec3(0.,.03,0.))-.075)-.003,pn.y-.012);
  pan=max(pan,-pn.y-.02);
  return vec2(min(min(base,body),min(post,pan)),dial); }
float coins(vec3 p){
  float a=coinStack(p-vec3(-.2,0.,-.03),.028,.0032,7,1.);
  float b=coinStack(p-vec3(-.25,0.,.03),.028,.0032,4,2.);
  vec3 c=p-vec3(-.15,.0035,-.09); float lone=coinD(c,.028,.003);
  return min(min(a,b),lone); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 c=crate(p); r=U(r,c.x,3.); r=U(r,c.y,4.);
  vec2 s=scale(p); r=U(r,s.x,5.); r=U(r,s.y,6.);
  r=U(r,coins(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=kq(p); if(abs(fract(q.y/.033)-.5)>.46) return .25; return .62+.1*grain(q.zxy,40.); }   /* slat gaps and grain */
  if(id==4.) return .42;
  if(id==5.) return .45;
  if(id==6.){ vec3 q=sq(p)-vec3(0.,.07,-.03); float r=length(q.xy);
    if(q.z<-.004&&r<.03){ float a=atan(q.y,q.x); if(r>.022&&fract(a*20./6.2832)<.15) return .2;
      if(sdSeg2(q.xy,vec2(0.),vec2(.012,.018))<.0012) return .15; return .95; }
    return .4; }
  if(id==7.){ if(abs(n.y)>.7){ vec3 q=p; return .7; } return fract(p.y/.0012)<.4?.45:.6; }
  return .7; }
