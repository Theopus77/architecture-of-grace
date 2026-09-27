/* sp2 "Numbers, Time and Dates" — a twin-bell alarm clock (the hour), a wooden perpetual
   calendar whose two cubes show 1 and 2 (the date), and a glass thermometer on a small board
   (what the weather is doing).
   @params {"mat":{"3":[0.45,1.3,1.0],"4":[0.9,1.0,0.5],"5":[0.4,1.3,1.0],"6":[0.6,1.2,0.9],"7":[0.72,1.3,1.0],"8":[0.72,1.3,1.0],"9":[0.66,1.2,0.9],"10":[0.8,1.1,0.8]},
            "texlines":{"4":[0.12,0.4,0.9],"7":[0.12,0.4,0.85],"8":[0.12,0.4,0.85],"9":[0.12,0.4,0.6],"10":[0.12,0.4,0.8]}} */
#define CAM_POS vec3(-0.3847,0.3957,-0.8146)
#define CAM_TGT vec3(-0.2472,-0.0470,0.1079)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* alarm clock: face toward -z, round case, two bells and a hammer on top, two feet */
#define CK vec3(.13,0.,.04)
#define CKR -.3
#define CR .07
vec3 ckQ(vec3 p){ vec3 q=p-CK; q.xz=rot(CKR)*q.xz; return q-vec3(0.,.016+CR,0.); }
float caseD(vec3 p){ vec3 q=ckQ(p);
  float body=sdCylZ(q,CR,.022)-.004;
  body=max(body,-(sdCylZ(q-vec3(0.,0.,-.03),CR-.008,.01)));         /* bezel recess */
  body=min(body,sdTorus(vec3(q.x,q.z+.024,q.y),CR-.004,.0045));
  vec3 f=q; f.x=abs(f.x); f-=vec3(CR*.62,-CR*.78,0.); f.xy=rot(-.5)*f.xy;
  body=min(body,sdCapsule(f,vec3(0.),vec3(0.,-.022,0.),.0045));       /* feet */
  vec3 b=q; b.x=abs(b.x); b-=vec3(CR*.58,CR*.88,0.); b.xy=rot(-.55)*b.xy;
  float bell=max(length(b)-.028,-b.y-.004); bell=max(bell,-(length(b)-.024));
  bell=min(bell,sdCylY(b-vec3(0.,.03,0.),.004,.006));
  body=min(body,bell);
  float bar=sdCapsule(q,vec3(-CR*.4,CR+.012,0.),vec3(CR*.4,CR+.012,0.),.003);
  bar=min(bar,sdCapsule(q,vec3(0.,CR+.012,0.),vec3(0.,CR+.03,0.),.0035));
  bar=min(bar,length(q-vec3(0.,CR+.033,0.))-.007);                    /* the winding knob */
  return min(body,bar); }
float faceD(vec3 p){ vec3 q=ckQ(p); return sdCylZ(q-vec3(0.,0.,-.021),CR-.008,.002); }
float glassT(vec3 p){ vec3 q=ckQ(p); vec2 u=q.xy; float r=length(u); float a=atan(u.x,u.y);
  float t=.95;
  float tick=abs(fract(a/6.2832*12.+.5)-.5);
  if(r>CR*.72&&r<CR*.84&&tick<.05) t=.15;
  if(r>CR*.76&&r<CR*.84&&abs(fract(a/6.2832*60.+.5)-.5)<.1) t=min(t,.5);
  vec2 hh=rot(-5.24)*vec2(0.,1.); vec2 mh=rot(-1.05)*vec2(0.,1.);   /* ten past ten, the hands wide */
  if(sdSeg2(u,vec2(0.),vec2(-hh.x,hh.y)*CR*.45)<.0028) t=.1;
  if(sdSeg2(u,vec2(0.),vec2(-mh.x,mh.y)*CR*.66)<.0018) t=.1;
  if(r<.004) t=.1;
  return t; }
/* perpetual calendar: a wooden base holding two cubes carved 1 and 2 */
#define CL vec3(-.1,0.,.07)
#define CLR .28
#define CH .03
vec3 clQ(vec3 p){ vec3 q=p-CL; q.xz=rot(CLR)*q.xz; return q; }
float baseD(vec3 p){ vec3 q=clQ(p);
  float b=sdRBox(q-vec3(0.,.01,0.),vec3(.075,.01,.04),.004);
  b=min(b,sdRBox(q-vec3(0.,.024,.028),vec3(.075,.018,.006),.003));   /* back rail */
  return b; }
float cube(vec3 p,float x,int g,int g2){ vec3 q=clQ(p)-vec3(x,.02+CH,-.004);
  float d=sdRBox(q,vec3(CH),.004);
  if(d>.02) return d;
  d=carve(d,q.xy,g,.046,.0042,q.z+CH,.003);
  d=carve(d,vec2(-q.z,q.y),g2,.044,.004,q.x+CH,.003);
  return d; }
float cubeInk(vec3 p,float x,int g,int g2){ vec3 q=clQ(p)-vec3(x,.02+CH,-.004);
  if(q.z<-CH+.006&&glyph(q.xy/.046,g)*.046<.0058) return .15;
  if(q.x<-CH+.006&&glyph(vec2(-q.z,q.y)/.044,g2)*.044<.0056) return .15;
  return .8; }
/* a glass thermometer on a little wooden board, lying tilted toward us */
vec3 thQ(vec3 p){ vec3 q=p-vec3(.01,0.,-.13); q.xz=rot(-.35)*q.xz; return q; }
float board(vec3 p){ vec3 q=thQ(p); return sdRBox(q-vec3(0.,.006,0.),vec3(.1,.006,.022),.004); }
float tube(vec3 p){ vec3 q=thQ(p)-vec3(0.,.015,0.);
  float t=sdCapsule(q,vec3(-.075,0.,0.),vec3(.08,0.,0.),.0045);
  return min(t,length(q-vec3(-.08,0.,0.))-.008); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,caseD(p),3.);
  r=U(r,faceD(p),4.);
  r=U(r,baseD(p),6.);
  r=U(r,cube(p,-.034,49,51),7.);
  r=U(r,cube(p,.034,50,49),8.);
  r=U(r,board(p),9.);
  r=U(r,tube(p),10.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return glassT(p);
  if(id==6.) return .55+.15*(grain(clQ(p),60.)-.5);
  if(id==7.) return cubeInk(p,-.034,49,51);
  if(id==8.) return cubeInk(p,.034,50,49);
  if(id==9.){ vec3 q=thQ(p); if(q.y>.011&&abs(q.z)>.008&&abs(q.z)<.016&&q.x>-.06&&q.x<.075&&fract((q.x+.06)/.01)<.18) return .3; return .66; }
  if(id==10.){ vec3 q=thQ(p); if(q.x<.02&&abs(q.z)<.002) return .2; if(q.x<-.072) return .2; return .9; }
  return .7; }
