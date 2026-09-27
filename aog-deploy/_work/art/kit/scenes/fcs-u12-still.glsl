/* FCS Unit 12 "Hand Sewing" — pencil still life: a tomato pincushion stuck with round-headed
   pins, a pair of sewing scissors, a thimble and a small spool of thread. */
#define CAM_POS vec3(-0.3039,0.1938,-0.5304)
#define CAM_TGT vec3(-0.1365,-0.0204,0.0925)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define PC vec3(.03,0.,.06)
float cushion(vec3 p){ vec3 q=p-PC-vec3(0.,.055,0.); float a=atan(q.z,q.x);
  float d=(length(q/vec3(.085,.06,.085))-1.)*.06; d+=.004*(1.-abs(cos(a*3.)))*smoothstep(-.03,.03,q.y);   /* six lobes */
  d=max(d,-(q.y+.052));
  float leaf=1e5; for(int i=0;i<5;i++){ float b=float(i)*1.2566; vec3 l=q-vec3(0.,.06,0.); l.xz=rot(b)*l.xz; leaf=min(leaf,(length((l-vec3(.018,0.,0.))/vec3(.022,.004,.008))-1.)*.004); }
  leaf=min(leaf,sdCylY(q-vec3(0.,.068,0.),.004,.008));
  return min(d,leaf); }
vec3 pinDir(int i){ float a=float(i)*1.3+.3; float e=.5+.35*sin(float(i)*2.1); return normalize(vec3(cos(a)*cos(e),sin(e),sin(a)*cos(e))); }
float pins(vec3 p){ vec3 c=PC+vec3(0.,.055,0.); float d=1e5;
  for(int i=0;i<7;i++){ vec3 a=pinDir(i); vec3 s=c+a*vec3(.085,.06,.085)*.95; vec3 e=s+a*.03;
    d=min(d,sdCapsule(p,s,e,.0009)); d=min(d,length(p-e)-.0055); } return d; }
float scissors(vec3 p){ vec3 q=p-vec3(-.15,.004,-.05); q.xz=rot(.5)*q.xz; float d=1e5;
  for(int s=0;s<2;s++){ float a=s==0?.14:-.14; vec3 r=q; r.xz=rot(a)*r.xz;
    float blade=max(sdRBox(r-vec3(.055,0.,0.),vec3(.055,.0018,.006),.001),abs(r.z)-.0065*(1.-max(r.x-.02,0.)/.09));
    vec3 rr=r-vec3(-.035,0.,(s==0?.014:-.014)); float ring=sdTorus(rr/vec3(1.,1.,.75),.013,.0035);
    d=min(d,min(blade,ring)); }
  d=min(d,sdCylY(q,.004,.004)); return d; }
float thimble(vec3 p){ vec3 q=p-vec3(.17,0.,-.05); float r=.013-q.y*.08; float d=sdCylY(q-vec3(0.,.016,0.),r,.016)-.002; d=smin(d,length(q-vec3(0.,.03,0.))-.011,.004);
  return d; }
float spool(vec3 p){ vec3 q=p-vec3(.2,0.,.04); float f=min(sdCylY(q-vec3(0.,.004,0.),.024,.004),sdCylY(q-vec3(0.,.056,0.),.024,.004))-.001;
  float t=sdCylY(q-vec3(0.,.03,0.),.02,.022); return min(f,t); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cushion(p),3.);
  r=U(r,pins(p),4.);
  r=U(r,scissors(p),5.);
  r=U(r,thimble(p),6.);
  r=U(r,spool(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PC-vec3(0.,.055,0.); if(q.y>.052) return .3; float a=atan(q.z,q.x); return abs(cos(a*3.))>.97?.3:.5; }
  if(id==4.) return .3;
  if(id==5.){ vec3 q=p-vec3(-.15,.004,-.05); q.xz=rot(.5)*q.xz; return q.x<-.015?.3:.8; }
  if(id==6.){ vec3 q=p-vec3(.17,0.,-.05); return fract(q.y/.004)<.4&&q.y>.008?.4:.7; }
  if(id==7.){ vec3 q=p-vec3(.2,0.,.04); return q.y>.009&&q.y<.051&&length(q.xz)<.021?.3+.1*sin(q.y*1500.):.72; }
  return .7; }
