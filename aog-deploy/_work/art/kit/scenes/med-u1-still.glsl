/* Medicine and Health Unit 1 "My Healthy Body" — pencil still life: a toothbrush standing in
   a cup, a bar of soap on a little dish, and an apple (clean hands, clean teeth, good food). */
#define CAM_POS vec3(-0.3497,0.3923,-0.8099)
#define CAM_TGT vec3(-0.2058,0.0365,0.0204)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define CUP vec3(0.,0.,.02)
#define APL vec3(-.13,.05,-.05)
#define DISH vec3(.15,0.,-.06)
vec3 brushQ(vec3 p){ vec3 q=p-CUP-vec3(.004,.05,0.); q.xy=rot(-.2)*q.xy; q.yz=rot(.1)*q.yz; q.xz=rot(.5)*q.xz; return q; }
float dishD(vec3 p){ vec3 q=p-DISH; float r=length(q.xz*vec2(.8,1.));
  float d=max(abs(q.y-.005-r*r*1.2)-.0025,r-.075)-.001;
  return d; }
float soapD(vec3 p){ vec3 q=place(p,DISH+vec3(0.,.026,0.),.25);
  float d=sdRBox(q,vec3(.06,.017,.036),.014);
  float ring=abs(length(q.xz*vec2(1.,1.5))-.036)-.0015;
  d=max(d,-max(ring,-(q.y-.0165)));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,cupD(p-CUP,.042,.1,.028),3.);
  r=U(r,brushD(brushQ(p)),4.);
  vec3 a=p-APL; a.xz=rot(.4)*a.xz;
  r=U(r,appleD(a,.05),5.);
  r=U(r,appleLeaf(a,.05),6.);
  r=U(r,dishD(p),7.);
  r=U(r,soapD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-CUP; if(abs(q.y-.07)<.004||abs(q.y-.058)<.002) return .35; return .82; }
  if(id==4.){ vec3 q=brushQ(p); if(q.z>.004&&q.y>.155){ return fract(q.y/.005)<.4?.5:.85; } if(abs(q.y-.09)<.03) return .5; return .7; }
  if(id==5.){ vec3 q=p-APL; float s=.5+.08*sin(atan(q.z,q.x)*9.+q.y*40.); if(q.y>.04) return .3; return s; }
  if(id==6.) return .4;
  if(id==7.){ vec3 q=p-DISH; float r=length(q.xz*vec2(.8,1.)); return abs(r-.065)<.003?.5:.88; }
  if(id==8.){ vec3 q=place(p,DISH+vec3(0.,.026,0.),.25); float ring=abs(length(q.xz*vec2(1.,1.5))-.036); if(q.y>.012&&ring<.003) return .45; return .86; }
  return .7; }
