/* Crosswalk: Danielson Framework for Teaching — a clipboard propped on a book, holding a rubric sheet ruled in four columns, with a pencil in front. */
#define CAM_POS vec3(-0.5785,0.4788,-0.7362)
#define CAM_TGT vec3(-0.2751,0.0632,0.1404)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define CB vec3(-.01,0.,.1)
vec3 cq(vec3 p){ vec3 q=p-CB; q.xz=rot(.18)*q.xz; q.yz=rot(-1.0)*q.yz; return q; }
float board(vec3 q){ return sdRBox(q-vec3(0.,.004,.15),vec3(.11,.004,.15),.004); }
float paper(vec3 q){ return sdRBox(q-vec3(0.,.0095,.135),vec3(.1,.0008,.125),.0005); }
float clip(vec3 q){ float b=sdRBox(q-vec3(0.,.013,.265),vec3(.04,.005,.018),.004);
  float ring=sdTorus((q-vec3(0.,.012,.29)).xzy,.014,.003); return min(b,ring); }
float paperT(vec3 q){ vec2 u=vec2(q.x,q.z-.135);
  if(abs(u.x)>.088||u.y>.1||u.y<-.11) return .96;
  float cx=fract((u.x+.088)/.044); bool vl=(cx<.03||cx>.97);
  float ry=(u.y+.11)/.042; bool hl=fract(ry)<.035;
  if(vl||hl||abs(u.x)>.0865||u.y>.098) return .3;
  if(u.y>.058) return .72;
  if(fract(ry)>.3&&fract(ry)<.4&&cx>.12&&cx<.12+.7*h1(vec2(floor(ry),floor((u.x+.088)/.044)))) return .62;
  return .96; }
#define BK vec3(-.02,0.,.25)
#define PN vec3(.12,0.,-.04)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec3 q=cq(p);
  r=U(r,board(q),3.); r=U(r,paper(q),4.); r=U(r,clip(q),5.);
  vec2 b=xwBookD(P(p,BK,.1),vec3(.14,.03,.1)); r=U(r,b.x,6.); r=U(r,b.y,7.);
  r=U(r,xwPencilD(P(p,PN,-.35),.07),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  vec3 q=cq(p);
  if(id==3.) return .5+.1*grain(q,30.); if(id==4.) return paperT(q); if(id==5.) return .35;
  if(id==6.) return .4; if(id==7.) return xwPagesT(P(p,BK,.1));
  if(id==8.) return xwPencilT(P(p,PN,-.35),.07);
  return .7; }
