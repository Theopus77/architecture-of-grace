/* Home door "Contact" — pencil still life of a letter on its way: a sealed envelope, a folded
   note leaning on a small inkpot, and a long pencil. Hint-lines only, never words. */
#define CAM_POS vec3(-0.4200,0.3001,-0.6535)
#define CAM_TGT vec3(-0.1738,-0.0372,0.0579)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define EN vec3(.02,0.,-.04)
#define ENR -.18
#define IP vec3(-.1,0.,.13)
#define NT vec3(-.02,0.,.14)
#define PN vec3(.08,.0068,-.16)
float envD(vec3 p){ vec3 q=P(p,EN,ENR); return sdRBox(q-vec3(0.,.004,0.),vec3(.12,.003,.075),.002); }
float envT(vec3 p){ vec3 q=P(p,EN,ENR); if(q.y<.006) return .6;
  vec2 u=q.xz; float fl=abs(u.y-(.075-abs(u.x)*.62))<.0016&&u.y>0.?1.:0.;   /* the flap's V */
  if(fl>0.) return .35;
  if(abs(abs(u.x)*.6+u.y+.075-.0)<.0014&&u.y<0.) return .6;                  /* the side folds */
  if(length(u-vec2(0.,.0285))<.011) return .3;                             /* a round seal */
  if(u.y<-.02&&u.y>-.05&&u.x>.0&&u.x<.07&&fract((u.y+.05)/.01)<.22) return .55;   /* address hint-lines */
  if(u.x>.085&&u.x<.108&&u.y>.035&&u.y<.062) return abs(u.x-.0965)>.009||abs(u.y-.0485)>.011?.4:.8;  /* a stamp */
  return .9; }
float inkD(vec3 p){ vec3 q=p-IP; float b=sdCylY(q-vec3(0.,.025,0.),.034,.025)-.003;
  float n=sdCylY(q-vec3(0.,.055,0.),.014,.008)-.002; return min(b,n); }
float inkT(vec3 p){ vec3 q=p-IP; if(q.y>.05) return .25; return .45; }
float noteD(vec3 p){ vec3 q=P(p,NT,.1); q.yz=rot(-.35)*q.yz;
  return sdRBox(q-vec3(0.,.07,0.),vec3(.055,.07,.002),.0015); }
float noteT(vec3 p){ vec3 q=P(p,NT,.1); q.yz=rot(-.35)*q.yz; vec2 u=vec2(q.x,q.y-.07);
  if(abs(u.y+.005)<.0014) return .6;                                         /* the fold */
  if(abs(u.x)<.042&&u.y<.055&&u.y>-.05&&fract((u.y+.05)/.012)<.2&&u.x<.042-.025*h1(vec2(floor((u.y+.05)/.012),3.))) return .55;
  return .93; }
float pen(vec3 p){ vec3 q=p-PN; q.xz=rot(.35)*q.xz; return pencilL(q,.09); }
float penT(vec3 p){ vec3 q=p-PN; q.xz=rot(.35)*q.xz; return pencilT(q,.09); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,envD(p),3.);
  r=U(r,inkD(p),4.);
  r=U(r,noteD(p),5.);
  r=U(r,pen(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return envT(p);
  if(id==4.) return inkT(p);
  if(id==5.) return noteT(p);
  if(id==6.) return penT(p);
  return .7; }
