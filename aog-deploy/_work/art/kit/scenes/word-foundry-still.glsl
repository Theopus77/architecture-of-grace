/* word-foundry "The Word Foundry" — a small blacksmith's anvil with a hammer resting across
   it, and three tall wooden printer's type blocks standing in front, their faces cut with
   A, B and C (words forged from parts). */
#define CAM_POS vec3(-0.4083,0.2503,-0.6382)
#define CAM_TGT vec3(-0.1725,-0.0012,0.1006)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define AV vec3(-.05,0.,.12)
vec3 aQ(vec3 p){ return place(p,AV,-.2)/1.3; }
float anvil(vec3 q){
  float base=sdRBox(q-vec3(0.,.018,0.),vec3(.06,.018,.045),.004);
  float waist=sdRBox(q-vec3(0.,.055,0.),vec3(.035-.01*sin(clamp((q.y-.036)/.04,0.,1.)*3.14),.02,.028),.003);
  float face=sdRBox(q-vec3(.0,.088,0.),vec3(.075,.014,.035),.003);
  vec3 h=q-vec3(-.075,.093,0.); float horn=max(sdCone(vec3(-h.x,h.z,h.y).yxz*vec3(1.,1.,1.),.0,.0,.0),0.);
  float t=clamp(-h.x/.07,0.,1.); horn=max(length(h.yz-vec2(.004*t,0.))-.018*(1.-t)-.002,max(h.x,-h.x-.07));
  float heel=sdRBox(q-vec3(.085,.093,0.),vec3(.012,.009,.03),.003);
  return min(min(base,waist),min(min(face,horn),heel)); }
float anv(vec3 p){ return anvil(aQ(p))*1.3; }
vec3 hQ(vec3 p){ vec3 q=aQ(p)-vec3(.01,.103,-.005); q.xz=rot(-.35)*q.xz; return q; }
float hammer(vec3 p){ vec3 q=hQ(p);
  float head=sdRBox(q-vec3(0.,.01,0.),vec3(.012,.012,.032),.003);
  head=min(head,sdCylZ(q-vec3(0.,.01,-.034),.011,.006)-.001);
  float handle=sdCapsule(q,vec3(0.,.002,0.),vec3(.12,.006,0.),.0055);
  return min(head,handle)*1.3; }
#define TH .026
vec3 tc(int i){ return vec3(.07+float(i)*.068,.036,-.1+float(i)*.012); }
float tblock(vec3 p,int i){ vec3 q=p-tc(i); q.xz=rot(-.3)*q.xz;
  float d=sdRBox(q,vec3(TH,.036,TH*.8),.003); if(d>.02) return d;
  return carve(d,q.xy,65+i,.05,.0042,q.z+TH*.8,.0035); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,anv(p),3.);
  r=U(r,hammer(p),4.);
  for(int i=0;i<3;i++) r=U(r,tblock(p,i),5.+float(i));
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=aQ(p); if(n.y>.8&&q.y>.1) return .55; return .3; }
  if(id==4.){ vec3 q=hQ(p); if(q.x>.015) return .6+.1*grain(q.zyx,60.); return .35; }
  if(id>=5.&&id<=7.){ int i=int(id-5.); vec3 q=p-tc(i); q.xz=rot(-.3)*q.xz;
    if(q.z<-TH*.8+.006&&glyph(q.xy/.05,65+i)*.05<.0065) return .15;
    if(abs(q.y+.012)<.0018) return .4; return .72+.08*grain(q,50.); }
  return .7; }
