/* Medicine Unit 15 "Health Systems Around the World" — pencil still life: an old leather
   doctor's bag with a brass clasp and handle, and two small stacks of coins beside it. */
#define CAM_POS vec3(-0.3828,0.2182,-0.8571)
#define CAM_TGT vec3(-0.1711,0.0257,0.0952)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BC vec3(0.,0.,.06)
float bag(vec3 p){ vec3 q=p-BC; q.xz=rot(.25)*q.xz;
  float w=.15-.02*(q.y/.16); /* tapers up */
  float body=sdRBox(q-vec3(0.,.08,0.),vec3(w,.08,.075-.02*q.y/.16),.03);
  float top=length((q-vec3(0.,.155,0.)).xy*vec2(1.,1.))-1.; /* dummy */
  float ridge=sdCapsule(q,vec3(-.13,.165,0.),vec3(.13,.165,0.),.016);
  float d=smin(body,ridge,.015);
  d=min(d,sdRBox(q-vec3(0.,.003,0.),vec3(.155,.004,.07),.003));   /* base rim */
  return d+.0008*vn3(p*300.); }
float clasp(vec3 p){ vec3 q=p-BC; q.xz=rot(.25)*q.xz;
  float c=sdRBox(q-vec3(0.,.165,-.018),vec3(.022,.014,.008),.004);
  float bar=sdCapsule(q,vec3(-.14,.172,0.),vec3(.14,.172,0.),.005);
  return min(c,bar); }
float handle(vec3 p){ vec3 q=p-BC; q.xz=rot(.25)*q.xz; q-=vec3(0.,.19,0.);
  float h=max(sdTorus(q.xzy,.055,.008),-q.y); h=min(h,min(sdCylY(q-vec3(-.055,-.005,0.),.01,.008),sdCylY(q-vec3(.055,-.005,0.),.01,.008)));
  return h; }
float coins(vec3 p){ float d=1e3;
  for(int i=0;i<6;i++){ float fi=float(i); d=min(d,sdCylY(p-vec3(.22+.002*sin(fi*4.),.004+fi*.008,-.1+.002*cos(fi*3.)),.03,.0035)-.0006); }
  for(int i=0;i<3;i++){ float fi=float(i); d=min(d,sdCylY(p-vec3(.28+.002*sin(fi*5.),.004+fi*.008,-.03),.026,.0035)-.0006); }
  vec3 q=p-vec3(.16,.004,-.17); d=min(d,sdCylY(q,.03,.0035)-.0006);
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bag(p),3.);
  r=U(r,clasp(p),4.);
  r=U(r,handle(p),5.);
  r=U(r,coins(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; q.xz=rot(.25)*q.xz; if(abs(abs(q.x)-.1)<.002&&q.y<.14) return .2; /* stitched seams */
    return .38+.06*vn3(p*150.); }
  if(id==4.) return .3;
  if(id==5.) return .3;
  if(id==6.){ if(n.y<.5) return fract(atan(p.z,p.x)*400.)<.4?.45:.65; return .7; }
  return .7; }
