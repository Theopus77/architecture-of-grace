/* Spanish Unit 3 "El and La: Naming Things" — pencil still life: an apple, a cup and a stack of
   two books, each with a small folded name card standing in front of it (hint-lines only). */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.03,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define AP vec3(-.17,0.,.02)
#define MG vec3(.18,0.,.05)
#define T1 vec3(-.17,0.,-.1)
#define T2 vec3(.0,0.,-.1)
#define T3 vec3(.17,0.,-.08)
vec2 books(vec3 p){ vec2 a=flatBook(p,vec3(0.,.022,.04),vec3(.1,.022,.075),.08); vec2 b=flatBook(p,vec3(-.005,.061,.035),vec3(.09,.017,.065),-.1);
  return a.x<b.x?a:b; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 a=appleD(p,AP,.058,.4); r=U(r,a.x,a.y>.5?4.:3.);
  vec2 b=books(p); r=U(r,b.x,b.y>.5?6.:5.);
  r=U(r,mugD(p,MG,.045,.1,-2.4),7.);
  r=U(r,tentD(p,T1,.045,.04,.12),8.);
  r=U(r,tentD(p,T2,.045,.04,-.02),8.);
  r=U(r,tentD(p,T3,.045,.04,-.15),8.);
  return r; }
float tentInk(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; if(q.z>0.) return .92;
  if(abs(q.x)<.03&&abs(q.y-.022)<.0035) return .25; if(abs(q.x+.008)<.02&&abs(q.y-.011)<.0022) return .6; return .92; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-AP; return .42+.12*smoothstep(.02,.07,q.y)*fbm(q.xy*vec2(30.,4.)); }   /* streaked skin */
  if(id==4.) return .3;
  if(id==5.) return p.y>.045?.4:.55;
  if(id==6.) return .9;
  if(id==7.){ vec3 q=p-MG; return abs(q.y-.07)<.004||abs(q.y-.08)<.002?.3:.72; }
  if(id==8.){ float t=.92; if(p.x<-.1) t=tentInk(p,T1,.12); else if(p.x<.09) t=tentInk(p,T2,-.02); else t=tentInk(p,T3,-.15); return t; }
  return .7; }
