/* sp1 "Greetings and Introductions" — an old rotary desk telephone with its handset in the
   cradle and a coiled cord, and a folded name card standing beside it (hint-lines only). */
#define CAM_POS vec3(-0.5170,0.2549,-0.4929)
#define CAM_TGT vec3(-0.1781,-0.0244,0.0985)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#include "roomparts_e.glsl"
vec3 fQ(vec3 p){ return plc(p,vec3(.03,0.,.06),-.55); }   /* phone local: front is -z */
float body(vec3 q){
  float b=sdRBox(q-vec3(0.,.045,0.),vec3(.085,.045,.075),.02);
  vec3 n=normalize(vec3(0.,.8,-.6)); b=smax(b,dot(q-vec3(0.,.07,-.02),n),.015);   /* sloped front */
  b=smax(b,q.y-.088,.012);
  return b; }
vec3 dQ(vec3 q){ vec3 d=q-vec3(0.,.062,-.052); d.yz=rot(-.93)*d.yz; return d; }   /* dial plane: local y is the face normal */
float dial(vec3 q){ vec3 d=dQ(q);
  float disc=sdCylY(d,.042,.004)-.001;
  float a=atan(d.z,d.x); float k=floor((a+PI)/(2.*PI)*12.); float ac=-PI+(k+.5)*2.*PI/12.;
  vec2 hc=.029*vec2(cos(ac),sin(ac)); float hole=length(d.xz-hc)-.0075;
  if(k<10.) disc=max(disc,-max(hole,-d.y+.0));
  float hub=sdCylY(d-vec3(0.,.003,0.),.014,.003)-.001;
  float stop=sdCapsule(d,vec3(.04,.004,-.012),vec3(.047,.006,-.02),.002);
  return min(min(disc,hub),stop); }
float cradle(vec3 q){ float d=1e5;
  for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; vec3 c=q-vec3(sx*.06,.097,.028);
    d=min(d,sdRBox(c,vec3(.012,.012,.02),.006)); }
  return d; }
float handset(vec3 q){ vec3 h=q-vec3(0.,.118,.028);
  float bar=sdCapsule(h,vec3(-.085,0.,0.),vec3(.085,0.,0.),.012);
  float ear=sdCylY(h-vec3(-.1,-.012,0.),.024,.012)-.004;
  float mouth=sdCylY(h-vec3(.1,-.012,0.),.024,.012)-.004;
  float d=smin(bar,min(ear,mouth),.02);
  return d; }
float coilSeg(vec3 q,vec3 a,vec3 b){ vec3 pa=q-a,ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
  float s=h*length(ba); return length(pa-ba*h)-.0045-.002*sin(s*2.*PI/.007); }
float cord(vec3 p){ vec3 q=fQ(p);
  vec3 a=vec3(.1,.1,.03), b=vec3(.13,.05,.0), c=vec3(.15,.006,-.05), e=vec3(.12,.006,-.1), f=vec3(.085,.02,-.06);
  float d=coilSeg(q,a,b); d=min(d,coilSeg(q,b,c)); d=min(d,coilSeg(q,c,e)); d=min(d,coilSeg(q,e,f));
  return d*.7; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=fQ(p);
  r=U(r,body(q),3.);
  r=U(r,dial(q),4.);
  r=U(r,min(cradle(q),handset(q)),5.);
  r=U(r,cord(p),6.);
  r=U(r,tentD(p,vec3(-.16,0.,-.08),.055,.05,-.35),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .3;
  if(id==4.){ vec3 d=dQ(fQ(p)); float r=length(d.xz); if(r<.016) return .9; return .75; }
  if(id==5.) return .25;
  if(id==6.) return .3;
  if(id==7.){ vec3 q=p-vec3(-.16,0.,-.08); q.xz=rot(-.35)*q.xz; if(q.z<0.&&abs(q.x)<.04){ float l=fract(q.y/.013); if(q.y>.015&&q.y<.042&&l<.2) return .45; } return .92; }
  return .7; }
