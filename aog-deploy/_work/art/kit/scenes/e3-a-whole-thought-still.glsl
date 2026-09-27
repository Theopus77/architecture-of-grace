/* Room e3 "A Sentence Is a Whole Thought" — pencil still life: two big wooden jigsaw pieces,
   one dark and one light, fitted together (who or what, and what they do: two parts make it
   whole), a third piece waiting beside them, and a spiral notebook with a pencil. */
#define CAM_POS vec3(-0.2795,0.4796,-0.5460)
#define CAM_TGT vec3(-0.1352,-0.0467,0.0312)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define PS .045
#define KR .015
/* a jigsaw piece in 2D: knob on +x when kx>0, socket on -x when sx>0, knob on +y when ky>0, socket on -y when sy>0 */
float piece2(vec2 u,float kx,float sx,float ky,float sy){
  float d=sdBox2(u,vec2(PS));
  if(kx>0.) d=min(d,length(u-vec2(PS+KR*.75,0.))-KR);
  if(sx>0.) d=max(d,-(length(u-vec2(-PS+KR*.75,0.))-KR-.001));
  if(ky>0.) d=min(d,length(u-vec2(0.,PS+KR*.75))-KR);
  if(sy>0.) d=max(d,-(length(u-vec2(0.,-PS+KR*.75))-KR-.001));
  return d; }
#define PC vec3(.02,0.,-.03)
#define PR -.2
vec3 pQ(vec3 p){ return place(p,PC,PR); }
float pieceA(vec3 q){ return extrude(piece2(vec2(q.x,-q.z),1.,0.,1.,1.),q.y-.009,.009,.003); }
float pieceB(vec3 q){ vec3 b=q-vec3(2.*PS,0.,0.); return extrude(piece2(vec2(b.x,-b.z),0.,1.,1.,0.),b.y-.009,.009,.003); }
vec3 cQ(vec3 p){ vec3 q=p-vec3(.2,.024,-.13); q.xz=rot(.5)*q.xz; q.yz=rot(.25)*q.yz; return q; }
float pieceC(vec3 q){ return extrude(piece2(q.xz,1.,1.,0.,0.),q.y,.009,.003); }
vec3 nbQ(vec3 p){ return place(p,vec3(-.02,0.,.14),-.12); }
float notebookD(vec3 q){ float c=sdRBox(q-vec3(0.,.007,0.),vec3(.14,.007,.1),.003);
  float cz=clamp(floor(q.z/.016+.5),-5.,5.)*.016;
  float ring=sdTorus((q-vec3(-.14,.012,cz)).xzy*vec3(1.,1.,1.),.009,.0018);
  ring=max(ring,-(q.y-.004));
  return min(c,ring); }
vec3 penQ(vec3 p){ vec3 q=p-vec3(.04,.0204,.12); q.xz=rot(.3)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=pQ(p);
  r=U(r,pieceA(q),3.);
  r=U(r,pieceB(q),4.);
  r=U(r,pieceC(cQ(p)),5.);
  r=U(r,notebookD(nbQ(p)),6.);
  r=U(r,pencilD2(penQ(p),.07),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4+.06*grain(p,80.);
  if(id==4.) return .82+.05*grain(p,80.);
  if(id==5.) return .62+.05*grain(p,80.);
  if(id==6.){ vec3 q=nbQ(p); if(q.y<.012) return .5;
    if(q.x>-.12&&q.x<.13&&abs(fract((q.z+.1)/.018)-.5)<.07&&abs(q.z)<.085) return .62;
    if(abs(q.x+.1)<.001) return .6; return .95; }
  if(id==7.) return pencilTone(penQ(p),.07);
  return .7; }
