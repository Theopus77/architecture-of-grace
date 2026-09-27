/* Math Unit 18 "Algebra I: Linear Equations, Functions and Systems" — pencil still life: a
   small easel holding a board of graph paper with two axes and one straight line drawn on
   it, with a ruler and a pencil on the table in front. */
#define CAM_POS vec3(-0.4580,0.3326,-1.1451)
#define CAM_TGT vec3(-0.2963,0.0507,0.1164)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
vec3 ebQ(vec3 p){ vec3 q=p-vec3(0.,.02,.14); q.xz=rot(.2)*q.xz; q.yz=rot(-.22)*q.yz; return q; }
vec2 easel(vec3 p){ vec3 q=ebQ(p);
  float board=sdRBox(q-vec3(0.,.16,0.),vec3(.16,.13,.006),.004);
  float frame=max(sdRBox(q-vec3(0.,.16,-.004),vec3(.168,.138,.008),.004),-sdBox(q-vec3(0.,.16,-.01),vec3(.155,.125,.01)));
  float ledge=sdRBox(q-vec3(0.,.028,-.012),vec3(.17,.006,.016),.003);
  float legs=min(sdCapsule(q,vec3(-.13,-.03,0.),vec3(-.1,.33,.01),.007),sdCapsule(q,vec3(.13,-.03,0.),vec3(.1,.33,.01),.007));
  vec3 bq=p-vec3(0.,0.,.14); bq.xz=rot(.2)*bq.xz;
  float back=sdCapsule(bq,vec3(0.,0.,.18),vec3(0.,.3,.03),.007);
  return vec2(min(min(frame,ledge),min(legs,back)),board); }
vec3 ruQ(vec3 p){ vec3 q=p-vec3(-.02,.004,-.03); q.xz=rot(.1)*q.xz; return q; }
float pencilD(vec3 p){
  vec3 q=p-vec3(.1,.0068,-.08); q.xz=rot(2.8)*q.xz; q.yz=rot(.26)*q.yz;
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.005)-.1);
  float t=clamp((q.x-.095)/.028,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.095-q.x,q.x-.123));
  return min(body,cone); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 e=easel(p); r=U(r,e.x,3.); r=U(r,e.y,4.);
  r=U(r,sdRBox(ruQ(p),vec3(.16,.004,.022),.0015),5.);
  r=U(r,pencilD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.){ vec3 q=ebQ(p); vec2 u=q.xy-vec2(-.1,.07);
    if(abs(u.x)<.0016&&u.y>-.02&&u.y<.23) return .08;
    if(abs(u.y)<.0016&&u.x>-.03&&u.x<.27) return .08;
    if(abs(u.y-.02-u.x*.62)<.0022&&u.x>-.02&&u.x<.25&&u.y<.22) return .05;
    vec2 f=abs(fract(u/.02+.5)-.5); if(min(f.x,f.y)<.05) return .8;
    return .95; }
  if(id==5.){ vec3 q=ruQ(p); float t=fract((q.x+.16)/.01); if(q.y>.003&&q.z>.004&&t<.12) return .2; return .78; }
  if(id==6.){ vec3 q=p-vec3(.1,.0068,-.08); q.xz=rot(2.8)*q.xz; q.yz=rot(.26)*q.yz; if(q.x>.095) return q.x>.112?.12:.88; return .5; }
  return .7; }
