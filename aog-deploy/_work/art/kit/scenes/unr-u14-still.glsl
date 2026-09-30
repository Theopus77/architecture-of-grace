/* The Unseen Realm Unit 14 "Angels Up Close" — pencil still life: a small square incense altar
   with a horn at each corner and a shallow bowl on top (worship in the temple, Isaiah 6 and
   Revelation 8), and a long straight silver trumpet with a flared bell lying in front (the trumpet of
   1 Thessalonians 4:16). */
#define CAM_POS vec3(-0.5220,0.3208,-0.9270)
#define CAM_TGT vec3(-0.3256,0.0152,0.0991)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define ALT vec3(.04,0.,.1)
#define TRP vec3(-.08,0.,-.06)
#define TNG vec3(.21,0.,.1)
/* the altar: plinth, body, cornice, four horns, and a bowl on top */
vec3 altQ(vec3 p){ vec3 q=p-ALT; q.xz=rot(.35)*q.xz; return q; }
float altarD(vec3 p){ vec3 q=altQ(p);
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.075,.012,.075),.003);
  float body=sdRBox(q-vec3(0.,.11,0.),vec3(.06,.09,.06),.003);
  float corn=sdRBox(q-vec3(0.,.207,0.),vec3(.072,.008,.072),.003);
  float band=sdRBox(q-vec3(0.,.19,0.),vec3(.064,.004,.064),.002);
  float d=min(min(base,body),min(corn,band));
  float sk=sdRBox(q-vec3(0.,.03,0.),vec3(.066,.006,.066),.002); d=min(d,sk);
  vec3 h=q; h.xz=abs(h.xz)-.058;
  float horn=sdCone(h-vec3(0.,.232,0.),.012,.004,.018)-.002;
  horn=smin(horn,length(h-vec3(0.,.252,0.))-.0055,.004);
  d=min(d,horn);
  vec2 pn=abs(q.xz); float panel=max(max(pn.x,pn.y)-.061,max(abs(q.y-.11)-.06,-(max(pn.x,pn.y)-.05)));
  return d; }
float bowlD(vec3 p){ vec3 q=altQ(p)-vec3(0.,.215,0.);
  float o=sdEll(q-vec3(0.,.018,0.),vec3(.045,.02,.045)); o=max(o,q.y-.02);
  o=max(o,-sdEll(q-vec3(0.,.021,0.),vec3(.04,.017,.04)));
  o=min(o,sdTorus(q-vec3(0.,.02,0.),.043,.0025));
  o=min(o,sdCylY(q-vec3(0.,.002,0.),.018,.003));
  return o; }
/* the trumpet: a straight tube along x, two bands, a mouthpiece and a flared bell */
vec3 trpQ(vec3 p){ vec3 q=p-TRP; q.xz=rot(-.55)*q.xz; q.xy-=vec2(.18,.0465); q.xy=rot(.0985)*q.xy; q.x+=.18; return q; }   /* bell and mouthpiece both rest on the table */
float trumpetD(vec3 p){ vec3 q=trpQ(p);
  float x=q.x; float t=clamp((x-.1)/.08,0.,1.);
  float r=.0065+.0012*smoothstep(-.18,.1,x)+.038*pow(t,3.2);
  float tube=(length(q.yz)-r)*.6; tube=max(tube,max(-.2-x,x-.18));
  float inner=max(length(q.yz)-r+.0025,.12-x); tube=max(tube,-inner);
  float mp=sdCylX(q-vec3(-.205,0.,0.),.0055,.008)-.001;
  mp=min(mp,sdTorus((q-vec3(-.213,0.,0.)).yxz,.009,.0025));
  vec3 b=q; b.x=abs(b.x+.05)-.09; float bands=sdTorus(b.yxz,.0078,.0022);
  float lip=sdTorus((q-vec3(.18,0.,0.)).yxz,.0445,.0025);
  return min(min(tube,mp),min(bands,lip)); }
/* the tongs: two long arms joined in a loop, tips pinching a coal; lying on the table */
vec3 tngQ(vec3 p){ vec3 q=p-TNG; q.xz=rot(1.2)*q.xz; return q; }
float tongsD(vec3 p){ vec3 q=tngQ(p)-vec3(0.,.005,0.);
  float d=1e3;
  for(int i=0;i<2;i++){ float sg=i==0?1.:-1.;
    d=min(d,sdCapsule(q,vec3(-.1,0.,sg*.002),vec3(.06,0.,sg*.016),.0035));
    d=min(d,sdCapsule(q,vec3(.06,0.,sg*.016),vec3(.085,.003,sg*.011),.0035)); }
  d=min(d,sdTorus((q-vec3(-.108,0.,0.)),.01,.0032));
  return d; }
float coalD(vec3 p){ vec3 q=tngQ(p)-vec3(.087,.013,0.);
  return sdEll(q,vec3(.016,.012,.013))+.0012*vn3(q*260.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,altarD(p),3.);
  r=U(r,bowlD(p),4.);
  r=U(r,trumpetD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=altQ(p); vec2 pn=abs(q.xz); float a=.62+.06*fbm(q.xy*30.);
    float fc=abs(n.x)>abs(n.z)?pn.y:pn.x;                              /* sunk panel border on each face */
    if(abs(q.y-.11)<.055&&abs(fc-.045)<.0025) a=.35;
    if(abs(q.y-.11)<.057&&abs(abs(q.y-.11)-.054)<.0025&&fc<.047) a=.35;
    return a; }
  if(id==4.) return .5;
  if(id==5.){ vec3 q=trpQ(p); if(q.x>.17&&length(q.yz)<.041) return .3; if(abs(q.x-.18)<.004) return .4; return .7; }
  if(id==6.) return .38;
  if(id==7.) return .5+.12*vn(p.xz*300.);
  return .7; }
