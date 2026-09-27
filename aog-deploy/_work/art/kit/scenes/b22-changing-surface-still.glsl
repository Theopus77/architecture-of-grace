/* Room "Earth's Changing Surface" — pencil still life: a model volcano with a crater, a
   chunk of layered sedimentary rock worn by water, and two smooth river pebbles. */
#define CAM_POS vec3(-0.3632,0.2777,-0.5587)
#define CAM_TGT vec3(-0.1597,-0.0129,0.0517)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define VOL vec3(-.05,0.,.08)
#define RK vec3(.15,0.,-.03)
float volD(vec3 p){ vec3 q=p-VOL;
  float r=length(q.xz); float a=atan(q.z,q.x);
  float h=.16-r*1.05;
  h+=.008*sin(a*7.+r*40.)*smoothstep(.03,.1,r)+.006*fbm(q.xz*40.);   /* gullies */
  float d=(q.y-h)*.65;
  d=max(d,r-.16);
  float crater=length(q-vec3(0.,.175,0.))-.05; d=max(d,-crater);
  d=max(d,-q.y);
  return d*.6; }
vec3 rkQ(vec3 p){ return place(p,RK,-.35); }
float rockD(vec3 p){ vec3 q=rkQ(p);
  float d=sdRBox(q-vec3(0.,.07,0.),vec3(.06,.07,.05),.01);
  d=max(d,dot(q-vec3(.0,.12,0.),normalize(vec3(.7,1.,-.3))));          /* a sloping broken top */
  float band=sin(q.y*190.+fbm(q.xz*30.)*2.);
  d+=.0018*band+.008*fbm(q.xy*25.+q.z*20.);
  return d*.8; }
float pebD(vec3 p){ vec3 q=place(p,vec3(.07,.012,-.15),.4); float a=sdEll(q,vec3(.028,.013,.02));
  vec3 q2=place(p,vec3(.12,.009,-.17),-.3); return min(a,sdEll(q2,vec3(.018,.009,.014))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,volD(p),3.);
  r=U(r,rockD(p),4.);
  r=U(r,pebD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-VOL; if(q.y>.14) return .3+.2*fbm(q.xz*60.); return .5+.15*fbm(q.xz*50.+q.y*20.); }
  if(id==4.){ vec3 q=rkQ(p); float b=fract(q.y/.018+.2*fbm(q.xz*20.)); return b<.3?.35:b<.45?.8:.58; }
  if(id==5.) return .45;
  return .7; }
