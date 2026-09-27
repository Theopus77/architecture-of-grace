/* Room e18 "Clauses, Parallel Structure and Usage" — pencil still life: a wooden toy train,
   an engine coupled to two wagons (clauses joined into one sentence), running on a straight
   piece of track whose two rails stay parallel. */
#define CAM_POS vec3(-0.3397,0.3666,-0.7738)
#define CAM_TGT vec3(-0.2095,-0.0526,0.0997)
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
vec3 tQ(vec3 p){ return place(p,vec3(0.,0.,.02),-.38); }   /* track along local x */
float trackD(vec3 q){
  float rails=min(sdRBox(q-vec3(0.,.016,-.03),vec3(.3,.004,.004),.0015),sdRBox(q-vec3(0.,.016,.03),vec3(.3,.004,.004),.0015));
  float cx=clamp(floor(q.x/.04+.5),-7.,7.)*.04;
  float tie=sdRBox(q-vec3(cx,.006,0.),vec3(.011,.006,.048),.002);
  return min(rails,tie); }
float wheels(vec3 q,float x0,float x1){ float d=1e5;
  for(int i=0;i<2;i++){ float x=i==0?x0:x1;
    d=min(d,sdCylZ(q-vec3(x,.036,-.03),.016,.005)-.0015); d=min(d,sdCylZ(q-vec3(x,.036,.03),.016,.005)-.0015); }
  return d; }
float engineD(vec3 q){ vec3 e=q-vec3(.12,0.,0.);
  float chassis=sdRBox(e-vec3(0.,.05,0.),vec3(.075,.01,.03),.003);
  float boiler=sdCylX(e-vec3(.02,.078,0.),.024,.05)-.002;
  float cab=sdRBox(e-vec3(-.05,.098,0.),vec3(.028,.04,.031),.004);
  cab=max(cab,-sdRBox(e-vec3(-.05,.108,-.03),vec3(.014,.014,.01),.003));
  float roof=sdRBox(e-vec3(-.05,.14,0.),vec3(.035,.005,.037),.003);
  float stack=sdCylY(e-vec3(.05,.115,0.),.01+.004*smoothstep(.1,.13,e.y),.02)-.001;
  float dome=length(e-vec3(.01,.1,0.))-.012;
  return min(min(min(chassis,boiler),min(cab,roof)),min(min(stack,dome),wheels(e,-.04,.035))); }
float wagonD(vec3 q,float x){ vec3 w=q-vec3(x,0.,0.);
  float ch=sdRBox(w-vec3(0.,.05,0.),vec3(.055,.01,.03),.003);
  float box=sdRBox(w-vec3(0.,.075,0.),vec3(.052,.02,.03),.003);
  box=max(box,-sdBox(w-vec3(0.,.085,0.),vec3(.046,.02,.024)));
  return min(min(ch,box),wheels(w,-.03,.03)); }
float cargoD(vec3 q){ float d=1e5;
  for(int i=0;i<3;i++){ vec3 c=q-vec3(-.035+.035*float(i)-.0,.0,0.); d=min(d,sdRBox(c-vec3(-.03+.0,.085,0.),vec3(.012),.003)); }
  return d; }
float couplersD(vec3 q){ return min(sdCapsule(q,vec3(.04,.05,0.),vec3(.06,.05,0.),.0035),sdCapsule(q,vec3(-.09,.05,0.),vec3(-.07,.05,0.),.0035)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=tQ(p);
  r=U(r,trackD(q),3.);
  r=U(r,engineD(q),4.);
  r=U(r,min(wagonD(q,-.01),wagonD(q,-.14)),5.);
  r=U(r,couplersD(q),6.);
  r=U(r,cargoD(q-vec3(-.13,0.,0.)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=tQ(p); if(q.y>.011) return .45; return .65+.08*grain(p,80.); }
  if(id==4.){ vec3 e=tQ(p)-vec3(.12,0.,0.); if(e.y<.058&&e.y>.04) return .35; if(abs(e.x-.0)<.003&&e.y>.06) return .35; if(e.y>.134) return .3; return .75; }
  if(id==5.){ vec3 q=tQ(p); if(q.y<.058) return .35; return .68+.06*grain(p,90.); }
  if(id==6.) return .3;
  if(id==7.) return .55;
  return .7; }
