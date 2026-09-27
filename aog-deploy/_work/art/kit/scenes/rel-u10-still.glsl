/* World Religions Unit 10 "Islam in History" — pencil still life: an open Qur'an on a carved
   wooden rahle stand, with a pierced brass lantern and a string of prayer beads beside it.
   Pages carry an ornamental frame and hint-lines only, no writing. No people. */
#define CAM_POS vec3(-0.4474,0.5364,-1.0102)
#define CAM_TGT vec3(-0.2775,-0.0106,0.1299)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define RS .38
#define RC vec3(-.03,0.,.08)
#define LN vec3(.2,0.,.02)
#define BD vec3(-.2,0.,-.06)
float star2(vec2 f){ vec2 a=abs(f); vec2 r=abs(rot(.785398)*f); return min(max(a.x,a.y),max(r.x,r.y)); }
vec3 rq(vec3 p){ vec3 q=(p-RC)/RS; q.xz=rot(.3)*q.xz; return q; }
float board(vec3 q,float s){
  vec3 a=q-vec3(0,.26,0); a.yz=rot(s*.62)*a.yz;
  float d=sdRBox(a,vec3(.2,.34,.009),.003);
  float st=star2((a.xy-vec2(0.,-.19))/.07)*.07-.03; d=max(d,-st);
  d=max(d,-(length(vec2(a.x,(a.y+.34)*.8))-.1));
  return d; }
float rahle(vec3 p){ vec3 q=rq(p); float d=min(board(q,1.),board(q,-1.)); return max(d,-q.y)*RS; }
vec3 bq(vec3 p){ vec3 q=rq(p); q-=vec3(0.,.565,-.02); q.yz=rot(-.62)*q.yz; return q; }
vec2 mushaf(vec3 p){
  vec3 q=bq(p)/1.22; float x=abs(q.x);
  float curl=.02*sin(clamp(x/.2,0.,1.)*3.1416)+.022*(1.-exp(-x*25.));
  float pages=sdBox(vec3(x-.1,q.y-curl*.8,q.z),vec3(.097,.014,.14))-.001;
  float cover=sdRBox(vec3(x-.104,q.y+.014+curl*.3,q.z),vec3(.107,.004,.149),.002);
  return vec2(pages,cover)*1.22*RS; }
float beads(vec3 q){
  /* a loop of round beads lying in a loose oval, with a tassel end */
  float a=atan(q.z*1.5,q.x); float n=33.; float k=floor(a/6.2832*n+.5)/n*6.2832;
  vec3 c=vec3(cos(k)*.06,.0055,sin(k)*.04); float d=length(q-c)-.0055;
  float tail=sdCapsule(q,vec3(.06,.005,0),vec3(.1,.004,.02),.004);
  float tas=sdCone((q-vec3(.112,.006,.026)).yxz,.001,.007,.012);
  return min(d,min(tail,tas*.8)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rahle(p),3.);
  vec2 b=mushaf(p); r=U(r,b.x,4.); r=U(r,b.y,5.);
  r=U(r,lanternD(L(p,LN,.4),1.05),6.);
  r=U(r,lanternCandle(L(p,LN,.4),1.05),7.);
  r=U(r,beads(L(p,BD,.3)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.){ vec3 q=bq(p)/1.22; float x=abs(q.x); float a=.94;
    vec2 b=abs(vec2(x-.1,q.z))-vec2(.078,.118); float m=max(b.x,b.y);
    if(abs(m)<.003||abs(m+.009)<.002) a=.45;
    if(m<-.014){ float l=fract((q.z+.2)/.02); if(l<.22) a=.66; }
    if(x<.008) a=.72; return a; }
  if(id==5.) return .3;
  if(id==6.) return lanternT(L(p,LN,.4),1.05);
  if(id==7.) return .95;
  if(id==8.) return .42;
  return .7; }
