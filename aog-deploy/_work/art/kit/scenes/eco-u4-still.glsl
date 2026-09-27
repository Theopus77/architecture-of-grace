/* Economics Unit 4 "Scarcity and the Choices People Make" — pencil still life: an hourglass
   running low (time is scarce), and a plate with just one cookie left beside an almost
   empty cookie jar. */
#define CAM_POS vec3(-0.3158,0.2399,-0.8153)
#define CAM_TGT vec3(-0.1969,0.0307,0.0810)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define HC vec3(.04,0.,.14)
vec2 hourglass(vec3 p){
  vec3 q=p-HC;
  float caps=min(sdCylY(q-vec3(0.,.008,0.),.06,.008),sdCylY(q-vec3(0.,.232,0.),.06,.008))-.002;
  float posts=1e5; for(int i=0;i<3;i++){ float a=float(i)*2.094+.5; posts=min(posts,sdCylY(q-vec3(.05*cos(a),.12,.05*sin(a)),.0045,.112)); }
  float y=q.y-.12; float R=.006+.04*pow(abs(y)/.105,.7);
  float glass=abs((length(q.xz)-R)*.8)-.0015; glass=max(glass,abs(y)-.105);
  /* sand: a little left on top, a heap below, a thin stream */
  float top=max((length(q.xz)-R+.003)*.8,max(y-.03,-y));
  float bot=max((length(q.xz)-R+.003)*.8,max(y+.105-.065+length(q.xz)*.6,-(y+.105)));
  float stream=sdCylY(q-vec3(0.,.07,0.),.0012,.05);
  return vec2(min(caps,posts),min(glass,1e5)); }
float sand(vec3 p){
  vec3 q=p-HC; float y=q.y-.12; float R=.006+.04*pow(abs(y)/.105,.7);
  float top=max((length(q.xz)-R+.003)*.8,max(y-.025,-y));
  float bot=max((length(q.xz)-R+.003)*.8,max(y+.105-.06+length(q.xz)*.7,-(y+.105)));
  float stream=sdCylY(q-vec3(0.,.07,0.),.0012,.05);
  return min(min(top,bot),stream); }
#define PL vec3(-.19,0.,-.01)
vec2 plate(vec3 p){
  vec3 q=p-PL;
  float pl=max(abs(length(vec2(length(q.xz)*.9,q.y+.06))-.0-0.)-.0,0.);
  pl=sdCone(q-vec3(0.,.006,0.),.05,.075,.006); pl=max(pl,-sdCone(q-vec3(0.,.011,0.),.045,.066,.004));
  vec3 c=q-vec3(.005,.018,.0);
  float cookie=sdCylY(c,.034,.006)-.003;
  cookie-= .002*(fbm3(c*140.)-.5);
  return vec2(pl,cookie); }
#define JC vec3(.29,0.,.02)
vec2 jar(vec3 p){
  vec3 q=p-JC;
  float g=abs(sdCylY(q-vec3(0.,.07,0.),.05,.07)-.005)-.0025; g=max(g,q.y-.137);
  float lid=sdCylY(q-vec3(0.,.145,0.),.054,.008)-.003; lid=min(lid,length(q-vec3(0.,.162,0.))-.012);
  vec3 c=q-vec3(.01,.012,.0); c.xy=rot(.25)*c.xy; float crumb=sdCylY(c,.012,.003)-.002;
  return vec2(min(g,lid),crumb); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 h=hourglass(p); r=U(r,h.x,3.); r=U(r,h.y,4.);
  r=U(r,sand(p),5.);
  vec2 pl=plate(p); r=U(r,pl.x,6.); r=U(r,pl.y,7.);
  vec2 j=jar(p); r=U(r,j.x,4.); r=U(r,j.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .42;
  if(id==4.) return .96;
  if(id==5.) return .55;
  if(id==6.){ vec3 q=p-PL; if(abs(length(q.xz)-.062)<.0025) return .5; return .9; }
  if(id==7.){ vec3 q=p-PL-vec3(.005,.018,0.); if(q.y>.004&&length(fract(q.xz/.016)-.5)<.18) return .15; return .5; }   /* chocolate chips */
  return .7; }
