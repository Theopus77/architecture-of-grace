/* Room "Forces, Energy and Waves" — pencil still life: a Newton's cradle with its end ball
   pulled back, ready to swing, and a steel tuning fork lying on the table in front. */
#define CAM_POS vec3(-0.4175,0.2783,-0.6943)
#define CAM_TGT vec3(-0.1779,0.0300,0.0761)
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
#define NC vec3(-.02,0.,.06)
#define TOPY .21
#define SL .15
vec3 ncQ(vec3 p){ return place(p,NC,.18); }
float baseD(vec3 p){ vec3 q=ncQ(p); return sdRBox(q-vec3(0.,.011,0.),vec3(.15,.011,.07),.005); }
float frameD(vec3 p){ vec3 q=ncQ(p); vec3 a=vec3(abs(q.x),q.y,abs(q.z));
  float post=sdCapsule(a,vec3(.13,.02,.05),vec3(.13,TOPY-.012,.05),.0045);
  float bend=sdTorus((a-vec3(.118,TOPY-.012,.05)).xzy,.012,.0045); bend=max(bend,max(.118-a.x,TOPY-.012-a.y));
  float rail=sdCapsule(a,vec3(0.,TOPY,.05),vec3(.118,TOPY,.05),.0045);
  float foot=sdCylY(a-vec3(.13,.024,.05),.009,.003)-.002;
  return min(min(post,bend),min(rail,foot)); }
vec3 ballC(int i){ float x=-.08+float(i)*.04; if(i==0){ float a=.75; return vec3(-.08-SL*sin(a),TOPY-SL*cos(a),0.); } return vec3(x,TOPY-SL,0.); }
float ballsD(vec3 p){ vec3 q=ncQ(p); float d=1e5; for(int i=0;i<5;i++) d=min(d,length(q-ballC(i))-.0198); return d; }
float stringsD(vec3 p){ vec3 q=ncQ(p); float d=1e5;
  for(int i=0;i<5;i++){ vec3 c=ballC(i)+vec3(0.,.019,0.); float x=-.08+float(i)*.04;
    d=min(d,sdCapsule(q,c,vec3(x,TOPY,.05),.0009)); d=min(d,sdCapsule(q,c,vec3(x,TOPY,-.05),.0009));
    d=min(d,length(q-c)-.0035); }
  return d; }
vec3 forkQ(vec3 p){ vec3 q=p-vec3(.11,.006,-.1); q.xz=rot(-.3)*q.xz; return q; }
float forkD(vec3 p){ vec3 q=forkQ(p);
  float stem=sdCapsule(q,vec3(-.1,0.,0.),vec3(-.02,0.,0.),.006);
  float ball=length(q-vec3(-.104,0.,0.))-.0065;
  vec3 u=q-vec3(-.005,0.,0.);
  float bend=max(length(vec2(length(u.xz)-.012,u.y))-.0058,u.x);
  float prong=sdCapsule(vec3(u.x,u.y,abs(u.z)),vec3(0.,0.,.011),vec3(.11,0.,.012),.0058);
  float neck=sdCapsule(q,vec3(-.03,0.,0.),vec3(-.016,0.,0.),.0055);
  return min(min(min(stem,ball),min(bend,prong)),neck); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,baseD(p),3.);
  r=U(r,frameD(p),4.);
  r=U(r,ballsD(p),5.);
  r=U(r,stringsD(p),6.);
  r=U(r,forkD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .3+.12*grain(ncQ(p),50.);
  if(id==4.) return .55;
  if(id==5.) return n.y>.6?.9:.5;
  if(id==6.) return .3;
  if(id==7.) return .6;
  return .7; }
