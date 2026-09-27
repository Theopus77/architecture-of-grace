/* FACS project 15 "Soup from scratch" — pencil still life: a big pot of vegetable soup with a
   ladle standing in it, a filled soup bowl in front showing even little cubes of carrot and
   celery with pasta, and a cutting board of diced carrot beside it. */
#define CAM_POS vec3(-0.4548,0.4974,-0.8719)
#define CAM_TGT vec3(-0.1851,0.0221,0.1320)
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
#define PT vec3(.04,0.,.1)
#define SB vec3(-.07,0.,-.07)
#define CB vec3(.17,0.,-.08)
float pot(vec3 p){ vec3 q=p-PT;
  float body=max(abs(length(q.xz)-.09)-.0035,abs(q.y-.065)-.065); body=min(body,sdCylY(q-vec3(0.,.003,0.),.09,.003));
  body=min(body,sdTorus(q-vec3(0.,.13,0.),.09,.004));
  float ears=min(sdTorus((q-vec3(.1,.11,0.)).xzy,.014,.0045),sdTorus((q-vec3(-.1,.11,0.)).xzy,.014,.0045));
  ears=max(ears,-(abs(q.x)-.09));
  return min(body,ears); }
/* soup surface with a few floating cubes and pasta shells: centre c, radius R, level y */
vec2 soupTop(vec3 p,vec3 c,float R,float y,float sd){ vec3 q=p-c; vec2 r=vec2(max(length(q.xz)-R,abs(q.y-y)-.002),4.);
  vec2 cell=floor(q.xz/.018);
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){ vec2 k=cell+vec2(float(i),float(j)); vec2 h=h22(k+sd); float t=h1(k+sd*2.);
    vec2 xz=(k+.25+.5*h)*.018; if(length(xz)>R*.85||t<.3) continue;
    vec3 l=q-vec3(xz.x,y+.0015,xz.y); l.xz=rot(t*6.)*l.xz; l.xy=rot(h.x)*l.xy;
    if(t<.75){ float b=sdRBox(l,vec3(.0045),.001); if(b<r.x) r=vec2(b,t<.55?5.:6.); }
    else { float b=max(abs(sdTorus(l.xzy,.004,.0022))-.0005,l.y); if(b<r.x) r=vec2(b,7.); } }
  return r; }
float ladle(vec3 p){ vec3 q=p-PT; vec3 a=vec3(.02,.1,.0), e=vec3(.075,.19,-.03);
  return min(sdCapsule(q,a,e,.0045),sdCapsule(q,e,e+vec3(.004,-.03,-.002),.004)); }
float bowl(vec3 p){ return bowlD(p-SB,.07,.05); }
float board(vec3 p){ vec3 q=p-CB; q.xz=rot(-.3)*q.xz; return sdRBox(q-vec3(0.,.008,0.),vec3(.085,.008,.055),.006); }
float cubes(vec3 p){ vec3 q=p-CB; q.xz=rot(-.3)*q.xz; q.y-=.021; q.xz+=vec2(.012,-.004); vec2 c=clamp(floor(q.xz/.016+.5),vec2(-2.,-1.),vec2(2.,1.));
  vec3 l=q-vec3(c.x*.016,0.,c.y*.016)-vec3(h22(c).x-.5,0.,h22(c).y-.5)*.006; l.xz=rot(h1(c)*1.5)*l.xz; return sdRBox(l,vec3(.0048),.0012); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pot(p),3.);
  vec3 q=p-PT; float bd=sdCylY(q-vec3(0.,.115,0.),.088,.01);
  if(bd>.01) r.x=min(r.x,bd); else r=U(r,soupTop(p,PT,.087,.113,1.));
  r=U(r,ladle(p),8.);
  r=U(r,bowl(p),9.);
  vec3 b=p-SB; float bb=sdCylY(b-vec3(0.,.043,0.),.07,.01);
  if(bb>.01) r.x=min(r.x,bb); else r=U(r,soupTop(p,SB,.064,.042,7.));
  r=U(r,board(p),10.);
  r=U(r,cubes(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.) return .5;
  if(id==5.) return .6;
  if(id==6.) return .8;
  if(id==7.) return .92;
  if(id==8.) return .5;
  if(id==9.){ vec3 q=p-SB; return abs(q.y-.036)<.0025?.4:.84; }
  if(id==10.) return .72-.06*grain(p,40.);
  return .7; }
