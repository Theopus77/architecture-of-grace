/* World Religions Unit 9 "Judaism and Christianity in History" (A Scroll Leaves a Burning
   City) — pencil still life: a tall lidded clay storage jar of the kind that kept ancient
   scrolls safe, a rolled scroll tied with a cord lying before it, and a clay oil lamp with a
   small flame. No figures. */
#define CAM_POS vec3(-0.4258,0.5516,-0.9989)
#define CAM_TGT vec3(-0.2568,0.0073,0.1355)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define JR vec3(-.02,0.,.08)
#define LP vec3(.2,0.,-.02)
#define RL vec3(-.17,0.,-.05)
float jarR(float y){ /* profile: narrow foot, full shoulder, cylinder body, rounded neck */
  return .045+.035*smoothstep(0.,.05,y)-.004*smoothstep(.12,.2,y)+.006*sin(y*25.)*0.+(-.02)*smoothstep(.22,.26,y); }
float jar(vec3 q){
  float y=q.y; float r=jarR(clamp(y,0.,.26));
  float d=(length(q.xz)-r)*.8; d=max(d,max(-y,y-.26));
  float lid=length((q-vec3(0,.262,0))*vec3(1.,2.2,1.))-.064; lid=max(lid*.45,.26-q.y);
  float knob=length(q-vec3(0,.29,0))-.012;
  float rim=sdTorus(q-vec3(0,.255,0),.061,.004);
  return min(min(d,lid),min(knob,rim)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,jar(L(p,JR,0.)),3.);
  r=U(r,rollD(L(p,RL,-.3),.024,.12),4.);
  vec3 lq=L(p,LP,2.2);
  r=U(r,lampD(lq,1.3),5.);
  r=U(r,lampFlameD(lq,1.3),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,JR,0.); float a=.6-.1*fbm(vec2(atan(q.z,q.x)*3.,q.y*20.));
    if(abs(q.y-.19)<.002||abs(q.y-.2)<.002) a=.35; if(q.y>.255) a=.5; return a; }
  if(id==4.) return rollT(L(p,RL,-.3),.024,.12);
  if(id==5.) return .55;
  if(id==6.) return .97;
  return .7; }
