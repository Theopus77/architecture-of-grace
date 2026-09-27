/* Hindu Texts Unit 13 "Devotion, Vision and the Upanishads" — pencil still life: a tall brass
   standing lamp with five small flames on its top dish, and a flower garland lying coiled at
   its foot, a lotus flower and a tied palm-leaf bundle. Objects only. */
#define CAM_POS vec3(-0.5894,0.5040,-1.5087)
#define CAM_TGT vec3(-0.3986,0.0590,0.0808)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define LC vec3(.06,0.,.1)
float lampStand(vec3 p){ vec3 q=p-LC; float y=q.y;
  float base=sdCone(q-vec3(0.,.02,0.),.09,.05,.02)-.002;
  float step1=sdCylY(q-vec3(0.,.045,0.),.045,.006)-.002;
  float r=.012+.006*sin(y*80.)*smoothstep(.05,.08,y)*(1.-smoothstep(.3,.33,y));
  float stem=max(length(q.xz)-r,max(.04-y,y-.34));
  float knob1=sdEll(q-vec3(0.,.12,0.),vec3(.024,.016,.024));
  float knob2=sdEll(q-vec3(0.,.25,0.),vec3(.02,.014,.02));
  vec3 d=q-vec3(0.,.35,0.);
  float dish=max(abs(sdEll(d,vec3(.075,.025,.075)))-.003,max(d.y-.012,-d.y-.02));
  float tip=sdCone(q-vec3(0.,.4,0.),.014,.002,.035);
  float spouts=1e5; vec3 s=prep(d,5.); spouts=sdCapsule(s,vec3(.05,.004,0.),vec3(.08,.014,0.),.008);
  return min(min(min(base,step1),min(stem,knob1)),min(min(knob2,dish),min(tip,spouts))); }
float flames5(vec3 p){ vec3 d=p-LC-vec3(0.,.35,0.); vec3 s=prep(d,5.); return flameD(s-vec3(.083,.02,0.),.04); }
float garland(vec3 p){ vec3 q=p-LC-vec3(-.02,0.,-.13); float d=1e5;
  for(int i=0;i<22;i++){ float a=float(i)*.3; float R=.07+.012*a; vec3 c=vec3(cos(a)*R,.012,sin(a)*R*.7); d=min(d,length(q-c)-.014-.002*sin(float(i)*7.)); }
  return d+.0025*sin(q.x*700.)*sin(q.z*650.)*sin(q.y*600.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,lampStand(p),3.);
  r=U(r,flames5(p),4.);
  r=U(r,garland(p),5.);
  r=U(r,lotus(ry(p-vec3(.27,0.,-.05),.3),1.6),6.);
  r=U(r,palmBundle(ry(p-vec3(-.2,0.,-.08),.25),.13,.024,.011),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-LC; if(abs(fract(q.y*60.)-.5)<.08&&q.y>.05&&q.y<.33) return .35; return .55; }
  if(id==4.) return .97;
  if(id==5.){ vec3 q=p-LC-vec3(-.02,0.,-.13); return .7+.2*sin(atan(q.z,q.x)*30.); }
  if(id==6.) return .88;
  if(id==7.) return palmBundleTone(ry(p-vec3(-.2,0.,-.08),.25)-vec3(0.,.008,0.),.13,.024,.011);
  return .7; }
