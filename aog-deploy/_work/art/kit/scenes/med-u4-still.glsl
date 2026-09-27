/* Medicine and Health Unit 4 "How the Body Works" (food as fuel) — pencil still life: a
   long loaf of bread with a scored crust, a boiled egg in an egg cup, and a pear, on a
   wooden board. */
#define CAM_POS vec3(-0.2883,0.2534,-0.6547)
#define CAM_TGT vec3(-0.1745,-0.0346,0.0283)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define BR vec3(-.01,0.,.04)
#define GL vec3(.14,0.,-.04)
#define PR vec3(-.14,0.,-.08)
#define BD vec3(.0,0.,-.02)
float breadD(vec3 p){ vec3 q=place(p,BR,.4);
  float d=sdEll(q-vec3(0.,.012,0.),vec3(.1,.066,.064)); d=max(d,-q.y+.001);
  d=smin(d,sdRBox(q-vec3(0.,.006,0.),vec3(.095,.006,.058),.006),.01);
  float g=1e3; for(int i=0;i<3;i++){ vec3 c=q-vec3((float(i)-1.)*.05,0.,0.); c.xz=rot(-.5)*c.xz; g=min(g,abs(c.x)); }
  d=smax(d,-(max(g-.0045,.055-q.y)),.003);
  return d+.0007*fbm(q.xz*250.); }
float cupD2(vec3 p){ vec3 q=p-GL;
  float st=sdCone(q-vec3(0.,.012,0.),.026,.012,.012);
  float bowl=sdEll(q-vec3(0.,.045,0.),vec3(.03,.028,.03)); bowl=max(bowl,q.y-.058); bowl=max(bowl,.024-q.y);
  bowl=max(bowl,-sdEll(q-vec3(0.,.047,0.),vec3(.026,.025,.026)));
  float d=min(smin(st,bowl,.008),sdTorus(q-vec3(0.,.058,0.),.0275,.0022));
  return min(d,sdCylY(q-vec3(0.,.002,0.),.028,.002)-.001); }
float eggD(vec3 p){ vec3 q=p-GL-vec3(0.,.075,0.); float k=1.+.12*clamp(q.y/.03,-1.,1.); return sdEll(q*vec3(k,1.,k),vec3(.024,.033,.024))*.9; }
float pearD(vec3 p){ vec3 q=p-PR; q.xy=rot(.12)*q.xy;
  float lo=length(q-vec3(0.,.04,0.))-.04, hi=length(q-vec3(0.,.09,0.))-.024;
  float d=smin(lo,hi,.035);
  d=min(d,sdCapsule(q,vec3(0.,.11,0.),vec3(.008,.135,0.),.0028));
  return d; }
float boardD(vec3 p){ vec3 q=place(p,BD,.12); float d=sdRBox(q-vec3(0.,.008,0.),vec3(.2,.008,.12),.004);
  d=min(d,sdRBox(q-vec3(-.215,.008,0.),vec3(.03,.008,.03),.006)); d=max(d,-sdCylY(q-vec3(-.228,.008,0.),.008,.02));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 o=vec3(0.,.016,0.);
  r=U(r,boardD(p),3.);
  r=U(r,breadD(p-o),4.);
  r=U(r,cupD2(p-o),5.);
  r=U(r,eggD(p-o),6.);
  r=U(r,pearD(p-o),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55+.2*grain(place(p,BD,.12),50.);
  if(id==4.){ vec3 q=place(p-vec3(0.,.016,0.),BR,.4);
    float g=1e3; for(int i=0;i<3;i++){ vec3 c=q-vec3((float(i)-1.)*.05,0.,0.); c.xz=rot(-.5)*c.xz; g=min(g,abs(c.x)); }
    if(q.y>.05&&g<.009) return g<.004?.2:.85;
    return .45+.1*fbm(q.xz*80.); }
  if(id==5.){ vec3 q=p-GL-vec3(0.,.016,0.); if(abs(q.y-.042)<.002) return .4; return .88; }
  if(id==6.) return .9;
  if(id==7.){ vec3 q=p-PR; if(q.y>.12) return .3; return .6+.1*fbm(q.xy*150.); }
  return .7; }
