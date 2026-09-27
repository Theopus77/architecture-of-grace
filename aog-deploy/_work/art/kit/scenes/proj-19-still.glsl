/* FACS project 19 "Soft mall-style pretzels" — pencil still life: three twisted soft pretzels,
   shiny and deep brown with coarse salt, on a parchment-lined baking sheet, and a small bowl of
   melted butter with a pastry brush resting across it. */
#define CAM_POS vec3(-0.3038,0.3707,-0.5965)
#define CAM_TGT vec3(-0.1217,-0.0481,0.0808)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define SC vec3(-.02,0.,.03)
#define SR .1
vec3 sL(vec3 p){ vec3 q=p-SC; q.xz=rot(SR)*q.xz; return q; }
float sheet(vec3 p){ vec3 q=sL(p);
  float d=sdRBox(q-vec3(0.,.005,0.),vec3(.18,.005,.12),.003);
  d=max(d,-sdRBox(q-vec3(0.,.009,0.),vec3(.17,.005,.11),.002));
  return d; }
float parch(vec3 p){ vec3 q=sL(p); return sdRBox(q-vec3(0.,.0052,0.),vec3(.165,.0006,.105),.0004); }
/* one pretzel: centre c (on the sheet), turned a, scale s */
float pretzel(vec3 p,vec3 c,float a,float s){ vec3 q=sL(p)-c; q.xz=rot(a)*q.xz; q/=s;
  vec3 P[55]=vec3[55](vec3(-0.300,0.100,-0.520),vec3(-0.251,0.100,-0.450),vec3(-0.182,0.100,-0.350),vec3(-0.120,0.100,-0.250),vec3(-0.079,0.100,-0.160),vec3(-0.044,0.100,-0.069),vec3(0.000,0.100,0.020),vec3(0.059,0.100,0.113),vec3(0.127,0.100,0.204),vec3(0.200,0.100,0.280),vec3(0.279,0.100,0.339),vec3(0.363,0.100,0.381),vec3(0.450,0.100,0.400),vec3(0.544,0.100,0.390),vec3(0.640,0.100,0.355),vec3(0.720,0.100,0.300),vec3(0.779,0.100,0.221),vec3(0.821,0.100,0.123),vec3(0.840,0.100,0.020),vec3(0.832,0.100,-0.086),vec3(0.801,0.100,-0.197),vec3(0.750,0.100,-0.300),vec3(0.681,0.100,-0.394),vec3(0.592,0.100,-0.480),vec3(0.480,0.100,-0.550),vec3(0.336,0.100,-0.605),vec3(0.168,0.100,-0.645),vec3(0.000,0.100,-0.660),vec3(-0.168,0.100,-0.645),vec3(-0.336,0.100,-0.605),vec3(-0.480,0.100,-0.550),vec3(-0.592,0.100,-0.480),vec3(-0.681,0.100,-0.394),vec3(-0.750,0.100,-0.300),vec3(-0.801,0.100,-0.197),vec3(-0.832,0.100,-0.086),vec3(-0.840,0.100,0.020),vec3(-0.821,0.100,0.123),vec3(-0.779,0.100,0.221),vec3(-0.720,0.100,0.300),vec3(-0.640,0.100,0.355),vec3(-0.544,0.100,0.390),vec3(-0.450,0.100,0.400),vec3(-0.363,0.100,0.381),vec3(-0.279,0.100,0.339),vec3(-0.200,0.170,0.280),vec3(-0.127,0.170,0.204),vec3(-0.059,0.170,0.113),vec3(0.000,0.170,0.020),vec3(0.044,0.170,-0.069),vec3(0.079,0.170,-0.160),vec3(0.120,0.100,-0.250),vec3(0.182,0.100,-0.350),vec3(0.251,0.100,-0.450),vec3(0.300,0.100,-0.520));
  float d=1e5;
  for(int i=0;i<54;i++) d=smin(d,sdCapsule(q,P[i],P[i+1],(i<2||i>51)?.075:.095),.03);
  return d*s; }
#define PS .075
float pretzels(vec3 p){ float y=.0058;
  float d=pretzel(p,vec3(-.07,y,.035),.1,PS);
  d=min(d,pretzel(p,vec3(.08,y,.04),-.2,PS));
  d=min(d,pretzel(p,vec3(.0,y,-.055),.25,PS));
  return d; }
#define BB vec3(.23,0.,-.08)
float bowl(vec3 p){ return bowlD(p-BB,.045,.035); }
float butter(vec3 p){ vec3 q=p-BB; return max(sdCylY(q-vec3(0.,.02,0.),.04,.008),-1.); }
float brush(vec3 p){ vec3 q=p-BB-vec3(0.,.04,0.); q.xz=rot(.5)*q.xz;
  float h=sdCapsule(q,vec3(-.01,0.,0.),vec3(.13,.012,0.),.005);
  float fer=sdRBox(q-vec3(-.02,-.001,0.),vec3(.012,.004,.012),.002);
  float br=sdRBox(q-vec3(-.045,-.004,0.),vec3(.02,.003,.012),.002);
  return min(min(h,fer),br); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,sheet(p),3.);
  r=U(r,parch(p),4.);
  vec3 q=sL(p); float bd=sdRBox(q-vec3(0.,.025,0.),vec3(.17,.025,.115),.0);
  if(bd>.01) r.x=min(r.x,bd); else r=U(r,pretzels(p),5.);
  r=U(r,bowl(p),6.);
  r=U(r,butter(p),7.);
  r=U(r,brush(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return .93;
  if(id==5.) return (n.y>.5&&h13(floor(p*900.))>.93)?.97:.33;     /* deep brown with coarse salt */
  if(id==6.){ vec3 q=p-BB; return abs(q.y-.028)<.002?.4:.8; }
  if(id==7.) return .8;
  if(id==8.){ vec3 q=p-BB-vec3(0.,.04,0.); q.xz=rot(.5)*q.xz; return q.x<-.03?.75:q.x<-.008?.45:.62; }
  return .7; }
