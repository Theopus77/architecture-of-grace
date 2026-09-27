/* Social Studies Unit 4 "Then and Now, and Our Country" — pencil still life: an old oil
   lantern (then) beside a modern flashlight (now), and a small flag on a desk stand. */
#define CAM_POS vec3(-0.2564,0.2880,-0.9009)
#define CAM_TGT vec3(-0.1262,0.0595,0.0781)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define LC vec3(-.02,0.,.14)
vec2 lantern0(vec3 q){
  float base=sdCylY(q-vec3(0.,.02,0.),.045,.02)-.003;
  float glass=length((q-vec3(0.,.085,0.))*vec3(1.,.75,1.))-.04;
  float top=sdCone(q-vec3(0.,.14,0.),.038,.016,.016)-.002;
  float cap=sdCylY(q-vec3(0.,.162,0.),.018,.006)-.002;
  float guards=1e5; for(int i=0;i<4;i++){ float a=float(i)*1.5708+.4; vec3 g=q; g.xz=rot(a)*g.xz;
    guards=min(guards,sdCapsule(g,vec3(.043,.04,0.),vec3(.043,.13,0.),.0025)); }
  vec3 h=q-vec3(0.,.135,0.); float bail=max(abs(length(h.xy)-.036)-.0025,max(abs(h.z)-.0025,-h.y+.0));
  float knob=sdCylX(q-vec3(.045,.03,0.),.006,.008);
  return vec2(min(min(base,top),min(cap,min(guards,min(bail,knob)))),glass); }
vec2 lantern(vec3 p){ return lantern0((p-LC)/1.4)*1.4; }
vec3 fq(vec3 p){ vec3 q=p-vec3(.25,.024,.0); q.xz=rot(-.3)*q.xz; return q; }
float flashlight(vec3 p){
  vec3 q=fq(p);
  float body=sdCylX(q,.02,.07)-.002;
  float head=sdCone(q.yxz-vec3(0.,.09,0.),.021,.028,.022)-.002;
  float lens=sdCylX(q-vec3(.113,0.,0.),.026,.002);
  float sw=sdRBox(q-vec3(.02,.022,0.),vec3(.012,.004,.006),.002);
  return min(min(body,head),min(lens,sw)); }
#define FS vec3(.24,0.,.22)
vec2 flag(vec3 p){
  vec3 q=p-FS;
  float stand=sdCylY(q-vec3(0.,.006,0.),.035,.006)-.002;
  float pole=sdCylY(q-vec3(0.,.14,0.),.0035,.14);
  float fin=length(q-vec3(0.,.285,0.))-.007;
  vec3 f=q-vec3(.07,.235,0.); f.z+=.008*sin(f.x*50.)*smoothstep(-.07,.07,f.x);
  float cloth=sdBox(f,vec3(.068,.045,.0015))-.0005;
  return vec2(min(stand,min(pole,fin)),cloth*.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 l=lantern(p); r=U(r,l.x,3.); r=U(r,l.y,4.);
  r=U(r,flashlight(p),5.);
  vec2 f=flag(p); r=U(r,f.x,6.); r=U(r,f.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .38;
  if(id==4.){ vec3 q=(p-LC)/1.4; return abs(q.y-.075)<.012&&abs(q.x)<.006?.3:.92; }   /* the wick flame */
  if(id==5.){ vec3 q=fq(p); if(q.x>.108) return .95; return fract(q.x/.008)<.3&&q.x<-.02?.25:.5; }
  if(id==6.) return .4;
  if(id==7.){ vec3 f=p-FS-vec3(.07,.235,0.);
    if(f.x<-.005&&f.y>0.){ vec2 s=fract(vec2(f.x,f.y)/.011)-.5; return length(s)<.22?.95:.28; }   /* canton with stars */
    return fract((f.y+.045)/(.09/13.))<.5?.35:.92; }
  return .7; }
