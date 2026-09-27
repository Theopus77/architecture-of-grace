/* Spanish Unit 17 "Pronouns, Reflexives and Commands" — pencil still life of a morning routine
   (me lavo, me peino): a cup holding a toothbrush, a comb, and a bar of soap on a folded washcloth. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.05,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define CU vec3(.04,0.,.06)
float cup(vec3 p){ vec3 q=p-CU; float r=.04+q.y*.05; float o=max(abs(length(q.xz)-r)-.003,abs(q.y-.055)-.055); return min(o,sdCylY(q-vec3(0.,.004,0.),r,.004)); }
vec3 tbq(vec3 p){ vec3 q=p-CU-vec3(.0,.01,.0); vec3 a=normalize(vec3(-.35,1.,-.1)); vec3 x=a, z=normalize(cross(x,vec3(0.,0.,1.))), y=cross(z,x); return vec3(dot(q,x),dot(q,y),dot(q,z)); }
float brush(vec3 p){ vec3 q=tbq(p);
  float hdl=sdRBox(q-vec3(.1,0.,0.),vec3(.1,.006,.004),.004);
  float head=sdRBox(q-vec3(.21,.0,0.),vec3(.016,.004,.005),.003);
  float bristle=sdRBox(q-vec3(.21,.012,0.),vec3(.015,.008,.0045),.001);
  return min(min(hdl,head),bristle); }
float comb(vec3 p){ vec3 q=p-vec3(-.14,.004,-.06); q.xz=rot(.25)*q.xz;
  float spine=sdRBox(q-vec3(0.,0.,.012),vec3(.08,.004,.008),.003);
  float teeth=max(sdBox(q-vec3(0.,0.,-.01),vec3(.075,.0025,.016)),abs(fract(q.x/.007)-.5)*.007-.0015);
  return min(spine,teeth); }
vec3 clq(vec3 p){ vec3 q=p-vec3(.2,0.,-.03); q.xz=rot(-.3)*q.xz; return q; }
float cloth(vec3 p){ vec3 q=clq(p); return min(sdRBox(q-vec3(0.,.006,0.),vec3(.07,.006,.055),.005),sdRBox(q-vec3(.005,.017,0.),vec3(.065,.005,.052),.005)); }
float soap(vec3 p){ vec3 q=clq(p)-vec3(-.005,.037,0.); q.xz=rot(.3)*q.xz; return sdRBox(q,vec3(.045,.015,.028),.013); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cup(p),3.);
  r=U(r,brush(p),4.);
  r=U(r,comb(p),5.);
  r=U(r,cloth(p),6.);
  r=U(r,soap(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-CU; return abs(q.y-.08)<.004?.3:.8; }
  if(id==4.){ vec3 q=tbq(p); if(q.y>.005&&q.x>.19) return fract(q.x/.004)<.4?.5:.92; return q.x>.12&&q.x<.18?.3:.5; }
  if(id==5.) return .35;
  if(id==6.){ vec3 q=clq(p); return fract(q.x/.01)<.3?.6:.78; }
  if(id==7.) return .88;
  return .7; }
