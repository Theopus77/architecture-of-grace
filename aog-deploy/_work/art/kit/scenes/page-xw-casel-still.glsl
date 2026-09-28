/* Crosswalk: CASEL five competencies — a round wooden wheel puzzle of five wedges, one wedge lifted out and lying beside it, and a pencil. */
#define CAM_POS vec3(-0.2990,0.2064,-0.5579)
#define CAM_TGT vec3(-0.0995,-0.0668,0.0181)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.4)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#include "xwparts.glsl"

#define DC vec3(-.02,0.,.06)
#define W5 1.2566370
float wedge(vec3 q){ float h=W5*.5; vec3 c=q-vec3(0.,.011,0.);
  float d=sdCylY(c,.12,.009)-.002;
  float s1=-sin(h)*q.x+cos(h)*q.z, s2=-sin(h)*q.x-cos(h)*q.z;
  d=max(d,max(s1,s2)+.004); d=max(d,.022-length(q.xz));
  return d; }
vec3 wq(vec3 p,float k){ vec3 q=p-DC; q.xz=rot(-k*W5-.3)*q.xz; return q; }
#define LW vec3(.2,0.,-.1)
vec3 lq(vec3 p){ vec3 q=p-LW; q.xz=rot(2.3)*q.xz; q.x+=.07; return q; }
#define PN vec3(-.03,0.,-.16)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,wedge(wq(p,0.)),3.); r=U(r,wedge(wq(p,1.)),4.); r=U(r,wedge(wq(p,2.)),5.); r=U(r,wedge(wq(p,3.)),6.);
  r=U(r,wedge(lq(p)),7.);
  r=U(r,xwPencilD(P(p,PN,.25),.075),8.);
  return r; }
float wt(vec3 q,float b){ float g=grain(q*vec3(1.,1.,4.),30.); float rim=length(q.xz)>.105?-.12:0.; return b+.1*g+rim; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7; if(id==2.) return .9;
  if(id==3.) return wt(wq(p,0.),.62); if(id==4.) return wt(wq(p,1.),.4); if(id==5.) return wt(wq(p,2.),.72);
  if(id==6.) return wt(wq(p,3.),.5); if(id==7.) return wt(lq(p),.3);
  if(id==8.) return xwPencilT(P(p,PN,.25),.075);
  return .7; }
