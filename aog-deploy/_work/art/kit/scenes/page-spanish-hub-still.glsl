/* Spanish hub page — pencil still life: a small guitar lying on the table with its neck resting
   on a thick closed dictionary (cover hint-lines and thumb-index notches, no words), and a cup
   on a saucer. */
#define CAM_POS vec3(-0.4805,0.4162,-0.7051)
#define CAM_TGT vec3(-0.1712,-0.0788,0.0681)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define GT vec3(-.08,0.,-.06)
#define GTR .5
#define DK vec3(.2,.0,.09)
#define DKR .35
#define DH vec3(.085,.031,.115)
#define CUP vec3(.21,0.,-.13)
/* guitar frame: top face up (y), body toward -x, head toward +x; tipped so the neck rests on the book */
vec3 gq(vec3 p){ vec3 q=P(p,GT,GTR); q.y-=.0165; q.xy=rot(.09)*q.xy; return q; }
float gOutline(vec2 u){   /* figure-eight body outline, u=(x,z) */
  float lo=length(u-vec2(-.105,0.))-.078, up=length(u-vec2(.0,0.))-.06;
  float w=smin(lo,up,.05);
  return w; }
float extrudeG(float d2,float z,float h){ vec2 w=vec2(d2,abs(z)-h); return min(max(w.x,w.y),0.)+length(max(w,0.))-.002; }
float guitarD(vec3 q){
  float o=gOutline(q.xz);
  float body=extrudeG(o,q.y-.022,.022);
  float neck=sdRBox(q-vec3(.15,.03,0.),vec3(.1,.009,.0115),.004);
  float heel=sdRBox(q-vec3(.058,.025,0.),vec3(.012,.018,.011),.004);
  float head=sdRBox(q-vec3(.285,.028,0.),vec3(.04,.006,.019),.003);
  float pegs=1e3; for(int i=0;i<3;i++){ float x=.262+float(i)*.018;
    pegs=min(pegs,sdCylZ(vec3(q.x-x,q.y-.028,abs(q.z)-.028),.0035,.009)); }
  float bridge=sdRBox(q-vec3(-.12,.046,0.),vec3(.007,.003,.028),.0015);
  float hole=length(q.xz)-.025;
  body=max(body,-max(hole,.042-q.y));   /* a shallow sound hole */
  return min(min(min(body,neck),min(heel,head)),min(pegs,bridge)); }
float guitarT(vec3 q){
  if(q.y>(q.x>.05?.036:.043)&&q.x>-.2&&q.x<.33&&abs(q.z)<.009){ float s=fract((q.z+.009)/.0036); if(s<.16&&q.x>-.12) return .15; }   /* strings */
  if(q.y>.036&&q.x>.047&&q.x<.25&&fract((q.x-.047)/.022)<.07) return .3;   /* frets */
  if(length(q.xz)<.025) return .06;                                         /* sound hole */
  if(abs(length(q.xz)-.031)<.0015) return .35;                              /* rosette */
  if(q.x>.05) return .32;                                                   /* dark neck and head */
  if(q.y<.042) return .42+.08*grain(q.zyx,45.);                             /* the sides */
  return .74+.06*grain(q.zyx*vec3(1.,1.,.2),30.); }
/* the dictionary */
vec3 dq(vec3 p){ return P(p,DK+vec3(0.,DH.y,0.),DKR); }
float dictT(vec3 q){ vec3 h=DH;
  if(abs(q.y)<h.y-.0035&&q.x>-h.x+.004){                                    /* page edges and thumb notches */
    if(q.z<-h.z+.002||q.x>h.x-.002){ float t=q.z<-h.z+.002?q.x:q.z; if(abs(fract(q.y/.012+.3)-.5)<.12&&fract(t/.05)<.3) return .25; }
    return fract(q.y/.0026)<.3?.72:.93; }
  if(q.y>h.y-.004){ vec2 u=q.xz;                                            /* cover: framed panel with hint-lines */
    if(abs(max(abs(u.x)/h.x,abs(u.y)/h.z)-.86)<.012) return .2;
    if(abs(u.x-.01)<.045&&(abs(u.y-.045)<.004||abs(u.y-.025)<.0025)) return .2;
    if(abs(u.x-.01)<.03&&abs(u.y+.04)<.0025) return .25;
    return .45; }
  if(q.x<-h.x+.012&&abs(abs(q.y)-h.y*.6)<.003) return .2;
  return .45; }
/* cup on a saucer */
float cupD(vec3 q){ float s=sdCylY(q-vec3(0.,.004,0.),.062,.003)-.002;
  s=min(s,max(abs(length(q-vec3(0.,.1,0.))-.093)-.0015,max(q.y-.011,.004-q.y)));
  float m=mug(q-vec3(0.,.007,0.),.034,.058);
  return min(s,m); }
float cupT(vec3 q){ if(q.y<.013){ float r=length(q.xz); return abs(r-.045)<.0015?.4:.85; }
  return mugT(q-vec3(0.,.007,0.),.034,.058,.86); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,guitarD(gq(p)),3.);
  vec2 b=bookC(dq(p),DH);
  r=U(r,b.x,4.); r=U(r,b.y,5.);
  r=U(r,cupD(P(p,CUP,-1.04)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return guitarT(gq(p));
  if(id==4.||id==5.) return dictT(dq(p));
  if(id==6.) return cupT(P(p,CUP,-1.04));
  return .7; }
