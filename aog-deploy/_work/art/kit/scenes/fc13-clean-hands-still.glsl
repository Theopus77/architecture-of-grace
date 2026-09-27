/* Room "Clean Hands" — pencil still life: a pump bottle of hand soap, a neatly folded hand
   towel with a woven band, and a bar of soap with a few bubbles beside it. */
#define CAM_POS vec3(-0.3944,0.2983,-0.6768)
#define CAM_TGT vec3(-0.1602,0.0139,0.0592)
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
#define PB vec3(-.07,0.,.08)
#define TW vec3(.12,0.,.08)
#define SP vec3(.08,0.,-.1)
vec3 pbQ(vec3 p){ return place(p,PB,.6); }
float pumpD(vec3 p){ vec3 q=pbQ(p);
  float body=sdRBox(q-vec3(0.,.065,0.),vec3(.038,.065,.038),.018);
  float sh=sdCylY(q-vec3(0.,.135,0.),.02,.008)-.004;
  float collar=sdCylY(q-vec3(0.,.15,0.),.016,.008)-.002;
  float stem=sdCylY(q-vec3(0.,.172,0.),.0045,.016);
  float headp=sdRBox(q-vec3(-.008,.19,0.),vec3(.018,.007,.009),.004);
  float spout=sdCapsule(q,vec3(-.02,.19,0.),vec3(-.05,.186,0.),.0038);
  return min(min(min(body,sh),min(collar,stem)),min(headp,spout)); }
vec3 twQ(vec3 p){ return place(p,TW,-.2); }
float towelD(vec3 p){ vec3 q=twQ(p);
  float d=1e5;
  for(int i=0;i<3;i++){ float y=.012+float(i)*.022; d=min(d,sdRBox(q-vec3(0.,y,0.),vec3(.085,.011,.06),.01)); }

  return d; }
vec3 spQ(vec3 p){ return place(p,SP,.3); }
float soapD(vec3 p){ vec3 q=spQ(p); float d=sdRBox(q-vec3(0.,.016,0.),vec3(.05,.016,.03),.013);
  float ring=abs(length(q.xz*vec2(1.,1.5))-.028)-.0015; d=max(d,-max(ring,-(q.y-.0305)));
  return d; }
float bubblesD(vec3 p){ float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); vec3 c=SP+vec3(.07+.02*sin(fi*2.1),.006+.004*fi*0.,-.03+.02*cos(fi*1.7)); float r=.004+.003*fract(fi*.37);
    d=min(d,length(p-c-vec3(0.,r,0.))-r); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pumpD(p),3.);
  r=U(r,towelD(p),4.);
  r=U(r,soapD(p),5.);
  r=U(r,bubblesD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pbQ(p); if(q.y>.125) return .35; if(q.y>.04&&q.y<.1&&q.z<0.&&abs(q.x)<.028) return .88; return .55; }
  if(id==4.){ vec3 q=twQ(p); if(abs(q.x-.05)<.012||abs(q.x-.03)<.003) return .4; return .8; }
  if(id==5.){ vec3 q=spQ(p); float ring=abs(length(q.xz*vec2(1.,1.5))-.028); if(q.y>.026&&ring<.003) return .5; return .85; }
  if(id==6.) return .92;
  return .7; }
