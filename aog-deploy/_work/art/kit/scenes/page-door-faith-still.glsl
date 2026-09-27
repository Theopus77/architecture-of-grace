/* Home page door 03 "World Religions" — pencil still life: a row of old closed books of
   different sizes standing on a wooden stand with one bookend, the last one leaning, a clay
   oil lamp with a small flame in front and a rolled double scroll on the table. The great
   traditions and their books, studied: no symbol of any one faith, no figures, no text. */
#define CAM_POS vec3(-0.5286,0.2301,-0.8823)
#define CAM_TGT vec3(-0.1921,0.0056,0.0901)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- the stand: local frame, turned a little toward the viewer ---- */
#define SC vec3(-.02,0.,.1)
vec3 sq(vec3 p){ vec3 q=p-SC; q.xz=rot(-.12)*q.xz; return q; }
#define SB .022   /* top of the base board */
float standD(vec3 q){
  float base=sdRBox(q-vec3(0.,SB*.5,0.),vec3(.2,SB*.5,.085),.005);
  /* a bead along the front edge */
  base=min(base,sdCylX(q-vec3(0.,.008,-.085),.006,.195));
  /* the bookend on the left: an upright board with a rounded top */
  vec3 e=q-vec3(-.172,SB,0.);
  float slab=max(sdBox(e-vec3(0.,.09,0.),vec3(.009,.09,.07)),length(e.yz-vec2(.1,0.))-.105)-.002;
  slab=max(slab,-e.y);
  return min(base,slab); }
/* book i: x centre, half thickness, half height, half depth */
vec4 bdim(int i){
  if(i==0) return vec4(-.145,.017,.1,.068);
  if(i==1) return vec4(-.114,.013,.085,.06);
  if(i==2) return vec4(-.078,.021,.112,.075);
  if(i==3) return vec4(-.042,.014,.075,.056);
  if(i==4) return vec4(-.01,.017,.094,.064);
  if(i==5) return vec4(.024,.016,.082,.06);
  return vec4(.1,.02,.1,.07); }
vec3 bq(vec3 q,int i){ vec4 b=bdim(i); vec3 o=q-vec3(b.x,SB,0.);
  if(i==6){ /* leans left on book 5, pivoting on its lower left corner */
    o+=vec3(b.y,0.,0.); o.xy=rot(.24)*o.xy; o-=vec3(b.y,0.,0.); }
  o.y-=b.z; return o; }
vec2 bookD(vec3 q,int i){ /* (cover, pages) */
  vec4 b=bdim(i); vec3 o=bq(q,i);
  vec3 s=vec3(b.y,b.z,b.w);
  float cv=sdRBox(o,s,.004);
  /* the page block shows between the boards at the top, the back and the bottom edge */
  float cut=sdBox(o-vec3(0.,0.,.006),vec3(s.x-.0028,s.y+.01,s.z));
  cv=max(cv,-cut);
  float pg=sdBox(o-vec3(0.,-.0015,.004),vec3(s.x-.003,s.y-.003,s.z-.005));
  /* raised bands across the spine */
  float bands=1e5;
  for(int k=0;k<3;k++){ float y=s.y*(k==0?-.72:(k==1?.52:.72));
    bands=min(bands,sdRBox(o-vec3(0.,y,-s.z),vec3(s.x+.0008,.0032,.0035),.0015)); }
  cv=min(cv,bands);
  return vec2(cv,pg); }
vec2 books(vec3 q){ vec2 r=vec2(1e5);
  for(int i=0;i<7;i++){ vec2 d=bookD(q,i); r=min(r,d); }
  return r; }
/* ---- a double scroll lying on the table, front left ---- */
#define SCR vec3(-.2,0.,-.14)
float scroll(vec3 p){
  vec3 q=p-SCR; q.xz=rot(-.25)*q.xz;
  float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(0.,.02,s*.024);
    d=min(d,sdCylX(c,.0185,.075)-.001);
    d=min(d,sdCylX(c,.0045,.108));
    d=min(d,sdCylX(c-vec3(.087,0,0),.015,.003)-.001); d=min(d,sdCylX(c+vec3(.087,0,0),.015,.003)-.001);
    d=min(d,length(c-vec3(.113,0,0))-.007); d=min(d,length(c+vec3(.113,0,0))-.007); }
  d=min(d,sdBox(q-vec3(0.,.0015,0.),vec3(.075,.0012,.024)));
  return d; }
float tie(vec3 p){ vec3 q=p-SCR; q.xz=rot(-.25)*q.xz;
  return sdTorus((q-vec3(-.03,.02,.024)).yxz,.0195,.0022); }
/* ---- the clay oil lamp, front right ---- */
#define LP vec3(.25,0.,-.11)
#define LS 1.35
float lamp0(vec3 p){
  vec3 q=p-LP; q.xz=rot(2.5)*q.xz;
  float body=(length((q-vec3(0,.026,0))/vec3(.058,.03,.05))-1.)*.03;
  float spout=sdCapsule(q,vec3(.03,.035,0),vec3(.085,.045,0),.012);
  spout=max(spout,-sdCapsule(q,vec3(.06,.05,0),vec3(.09,.056,0),.006));
  float body2=smin(body,spout,.01); body2=max(body2,-(length(q-vec3(-.005,.064,0))-.012));
  float handle=sdTorus((q-vec3(-.06,.035,0)).xzy,.017,.004);
  float foot=sdCylY(q-vec3(0,.004,0),.03,.004);
  return min(min(body2,handle),foot); }
float lamp(vec3 p){ return lamp0((p-LP)/LS+LP)*LS; }
float flame(vec3 p){ p=(p-LP)/LS+LP; vec3 q=p-LP; q.xz=rot(2.5)*q.xz; q-=vec3(.088,.07,0.);
  float t=clamp((q.y+.006)/.05,0.,1.); float r=.0105*pow(sin(3.1416*pow(t,.62)),.8)*(1.-.15*t);
  float d=length(q.xz)-r; d=max(d,max(-q.y-.006,q.y-.044)); return d*.7*LS; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=sq(p);
  r=U(r,standD(q),3.);
  vec2 b=books(q); r=U(r,b.x,4.); r=U(r,b.y,5.);
  r=U(r,scroll(p),6.);
  r=U(r,tie(p),7.);
  r=U(r,lamp(p),8.);
  r=U(r,flame(p),9.);
  return r; }
int nearestBook(vec3 q){ int bi=0; float bd=1e5;
  for(int i=0;i<7;i++){ vec4 b=bdim(i); vec3 o=bq(q,i); float d=sdBox(o,vec3(b.y,b.z,b.w)); if(d<bd){bd=d;bi=i;} }
  return bi; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=sq(p);
  if(id==3.) return .45+.08*grain(q.zyx,26.);
  if(id==4.){ int i=nearestBook(q); vec4 b=bdim(i); vec3 o=bq(q,i);
    float t=i==0?.28:(i==1?.46:(i==2?.34:(i==3?.52:(i==4?.3:(i==5?.44:.38)))));
    return t+.05*fbm(o.xy*120.); }
  if(id==5.){ int i=nearestBook(q); vec3 o=bq(q,i); return fract(o.x/.0022)<.3?.78:.9; }
  if(id==6.){ vec3 s=p-SCR; s.xz=rot(-.25)*s.xz; if(abs(s.x)>.078) return .35;
    if(s.y<.004&&fract(s.x/.01)<.3&&abs(s.x)<.065) return .62; return .86; }
  if(id==7.) return .3;
  if(id==8.) return .55;
  if(id==9.) return .97;
  return .7; }
