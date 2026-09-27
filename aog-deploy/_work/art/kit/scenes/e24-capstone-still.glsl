/* Room "Capstone: Research, Cite, Defend" — pencil still life: a stack of three books bristling
   with paper bookmarks, a pair of round reading glasses folded in front, and a small wooden
   box of index cards with a raised divider tab. */
#define CAM_POS vec3(-0.3515,0.3259,-0.4770)
#define CAM_TGT vec3(-0.1655,0.0005,0.0544)
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
#define BK vec3(-.05,0.,.07)
#define BX vec3(.18,0.,.08)
float booksD(vec3 p){ float d=1e5;
  d=min(d,bookD(place(p,BK,.1),vec3(.11,.02,.075)));
  d=min(d,bookD(place(p,BK+vec3(.005,.041,0.),-.08),vec3(.1,.017,.07)));
  d=min(d,bookD(place(p,BK+vec3(-.005,.076,.004),.22),vec3(.09,.016,.064)));
  return d; }
float slipsD(vec3 p){ float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i);
    vec3 c=BK+vec3(-.06+fi*.03,.02+mod(fi,3.)*.036,-.02+.02*sin(fi*2.));
    vec3 q=place(p,c,.1+.15*sin(fi*3.)); q.xy=rot(.05*sin(fi*5.))*q.xy;
    d=min(d,sdBox(q-vec3(0.,.012,-.07),vec3(.009,.012+.004*mod(fi,2.),.0006))); }
  return d; }
vec3 glQ(vec3 p){ vec3 q=p-vec3(.07,.0,-.12); q.xz=rot(-.2)*q.xz; return q; }
float glassesD(vec3 p){ vec3 q=glQ(p);
  vec3 f=q-vec3(0.,.022,0.); f.yz=rot(-.25)*f.yz;          /* the front frame, tipped back a little */
  vec3 e=vec3(abs(f.x)-.03,f.y,f.z);
  float rim=sdTorus(e.xzy,.022,.0022);
  float bridge=sdCapsule(f,vec3(-.009,.008,0.),vec3(.009,.008,0.),.0018);
  bridge=min(bridge,sdTorus((f-vec3(0.,.004,0.)).xzy,.008,.0016)+max(0.,-(f.y-.006)));
  /* folded temples running back behind the rims */
  float t1=sdCapsule(f,vec3(.052,.004,.003),vec3(-.03,.004,.012),.0017);
  float t2=sdCapsule(f,vec3(-.052,.0,.004),vec3(.03,-.002,.02),.0017);
  float lens=max(sdCylZ(vec3(e.x,e.y,f.z),.021,.0008),0.);
  return min(min(min(rim,bridge),min(t1,t2)),lens); }
float boxD(vec3 p){ vec3 q=place(p,BX,-.35);
  float outer=sdRBox(q-vec3(0.,.035,0.),vec3(.06,.035,.045),.003);
  float inner=sdBox(q-vec3(0.,.045,0.),vec3(.055,.035,.04));
  return max(outer,-inner); }
float cardsD(vec3 p,out float tab){ vec3 q=place(p,BX,-.35); float d=1e5; tab=0.;
  for(int i=0;i<9;i++){ float z=-.034+float(i)*.0085; float h=.084+.004*sin(float(i)*2.3);
    vec3 c=q-vec3(0.,h*.5+.003,z); c.yz=rot(.12)*c.yz;
    float card=sdBox(c,vec3(.052,h*.5,.0006));
    if(i==4){ float t=sdBox(c-vec3(.03,h*.5+.006,0.),vec3(.012,.008,.0008)); card=min(card,t); }
    if(card<d){ d=card; tab=float(i); } }
  return d-.0003; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,booksD(p),3.);
  r=U(r,slipsD(p),4.);
  r=U(r,glassesD(p),5.);
  r=U(r,boxD(p),6.);
  float t; r=U(r,cardsD(p,t),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ if(abs(n.y)<.5&&abs(n.x)<.7){ return fract(p.y/.003)<.3?.7:.9; } return .4; }
  if(id==4.) return .93;
  if(id==5.){ vec3 q=glQ(p); return .25; }
  if(id==6.) return .45+.15*grain(place(p,BX,-.35),60.);
  if(id==7.){ float t; cardsD(p,t); return t==4.?.6:.92; }
  return .7; }
