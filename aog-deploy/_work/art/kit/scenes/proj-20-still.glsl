/* FACS project 20 "Classic meat lasagna" — pencil still life: a baking dish of lasagna with a
   golden, bubbled cheese top and one square already lifted out, that slice standing on a plate
   in front so its neat layers of noodle, sauce and cheese show, and a spatula beside it. */
#define CAM_POS vec3(-0.3875,0.3874,-0.7933)
#define CAM_TGT vec3(-0.1487,-0.0337,0.0958)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define DC vec3(.02,0.,.08)
#define DR .12
vec3 dL(vec3 p){ vec3 q=p-DC; q.xz=rot(DR)*q.xz; return q; }
float dish(vec3 p){ vec3 q=dL(p);
  float d=sdRBox(q-vec3(0.,.03,0.),vec3(.17,.03,.12),.015);
  d=max(d,-sdRBox(q-vec3(0.,.04,0.),vec3(.158,.032,.108),.012));
  float lip=sdRBox(q-vec3(0.,.058,0.),vec3(.18,.004,.13),.004); lip=max(lip,-sdRBox(q-vec3(0.,.058,0.),vec3(.158,.01,.108),.012));
  float ears=sdRBox(vec3(abs(q.x)-.185,q.y-.058,q.z),vec3(.012,.004,.05),.004);
  return min(min(d,lip),ears); }
/* the lasagna in the dish, with the front-right square missing */
float slab(vec3 q){ return sdRBox(q-vec3(0.,.03,0.),vec3(.155,.024,.105),.004); }
float lasagna(vec3 p){ vec3 q=dL(p);
  float d=slab(q);
  d-=.003*smoothstep(.45,.8,vn3(q*160.))*step(.05,q.y);
  vec3 g=q-vec3(.1,.03,-.06); d=max(d,-sdBox(g,vec3(.05,.05,.046)));
  return d*.85; }
#define PL vec3(-.13,0.,-.1)
float plate(vec3 p){ vec3 q=p-PL; float r=length(q.xz);
  float f=.004+.008*smoothstep(.06,.1,r);
  return min(max(abs(q.y-f)-.0025,r-.1)*.8,sdTorus(q-vec3(0.,.003,0.),.05,.0025)); }
vec3 sl(vec3 p){ vec3 q=p-PL-vec3(0.,.009,0.); q.xz=rot(.5)*q.xz; return q; }
float slice(vec3 p){ vec3 q=sl(p);
  float d=sdRBox(q-vec3(0.,.025,0.),vec3(.045,.025,.042),.003);
  d-=.003*smoothstep(.45,.8,vn3(q*160.))*step(.045,q.y);
  d+=.0015*smoothstep(.0,.004,-abs(fract(q.y/.0125)-.5)+.12);
  return d*.85; }
float spat(vec3 p){ vec3 q=p-vec3(.21,.004,-.12); q.xz=rot(-.4)*q.xz;
  float blade=sdRBox(q-vec3(-.05,0.,0.),vec3(.04,.002,.03),.004);
  float hdl=sdCapsule(q,vec3(-.01,.002,0.),vec3(.12,.012,0.),.007);
  return min(blade,hdl); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,dish(p),3.);
  r=U(r,lasagna(p),4.);
  r=U(r,plate(p),5.);
  r=U(r,slice(p),6.);
  r=U(r,spat(p),7.);
  return r; }
float layers(float y){ float k=fract(y/.0125); return k<.25?.85:k<.5?.3:k<.75?.95:.35; }   /* noodle, sauce, cheese, sauce */
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .82;
  if(id==4.){ vec3 q=dL(p); if(n.y>.6) return .8-.3*step(.72,vn3(q*260.)); return layers(q.y); }
  if(id==5.){ vec3 q=p-PL; return abs(length(q.xz)-.07)<.0015?.5:.92; }
  if(id==6.){ vec3 q=sl(p); if(n.y>.6) return .8-.3*step(.72,vn3(q*260.)); return layers(q.y); }
  if(id==7.) return .45;
  return .7; }
