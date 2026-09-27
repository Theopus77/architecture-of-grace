/* sp17 "A Whole Thought in Spanish" — two big wooden jigsaw pieces fitted together (el sujeto
   and el verbo make one whole thought), a third piece standing on edge behind, and a pencil. */
#define CAM_POS vec3(-0.5883,0.3771,-0.5633)
#define CAM_TGT vec3(-0.2029,-0.0328,0.1094)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#include "roomparts_e.glsl"
#define S .06
#define TH .009
vec3 gQ(vec3 p){ return plc(p,vec3(0.,0.,0.),-.35); }
float pieceA(vec3 p){ vec3 q=gQ(p)+vec3(S,0.,0.); return extrude(jig2(q.xz,S,vec4(1.,-1.,1.,-1.)),q.y-TH,TH)-.0015; }
float pieceB(vec3 p){ vec3 q=gQ(p)-vec3(S+.0025,0.,0.); return extrude(jig2(q.xz,S,vec4(1.,-1.,-1.,1.)),q.y-TH,TH)-.0015; }
vec3 cQ(vec3 p){ vec3 q=plc(p,vec3(.03,0.,.13),-.25); q.yz=rot(-.22)*q.yz; return q; }
float pieceC(vec3 p){ vec3 q=cQ(p); q.y-=S+.016; return extrude(jig2(q.xy,S,vec4(1.,1.,-1.,1.)),q.z,TH)-.0015; }
vec3 pQ(vec3 p){ vec3 q=plc(p,vec3(-.1,.0066,-.13),.12); return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pieceA(p),3.);
  r=U(r,pieceB(p),4.);
  r=U(r,pieceC(p),5.);
  r=U(r,pencilX(pQ(p),.0066,.2),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ if(n.y>.7){ vec3 q=gQ(p)+vec3(S,0.,0.); float g=grain(vec3(q.x,q.y,q.z*1.),30.); return .62+.1*g; } return .45; }
  if(id==4.){ if(n.y>.7){ vec3 q=gQ(p)-vec3(S,0.,0.); float g=grain(vec3(q.z,q.y,q.x),30.); return .82+.08*g; } return .6; }
  if(id==5.) return .7;
  if(id==6.) return pencilTone(pQ(p),.2);
  return .7; }
