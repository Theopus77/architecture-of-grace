/* WCS Unit 12 "The Political Spectrum in Depth" — pencil still life: a brass balance scale with
   weights in both pans, and a long wooden ruler lying in front, marked like a spectrum. */
#define CAM_POS vec3(-0.5707,0.3332,-1.3114)
#define CAM_TGT vec3(-0.2531,0.0445,0.1173)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define SC vec3(.08,0.,.08)
#define TILT .07
vec3 beamQ(vec3 p){ vec3 q=p-SC-vec3(0.,.3,0.); q.xy=rot(TILT)*q.xy; return q; }
vec3 panC(float s){ return SC+vec3(s*.17*cos(TILT),.3-s*.17*sin(TILT)*(-1.)*-1.,0.); }
float base(vec3 p){ vec3 q=p-SC;
  float d=sdCylY(q-vec3(0.,.01,0.),.075,.01)-.003;
  d=min(d,sdCylY(q-vec3(0.,.028,0.),.05,.008)-.002);
  d=min(d,sdCylY(q-vec3(0.,.16,0.),.009,.13));
  d=min(d,sdCone(q-vec3(0.,.045,0.),.022,.009,.012));
  d=min(d,length(q-vec3(0.,.305,0.))-.013);
  return d; }
float beam(vec3 p){ vec3 q=beamQ(p);
  float d=sdRBox(q,vec3(.17,.005,.006),.002);
  d=min(d,length(q-vec3(.17,0.,0.))-.009); d=min(d,length(q+vec3(.17,0.,0.))-.009);
  d=min(d,sdRBox(q-vec3(0.,.045,0.),vec3(.003,.045,.002),.001));
  return d; }
vec3 hang(float s){ vec3 e=vec3(s*.17,0.,0.); e.xy=rot(-TILT)*e.xy; return SC+vec3(0.,.3,0.)+e; }
float chains(vec3 p){ float d=1e5; for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 h=hang(s); vec3 pc=vec3(h.x,h.y-.19,h.z);
    for(int k=0;k<3;k++){ float a=float(k)*2.094; d=min(d,sdCapsule(p,h,pc+vec3(.045*cos(a),.01,.045*sin(a)),.0013)); } }
  return d; }
float pans(vec3 p){ float d=1e5; for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 h=hang(s); vec3 q=p-vec3(h.x,h.y-.19,h.z);
    float r=length(q.xz); d=min(d,max(abs(q.y+.012-r*r*6.)-.0025,r-.055)); } return d; }
float weights(vec3 p){ float d=1e5; vec3 h=hang(-1.); vec3 q=p-vec3(h.x,h.y-.19,h.z);
  d=min(d,sdCylY(q-vec3(-.012,.004,0.),.022,.009)-.002); d=min(d,sdCylY(q-vec3(-.012,.024,0.),.016,.008)-.002);
  d=min(d,sdCylY(q-vec3(-.012,.039,0.),.006,.005)-.001);
  h=hang(1.); q=p-vec3(h.x,h.y-.19,h.z);
  d=min(d,sdCylY(q-vec3(.0,.003,.0),.018,.008)-.002); d=min(d,sdCylY(q-vec3(0.,.017,0.),.006,.004)-.001);
  return d; }
vec3 rulQ(vec3 p){ vec3 q=p-vec3(.1,.006,-.14); q.xz=rot(.05)*q.xz; return q; }
float ruler(vec3 p){ return sdRBox(rulQ(p),vec3(.26,.004,.02),.0015); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,base(p),3.);
  r=U(r,beam(p),4.);
  r=U(r,chains(p),5.);
  r=U(r,pans(p),6.);
  r=U(r,weights(p),7.);
  r=U(r,ruler(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55;
  if(id==4.) return .5;
  if(id==5.) return .35;
  if(id==6.) return .62;
  if(id==7.) return .35;
  if(id==8.){ vec3 q=rulQ(p); if(n.y>.5){ float t=fract(q.x/.013); float big=fract(q.x/.065);
      if(q.z>.004&&t<.12) return .25; if(q.z>-.008&&big<.025) return .2; if(abs(q.x)<.002) return .15; }
    return .7+.08*grain(p.zyx,40.); }
  return .7; }
