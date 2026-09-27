/* World Religions Unit 2 "Stories People Keep" — pencil still life: two old storybooks stacked,
   a rolled scroll tied with a cord leaning on them, and a small wooden toy boat with a sail
   (for "A Boat and a Prince"). No figures. */
#define CAM_POS vec3(-0.3382,0.3487,-0.6931)
#define CAM_TGT vec3(-0.2185,-0.0360,0.1088)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define B1 vec3(-.12,0.,.06)
#define B1S vec3(.13,.018,.095)
#define B2S vec3(.11,.016,.08)
#define BT vec3(.16,0.,-.03)
vec3 b2Q(vec3 p){ return L(p,B1+vec3(-.005,2.*B1S.y,0.),.18); }
vec3 rlQ(vec3 p){ vec3 q=L(p,vec3(-.06,0.,-.1),-.25); return q; }
float boat(vec3 q){
  vec3 h=q-vec3(0,.03,0);
  float hull=length(h*vec3(1.,1.9,2.6))-.075; hull=max(hull,h.y-.004);
  hull=max(hull,-(length((h-vec3(0,.012,0))*vec3(1.08,1.9,2.9))-.075)); hull*=.4;
  float deck=max(length((h-vec3(0,0,0))*vec3(1.,1.,2.6))-.07,abs(h.y+.004)-.002)*.4;
  hull=min(hull,deck);
  float mast=sdCylY(q-vec3(-.005,.105,0),.0035,.08);
  vec3 s=q-vec3(-.002,.04,0);
  float sail=max(max(abs(s.z-.004*sin(s.y*30.))-.0015,-s.x),max(s.y-.13,-s.y+.0)+0.);
  sail=max(sail,s.x-.07*(1.-s.y/.135)); sail=max(sail,.005-s.y);
  float boom=sdCylX(q-vec3(.03,.043,0),.0025,.035);
  vec3 fq=q-vec3(-.005,.178,0); float flag=max(sdBox(fq-vec3(-.014,0,0),vec3(.014,.006,.0012)),abs(fq.y)-.006*(1.+fq.x/.028));
  return min(min(hull,mast),min(sail*.8,min(boom,flag))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bookD(L(p,B1,.08),B1S),3.);
  r=U(r,bookD(b2Q(p),B2S),4.);
  r=U(r,rollD(rlQ(p),.022,.11),5.);
  r=U(r,boat(L(p,BT,-.5)),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return bookT(L(p,B1,.08),B1S,.35);
  if(id==4.) return bookT(b2Q(p),B2S,.55);
  if(id==5.) return rollT(rlQ(p),.022,.11);
  if(id==6.){ vec3 q=L(p,BT,-.5); if(q.y>.037&&q.y<.2&&abs(q.z)<.006&&q.x>-.001) return .93;
    if(q.y<.035&&abs(q.y-.022)<.0025) return .3; if(q.y>.17) return .35; return .5; }
  return .7; }
