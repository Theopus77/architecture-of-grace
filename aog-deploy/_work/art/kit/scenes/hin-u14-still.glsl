/* Hindu Texts Unit 14 "Hymns and Hard Cases" — pencil still life: a cross-shaped cloth game
   board with a grid of squares, three long four-sided dice with dot pips, and a few cowrie
   shells used as counters, with a round brass water pot behind. Objects only. */
#define CAM_POS vec3(-0.2494,0.2268,-0.6841)
#define CAM_TGT vec3(-0.1609,-0.0168,0.0538)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define BC vec3(.07,0.,.08)
float board(vec3 p){ vec3 q=p-BC; q.xz=rot(.2)*q.xz;
  float arm=min(sdB2(q.xz,vec2(.24,.05)),sdB2(q.xz,vec2(.05,.24)));
  return max(arm-.004,abs(q.y-.003)-.003)-.001+.0006*sin(q.x*80.)*sin(q.z*70.); }
float die(vec3 q){ float d=sdRBox(q,vec3(.055,.009,.009),.0025);
  vec2 f=vec2(fract(q.x/.018+.5)-.5,0.); float pip=length(vec3((fract(q.x/.018+.5)-.5)*.018,q.y-.009,q.z))-.0028;
  if(abs(q.x)<.045) d=max(d,-pip);
  return d; }
float dice(vec3 p){ vec3 q=p-BC; float d=1e5;
  d=min(d,die(ry(q-vec3(-.02,.015,-.08),.35)));
  d=min(d,die(ry(q-vec3(.07,.015,-.12),-.2)));
  vec3 t=ry(q-vec3(.0,.034,-.1),1.2); d=min(d,die(t));
  return d; }
float cowrie(vec3 q){ float d=sdEll(q-vec3(0.,.008,0.),vec3(.016,.01,.011)); d=max(d,-sdB2(vec2(q.y,q.z*.5),vec2(.002,.002))+0.); return d; }
float cowries(vec3 p){ vec3 q=p-BC; float d=1e5;
  d=min(d,cowrie(ry(q-vec3(.15,.006,.05),.4)));
  d=min(d,cowrie(ry(q-vec3(.18,.006,.09),1.3)));
  d=min(d,cowrie(ry(q-vec3(.2,.006,.03),2.2)));
  d=min(d,cowrie(ry(q-vec3(-.13,.006,.13),.8)));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.42-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,dice(p),4.);
  r=U(r,cowries(p),5.);
  r=U(r,potD(ry(p-vec3(.3,0.,.2),.4),1.05),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; q.xz=rot(.2)*q.xz; vec2 g=abs(fract(q.xz/.0333+.5)-.5); if(min(g.x,g.y)<.05) return .35;
    vec2 c=abs(q.xz); if(max(c.x,c.y)<.05) return .5; return .78; }
  if(id==4.) return .82;
  if(id==5.) return .9;
  if(id==6.){ vec3 q=(p-vec3(.3,0.,.2))/1.05; if(abs(q.y-.055)<.002||abs(q.y-.07)<.002) return .3; return .55; }
  return .7; }
