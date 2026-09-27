/* Spanish Unit 5 "A Whole Thought in Spanish" — pencil still life: a wooden letter rack holding
   a sentence made of tiles, opening with a carved ¿ block and closing with a carved ? block,
   with a pencil lying in front. */
#define CAM_POS vec3(-0.3651,0.2191,-0.6120)
#define CAM_TGT vec3(-0.1735,-0.0338,0.1006)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define RY -.12
vec3 rq(vec3 p){ vec3 q=p-vec3(0.,0.,.02); q.xz=rot(RY)*q.xz; return q; }
float rack(vec3 q){ float base=sdRBox(q-vec3(0.,.01,0.),vec3(.25,.01,.045),.004);
  float back=sdRBox(q-vec3(0.,.035,.035),vec3(.25,.035,.01),.004);
  float lip=sdRBox(q-vec3(0.,.026,-.038),vec3(.25,.006,.007),.003); return min(min(base,back),lip); }
/* tiles lean back a little against the back rail */
vec3 tq(vec3 q,float x,float w){ vec3 t=q-vec3(x,.075,.005); t.yz=rot(.2)*t.yz; return t; }
float tile(vec3 q,float x,float w){ vec3 t=tq(q,x,w); return sdRBox(t,vec3(w,.055,.012),.006); }
float qblock(vec3 q,float x,int g){ vec3 t=tq(q,x,.045); float d=sdRBox(t,vec3(.045,.055,.014),.006);
  return carveX(d,t.xy,g,.085,.007,t.z+.014,.005); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=rq(p);
  r=U(r,rack(q),3.);
  r=U(r,qblock(q,-.2,191),4.);
  r=U(r,tile(q,-.085,.06),5.);
  r=U(r,tile(q,.05,.065),6.);
  r=U(r,qblock(q,.17,63),7.);
  vec3 pc=p-vec3(-.1,.0066,-.11); pc.xz=rot(-.12)*pc.xz; pc.yz=rot(.26)*pc.yz; r=U(r,pencilX(pc,.0066,.2),8.);
  return r; }
float tileInk(vec3 q,float x,float w){ vec3 t=tq(q,x,w); if(t.z>-.01) return .76;
  if(abs(t.y-.015)<.004&&abs(t.x)<w*.72) return .25; if(abs(t.y+.012)<.003&&abs(t.x+w*.15)<w*.55) return .45; return .78; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  vec3 q=rq(p);
  if(id==3.) return .45+.1*grain(q*vec3(1.,1.,1.),30.);
  if(id==4.||id==7.){ vec3 t=tq(q,id==4.?-.2:.17,.045); int g=id==4.?191:63; if(t.z<-.009&&glyphX(t.xy/.085,g)*.085<.0085) return .15; return .78; }
  if(id==5.) return tileInk(q,-.085,.06);
  if(id==6.) return tileInk(q,.05,.065);
  if(id==8.){ vec3 pc=p-vec3(-.1,.0066,-.11); pc.xz=rot(-.12)*pc.xz; return pencilTone(pc,.2); }
  return .7; }
