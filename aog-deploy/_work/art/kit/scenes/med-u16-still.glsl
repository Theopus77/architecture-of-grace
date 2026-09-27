/* Medicine Unit 16 "Ethics and the Mind" — pencil still life: a brass balance scale with two
   hanging pans, beside a closed medical file folder with a tab and a paper clip. */
#define CAM_POS vec3(-0.3831,0.2497,-1.0157)
#define CAM_TGT vec3(-0.1378,0.0265,0.0880)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define SC vec3(0.,0.,.06)
#define BW .13
float scaleD(vec3 p){ vec3 q=p-SC;
  float base=sdCylY(q-vec3(0.,.008,0.),.06,.008)-.003;
  base=min(base,sdCone(q-vec3(0.,.03,0.),.035,.012,.015));
  float post=sdCylY(q-vec3(0.,.15,0.),.006,.12);
  float top=length(q-vec3(0.,.275,0.))-.012;
  float beam=sdCapsule(q,vec3(-BW,.262,0.),vec3(BW,.262,0.),.0045);
  float ends=min(length(q-vec3(-BW,.262,0.))-.008,length(q-vec3(BW,.262,0.))-.008);
  return min(min(min(base,post),top),min(beam,ends)); }
float pan(vec3 p,float s){ vec3 q=p-SC-vec3(s*BW,0.,0.);
  float r=length(q.xz); float d=max(abs(q.y-.07-r*r*2.)-.0022,r-.055)-.001;
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.4; vec3 e=vec3(cos(a)*.05,.074,sin(a)*.05);
    d=min(d,sdCapsule(q,e,vec3(0.,.255,0.),.0012)); }
  return d; }
#define FC vec3(.28,0.,-.1)
vec3 fq(vec3 p){ vec3 q=p-FC; q.xz=rot(-.35)*q.xz; return q; }
float folder(vec3 p){ vec3 q=fq(p);
  float f=sdRBox(q-vec3(0.,.008,0.),vec3(.1,.008,.13),.003);
  float tab=sdRBox(q-vec3(-.04,.008,.14),vec3(.035,.006,.014),.003);
  return min(f,tab); }
float clip(vec3 p){ vec3 q=fq(p)-vec3(.05,.0175,.12); return max(abs(sdSeg2(q.xz,vec2(0.,-.03),vec2(0.,.0))-.006)-.0012,abs(q.y)-.0012); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,scaleD(p),3.);
  r=U(r,pan(p,-1.),4.);
  r=U(r,pan(p,1.),5.);
  r=U(r,folder(p),6.);
  r=U(r,clip(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.||id==5.) return .6;
  if(id==6.){ vec3 q=fq(p); if(n.y<.5) return fract(q.y/.003)<.4?.45:.8;
    if(abs(q.x-.0)<.075&&q.z>-.09&&q.z<.02&&fract(q.z/.018)<.14) return .55;   /* hint-lines on the label */
    if(abs(abs(q.x)-.08)<.0015&&q.z>-.1&&q.z<.04) return .35;
    return .72; }
  if(id==7.) return .5;
  return .7; }
