/* Room b35 "Matter and Reactions" — pencil still life: a ball-and-stick model of a methane
   molecule (one carbon, four hydrogens on sticks), an Erlenmeyer flask with liquid, and two
   test tubes in a small wooden rack. */
#define CAM_POS vec3(-0.3336,0.3390,-0.6077)
#define CAM_TGT vec3(-0.2247,-0.0111,0.1218)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define MC vec3(0.,.092,-.02)
vec3 hdir(int i){ if(i==0) return vec3(0.,-1.,0.); float a=float(i)*2.0944+.5; return vec3(.943*cos(a),.333,.943*sin(a)); }
float carbonD(vec3 p){ return length(p-MC)-.036; }
float hydD(vec3 p){ float d=1e5; for(int i=0;i<4;i++) d=min(d,length(p-MC-hdir(i)*.074)-.019); return d; }
float stickD(vec3 p){ float d=1e5; for(int i=0;i<4;i++) d=min(d,sdCapsule(p,MC,MC+hdir(i)*.07,.0055)); return d; }
#define FC vec3(.17,0.,.08)
float flask(vec3 p){ return flaskD(p-FC,.065,.17); }
float liquidD(vec3 p){ vec3 q=p-FC; float r=length(q.xz); float hb=.17*.68;
  float cone=max(r-mix(.065,.065*.3,clamp(q.y/hb,0.,1.))+.004,-q.y+.004);
  return max(cone*.9,q.y-.05); }
vec3 rkQ(vec3 p){ return place(p,vec3(-.17,0.,.03),.35); }
float rackD(vec3 q){
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.075,.006,.028),.002);
  float top=sdRBox(q-vec3(0.,.07,0.),vec3(.075,.005,.022),.002);
  top=max(top,-sdCylY(q-vec3(-.03,.07,0.),.0125,.01)); top=max(top,-sdCylY(q-vec3(.0,.07,0.),.0125,.01)); top=max(top,-sdCylY(q-vec3(.03,.07,0.),.0125,.01));
  float u1=sdRBox(q-vec3(-.07,.04,0.),vec3(.005,.035,.02),.002), u2=sdRBox(q-vec3(.07,.04,0.),vec3(.005,.035,.02),.002);
  return min(min(base,top),min(u1,u2)); }
float tubeD(vec3 q,float x,float h){ vec3 t=q-vec3(x,0.,0.);
  float d=min(sdCylY(t-vec3(0.,.02+h*.5,0.),.011,h*.5),length(t-vec3(0.,.02,0.))-.011);
  d=max(abs(d)-.0012,t.y-.02-h);
  return min(d,sdTorus(t-vec3(0.,.02+h,0.),.0115,.0018)); }
float tubesD(vec3 q){ return min(tubeD(q,-.03,.1),tubeD(q,.03,.11)); }
float tliqD(vec3 q){ float d=1e5; for(int i=0;i<2;i++){ vec3 t=q-vec3(i==0?-.03:.03,0.,0.);
  float c=min(sdCylY(t-vec3(0.,.045,0.),.0095,.025),length(t-vec3(0.,.02,0.))-.0095); d=min(d,max(c,t.y-(i==0?.055:.045))); } return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,carbonD(p),3.);
  r=U(r,hydD(p),4.);
  r=U(r,stickD(p),5.);
  r=U(r,flask(p),6.);
  r=U(r,liquidD(p),7.);
  vec3 k=rkQ(p);
  r=U(r,rackD(k),8.);
  r=U(r,tubesD(k),9.);
  r=U(r,tliqD(k),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .3;
  if(id==4.) return .9;
  if(id==5.) return .6;
  if(id==6.){ vec3 q=p-FC; if(abs(q.y-.08)<.0015||abs(q.y-.1)<.0015) return .45; return .93; }
  if(id==7.){ vec3 q=p-FC; if(q.y>.046) return .4; return .66; }
  if(id==8.) return .55+.08*grain(p,60.);
  if(id==9.) return .93;
  if(id==10.) return .55;
  return .7; }
