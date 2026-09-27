/* Room "Judaism: Torah, Talmud and a People" — pencil still life: a seven-branched menorah, a
   Torah scroll lying open on its two wooden rollers (columns shown as hint-lines only), and a
   stemmed kiddush cup. Objects only. */
#define CAM_POS vec3(-0.5800,0.4084,-0.8477)
#define CAM_TGT vec3(-0.2732,0.0140,0.0949)
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
#define MN vec3(-.1,0.,.08)
#define SC vec3(.06,0.,-.07)
#define KC vec3(.2,0.,.08)
vec3 mnQ(vec3 p){ return place(p,MN,.1)/1.35; }
float menD(vec3 p){ vec3 q=mnQ(p);
  float base=sdCylY(q-vec3(0.,.008,0.),.045,.006)-.003; base=smin(base,sdCone(q-vec3(0.,.03,0.),.03,.008,.018),.008);
  float stem=sdCylY(q-vec3(0.,.1,0.),.0055,.07);
  float d=min(base,stem);
  /* three pairs of arms: half rings in the xy plane meeting the stem at y=.09, .1, .11 */
  for(int i=1;i<=3;i++){ float R=float(i)*.028; vec3 a=q-vec3(0.,.17,0.);
    float arm=max(length(vec2(length(a.xy)-R,a.z))-.0045,a.y); d=min(d,arm);
    vec3 c=vec3(abs(q.x)-R,q.y-.176,q.z); d=min(d,sdCylY(c,.009,.006)-.001); }
  d=min(d,sdCylY(q-vec3(0.,.176,0.),.009,.006)-.001);
  return d; }
vec3 scQ(vec3 p){ return place(p,SC,-.2); }
float scrollD(vec3 p){ vec3 q=scQ(p);
  float sheet=sdBox(q-vec3(0.,.02,0.),vec3(.06,.0012,.075));
  float d=sheet;
  for(int s=0;s<2;s++){ float sg=float(s)*2.-1.; vec3 r=q-vec3(sg*.075,0.,0.);
    float roll=sdCylZ(r-vec3(0.,.026,0.),.024,.07)-.002;
    float pole=sdCylZ(r-vec3(0.,.026,0.),.006,.115);
    float disc=sdCylZ(vec3(r.x,r.y-.026,abs(r.z)-.075),.032,.003)-.001;
    float knob=length(vec3(r.x,r.y-.026,abs(r.z)-.118))-.009;
    d=min(d,min(min(roll,pole),min(disc,knob))); }
  return d; }
float cupD(vec3 p){ vec3 q=p-KC;
  float foot=sdCylY(q-vec3(0.,.005,0.),.03,.004)-.002;
  float stem=sdCylY(q-vec3(0.,.035,0.),.006+.004*smoothstep(.03,.012,q.y),.03);
  float knop=length(q-vec3(0.,.035,0.))-.01;
  vec3 b=q-vec3(0.,.1,0.); float bowl=max(sdCone(b,.018,.036,.035),-sdCone(b-vec3(0.,.006,0.),.014,.032,.035));
  return min(min(foot,stem),min(knop,bowl)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,menD(p)*1.35,3.);
  r=U(r,scrollD(p),4.);
  r=U(r,cupD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.){ vec3 q=scQ(p);
    if(abs(q.x)<.06&&q.y<.024&&q.y>.018){ float col=abs(fract(q.x/.04+.5)-.5)*.04; float l=fract(q.z/.009);
      if(col<.014&&abs(q.z)<.06&&l<.25) return .5; return .93; }
    if(abs(abs(q.z)-.075)<.004||abs(q.z)>.08) return .35; return .8; }
  if(id==5.){ vec3 q=p-KC; if(abs(q.y-.11)<.004) return .35; return .6; }
  return .7; }
