/* FACS project 1 "Trail mix by measuring cups" — pencil still life: a big bowl heaped with trail
   mix (cereal rings, little pretzels, raisins and seeds) with a big spoon in it, a one-cup
   measuring cup filled level with cereal, and a small fluted paper cup of mix. */
#define CAM_POS vec3(-0.4600,0.4464,-0.9086)
#define CAM_TGT vec3(-0.1817,0.0234,0.1268)
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
#define BC vec3(-.02,0.,.05)
#define MC vec3(.17,0.,-.07)
#define PC vec3(-.2,0.,-.07)
float bowl(vec3 p){ return bowlD(p-BC,.13,.09); }
float heap(vec3 p){ vec3 q=p-BC; return sdEll(q-vec3(0.,.068,0.),vec3(.122,.052,.122)); }
float spoon(vec3 p){ vec3 q=p-BC;
  vec3 b=q-vec3(.02,.108,-.01); b.xz=rot(-.5)*b.xz; b.xy=rot(.25)*b.xy;
  float bw=max(abs(sdEll(b,vec3(.032,.012,.022)))-.0015,b.y-.002);
  vec3 a=vec3(.05,.112,-.02), e=vec3(.2,.19,-.08);
  float h=sdCapsule(q,a,e,.0055);
  h=min(h,sdCapsule(q,e,e+normalize(e-a)*.03,.0085));
  return min(bw,h); }
/* a measuring cup with a long flat handle, base centre c, radius r, depth hgt */
float mcup(vec3 p,vec3 c,float r,float hgt,float a){ vec3 q=p-c; q.xz=rot(a)*q.xz;
  float rr=r*(.85+.15*clamp(q.y/hgt,0.,1.));
  float outer=sdCylY(q-vec3(0.,hgt*.5,0.),rr,hgt*.5)-.002; float inner=sdCylY(q-vec3(0.,hgt*.5+.004,0.),rr-.004,hgt*.5);
  float cup=max(outer,-inner);
  float handle=sdRBox(q-vec3(r+.055,hgt-.003,0.),vec3(.06,.0025,.012),.002);
  float hole=length(q.xz-vec2(r+.1,0.))-.005; handle=max(handle,-hole);
  return min(cup,handle); }
float paperCup(vec3 p){ vec3 q=p-PC; float t=clamp(q.y/.045,0.,1.); float a=atan(q.z,q.x);
  float r=mix(.027,.037,t)+.0012*cos(a*28.);
  float d=max(abs(length(q.xz)-r)-.0012,abs(q.y-.0225)-.0225);
  d=min(d,max(length(q.xz)-r,abs(q.y-.001)-.001));
  return d*.8; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bowl(p),3.);
  r=U(r,heap(p),4.);
  vec3 q=p-BC; if(q.y>.05&&q.y<.14&&length(q.xz)<.13){ vec2 mp=mixPieces(q/1.3,.12/1.3,.068/1.3,.052/1.3,.019,3.); r=U(r,mp.x*1.3,mp.y); }
  r=U(r,spoon(p),5.);
  r=U(r,mcup(p,MC,.058,.058,-.5),6.);
  vec3 m=p-MC; r=U(r,max(sdCylY(m-vec3(0.,.03,0.),.054,.024),m.y-.052),7.);
  if(m.y>.045&&m.y<.065&&length(m.xz)<.06) r=U(r,mixPieces(m,.052,.052,.0,.016,7.).x,20.);
  r=U(r,paperCup(p),8.);
  vec3 c=p-PC; r=U(r,sdEll(c-vec3(0.,.042,0.),vec3(.034,.012,.034)),4.);
  if(c.y>.03&&c.y<.07&&length(c.xz)<.04) r=U(r,mixPieces(c,.033,.042,.012,.016,11.));
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-BC; return abs(q.y-.07)<.0035?.4:.72; }
  if(id==4.) return .5;
  if(id==5.) return .62;
  if(id==6.){ vec3 q=p-MC; return abs(q.y-.035)<.0025&&length(q.xz)>.05?.35:.64; }
  if(id==7.) return .75;
  if(id==8.){ vec3 q=p-PC; float a=atan(q.z,q.x); return .8-.18*smoothstep(.3,1.,cos(a*28.)); }
  if(id>=20.) return mixTone(id,p);
  return .7; }
