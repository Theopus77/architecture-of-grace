/* Hindu Texts Unit 12 "Close Reading the Bhagavad Gita" — pencil still life: an open book on
   a small slanted wooden bookrest, a strung bow laid down on the table before it, and a conch
   shell. Pages carry hint-lines only. Objects only. */
#define CAM_POS vec3(-0.2612,0.4580,-0.8339)
#define CAM_TGT vec3(-0.1584,-0.0305,0.0231)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define RC vec3(.08,0.,.12)
#define TILT -.5
vec3 rQ(vec3 p){ vec3 q=p-RC-vec3(0.,.07,0.); q.yz=rot(TILT)*q.yz; return q; }
float rest(vec3 p){ vec3 q=p-RC;
  float board=sdRBox(rQ(p)-vec3(0.,-.008,0.),vec3(.16,.008,.11),.003);
  float lip=sdRBox(rQ(p)-vec3(0.,.006,-.106),vec3(.16,.01,.006),.002);
  float body=max(sdRBox(q-vec3(0.,.04,.01),vec3(.13,.04,.09),.004),rQ(p).y+.012);
  return min(min(board,lip),body); }
vec2 openBook(vec3 p){ vec3 q=rQ(p); float x=abs(q.x);
  float lift=.024*sin(clamp(x/.14,0.,1.)*1.9)-.016*exp(-x*50.)+.008;
  float pages=sdBox(vec3(x-.072,q.y-lift*.5,q.z),vec3(.07,max(lift*.5,.003),.095))-.0015;
  float cover=sdRBox(vec3(x-.076,q.y+.001,q.z),vec3(.08,.004,.102),.002);
  return vec2(pages,cover); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,rest(p),3.);
  vec2 b=openBook(p); r=U(r,b.x,4.); r=U(r,b.y,5.);
  vec3 bw=p-vec3(.0,.009,-.1); bw.xz=rot(.25)*bw.xz; bw=vec3(bw.x,bw.z,-bw.y);
  bw.y*=.5; r=U(r,bowD(bw,.26)*.5,6.);
  r=U(r,conch(ry(p-vec3(.3,0.,-.06),.5),1.5),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 q=rQ(p); float x=abs(q.x); float a=.94; float l=fract((q.z+.2)/.011);
    if(abs(x-.072)<.05&&abs(q.z)<.08&&l<.26) a=.62; if(x<.006) a=.7; return a; }
  if(id==5.) return .3;
  if(id==6.) return .4;
  if(id==7.) return .9;
  return .7; }
