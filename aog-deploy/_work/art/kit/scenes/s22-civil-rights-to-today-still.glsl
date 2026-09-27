/* Room "US History: Civil Rights to Today" — pencil still life: an old-style ribbon microphone
   on a short desk stand (speeches and marches), a wooden ballot box with a slot and a ballot
   half-way in (the vote). */
#define CAM_POS vec3(-0.3699,0.2909,-0.6139)
#define CAM_TGT vec3(-0.1546,0.0293,0.0633)
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
#define MC vec3(-.04,0.,.0)
#define BB vec3(.13,0.,.06)
float micD(vec3 p){ vec3 q=p-MC;
  float base=sdCylY(q-vec3(0.,.008,0.),.045,.006)-.003;
  float pole=sdCylY(q-vec3(0.,.07,0.),.005,.065);
  vec3 h=q-vec3(0.,.17,0.);
  float head=sdRBox(h,vec3(.028,.038,.018),.016);
  float yoke=max(length(vec2(length(h.xy)-.042,h.z))-.004,h.y+.01);
  float d=min(min(base,pole),min(head,yoke));
  return d; }
vec3 bbQ(vec3 p){ return place(p,BB,-.3); }
float boxD(vec3 p){ vec3 q=bbQ(p);
  float body=sdRBox(q-vec3(0.,.055,0.),vec3(.065,.055,.05),.004);
  float lid=sdRBox(q-vec3(0.,.114,0.),vec3(.07,.006,.055),.003);
  float d=min(body,lid);
  d=max(d,-sdBox(q-vec3(0.,.12,0.),vec3(.03,.02,.003)));
  float hinge=sdCylX(q-vec3(0.,.108,.055),.004,.05);
  float lock=sdRBox(q-vec3(0.,.09,-.052),vec3(.008,.01,.003),.002);
  return min(min(d,hinge),lock); }
float ballotD(vec3 p){ vec3 q=bbQ(p); return sdBox(q-vec3(0.,.14,0.),vec3(.026,.03,.0008)); }
vec3 shQ(vec3 p,float s){ vec3 q=place(p,vec3(-.01+s*.05,0.,-.13+s*.02),.25+s*.15); return q; }
float shoe(vec3 q){
  float sole=sdRBox(q-vec3(0.,.005,0.),vec3(.06,.005,.024),.008);
  float body=sdEll(q-vec3(-.01,.02,0.),vec3(.05,.022,.023)); body=max(body,-q.y+.004);
  float toe=sdEll(q-vec3(.035,.012,0.),vec3(.03,.014,.022));
  float heel=sdRBox(q-vec3(-.05,.004,0.),vec3(.012,.005,.022),.004);
  float d=min(min(sole,smin(body,toe,.012)),heel);
  d=max(d,-sdEll(q-vec3(-.03,.042,0.),vec3(.025,.02,.015)));
  return d; }
float shoesD(vec3 p){ return min(shoe(shQ(p,0.)),shoe(shQ(p,1.))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,micD(p),3.);
  r=U(r,boxD(p),4.);
  r=U(r,ballotD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-MC; if(q.y>.13&&q.y<.21){ return abs(fract(q.y/.006)-.5)<.18?.35:.7; } return .45; }
  if(id==4.) return .5+.15*grain(bbQ(p),70.);
  if(id==5.){ vec3 q=bbQ(p); if(abs(q.x-.01)<.008&&abs(q.y-.155)<.008&&abs(abs(q.x-.01)-abs(q.y-.155))<.0015) return .25; return .95; }
  if(id==6.){ vec3 q=shQ(p,0.); vec3 q2=shQ(p,1.); vec3 u=length(q)<length(q2)?q:q2; if(u.y<.009) return .3; return .45; }
  return .7; }
