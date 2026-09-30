/* The Unseen Realm Unit 8 "Enoch and the Watchers" - a traveller's find: three old hand-copied books
   stacked and tied with a strap (the Ethiopian copies of 1 Enoch brought to Europe in 1773), and a
   travel lantern with its candle. Objects only. */
#define CAM_POS vec3(-0.5407,0.3785,-0.8714)
#define CAM_TGT vec3(-0.1756,0.0136,0.1324)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.68,.85,-.32)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "unrparts_a.glsl"
vec3 SB(vec3 p,int i){ vec3 q=p-vec3(-.02,0.,-.02); float fi=float(i); float y=0.; if(i>0) y+=.07; if(i>1) y+=.062;
  q.y-=y; q.xz=rot(-.35+.12*sin(fi*2.5))*q.xz; q.x+=.012*sin(fi*2.); return q; }
vec3 BS(int i){ return i==0?vec3(.13,.035,.095):(i==1?vec3(.12,.031,.088):vec3(.108,.028,.08)); }
float stackD(vec3 p){ float d=1e5; for(int i=0;i<3;i++) d=min(d,o_codex(SB(p,i),BS(i))); return d; }
float stackT(vec3 p){ float d=1e5,t=.4; for(int i=0;i<3;i++){ float e=o_codex(SB(p,i),BS(i)); if(e<d){ d=e; t=t_codex(SB(p,i),BS(i),i==1?.45:.32); } } return t; }
/* a leather strap round the whole stack, across the middle */
float strapD(vec3 p){ vec3 q=SB(p,1); q.y+=.07;
  float outer=sdBox2(vec2(q.z,q.y-.094),vec2(.093,.096))-.002;
  float inner=sdBox2(vec2(q.z,q.y-.094),vec2(.089,.0925));
  return max(max(outer,-inner),abs(q.x+.01)-.013); }
vec3 Q6(vec3 p){ vec3 q=p-vec3(.28,0.,.02); q.xz=rot(.3)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,stackD(p),3.);
  r=U(r,strapD(p),4.);
  r=U(r,o_lantern(Q6(p),.055,.2),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72; if(id==2.) return .9;
  if(id==3.) return stackT(p);
  if(id==4.) return .3;
  if(id==5.) return t_lantern(Q6(p),.055,.2);
  return .7; }
