/* World Religions Unit 6 "Traditions of India and East Asia" (A Lamp and a Bell) — pencil
   still life: a clay diya with a small flame, a brass hand bell, and an open lotus flower
   floating in a shallow bowl. Objects only; no figures. */
#define CAM_POS vec3(-0.3854,0.4413,-0.8370)
#define CAM_TGT vec3(-0.2425,-0.0182,0.1209)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define BELL vec3(-.02,0.,.06)
#define DIYA vec3(-.19,0.,-.06)
#define BOWL vec3(.17,0.,-.02)
float lotus(vec3 q){
  /* two rings of pointed, cupped petals round a seed-head, floating above the dish */
  float d=1e5;
  for(int ring=0;ring<2;ring++){ float n=ring==0?8.:7.; float tilt=ring==0?.45:.95; float len=ring==0?.06:.048; float w=ring==0?.02:.017;
    float a=atan(q.z,q.x); float st=6.2832/n; float off=ring==0?0.:st*.5;
    float k=floor((a-off)/st+.5)*st+off; vec3 c=q; c.xz=rot(k)*c.xz;
    c.y-=.028+float(ring)*.004; c.xy=rot(tilt)*c.xy;
    vec3 e=c-vec3(len*.5,0.,0.); e.y-=4.*e.z*e.z;                 /* cupped across */
    e.x/=len*.5; float taper=1.-.55*smoothstep(-.2,1.,e.x);
    float p=(length(vec3(e.x,e.y/.005,e.z/(w*taper)))-1.)*.005*.8;
    d=min(d,p); }
  float seed=sdCylY(q-vec3(0,.04,0),.012,.005)-.002;
  return min(d,seed); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bellD(L(p,BELL,.3),1.35),3.);
  r=U(r,diyaD(L(p,DIYA,-.4),1.2),4.);
  r=U(r,diyaFlameD(L(p,DIYA,-.4),1.2),5.);
  r=U(r,bowlD(L(p,BOWL,0.),.1,.032),6.);
  r=U(r,lotus(L(p,BOWL,0.4)/1.3)*1.3,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,BELL,.3)/1.35; if(abs(q.y-.02)<.003||abs(q.y-.075)<.002) return .3; return q.y>.12?.4:.55; }
  if(id==4.){ vec3 q=L(p,DIYA,-.4)/1.2; if(q.x>.04&&q.y>.02&&abs(q.z)<.006) return .3; if(q.y>.021&&diyaShape(q-vec3(0,.009,0),.86)<.002) return .3; return abs(q.y-.015)<.002?.35:.58; }
  if(id==5.) return .97;
  if(id==6.){ vec3 q=L(p,BOWL,0.); if(q.y>.028&&length(q.xz)<.07) return .78; return abs(q.y-.022)<.002?.4:.6; }
  if(id==7.){ vec3 q=L(p,BOWL,.4)/1.3; if(q.y>.043&&fract(length(q.xz)/.005)<.3) return .5; return .88; }
  return .7; }
