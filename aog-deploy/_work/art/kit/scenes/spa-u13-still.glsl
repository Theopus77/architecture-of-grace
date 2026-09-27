/* Spanish Unit 13 "The Present Tense" — pencil still life of things people use while they do
   something now: a soccer ball, a coach's whistle on its cord, and a sports water bottle. */
#define CAM_POS vec3(-0.30,0.36,-0.84)
#define CAM_TGT vec3(-0.05,0.05,0.09)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define BL vec3(.04,.1,.06)
/* soccer-ball pattern: distance to the nearest of the 12 pentagon centres (icosahedron vertices) */
float pent(vec3 n){ float g=1.618; float best=-1.;
  for(int i=0;i<12;i++){ int k=i/4; float s1=(i%2==0)?1.:-1., s2=((i/2)%2==0)?1.:-1.;
    vec3 v=k==0?vec3(0.,s1,s2*g):k==1?vec3(s1,s2*g,0.):vec3(s2*g,0.,s1); best=max(best,dot(n,normalize(v))); } return best; }
vec3 bn(vec3 p){ vec3 q=normalize(p-BL); q.xz=rot(.4)*q.xz; q.yz=rot(.3)*q.yz; return q; }
float ball(vec3 p){ return length(p-BL)-.1; }
#define WB vec3(-.14,0.,.09)
float bottle(vec3 p){ vec3 q=p-WB; float r=.036-.004*smoothstep(.06,.1,q.y)*smoothstep(.14,.1,q.y);
  float body=sdCylY(q-vec3(0.,.085,0.),r,.085)-.004;
  float cap=sdCylY(q-vec3(0.,.185,0.),.028,.014)-.003;
  float spout=sdCylY(q-vec3(0.,.212,0.),.009,.014)-.002;
  return min(min(body,cap),spout); }
float whistle(vec3 p){ vec3 q=p-vec3(-.11,.016,-.08); q.xz=rot(.5)*q.xz;
  float drum=sdCylZ(q,.016,.011)-.002; float mouth=sdRBox(q-vec3(.03,.006,0.),vec3(.022,.008,.009),.003);
  float ring=sdTorus((q-vec3(-.02,.0,0.)).yxz,.007,.0018);
  float cord=1e5; for(int i=0;i<10;i++){ float a=float(i)*.55; vec3 c=q-vec3(-.07+.05*cos(a),-.013,.05*sin(a)-.01); cord=min(cord,length(c)-.0028); }
  cord=min(cord,sdCapsule(q,vec3(-.027,0.,0.),vec3(-.05,-.013,-.02),.0022));
  return min(min(drum,mouth),min(ring,cord)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,ball(p),3.);
  r=U(r,bottle(p),4.);
  r=U(r,whistle(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ float c=pent(bn(p)); if(c>.94) return .15; if(abs(c-.94)<.012||abs(c-.81)<.008) return .3; return .9; }
  if(id==4.){ vec3 q=p-WB; if(q.y>.17) return .3; if(q.y>.06&&q.y<.11) return abs(q.y-.085)<.003?.3:.55; return .8; }
  if(id==5.) return .4;
  return .7; }
