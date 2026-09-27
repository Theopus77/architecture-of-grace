/* Practice room "Physics: Motion and Forces" — pencil still life: a Newton's cradle with the end
   ball pulled back ready to swing, and a stopwatch lying beside it. */
#define CAM_POS vec3(-0.3168,0.3949,-0.7666)
#define CAM_TGT vec3(-0.1861,-0.0254,0.1092)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define NC vec3(0.,0.,.05)
#define SW vec3(.19,.0,-.08)
#define BR .02
#define TOP .19
#define LEN .12
vec3 ncQ(vec3 p){ vec3 q=p-NC; q.xz=rot(.18)*q.xz; return q; }
float baseD(vec3 q){ return sdRBox(q-vec3(0.,.008,0.),vec3(.13,.008,.065),.004); }
float frameD(vec3 q){ vec3 f=vec3(abs(q.x)-.11,q.y,abs(q.z)-.045);
  float d=sdCapsule(f,vec3(0.,.016,0.),vec3(0.,TOP,0.),.0035);
  d=min(d,sdCapsule(vec3(q.x,q.y,abs(q.z)-.045),vec3(-.11,TOP,0.),vec3(.11,TOP,0.),.0035));
  return d; }
vec3 ballC(int i){ float x=(float(i)-2.)*2.*BR; float a=i==0?-.75:0.;
  return vec3(x,TOP,0.)+vec3(sin(a),-cos(a),0.)*LEN; }
vec3 hookC(int i){ return vec3((float(i)-2.)*2.*BR,TOP,0.); }
float ballsD(vec3 q){ float d=1e3; for(int i=0;i<5;i++) d=min(d,length(q-ballC(i))-BR); return d; }
float stringsD(vec3 q){ float d=1e3; for(int i=0;i<5;i++){ vec3 b=ballC(i)+vec3(0.,.0,0.);
    vec3 h=hookC(i); vec3 t=(b-h); vec3 top=b-normalize(t)*BR*.9;
    d=min(d,sdCapsule(q,top,h+vec3(0.,0.,.045),.0009)); d=min(d,sdCapsule(q,top,h-vec3(0.,0.,.045),.0009)); } return d; }
float swD(vec3 q){ float d=sdCylY(q-vec3(0.,.011,0.),.042,.009)-.003;
  d=min(d,sdCylZ(q-vec3(0.,.011,-.05),.006,.006)-.001);
  d=min(d,sdTorus((q-vec3(0.,.011,-.062)).xzy,.008,.0022));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=ncQ(p);
  r=U(r,baseD(q),3.);
  r=U(r,frameD(q),4.);
  r=U(r,ballsD(q),5.);
  r=U(r,stringsD(q),6.);
  vec3 s=place(p,SW,-.5);
  r=U(r,swD(s),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=ncQ(p); return .45+.12*grain(q.zyx,40.); }
  if(id==4.) return .5;
  if(id==5.) return .6;
  if(id==6.) return .3;
  if(id==7.){ vec3 s=place(p,SW,-.5); float r=length(s.xz);
    if(s.y>.017&&r<.036){ float a=atan(s.z,s.x);
      if(r>.03&&abs(fract(a/(PI/6.))-.5)>.42) return .25;     /* hour ticks */
      if(sdSeg2(s.xz,vec2(0.),vec2(.012,-.024))<.0012) return .2;  /* the hand */
      if(r<.003) return .2; return .93; }
    return .45; }
  return .7; }
