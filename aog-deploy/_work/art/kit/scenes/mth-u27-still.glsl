/* Math Unit 27 "Financial Math and Capstone" — pencil still life: a round piggy bank with a
   coin slot on its back, beside three stacks of coins that grow taller (saving with
   interest). */
#define CAM_POS vec3(-0.3213,0.1804,-0.6455)
#define CAM_TGT vec3(-0.2260,0.0140,0.0992)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define PG vec3(.06,.1,.12)
vec3 pgQ(vec3 p){ vec3 q=p-PG; q.xz=rot(-.35)*q.xz; return q; }   /* pig faces -x (toward the left) */
float pig(vec3 p){ vec3 q=pgQ(p);
  float body=length(q/vec3(.12,.085,.085))-1.; body*=.085;
  float snout=sdCylX(q-vec3(-.118,-.005,0.),.03,.018)-.006;
  float d=smin(body,snout,.015);
  vec3 lq=q; lq.z=abs(lq.z); float legs=1e5;
  for(int i=0;i<2;i++){ float x=i==0?-.06:.06; legs=min(legs,sdCone(lq-vec3(x,-.07,.045),.02,.024,.03)-.003); }
  d=smin(d,legs,.01);
  vec3 e=q-vec3(-.06,.07,0.); e.z=abs(e.z)-.045; e.xy=rot(.5)*e.xy;
  float ears=max(sdCone(e,.022,.002,.018),abs(e.z)-.006)-.002;
  d=smin(d,ears,.006);
  float tail=sdTorus((q-vec3(.125,.01,0.)).yxz,.01,.0025);
  d=min(d,tail);
  float slot=sdBox(q-vec3(.01,.085,0.),vec3(.022,.02,.0025));
  d=max(d,-slot);
  return d; }
#define CT .0075
float stackD(vec3 p,vec3 c,float n){ vec3 q=p-c;
  float k=clamp(floor(q.y/CT),0.,n-1.); vec3 l=q-vec3(.001*sin(k*2.7),(k+.5)*CT,.001*cos(k*1.9));
  return sdCylY(l,.027,CT*.5-.0004)-.0004; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pig(p),3.);
  float c=min(stackD(p,vec3(-.2,0.,.02),4.),stackD(p,vec3(-.13,0.,-.01),7.));
  c=min(c,stackD(p,vec3(-.06,0.,-.05),11.));
  r=U(r,c,4.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pgQ(p); vec3 e=q-vec3(-.085,.03,0.); e.z=abs(e.z)-.035; if(length(e)<.009) return .1;
    if(q.x<-.128&&abs(abs(q.z)-.01)<.005&&abs(q.y+.005)<.007) return .2; return .78; }
  if(id==4.){ float f=fract(p.y/CT); return f<.14?.22:.6; }
  return .7; }
