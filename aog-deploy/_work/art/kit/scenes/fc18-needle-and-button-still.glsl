/* Room fc18 "The Needle and the Button" — pencil still life: a wooden spool of thread
   standing on end, a round pincushion with pins, three big four-hole buttons, and a sewing
   needle with its thread trailing back to the spool. */
#define CAM_POS vec3(-0.3322,0.3224,-0.6821)
#define CAM_TGT vec3(-0.2157,-0.0531,0.1003)
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
#define SP vec3(-.02,0.,.07)
float spoolD(vec3 p){ vec3 q=p-SP;
  float f1=sdCylY(q-vec3(0.,.008,0.),.05,.006)-.002, f2=sdCylY(q-vec3(0.,.132,0.),.05,.006)-.002;
  float core=sdCylY(q-vec3(0.,.07,0.),.026,.06);
  float d=min(min(f1,f2),core);
  return max(d,-sdCylY(q,.008,.2)); }
float threadD(vec3 p){ vec3 q=p-SP; return sdCylY(q-vec3(0.,.07,0.),.04+.0006*sin(q.y*1200.),.052)-.001; }
#define PC vec3(.16,0.,.04)
float cushionD(vec3 p){ vec3 q=p-PC; float a=atan(q.z,q.x);
  float d=sdEll(q-vec3(0.,.035,0.),vec3(.06,.037,.06));
  d+=.004*pow(abs(cos(a*4.)),6.);
  float base=sdCylY(q-vec3(0.,.006,0.),.045,.006)-.002;
  return min(d,base); }
float pinsD(vec3 p){ vec3 q=p-PC; float d=1e5;
  for(int i=0;i<4;i++){ float fi=float(i); vec3 dir=normalize(vec3(cos(fi*1.9+.3)*.7,1.,sin(fi*1.9+.3)*.7));
    vec3 a=vec3(0.,.035,0.)+dir*.02, b=a+dir*.042;
    d=min(d,sdCapsule(q,a,b,.0012)); d=min(d,length(q-b)-.0055); }
  return d; }
float button(vec3 q,float R){ float d=sdCylY(q-vec3(0.,.0035,0.),R,.0025)-.001;
  d=min(d,sdTorus(q-vec3(0.,.0062,0.),R-.002,.0015));
  d=max(d,-(sdCylY(q-vec3(0.,.008,0.),R-.004,.0012)));
  for(int i=0;i<4;i++){ vec2 o=vec2(i<2?-1.:1.,mod(float(i),2.)<1.?-1.:1.)*R*.22; d=max(d,-sdCylY(q-vec3(o.x,0.,o.y),R*.1,.02)); }
  return d; }
float buttonsD(vec3 p){ return min(min(button(p-vec3(-.17,0.,-.07),.03),button(p-vec3(-.1,0.,-.12),.022)),button(place(p,vec3(-.2,.006,.0),.0)*vec3(1.,1.,1.),.025)); }
vec3 ndQ(vec3 p){ vec3 q=p-vec3(.06,.0022,-.12); q.xz=rot(-.3)*q.xz; return q; }
float needleD(vec3 q){ float t=clamp((q.x+.05)/.1,0.,1.);
  float d=sdCapsule(q,vec3(-.05,0.,0.),vec3(.05,0.,0.),.0017*(1.-.8*t)+.0002);
  float eye=sdBox(q-vec3(-.042,0.,0.),vec3(.005,.004,.0006));
  return max(d,-eye); }
float trailD(vec3 p){ if(p.y>.03) return p.y-.02; float d=1e5; vec3 e=vec3(.0199,.0022,-.1076), b=SP+vec3(.028,.0015,-.03);
  vec3 prev=e;
  for(int i=1;i<=10;i++){ float t=float(i)/10.; vec3 pt=mix(e,b,t)+vec3(-.05*sin(t*3.1416),0.,-.025*sin(t*6.2832));
    pt.y=.0012; d=min(d,sdCapsule(p,prev,pt,.0009)); prev=pt; }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,spoolD(p),3.);
  r=U(r,threadD(p),4.);
  r=U(r,cushionD(p),5.);
  r=U(r,pinsD(p),6.);
  r=U(r,buttonsD(p),7.);
  r=U(r,needleD(ndQ(p)),8.);
  r=U(r,trailD(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .72+.06*grain(p,90.);
  if(id==4.){ vec3 q=p-SP; return fract(q.y/.0025+.3*sin(atan(q.z,q.x)))<.35?.35:.55; }
  if(id==5.){ vec3 q=p-PC; if(q.y<.012) return .6; return .45; }
  if(id==6.) return .3;
  if(id==7.) return .75;
  if(id==8.) return .6;
  if(id==9.) return .35;
  return .7; }
