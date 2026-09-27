/* Room "Kitchen Safety and Sanitation" — pencil still life: a small kitchen fire extinguisher
   with its handle, pull pin, gauge and hose, a quilted oven mitt lying in front, and a spray
   bottle of cleaner. */
#define CAM_POS vec3(-0.5478,0.4028,-1.0040)
#define CAM_TGT vec3(-0.2045,0.0227,0.0750)
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
#define EX vec3(-.06,0.,.08)
#define SB vec3(.16,0.,.12)
vec3 exQ(vec3 p){ return place(p,EX,.5); }
float extD(vec3 p){ vec3 q=exQ(p);
  float body=sdCylY(q-vec3(0.,.1,0.),.042,.1)-.004;
  float dome=length(q-vec3(0.,.2,0.))-.046; dome=max(dome,-(q.y-.2));
  float d=smin(body,dome,.012);
  d=min(d,sdTorus(q-vec3(0.,.006,0.),.044,.004));
  float neck=sdCylY(q-vec3(0.,.25,0.),.013,.012);
  float head=sdRBox(q-vec3(.0,.268,0.),vec3(.022,.009,.013),.004);
  float lever=sdRBox(q-vec3(-.035,.29,0.),vec3(.045,.004,.011),.003); lever=max(lever,-(q.x+.075));
  float grip=sdRBox(q-vec3(-.04,.265,0.),vec3(.04,.004,.01),.003);
  float gauge=sdCylZ(q-vec3(.012,.268,-.017),.009,.003)-.001;
  float ring=sdTorus((q-vec3(.0,.28,-.02)).xzy,.008,.0015);
  float nozzle=sdCapsule(q,vec3(.022,.265,0.),vec3(.04,.25,0.),.005);
  /* hose falls down the side and is clipped on */
  float hose=1e5; vec3 a=vec3(.04,.25,0.);
  for(int i=1;i<=6;i++){ float t=float(i)/6.; vec3 b=vec3(.048+.004*sin(t*3.),.25-t*.17,-.01*t); hose=min(hose,sdCapsule(q,a,b,.0055)); a=b; }
  float clip=sdCylY(q-vec3(.047,.08,-.01),.009,.006);
  d=min(d,min(min(neck,head),min(lever,grip)));
  d=min(d,min(min(gauge,ring),min(nozzle,min(hose,clip))));
  return d; }
/* a mitten outline in the xz plane: palm and a thumb, then puffed up in y */
float mitt2(vec2 u){ float palm=length(max(abs(u-vec2(0.,.0))-vec2(.035,.06),0.))-.018;
  float top=length(u-vec2(0.,.07))-.052; palm=smin(palm,top,.02);
  vec2 t=u-vec2(.075,.03); t=rot(-.6)*t; float thumb=length(max(abs(t)-vec2(.01,.035),0.))-.016;
  float cuff=length(max(abs(u-vec2(0.,-.1))-vec2(.058,.03),0.))-.006;
  return min(smin(palm,thumb,.012),cuff); }
vec3 mtQ(vec3 p){ vec3 q=p-vec3(.12,0.,-.13); q.xz=rot(1.2)*q.xz; return q; }
float mittD(vec3 p){ vec3 q=mtQ(p); float d2=mitt2(q.xz);
  float h=.02*sqrt(clamp(-d2/.03,0.,1.))+.004; float d=max(d2,abs(q.y-h*.5-.002)-h*.5);
  return d*.8-.002; }
float sprayD(vec3 p){ vec3 q=place(p,SB,-.4);
  float body=sdRBox(q-vec3(0.,.065,0.),vec3(.03,.065,.018),.014);
  float neck=sdCylY(q-vec3(0.,.14,0.),.012,.012);
  float cap=sdRBox(q-vec3(-.008,.162,0.),vec3(.022,.012,.012),.005);
  float spout=sdRBox(q-vec3(-.035,.165,0.),vec3(.012,.005,.006),.002);
  float trig=sdRBox(q-vec3(-.02,.14,0.),vec3(.004,.016,.005),.002);
  return min(min(min(body,neck),cap),min(spout,trig)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,extD(p),3.);
  r=U(r,mittD(p),4.);
  r=U(r,sprayD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=exQ(p); if(q.y>.245) return .6; if(q.y>.07&&q.y<.15&&q.z<0.&&abs(q.x)<.03) return abs(q.y-.11)<.012?.5:.85; return .3; }
  if(id==4.){ vec3 q=mtQ(p); if(q.z<-.07) return .5; float g=min(abs(fract((q.x+q.z)/.022)-.5),abs(fract((q.x-q.z)/.022)-.5)); return g<.06?.45:.75; }
  if(id==5.){ vec3 q=place(p,SB,-.4); if(q.y>.13) return .35; if(abs(q.y-.07)<.03&&q.z<0.) return .9; return .7; }
  return .7; }
