/* World Religions Unit 8 "Studying Religion Like a Historian" — pencil still life: a large
   magnifying glass lying on an old sheet of paper with hint-lines of writing, a wooden
   hourglass (time and timelines), and a small stack of books. No figures, no real words. */
#define CAM_POS vec3(-0.4818,0.4398,-0.8807)
#define CAM_TGT vec3(-0.3322,-0.0420,0.1230)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define PA vec3(-.04,0.,-.05)
#define HG vec3(.15,0.,.08)
#define BK vec3(-.2,0.,.1)
#define BS vec3(.09,.018,.07)
float paper(vec3 q){ float c=.004*sin(q.x*30.)*smoothstep(.06,.12,abs(q.x)); return sdBox(q-vec3(0,.0015+c,0),vec3(.12,.0012,.085)); }
float hourglass(vec3 q){
  float top=sdRBox(q-vec3(0,.19,0),vec3(.055,.008,.055),.003), bot=sdRBox(q-vec3(0,.008,0),vec3(.055,.008,.055),.003);
  vec2 a=abs(q.xz); float posts=max(length(a-vec2(.043))-.0055,abs(q.y-.1)-.09);
  vec3 g=q-vec3(0,.099,0); float y=abs(g.y); float r=.006+.034*pow(sin(clamp(y/.083,0.,1.)*1.5708),.7);
  float glass=max(abs(length(g.xz)-r)-.0012,y-.083)*.7;
  float sandB=max(length(g.xz)-r+.002,max(g.y+.083,-.083+.03-g.y*0.)-.0)*.7;
  sandB=max(length(g.xz)-r+.002,max(-g.y-.083,g.y+.05))*.7;
  float cone=sdCone(g-vec3(0,-.066,0),.03,.002,.017);
  float sandT=max(length(g.xz)-r+.002,max(g.y-.045,-g.y+.01))*.7;
  return min(min(min(top,bot),posts),min(glass,min(min(sandB,cone),sandT))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,paper(L(p,PA,.15)),3.);
  r=U(r,magD(L(p,PA+vec3(-.01,.003,-.01),-.5),1.1),4.);
  r=U(r,hourglass(L(p,HG,.3)),5.);
  r=U(r,bookD(L(p,BK,.35),BS),6.);
  r=U(r,bookD(L(p,BK+vec3(0.,2.*BS.y,0.),.2),BS*vec3(.9,.9,.9)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=L(p,PA,.15); float a=.9-.08*fbm(q.xz*30.); float l=fract((q.z+.2)/.012);
    if(abs(q.x)<.1&&abs(q.z)<.07&&l<.22&&fract(q.x*9.+floor((q.z+.2)/.012)*.37)<.8) a=.55; return a; }
  if(id==4.){ vec3 q=L(p,PA+vec3(-.01,.003,-.01),-.5)/1.1-vec3(0,.006,0); float r=length(q.xz);
    if(r<.045&&q.x<.06){ return .95; } return q.x>.06?.35:.45; }
  if(id==5.){ vec3 q=L(p,HG,.3); vec3 g=q-vec3(0,.099,0); float y=abs(g.y); float r=.006+.034*pow(sin(clamp(y/.083,0.,1.)*1.5708),.7);
    if(q.y<.017||q.y>.18) return .4; if(length(g.xz)>.035) return .38; if(length(g.xz)<r-.0015) return .55; return .92; }
  if(id==6.) return bookT(L(p,BK,.35),BS,.38);
  if(id==7.) return bookT(L(p,BK+vec3(0.,2.*BS.y,0.),.2),BS*vec3(.9,.9,.9),.58);
  return .7; }
