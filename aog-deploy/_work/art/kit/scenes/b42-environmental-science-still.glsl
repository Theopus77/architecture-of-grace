/* Room b42 "Environmental Science" — pencil still life: a model wind turbine with three
   blades, a small solar panel tilted on its stand, and a seedling in a clay pot. */
#define CAM_POS vec3(-0.5300,0.6509,-1.1729)
#define CAM_TGT vec3(-0.3327,0.0156,0.1508)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define TC vec3(.02,0.,.1)
#define HUB vec3(.02,.22,.08)
float towerD(vec3 p){ vec3 q=p-TC;
  float base=sdCylY(q-vec3(0.,.006,0.),.05,.006)-.002;
  float t=clamp(q.y/.22,0.,1.); float tw=max(length(q.xz)-mix(.011,.006,t),abs(q.y-.11)-.11);
  float nac=sdCapsule(p,HUB+vec3(0.,0.,.012),HUB+vec3(0.,0.,.05),.011);
  float hub=sdEll(p-HUB+vec3(0.,0.,.004),vec3(.012,.012,.018));
  return min(min(base,tw*.9),min(nac,hub)); }
float bladesD(vec3 p){ vec3 q=p-HUB; float d=1e5;
  for(int i=0;i<3;i++){ vec2 b=rot(float(i)*2.0944+.3)*q.xy;
    vec3 bq=vec3(b.x,b.y,q.z+.004); bq.xz=rot(.25)*bq.xz;
    float t=clamp((bq.y-.01)/.14,0.,1.); float w=.012*(1.-.7*t)*smoothstep(0.,.08,t+.02);
    float d2=sdSeg2(bq.xy,vec2(0.,.012),vec2(0.,.15))-w;
    d=min(d,extrude(d2,bq.z,.0018,.0008)); }
  return d; }
vec3 solQ(vec3 p){ return place(p,vec3(-.18,0.,-.02),.45); }
float solarD(vec3 q){ vec3 s=q-vec3(0.,.07,0.); s.yz=rot(-.75)*s.yz;
  float panel=sdRBox(s,vec3(.075,.004,.05),.002);
  float legs=min(sdCapsule(q,vec3(-.05,.0,.03),vec3(-.05,.07,.0),.003),sdCapsule(q,vec3(.05,.0,.03),vec3(.05,.07,.0),.003));
  legs=min(legs,min(sdCapsule(q,vec3(-.05,.0,-.02),vec3(-.05,.05,-.02),.003),sdCapsule(q,vec3(.05,.0,-.02),vec3(.05,.05,-.02),.003)));
  return min(panel,legs); }
#define PC vec3(.19,0.,-.07)
float potD(vec3 p){ vec3 q=p-PC; float r=length(q.xz); float R=.034+q.y*.2;
  float d=max(r-R,abs(q.y-.03)-.03)-.001; d=max(d,-max(r-R+.005,-(q.y-.006)));
  d=min(d,max(abs(r-(.034+.06*.2)-.002)-.005,abs(q.y-.056)-.008));
  return d; }
float soilD(vec3 p){ vec3 q=p-PC; return max(length(q.xz)-.04,abs(q.y-.05)-.002+.001*vn3(p*300.)); }
float sproutD(vec3 p){ vec3 q=p-PC;
  float st=sdCapsule(q,vec3(0.,.05,0.),vec3(.004,.12,0.),.003);
  vec3 l1=q-vec3(-.032,.118,0.); l1.xy=rot(-.35)*l1.xy; float a=extrude(length(l1.xz/vec2(.036,.02))*.02-.02,l1.y,.0016,.0008);
  vec3 l2=q-vec3(.04,.126,.002); l2.xy=rot(.3)*l2.xy; float b=extrude(length(l2.xz/vec2(.04,.021))*.021-.021,l2.y,.0016,.0008);
  return min(st,min(a,b)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,towerD(p),3.);
  r=U(r,bladesD(p),4.);
  r=U(r,solarD(solQ(p)),5.);
  r=U(r,potD(p),6.);
  r=U(r,soilD(p),7.);
  r=U(r,sproutD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .82;
  if(id==4.) return .9;
  if(id==5.){ vec3 q=solQ(p); vec3 s=q-vec3(0.,.07,0.); s.yz=rot(-.75)*s.yz;
    if(s.y>.003&&abs(s.x)<.07&&abs(s.z)<.045){ vec2 g=abs(fract(vec2(s.x/.0175,s.z/.015)+.5)-.5); if(min(g.x*.0175,g.y*.015)<.0007) return .75; return .3; }
    return .6; }
  if(id==6.){ vec3 q=p-PC; if(q.y>.048) return .5; return .55+.06*fbm3(p*90.); }
  if(id==7.) return .25;
  if(id==8.) return .5;
  return .7; }
