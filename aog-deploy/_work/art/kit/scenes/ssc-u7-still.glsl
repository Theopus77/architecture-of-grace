/* Social Studies Unit 7 "Colonies to a New Nation" — pencil still life: a model of the
   Liberty Bell with its crack, hanging from a wooden yoke, a quill pen in an inkwell and a
   rolled parchment tied with a ribbon. */
#define CAM_POS vec3(-0.2334,0.2709,-0.9271)
#define CAM_TGT vec3(-0.1010,0.0382,0.0699)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define BC vec3(.1,0.,.16)
/* bell profile: radius by height (mouth at y=.03, crown at .19) */
float bellR(float y){ float t=clamp((y-.03)/.16,0.,1.); return .085-.1*t+.06*t*t*t*0.+.045*t*t-.0*t; }
vec2 bell(vec3 p){
  vec3 q=p-BC;
  float y=q.y; float t=clamp((y-.035)/.15,0.,1.);
  float R=mix(.088,.045,pow(t,.55))+.008*exp(-(y-.04)*(y-.04)*4000.)-.002*t;   /* flared lip */
  float outer=(length(q.xz)-R)*.75; outer=max(outer,max(.035-y,y-.19));
  float crown=length((q-vec3(0.,.185,0.))*vec3(1.,1.6,1.))-.045;
  float b=smin(outer,crown*.7,.01);
  b=max(b,-max(length(q.xz)-R+.01,.07-y));                                   /* hollow mouth */
  /* the crack: a thin groove up the front */
  vec3 c=q; float cx=c.x+.012*sin(c.y*60.)+.004;
  float crack=max(max(abs(cx)-.0022,abs(c.y-.09)-.05),c.z+R-.008);
  b=max(b,-crack*.9);
  float bands=min(sdTorus(q-vec3(0.,.155,0.),.052,.003),sdTorus(q-vec3(0.,.06,0.),.083,.003));
  b=min(b,bands);
  /* yoke and two posts */
  float yoke=sdRBox(q-vec3(0.,.225,0.),vec3(.13,.018,.022),.004);
  float posts=min(sdRBox(q-vec3(-.12,.12,0.),vec3(.012,.12,.014),.003),sdRBox(q-vec3(.12,.12,0.),vec3(.012,.12,.014),.003));
  float feet=min(sdRBox(q-vec3(-.12,.006,0.),vec3(.022,.006,.05),.003),sdRBox(q-vec3(.12,.006,0.),vec3(.022,.006,.05),.003));
  float strap=sdRBox(q-vec3(0.,.198,0.),vec3(.018,.012,.024),.002);
  return vec2(b,min(min(yoke,posts),min(feet,strap))); }
#define IC vec3(-.2,0.,.02)
vec2 inkwell(vec3 p){
  vec3 q=p-IC;
  float w=sdRBox(q-vec3(0.,.02,0.),vec3(.032,.02,.032),.006);
  float neck=sdCylY(q-vec3(0.,.045,0.),.014,.008)-.002;
  w=min(w,neck); w=max(w,-sdCylY(q-vec3(0.,.05,0.),.009,.02));
  /* quill: a shaft leaning back to the right with a feather vane */
  vec3 a=vec3(0.,.035,0.), b=vec3(.05,.14,.04);
  float shaft=sdCapsule(q,a,b,.0022);
  vec3 ax=normalize(b-a); float h=clamp(dot(q-a,ax),0.,length(b-a));
  vec3 side=normalize(cross(ax,vec3(0.,0.,1.)));
  vec3 r=q-a-ax*h; float s=dot(r,side), f=dot(r,normalize(cross(ax,side)));
  float t=(h-.03)/.1; float wv=.018*sin(clamp(t,0.,1.)*3.14159)*(1.+.3*clamp(t,0.,1.));
  float vane=max(max(abs(f)-.0012,abs(s-wv*.35)-wv*.8),max(.03-h,-1.));
  float hu=dot(q-a,ax); vane=max(vane,max(hu-length(b-a),-hu));
  return vec2(w,min(shaft,vane)); }
vec3 sq(vec3 p){ vec3 q=p-vec3(.34,.022,-.02); q.xz=rot(-.35)*q.xz; return q; }
vec2 scroll(vec3 p){
  vec3 q=sq(p);
  float roll=sdCylX(q,.022,.1)-.001;
  float rib=sdCylX(q,.0235,.006);
  return vec2(roll,rib); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=bell(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  vec2 i=inkwell(p); r=U(r,i.x,5.); r=U(r,i.y,6.);
  vec2 s=scroll(p); r=U(r,s.x,7.); r=U(r,s.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; float cx=q.x+.012*sin(q.y*60.)+.004;
    if(abs(cx)<.004&&abs(q.y-.09)<.05&&q.z<0.) return .1;
    if(abs(q.y-.13)<.012&&q.z<0.){ float l=fract((q.y-.118)/.008); if(l<.3&&abs(q.x)<.035) return .5; }  /* inscription hint-lines */
    return .5; }
  if(id==4.) return .4;
  if(id==5.) return .3;
  if(id==6.) return .85;
  if(id==7.){ vec3 q=sq(p); if(q.x>.098) return fract(length(q.yz)/.004)<.4?.5:.85; return .86; }
  if(id==8.) return .35;
  return .7; }
