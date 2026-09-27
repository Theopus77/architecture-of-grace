/* Science Unit 10 "Matter and Its Interactions" — pencil still life: a round-bottom
   flask of liquid on a stand, a rack of three test tubes, and a beaker. */
#define CAM_POS vec3(-0.5161,0.2279,-0.6628)
#define CAM_TGT vec3(-0.2063,-0.0004,0.1526)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define FC vec3(.03,0.,.07)
vec2 flask(vec3 p){ vec3 q=p-FC;
  /* conical (Erlenmeyer) flask */
  float r=length(q.xz); float h=q.y;
  float prof=mix(.085,.018,clamp(h/.14,0.,1.));
  float outer=max(r-prof,abs(h-.09)-.09)-.003; outer=min(outer,sdCylY(q-vec3(0.,.16,0.),.019,.03));
  float lip=sdTorus(q-vec3(0.,.19,0.),.02,.004);
  float shell=max(outer,-max(max(r-prof+.004,abs(h-.1)-.1),-h+.004));
  float liq=max(max(r-prof+.004,h-.07),-h+.004);
  return vec2(min(shell,lip),liq); }
#define TR vec3(-.24,0.,.03)
vec2 rack(vec3 p){ vec3 q=p-TR; q.xz=rot(.25)*q.xz;
  float top=sdRBox(q-vec3(0.,.075,0.),vec3(.085,.005,.028),.002);
  for(int i=0;i<3;i++) top=max(top,-sdCylY(q-vec3(float(i-1)*.052,.075,0.),.016,.02));
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.085,.006,.028),.002);
  float ends=sdRBox(vec3(abs(q.x)-.08,q.y-.04,q.z),vec3(.005,.04,.028),.002);
  float tubes=1e5, liq=1e5;
  for(int i=0;i<3;i++){ vec3 t=q-vec3(float(i-1)*.052,0.,0.); float L=.07+.012*float(i==1?1:0);
    float tb=abs(sdCapsule(t,vec3(0.,.025,0.),vec3(0.,.15,0.),.013))-.0015; tb=max(tb,t.y-.15);
    tubes=min(tubes,min(tb,sdTorus(t-vec3(0.,.15,0.),.0135,.0025)));
    liq=min(liq,max(sdCapsule(t,vec3(0.,.025,0.),vec3(0.,.15,0.),.011),t.y-.03-L+.03*float(i))); }
  return vec2(min(min(top,base),min(ends,tubes)),liq); }
#define BK vec3(.3,0.,.04)
vec2 beaker(vec3 p){ vec3 q=p-BK;
  float r=length(q.xz);
  float sh=max(abs(r-.045)-.002,abs(q.y-.055)-.055); sh=min(sh,sdCylY(q-vec3(0.,.002,0.),.045,.002));
  vec2 sp=q.xz-vec2(-.045,0.); float spout=max(length(vec2(length(sp)-.006,q.y-.11))-.002,sp.x);
  float liq=max(r-.043,abs(q.y-.03)-.028);
  return vec2(min(sh,spout),liq); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 f=flask(p); r=U(r,f.x,3.); r=U(r,f.y,4.);
  vec2 t=rack(p); r=U(r,t.x,5.); r=U(r,t.y,6.);
  vec2 b=beaker(p); r=U(r,b.x,7.); r=U(r,b.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=p-FC; return (abs(fract(q.y/.025)-.5)<.05&&q.y>.02&&q.y<.12&&q.z<0.&&abs(q.x)<.012)?.3:.9; }
  if(id==4.) return .5;
  if(id==5.) return .55; if(id==6.) return .45;
  if(id==7.){ vec3 q=p-BK; return (fract(q.y/.02)<.1&&q.y>.015&&q.y<.1&&q.z<0.&&q.x<.0&&q.x>-.02)?.3:.9; }
  if(id==8.) return .62;
  return .7; }
