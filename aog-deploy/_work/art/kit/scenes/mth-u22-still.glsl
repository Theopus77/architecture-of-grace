/* Math Unit 22 "Statistics in Algebra I" — pencil still life: a baseball resting beside a
   wooden dot-plot board (beads stacked on a row of pegs, tallest in the middle), with a
   baseball bat lying along the table in front. */
#define CAM_POS vec3(-0.2750,0.1903,-0.6842)
#define CAM_TGT vec3(-0.1754,0.0165,0.0933)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
vec3 dbQ(vec3 p){ vec3 q=p-vec3(-.02,0.,.12); q.xz=rot(.2)*q.xz; return q; }
float cntB(int i){ return i==0?1.:i==1?3.:i==2?5.:i==3?6.:i==4?4.:i==5?2.:1.; }
#define BR .015
vec2 dots(vec3 p){ vec3 q=dbQ(p);
  float base=sdRBox(q-vec3(0.,.01,0.),vec3(.15,.01,.035),.004);
  float pegs=1e5, beads=1e5;
  for(int i=0;i<7;i++){ vec3 c=q-vec3(-.12+float(i)*.04,0.,0.); float n=cntB(i);
    pegs=min(pegs,sdCylY(c-vec3(0.,.1,0.),.0025,.09));
    float k=clamp(floor((c.y-.02)/(2.*BR)),0.,n-1.); beads=min(beads,length(c-vec3(0.,.02+BR+k*2.*BR,0.))-BR*.97); }
  return vec2(min(base,pegs),beads); }
#define BC vec3(.19,.037,.0)
float ball(vec3 p){ return length(p-BC)-.037; }
vec3 btQ(vec3 p){ vec3 q=p-vec3(-.02,0.,-.08); q.xz=rot(-.12)*q.xz; return q; }
float bat(vec3 p){ vec3 q=btQ(p);
  float x=q.x; float r=mix(.009,.024,smoothstep(-.12,.12,x));
  float body=max(length(vec2(q.y-.025,q.z))-r,abs(x)-.2)-.001;
  float knob=length(vec3((x+.205)*2.,q.y-.025,q.z))-.013;
  return min(body,knob*.5); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 d=dots(p); r=U(r,d.x,3.); r=U(r,d.y,4.);
  r=U(r,ball(p),5.);
  r=U(r,bat(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .55;
  if(id==4.) return .4;
  if(id==5.){ vec3 q=normalize(p-BC); q.xy=rot(.6)*q.xy; q.xz=rot(.8)*q.xz;
    float a=atan(q.z,q.x); float seam=abs(q.y-.55*cos(2.*a));
    if(seam<.035) return .2; if(abs(seam-.08)<.02&&fract(a*9.)<.45) return .4; return .92; }
  if(id==6.) return .62+.08*grain(btQ(p)*vec3(1.,3.,3.),20.);
  return .7; }
