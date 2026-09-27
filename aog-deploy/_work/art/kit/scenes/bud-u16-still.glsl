/* Buddhist Texts Unit 16 "Comparison" — pencil still life: two different books lying open side
   by side on the table, one a bound codex and one a palm-leaf manuscript untied with its leaves
   fanned, with a small bell between them to mark a pause for thinking. Hint-lines only. */
#define CAM_POS vec3(-0.3013,0.3535,-0.8562)
#define CAM_TGT vec3(-0.1922,-0.0011,0.0531)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
vec3 oQ(vec3 p){ vec3 q=ry(p-vec3(-.12,0.,.06),.2); q.yz=rot(-.2)*q.yz; return q-vec3(0.,.02,0.); }
vec2 openBook(vec3 p){ vec3 q=oQ(p); float x=abs(q.x);
  float lift=.022*sin(clamp(x/.13,0.,1.)*1.9)-.015*exp(-x*50.)+.008;
  float pages=sdBox(vec3(x-.066,q.y-lift*.5,q.z),vec3(.064,max(lift*.5,.003),.088))-.0015;
  float cover=sdRBox(vec3(x-.07,q.y+.001,q.z),vec3(.073,.0035,.095),.0015);
  float prop=sdRBox(p-vec3(-.1,.012,.14),vec3(.13,.012,.03),.003);
  return vec2(pages,min(cover,prop)); }
float fan(vec3 p){ vec3 q=p-vec3(.2,0.,-.03); float d=1e5;
  for(int i=0;i<5;i++){ vec3 l=ry(q-vec3(0.,.002+float(i)*.0032,0.),-.25+float(i)*.12); d=min(d,leafD(l-vec3(.0,0.,0.),.15,.024)); }
  d=min(d,sdRBox(ry(q,-.35)-vec3(0.,-.0,0.)+vec3(0.,0.,0.)-vec3(0.,.0,0.),vec3(.155,.004,.027),.003));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  vec2 b=openBook(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,fan(p),5.);
  r=U(r,bellD(ry(p-vec3(.05,0.,.2),.3),1.),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=oQ(p); float x=abs(q.x); float a=.94; float l=fract((q.z+.2)/.011); if(abs(x-.066)<.045&&abs(q.z)<.075&&l<.26) a=.62; if(x<.006) a=.7; return a; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-vec3(.2,0.,-.03); float k=clamp(floor((q.y-.002)/.0032+.5),0.,4.); return leafTone(ry(q-vec3(0.,.002+k*.0032,0.),-.25+k*.12),.15,.024); }
  if(id==6.) return .55;
  return .7; }
