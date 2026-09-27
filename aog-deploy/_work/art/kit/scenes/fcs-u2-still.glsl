/* FCS Unit 2 "Hot, Cold and Sharp" — pencil still life: a stovetop kettle with a curled handle
   and a wisp of steam, a quilted oven mitt, a glass of ice cubes and a paring knife in its sheath. */
#define CAM_POS vec3(-0.5306,0.3912,-0.9477)
#define CAM_TGT vec3(-0.2401,0.0078,0.1332)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define KB vec3(.0,0.,.04)
float kettle(vec3 p){ vec3 q=p-KB;
  float body=(length((q-vec3(0.,.075,0.))/vec3(.105,.08,.105))-1.)*.08; body=max(body,-q.y+.004);
  float base=sdCylY(q-vec3(0.,.008,0.),.085,.008)-.003;
  float lid=sdCone(q-vec3(0.,.158,0.),.05,.028,.012); float knob=length(q-vec3(0.,.178,0.))-.013;
  vec3 s=q-vec3(-.1,.07,0.); s.xy=rot(-.9)*s.xy; float spout=sdCone(s.yxz,.022,.011,.06);
  spout=max(spout,-sdCylY(s.yxz-vec3(0.,0.,0.),.007,.07));
  vec3 h=q-vec3(.0,.2,0.); float handle=max(sdTorus(h.xzy,.075,.009),-h.y);
  float posts=min(sdCapsule(q,vec3(-.06,.14,0.),vec3(-.075,.2,0.),.008),sdCapsule(q,vec3(.06,.14,0.),vec3(.075,.2,0.),.008));
  return min(min(min(body,base),min(lid,knob)),min(min(spout,handle),posts)); }
float steam(vec3 p){ vec3 q=p-KB-vec3(-.145,.15,0.); float w=.012*sin(q.y*55.);
  return max(sdCapsule(q-vec3(w,0.,0.),vec3(0.,0.,0.),vec3(0.,.07,0.),.004),-q.y); }
#define GB vec3(-.2,0.,-.05)
float glassD(vec3 p){ vec3 q=p-GB; float r=.036+q.y*.08;
  float wall=max(abs(length(q.xz)-r)-.0025,abs(q.y-.055)-.055);
  float bot=sdCylY(q-vec3(0.,.005,0.),r,.005); return min(wall,bot); }
float ice(vec3 p){ vec3 q=p-GB; float d=1e5;
  for(int i=0;i<4;i++){ float fi=float(i); vec3 c=vec3(.012*sin(fi*2.3),.03+fi*.024,.01*cos(fi*1.7)); vec3 r=q-c; r.xz=rot(fi*.9)*r.xz; r.xy=rot(fi*.5)*r.xy;
    d=min(d,sdRBox(r,vec3(.015),.004)); }
  d=min(d,sdRBox(q-vec3(0.,.116,0.)-vec3(.01,0.,-.005),vec3(.015),.004));
  return d; }
float knife(vec3 p){ vec3 q=p-vec3(.15,.01,-.08); q.xz=rot(-.35)*q.xz;
  float blade=sdRBox(q-vec3(.06,-.008,0.),vec3(.06,.0018,.014),.001); blade=max(blade,q.z-(.014-max(q.x-.04,0.)*.33));
  float bolster=sdRBox(q-vec3(.0,-.003,0.),vec3(.006,.008,.012),.004);
  float handle=sdRBox(q-vec3(-.05,.002,0.),vec3(.05,.009,.012),.007);
  return min(min(blade,bolster),handle); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,kettle(p),3.);
  r=U(r,steam(p),4.);
  r=U(r,glassD(p),5.);
  r=U(r,ice(p),6.);
  r=U(r,knife(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-KB; if(q.y>.15) return .3; if(abs(q.y-.1)<.004) return .35; return .72; }
  if(id==4.) return .92;
  if(id==5.) return .9;
  if(id==6.) return .82;
  if(id==7.){ vec3 q=p-vec3(.15,.01,-.08); q.xz=rot(-.35)*q.xz; if(q.x<-.006) return abs(q.x+.03)<.003||abs(q.x+.07)<.003?.7:.25; if(q.x<.006) return .5; return abs(q.z+.011)<.002?.95:.78; }
  return .7; }
