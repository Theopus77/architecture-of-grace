/* Room fc14 "Hot, Cold and Sharp" — pencil still life of the three kitchen dangers and their
   tools: a chef's knife lying on a wooden cutting board (sharp), a quilted oven mitt (hot),
   and a dial food thermometer (hot and cold). */
#define CAM_POS vec3(-0.2649,0.3804,-0.5989)
#define CAM_TGT vec3(-0.1431,-0.0662,0.0101)
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
vec3 bdQ(vec3 p){ return place(p,vec3(-.02,0.,.06),-.15); }
float boardD(vec3 q){ float b=sdRBox(q-vec3(0.,.011,0.),vec3(.17,.011,.11),.008);
  b=max(b,-sdCylY(q-vec3(-.145,.011,.085),.011,.02));
  float groove=length(vec2(sdBox2(q.xz,vec2(.15,.09)),q.y-.022))-.003;
  return max(b,-groove); }
vec3 knQ(vec3 p){ vec3 q=bdQ(p)-vec3(.0,.03,-.01); q.xz=rot(-.25)*q.xz; return q; }
float knifeD(vec3 q){ /* blade on +x, edge toward -z */
  float t=clamp((q.x)/.17,0.,1.);
  float top=.02-.02*pow(t,3.)*1.;           /* spine drops to the tip */
  float bot=-.022+.018*pow(t,1.6)+.004*t;   /* edge curves up to the tip */
  float bz=max(q.z-top,bot-q.z); float blade2=max(bz,max(-q.x,q.x-.17));
  float blade=extrude(blade2,q.y,.0012+.0015*(1.-t)*smoothstep(-.02,.02,q.z),.0004);
  float bol=sdRBox(q-vec3(-.006,0.,-.001),vec3(.006,.006,.02),.003);
  float hand=sdRBox(q-vec3(-.07,0.,0.),vec3(.06,.0075,.014),.0065);
  return min(blade,min(bol,hand)); }
vec3 mtQ(vec3 p){ vec3 q=p-vec3(.2,0.,-.07); q.xz=rot(.4)*q.xz; return q; }
float mitt2(vec2 u){ float palm=sdSeg2(u,vec2(-.07,0.),vec2(.05,0.))-.045;
  float th=sdSeg2(u,vec2(-.03,.02),vec2(.035,.068))-.021;
  float cuff=sdBox2(u-vec2(-.09,0.),vec2(.022,.04))-.008;
  return smin(smin(palm,th,.02),cuff,.01); }
float mittD(vec3 q){ float d2=mitt2(q.xz); float h=.009+.007*smoothstep(0.,-.03,d2);
  return length(max(vec2(d2+.008,abs(q.y-h)-h),0.))+min(max(d2+.008,abs(q.y-h)-h),0.)-.008; }
vec3 thQ(vec3 p){ vec3 q=p-vec3(-.19,0.,-.1); q.xz=rot(.35)*q.xz; return q; }
float thermoD(vec3 q){ float dial=sdCylY(q-vec3(0.,.012,0.),.026,.006)-.004;
  float rim=sdTorus(q-vec3(0.,.02,0.),.027,.0025);
  float stem=sdCapsule(q,vec3(.03,.004,0.),vec3(.16,.003,0.),.0028);
  float clip=sdRBox(q-vec3(.07,.009,0.),vec3(.012,.003,.004),.001);
  return min(min(dial,rim),min(stem,clip)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,boardD(bdQ(p)),3.);
  r=U(r,knifeD(knQ(p)),4.);
  r=U(r,mittD(mtQ(p)),5.);
  r=U(r,thermoD(thQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .66+.1*grain(p,50.);
  if(id==4.){ vec3 q=knQ(p); if(q.x<-.012){ if(length(vec2(q.x+.04,q.z))<.003||length(vec2(q.x+.09,q.z))<.003) return .8; return .3; } if(q.x<0.) return .6;
    float t=clamp(q.x/.17,0.,1.); float bot=-.022+.018*pow(t,1.6)+.004*t; if(q.z<bot+.004) return .95; return .82; }
  if(id==5.){ vec3 q=mtQ(p); vec2 u=q.xz; if(u.x<-.06) return .5;
    vec2 g=abs(fract(vec2(u.x+u.y,u.x-u.y)/.028)-.5); if(min(g.x,g.y)<.05) return .35; return .7; }
  if(id==6.){ vec3 q=thQ(p); if(q.y>.018&&length(q.xz)<.024){ float a=atan(q.z,q.x); float r=length(q.xz);
      if(r>.016&&abs(fract(a/.314+.5)-.5)<.08) return .2; if(sdSeg2(q.xz,vec2(0.),vec2(.012,.012))<.0015) return .15; return .95; }
    return .5; }
  return .7; }
