/* Practice room "A Job Done to the End" — pencil still life: a spray bottle of cleaner, a stack
   of clean plates, and a kitchen sponge (the clean-up that finishes the job). */
#define CAM_POS vec3(-0.3559,0.3917,-0.7916)
#define CAM_TGT vec3(-0.2220,-0.0398,0.1076)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define SB vec3(-.02,0.,.06)
#define PL vec3(.14,0.,.02)
#define SP vec3(-.14,0.,-.08)
vec3 sbQ(vec3 p){ vec3 q=p-SB; q.xz=rot(.2)*q.xz; return q; }
float bottleB(vec3 q){ float d=sdRBox(q-vec3(0.,.07,0.),vec3(.036,.07,.022),.018);
  d=smin(d,sdCylY(q-vec3(0.,.15,0.),.012,.014),.012); return d; }
float headD(vec3 q){ float d=sdRBox(q-vec3(-.004,.182,0.),vec3(.03,.014,.012),.008);
  d=min(d,sdCone((q-vec3(-.042,.186,0.)).yxz,.006,.009,.012));
  vec3 t=q-vec3(-.02,.16,0.); t.xy=rot(-.35)*t.xy; d=min(d,sdRBox(t,vec3(.005,.018,.007),.003));
  d=min(d,sdCylY(q-vec3(0.,.164,0.),.015,.006)-.001); return d; }
float platesD(vec3 q){ float d=1e3; for(int i=0;i<4;i++){ vec3 c=q-vec3(0.,float(i)*.009,0.); float r=length(c.xz);
    d=min(d,max(abs(c.y-.004-max(r-.045,0.)*.25)-.0022,r-.085)-.001); d=min(d,max(abs(c.y-.002)-.002,abs(r-.04)-.004)); } return d; }
vec3 spQ(vec3 p){ vec3 q=p-SP; q.xz=rot(.4)*q.xz; return q; }
float spongeD(vec3 q){ return sdRBox(q-vec3(0.,.016,0.),vec3(.05,.016,.032),.005)+.0008*vn3(q*700.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 s=sbQ(p);
  r=U(r,bottleB(s),3.);
  r=U(r,headD(s),4.);
  r=U(r,platesD(p-PL),5.);
  r=U(r,spongeD(spQ(p)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sbQ(p); if(q.y<.09&&q.y>.035&&abs(q.x)<.028){ if(abs(q.y-.08)<.003) return .3; if(abs(q.y-.045)<.002) return .3;
      if(abs(q.y-.062)<.002&&abs(q.x)<.016) return .35; return .85; } if(q.y<.03) return .6; return .72; }
  if(id==4.) return .45;
  if(id==5.){ vec3 q=p-PL; float r=length(q.xz); if(abs(r-.07)<.002) return .6; return .93; }
  if(id==6.){ vec3 q=spQ(p); if(q.y<.01) return .35+.1*vn3(p*600.); return .75-.15*vn3(p*700.); }
  return .7; }
