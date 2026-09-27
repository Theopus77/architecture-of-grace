/* Chinese Classics Unit 5 "Key Teachings of Confucius" — pencil still life: a bronze ritual
   cauldron (ding) on three legs with two upright handles and a band of cloud-scroll pattern
   (li, the rites), and a small clay pot with a young sprout (Mencius's "sprouts" of goodness). */
#define CAM_POS vec3(-0.3395,0.2790,-0.8200)
#define CAM_TGT vec3(-0.1348,0.0557,0.1011)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define DC vec3(0.,0.,.1)
float ding(vec3 p){ vec3 q=p-DC;
  /* bowl: a squat round belly from y .07 to .2 */
  vec3 b=q-vec3(0.,.15,0.);
  float bowl=(length(b/vec3(.12,.085,.12))-1.)*.085; bowl=max(bowl,b.y-.045);
  float hollow=(length(b/vec3(.11,.08,.11))-1.)*.08; bowl=max(bowl,-max(hollow,-(b.y-.0)));
  float lip=sdTorus(b-vec3(0.,.045,0.),.108,.006);
  float band=max(sdCylY(b-vec3(0.,.02,0.),.121,.014),-sdCylY(b,.1,.1));
  float d=min(min(bowl,lip),band-.001);
  /* three legs: slightly tapered columns with a flared foot */
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.5; vec3 l=q-vec3(.075*cos(a),0.,.075*sin(a));
    float leg=sdCone(l-vec3(0.,.05,0.),.012,.017,.05);
    float foot=sdCylY(l-vec3(0.,.005,0.),.016,.005)-.002;
    d=smin(d,min(leg,foot),.008); }
  /* two upright loop handles on the rim */
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 h=q-vec3(s*.095,.235,0.);
    float ear=max(sdRBox(h,vec3(.009,.04,.03),.006),-sdRBox(h-vec3(0.,.008,0.),vec3(.02,.022,.017),.004));
    d=min(d,ear); }
  return d; }
#define SP vec3(.3,0.,-.02)
float pot(vec3 p){ vec3 q=p-SP;
  float d=sdCone(q-vec3(0.,.035,0.),.032,.045,.035)-.002;
  d=max(d,-sdCylY(q-vec3(0.,.07,0.),.04,.01));
  d=min(d,sdTorus(q-vec3(0.,.068,0.),.045,.004));
  return d; }
float soil(vec3 p){ vec3 q=p-SP; return sdCylY(q-vec3(0.,.062,0.),.041,.002)-.001*fbm(q.xz*300.); }
float sprout(vec3 p){ vec3 q=p-SP;
  float stem=sdCapsule(q,vec3(0.,.062,0.),vec3(.004,.12,0.),.0025);
  float d=stem;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 l=q-vec3(.004,.12,0.); l.xy=rot(s*.5)*l.xy; l.x*=s;
    float w=.011*sin(clamp(l.x/.04,0.,1.)*3.1416); float lf=max(max(abs(l.z)-w,abs(l.y-l.x*.25)-.0012),max(-l.x,l.x-.04)); d=min(d,lf); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,ding(p),3.);
  r=U(r,pot(p),4.);
  r=U(r,soil(p),5.);
  r=U(r,sprout(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-DC; vec3 b=q-vec3(0.,.15,0.);
    if(abs(b.y-.02)<.013&&length(q.xz)>.112){ float a=atan(q.z,q.x); vec2 u=vec2(fract(a*16./6.2832)-.5,(b.y-.02)/.013*.5);
      float sp=abs(length(u)-.28); if(sp<.07||abs(u.y)>.44) return .22; return .58; }
    if(q.y<.07) return .4; return .46+.1*fbm(q.xz*60.+q.y*40.); }
  if(id==4.) return .6;
  if(id==5.) return .25;
  if(id==6.) return .4;
  return .7; }
