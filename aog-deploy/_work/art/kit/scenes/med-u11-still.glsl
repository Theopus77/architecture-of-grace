/* Medicine Unit 11 "Your Body's Defenses and Choices" — pencil still life: a round apple
   with a stem and leaf, a tall glass of water, and a bar of soap on a small wooden dish. */
#define CAM_POS vec3(-0.4653,0.2898,-1.0141)
#define CAM_TGT vec3(-0.2149,0.0621,0.1123)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define AP vec3(.02,.075,.0)
float apple(vec3 p){ vec3 q=p-AP; float r=length(q.xz);
  float d=length(q*vec3(1.,1.12,1.))-.075;
  d+=.018*exp(-r*r*900.)*smoothstep(-.02,.06,q.y);  /* dimple at the top */
  d+=.01*exp(-r*r*900.)*smoothstep(.0,-.06,q.y);
  return d*.8; }
float stem(vec3 p){ vec3 q=p-AP-vec3(0.,.055,0.); return sdCapsule(q,vec3(0.),vec3(.006,.035,.002),.0035); }
float leaf(vec3 p){ vec3 q=p-AP-vec3(.02,.078,0.); q.xy=rot(-.5)*q.xy; return max(length(q*vec3(1.,6.,2.2))-.028,-1.)*.4-.0005; }
#define GC vec3(-.16,0.,.1)
float glassD(vec3 p){ vec3 q=p-GC; float r=length(q.xz); float R=.042+.006*q.y/.16;
  float wall=max(abs(r-R)-.002,abs(q.y-.08)-.08);
  float base=sdCylY(q-vec3(0.,.006,0.),R-.001,.006);
  return min(wall,base)-.0005; }
float water(vec3 p){ vec3 q=p-GC; return max(length(q.xz)-.04-.004*q.y/.16,abs(q.y-.06)-.05); }
#define SD vec3(.2,0.,-.05)
float soapdish(vec3 p){ vec3 q=p-SD; q.xz=rot(-.25)*q.xz; float d=sdRBox(q-vec3(0.,.006,0.),vec3(.085,.006,.055),.005);
  for(int i=-3;i<=3;i++) d=min(d,sdRBox(q-vec3(float(i)*.022,.014,0.),vec3(.005,.003,.05),.002)); return d; }
float soap(vec3 p){ vec3 q=p-SD-vec3(0.,.035,0.); q.xz=rot(-.25)*q.xz; return sdRBox(q,vec3(.06,.018,.036),.014); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,apple(p),3.);
  r=U(r,stem(p),4.);
  r=U(r,leaf(p),5.);
  r=U(r,glassD(p),6.);
  r=U(r,water(p),7.);
  r=U(r,soapdish(p),8.);
  r=U(r,soap(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-AP; float a=atan(q.z,q.x); return .5+.08*sin(a*14.+q.y*30.)*smoothstep(.07,0.,abs(q.y)); }
  if(id==4.) return .3;
  if(id==5.){ vec3 q=p-AP-vec3(.02,.078,0.); q.xy=rot(-.5)*q.xy; return abs(q.y)<.0015?.3:.5; }
  if(id==6.) return .88;
  if(id==7.) return .8;
  if(id==8.) return .42+.12*grain(p,40.);
  if(id==9.) return .9;
  return .7; }
