/* Buddhist Texts Unit 10 "Mahayana Sutras, Zen and Tibet" — pencil still life: a Tibetan hand
   prayer wheel on its wooden handle, and a Zen ink set: a sheet of paper with a single brushed
   circle, an ink stone and a brush. No writing, no figures. */
#define CAM_POS vec3(-0.3519,0.3652,-0.9624)
#define CAM_TGT vec3(-0.2307,-0.0088,0.0485)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
vec3 wQ(vec3 p){ vec3 q=p-vec3(.2,.03,.12); q.xz=rot(-.3)*q.xz; return q; }   /* standing upright in a wooden holder */
float prayerWheel(vec3 p){ vec3 q=wQ(p);
  float drum=sdCylY(q-vec3(0.,.12,0.),.045,.04)-.003;
  float bands=min(sdTorus(q-vec3(0.,.085,0.),.047,.004),sdTorus(q-vec3(0.,.155,0.),.047,.004));
  float cap=sdCone(q-vec3(0.,.17,0.),.035,.006,.012);
  float knob=length(q-vec3(0.,.19,0.))-.007;
  float handle=sdCylY(q-vec3(0.,.02,0.),.01,.07)-.002;
  float collar=sdCylY(q-vec3(0.,.078,0.),.016,.004);
  vec3 c=q-vec3(.07,.13,0.); float chain=sdCapsule(q,vec3(.045,.13,0.),vec3(.07,.12,0.),.0015); float wt=length(c-vec3(0.,-.01,0.))-.009;
  return min(min(min(drum,bands),min(cap,knob)),min(min(handle,collar),min(chain,wt))); }
vec3 sQ(vec3 p){ return ry(p-vec3(-.07,0.,-.03),.08); }
float sheet(vec3 p){ return sdBox(sQ(p)-vec3(0.,.001,0.),vec3(.12,.001,.09)); }
float inkstone(vec3 p){ vec3 q=ry(p-vec3(.2,0.,-.08),-.2); float d=sdRBox(q-vec3(0.,.012,0.),vec3(.055,.012,.035),.004); d=max(d,-sdRBox(q-vec3(.01,.024,0.),vec3(.035,.006,.025),.004)); return d; }
float brush(vec3 p){ vec3 q=p-vec3(-.02,.006,-.17); q.xz=rot(.1)*q.xz; float h=max(length(q.yz)-.0055,abs(q.x)-.1);
  vec3 t=q-vec3(.12,0.,0.); float tip=max(length(t.yz)-.007*(1.-smoothstep(-.02,.03,t.x)),abs(t.x)-.025); return min(h,tip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,prayerWheel(p),3.);
  vec3 hb=p-vec3(.2,0.,.12); r=U(r,min(sdCone(hb-vec3(0.,.017,0.),.045,.03,.017)-.002,sdCylY(hb-vec3(0.,.036,0.),.018,.004)),7.);
  r=U(r,sheet(p),4.);
  r=U(r,inkstone(p),5.);
  r=U(r,brush(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=wQ(p); if(q.y>.085&&q.y<.155){ float a=atan(q.z,q.x); if(abs(q.y-.12)<.012&&fract(a*4.)<.3) return .3; } if(q.y<.075) return .35; return .55; }
  if(id==4.){ vec3 q=sQ(p); float r=length((q.xz-vec2(0.,.0))); float w=.008*(.4+.6*smoothstep(-3.,2.5,atan(q.z,q.x))); if(abs(r-.06)<w&&atan(q.z,q.x)>-2.6) return .12; return .95; }
  if(id==5.) return .25;
  if(id==6.){ vec3 q=p-vec3(-.02,.006,-.17); q.xz=rot(.1)*q.xz; return q.x>.1?.18:.6; }
  if(id==7.) return .4;
  return .7; }
