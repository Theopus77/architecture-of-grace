/* Medicine and Health Unit 9 "From the Islamic Golden Age to the Renaissance" — pencil still
   life: an old brass microscope on a horseshoe foot, a thick leather-bound book with raised
   bands on its spine, and a feather quill standing in an ink pot. */
#define CAM_POS vec3(-0.5736,0.5340,-1.1811)
#define CAM_TGT vec3(-0.3634,0.0394,0.0802)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define MC vec3(.0,0.,.08)
#define BK vec3(-.17,0.,-.02)
#define IP vec3(.17,0.,-.06)
vec3 mQ(vec3 p){ return place(p,MC,1.2)/1.45; }
float scopeD(vec3 p){ vec3 q=mQ(p);
  /* horseshoe foot */
  float f=sdCylY(q-vec3(0.,.008,.0),.06,.008)-.002; f=max(f,-sdBox(q-vec3(0.,.008,-.06),vec3(.022,.02,.04)));
  /* pillar and tilt joint */
  float d=min(f,sdRBox(q-vec3(0.,.05,.03),vec3(.01,.045,.008),.003));
  d=min(d,sdCylX(q-vec3(0.,.1,.03),.014,.016)-.002);
  /* the curved limb (arm) rising from the joint */
  vec3 a=q-vec3(0.,.15,-.01); float arm=max(abs(length(a.yz)-.046)-.008,abs(a.x)-.007)-.002; arm=max(arm,-a.z);
  arm=min(arm,sdRBox(q-vec3(0.,.18,.012),vec3(.007,.008,.016),.002));
  d=min(d,arm);
  /* the stage with a hole, and the mirror below */
  d=min(d,max(sdRBox(q-vec3(0.,.11,-.01),vec3(.035,.004,.035),.002),-sdCylY(q-vec3(0.,.11,-.01),.008,.01)));
  vec3 m=q-vec3(0.,.055,-.01); m.yz=rot(.5)*m.yz; d=min(d,sdCylY(m,.02,.003)-.0015);
  d=min(d,sdCylY(m-vec3(0.,-.006,0.),.022,.0015)-.001);
  /* body tube with its eyepiece and objective */
  vec3 t=q-vec3(0.,.16,-.01);
  d=min(d,sdCylY(t,.017,.035)-.0015);
  d=min(d,sdCylY(t-vec3(0.,.04,0.),.019,.004)-.001);
  d=min(d,sdCylY(t-vec3(0.,.055,0.),.011,.015)-.001);
  d=min(d,sdCylY(t-vec3(0.,.072,0.),.014,.003)-.001);
  d=min(d,sdCone(t-vec3(0.,-.042,0.),.007,.013,.008));
  /* focus knobs */
  d=min(d,sdCylX(q-vec3(0.,.19,.035),.012,.03)-.001);
  return d*1.45; }
float bkD(vec3 p){ vec3 q=place(p,BK,1.35); return bookD(q,vec3(.075,.028,.105)); }
float inkD(vec3 p){ vec3 q=p-IP;
  float d=sdCylY(q-vec3(0.,.02,0.),.03,.02)-.004;
  d=smin(d,sdCylY(q-vec3(0.,.045,0.),.014,.006),.008);
  d=min(d,sdTorus(q-vec3(0.,.051,0.),.014,.003));
  return max(d,-sdCylY(q-vec3(0.,.06,0.),.011,.02)); }
vec3 qlQ(vec3 p){ vec3 q=p-IP-vec3(0.,.03,0.); q.xy=rot(-.35)*q.xy; q.yz=rot(.2)*q.yz; return q; }
float quillD(vec3 p){ vec3 q=qlQ(p);
  float shaft=sdCapsule(q,vec3(0.),vec3(0.,.18,0.),.0022);
  vec3 v=q-vec3(.006,.125,0.); v.xy=rot(-.06)*v.xy;
  float vane=sdEll(v,vec3(.015,.058,.0022)); vane=max(vane,.07-q.y);
  vane+= .0015*abs(sin(v.y*120.+v.x*40.))*step(.0,v.x);
  return min(shaft,vane*.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,scopeD(p),3.);
  r=U(r,bkD(p),4.);
  r=U(r,inkD(p),5.);
  r=U(r,quillD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=mQ(p); if(q.y<.02) return .35; return .62+.1*n.y; }
  if(id==4.){ vec3 q=place(p,BK,1.35);
    if(q.x>-.07&&abs(q.z)<.1&&q.y>.006&&q.y<.05&&n.y<.6&&n.y>-.6) return fract(q.y/.0022)<.35?.7:.95;   /* page edges */
    if(n.y>.8&&abs(abs(q.z)-.09)<.002) return .25;
    if(n.y>.8&&abs(abs(q.x-.005)-.06)<.002&&abs(q.z)<.09) return .25;       /* a tooled border */
    return .38; }
  if(id==5.) return .3;
  if(id==6.) return .85;
  return .7; }
