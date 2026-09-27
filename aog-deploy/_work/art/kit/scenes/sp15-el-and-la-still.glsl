/* Room "El and La" — pencil still life: everyday things a learner names first, el and la:
   a little wooden chair (la silla), a book lying on its seat (el libro), a ball (la pelota) and
   a straw hat (el sombrero) resting on the table. */
#define CAM_POS vec3(-0.4997,0.3219,-0.7773)
#define CAM_TGT vec3(-0.2292,-0.0067,0.0731)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define CR vec3(-.05,0.,.07)
#define SH .085
vec3 crQ(vec3 p){ return place(p,CR,.45); }
float chairD(vec3 p){ vec3 q=crQ(p);
  float seat=sdRBox(q-vec3(0.,SH,0.),vec3(.055,.006,.05),.003);
  vec3 l=vec3(abs(q.x)-.045,q.y-SH*.5,abs(q.z)-.04); float legs=sdRBox(l,vec3(.0055,SH*.5,.0055),.002);
  float rung=sdRBox(vec3(abs(q.x)-.045,q.y-.03,q.z),vec3(.003,.003,.04),.001);
  vec3 b=vec3(abs(q.x)-.045,q.y-SH-.055,q.z-.044); float posts=sdRBox(b,vec3(.0055,.055,.0055),.002);
  float slats=min(sdRBox(q-vec3(0.,SH+.1,.044),vec3(.05,.012,.004),.002),sdRBox(q-vec3(0.,SH+.06,.044),vec3(.045,.007,.003),.002));
  return min(min(min(seat,legs),rung),min(posts,slats)); }
float bookOn(vec3 p){ vec3 q=crQ(p)-vec3(-.005,SH+.006,-.005); q.xz=rot(.3)*q.xz; return bookD(q,vec3(.035,.009,.028)); }
float ballD(vec3 p){ return length(p-vec3(.1,.04,-.04))-.04; }
vec3 htQ(vec3 p){ return place(p,vec3(.02,0.,-.13),.2); }
float hatD(vec3 p){ vec3 q=htQ(p);
  float brim=sdCylY(q-vec3(0.,.003,0.),.07,.0015)-.0015; brim+=.0015*smoothstep(.04,.06,length(q.xz))*0.;
  float crown=sdRBox(q-vec3(0.,.018,0.),vec3(.03,.016,.03),.02); crown=sdCylY(q-vec3(0.,.024,0.),.034,.022)-.006;
  crown=max(crown,-(length(q-vec3(0.,.04,0.))-.012)*0.-1.);
  float band=sdCylY(q-vec3(0.,.01,0.),.0405,.005);
  return min(min(brim,crown),band); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,chairD(p),3.);
  r=U(r,bookOn(p),4.);
  r=U(r,ballD(p),5.);
  r=U(r,hatD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5+.15*grain(crQ(p),70.);
  if(id==4.){ if(abs(n.y)<.5&&abs(n.x)<.7) return fract(p.y/.003)<.3?.7:.9; return .38; }
  if(id==5.){ vec3 q=p-vec3(.1,.04,-.04); float a=atan(q.z,q.x); return (abs(q.y)<.006||abs(sin(a*1.5))<.12)?.35:.8; }
  if(id==6.){ vec3 q=htQ(p); if(abs(q.y-.01)<.005&&length(q.xz)<.043) return .3; float r=length(q.xz); return fract(r/.006+atan(q.z,q.x)*.3)<.3?.6:.85; }
  return .7; }
