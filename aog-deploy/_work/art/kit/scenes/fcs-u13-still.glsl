/* FCS Unit 13 "The Sewing Machine" — pencil still life: a classic sewing machine with its arm,
   handwheel, spool of thread on top and needle down into a piece of cloth on the bed. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.08,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define SM vec3(.02,0.,.08)
vec3 sq(vec3 p){ vec3 q=p-SM; q.xz=rot(-.25)*q.xz; return q; }   /* head at -x, handwheel at +x */
float machine(vec3 q){
  float bed=sdRBox(q-vec3(0.,.02,0.),vec3(.2,.02,.08),.008);
  float pillar=sdRBox(q-vec3(.12,.1,0.),vec3(.055,.07,.045),.025);
  float arm=sdRBox(q-vec3(.0,.175,0.),vec3(.16,.028,.035),.022);
  float head=sdRBox(q-vec3(-.13,.14,0.),vec3(.035,.06,.038),.02);
  float d=smin(smin(pillar,arm,.03),head,.02);
  float nbar=sdCylY(q-vec3(-.15,.075,-.015),.0045,.02);
  float presser=sdCylY(q-vec3(-.13,.07,-.015),.004,.025); float foot=sdRBox(q-vec3(-.13,.043,-.015),vec3(.012,.003,.008),.002);
  float needle=sdCylY(q-vec3(-.15,.047,-.015),.0012,.012);
  vec3 w=q-vec3(.185,.15,0.); float wheel=sdCylX(w,.05,.012)-.004; wheel=max(wheel,-(sdCylX(w-vec3(.012,0.,0.),.038,.006)));
  float hub=sdCylX(w-vec3(.012,0.,0.),.012,.01);
  float pin=sdCylY(q-vec3(.06,.215,0.),.003,.03);
  float knob=sdCylZ(q-vec3(.12,.1,-.07),.012,.008)-.002;
  return min(min(min(bed,d),min(min(nbar,presser),min(foot,needle))),min(min(wheel,hub),min(pin,knob))); }
float spool(vec3 q){ vec3 s=q-vec3(.06,.205,0.); return min(sdCylY(s-vec3(0.,.025,0.),.018,.02),min(sdCylY(s-vec3(0.,.004,0.),.021,.003),sdCylY(s-vec3(0.,.046,0.),.021,.003))-.001); }
float threadD(vec3 q){ float t=sdCapsule(q,vec3(.06,.235,-.018),vec3(-.12,.205,-.036),.0012); t=min(t,sdCapsule(q,vec3(-.12,.205,-.036),vec3(-.15,.09,-.02),.0012)); return t; }
float cloth(vec3 q){ vec3 c=q-vec3(-.13,.042,-.02); c.xz=rot(.2)*c.xz; float d=sdRBox(c,vec3(.07,.0015,.06),.001)+.0015*sin(c.x*80.)*smoothstep(.03,.07,abs(c.x)); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=sq(p);
  r=U(r,machine(q),3.);
  r=U(r,spool(q),4.);
  r=U(r,threadD(q),5.);
  r=U(r,cloth(q),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=sq(p); if(q.y<.04){ if(q.z<-.03&&abs(q.x+.13)<.03&&q.y>.035) return .8; return .3; }   /* dark bed, bright needle plate */
    if(q.z<-.03&&q.y>.155&&q.y<.195&&abs(q.x)<.1){ float s=abs(fract((q.x+q.y*.5)/.03)-.5); if(s<.06) return .75; }   /* a painted scroll band */
    if(q.x>.17) return .55; return .28; }
  if(id==4.) return .5;
  if(id==5.) return .2;
  if(id==6.){ vec3 q=sq(p); vec3 c=q-vec3(-.13,.042,-.02); c.xz=rot(.2)*c.xz; if(abs(c.z+.0)<.001&&c.x<-.0) return .3; return mod(floor(c.x/.015)+floor(c.z/.015),2.)<1.?.7:.88; }
  return .7; }
