/* Skateboarding Unit 9 "Ollies and Flip Tricks" — pencil still life: a skateboard turned upside down on
   a square of practice carpet (wheels up, trucks showing, ready to tune), a T-shaped skate tool and three
   loose wheel bearings. Objects only. */
#define CAM_POS vec3(-0.5975,0.4088,-0.8963)
#define CAM_TGT vec3(-0.2918,-0.0343,0.0589)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "sktparts_a.glsl"
// @bg 0,1,2,3
#define CT .012
vec3 carQ(vec3 p){ return sk_place(p,vec3(.0,0.,.0),-.2); }
float carD(vec3 p){ vec3 q=carQ(p); return sdRBox(q-vec3(0.,CT*.5,0.),vec3(.45,CT*.5,.2),.004)+.0006*vn(q.xz*400.); }
float carT(vec3 p){ vec3 q=carQ(p); vec2 a=abs(q.xz);
  if(a.x>.43||a.y>.18) return .4+.1*step(.5,fract((q.x+q.z)/.008));        /* bound edge */
  return .62+.16*(vn(q.xz*500.)-.5)+.1*(fbm(q.xz*30.)-.5); }
/* the board, upside down: mirror the board frame in y so the deck top rests on the carpet */
vec3 boardQ(vec3 p){ vec3 q=sk_place(p,vec3(.02,0.,.06),-.3); q.y=(.1363+CT)-q.y; return q; }
/* skate tool: a T of sockets with a hex key in the stem */
vec3 toolQ(vec3 p){ return sk_place(p,vec3(-.05,CT,-.13),.5)/1.6; }
float toolD(vec3 p){ vec3 q=toolQ(p);
  float stem=sdCapsule(q,vec3(-.06,.009,0.),vec3(.05,.009,0.),.0075);
  float bar=sdCapsule(q,vec3(.05,.009,-.045),vec3(.05,.009,.045),.0085);
  float s1=sdCylZ(q-vec3(.05,.009,-.05),.011,.012)-.001;
  float s2=sdCylZ(q-vec3(.05,.009,.05),.0105,.012)-.001;
  float s3=sdCylX(q-vec3(-.065,.009,0.),.0095,.012)-.001;
  float hole=min(sdCylZ(q-vec3(.05,.009,-.06),.006,.006),min(sdCylZ(q-vec3(.05,.009,.06),.0055,.006),sdCylX(q-vec3(-.076,.009,0.),.005,.006)));
  return max(min(min(stem,bar),min(min(s1,s2),s3)),-hole)*1.6; }
float toolT(vec3 p){ vec3 q=toolQ(p); if(abs(q.x-.05)<.012&&abs(q.z)>.038) return .5+.2*step(.5,fract(q.z*300.));
  if(q.x<-.053) return .5; return .3; }
/* three bearings lying flat */
float brD(vec3 b){ float o=max(abs(length(b.xz)-.0085)-.0026,abs(b.y-.0035)-.0035); return o-.0004; }
vec3 bQ(vec3 p,int i){ vec3 c=i==0?vec3(.12,CT,-.14):i==1?vec3(.165,CT,-.155):vec3(.145,CT,-.105); return (p-c)/1.5; }
float bearD(vec3 p){ return min(brD(bQ(p,0)),min(brD(bQ(p,1)),brD(bQ(p,2))))*1.5; }
float bearT(vec3 p){ vec3 b=bQ(p,0); if(brD(bQ(p,1))<brD(b)) b=bQ(p,1); if(brD(bQ(p,2))<brD(b)) b=bQ(p,2);
  float r=length(b.xz); if(b.y>.0062&&r>.0075&&r<.0098) return .3; if(b.y>.006&&abs(r-.0065)<.0008) return .4; return .72; }
vec2 map(vec3 p){ vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,carD(p),3.);
  vec3 b=boardQ(p);
  r=U(r,sk_deckD(b),4.);
  r=U(r,sk_trucksD(b),5.);
  r=U(r,sk_wheelsD(b),6.);
  r=U(r,toolD(p),7.);
  r=U(r,bearD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){ if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return carT(p);
  vec3 b=boardQ(p);
  if(id==4.) return sk_deckT(b);
  if(id==5.) return sk_trucksT(b);
  if(id==6.) return sk_wheelsT(b);
  if(id==7.) return toolT(p);
  if(id==8.) return bearT(p);
  return .7; }
