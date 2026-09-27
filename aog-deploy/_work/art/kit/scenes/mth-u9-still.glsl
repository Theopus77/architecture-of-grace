/* Math Unit 9 "Decimals" — pencil still life: a large stopwatch standing on the table, with
   a wooden strip marked in ten equal tenths lying in front of it. */
#define CAM_POS vec3(-0.5418,0.2932,-1.0069)
#define CAM_TGT vec3(-0.3968,0.0396,0.1267)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define CC vec3(.03,.11,.1)
#define CR .1
vec3 swQ(vec3 p){ vec3 q=p-CC; q.xz=rot(.2)*q.xz; return q; }
vec2 watch(vec3 p){ vec3 q=swQ(p);
  float body=sdCylZ(q,CR,.022)-.008;
  float bez=length(vec2(length(q.xy)-CR+.002,q.z+.03))-.009;
  body=smin(body,bez,.004);
  body=max(body,-sdCylZ(q-vec3(0.,0.,-.036),CR-.012,.006));
  float stem=sdCylY(q-vec3(0.,CR+.018,0.),.011,.014)-.002;
  float crown=sdCylY(q-vec3(0.,CR+.04,0.),.019,.008)-.003;
  float ring=sdTorus((q-vec3(0.,CR+.068,0.)).xzy,.024,.0045);
  vec3 b=q; b.xy=rot(-.75)*b.xy; float btn=sdCylY(b-vec3(0.,CR+.012,0.),.007,.012)-.002;
  float hz=q.z+.032;
  float hands=max(sdSeg2(q.xy,vec2(-.012,-.02),vec2(.05,.064))-.0028,abs(hz)-.0015);
  hands=min(hands,length(q-vec3(0.,0.,-.034))-.007);
  /* small dial */
  return vec2(min(min(body,stem),min(min(crown,ring),btn)),hands); }
vec3 stQ(vec3 p){ vec3 q=p-vec3(-.12,.008,-.01); q.xz=rot(.12)*q.xz; return q; }
float strip(vec3 p){ return sdRBox(stQ(p),vec3(.2,.008,.022),.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 w=watch(p); r=U(r,w.x,3.); r=U(r,w.y,4.);
  r=U(r,strip(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=swQ(p); float r=length(q.xy);
    if(q.z<-.03&&r<CR-.012){ float a=atan(q.y,q.x);
      float t60=abs(fract(a/(2.*PI)*60.+.5)-.5)/60.*2.*PI*r, t12=abs(fract(a/(2.*PI)*12.+.5)-.5)/12.*2.*PI*r;
      if(r>CR-.032&&t12<.0024) return .1; if(r>CR-.022&&t60<.0011) return .3;
      vec2 sd=q.xy-vec2(0.,-.042); if(abs(length(sd)-.02)<.0013) return .3;
      return .93; }
    return .45; }
  if(id==4.) return .1;
  if(id==5.){ vec3 q=stQ(p); float x=(q.x+.2)/.04; float f=abs(fract(x+.5)-.5)*.04; if(q.y>.006&&f<.0014) return .15; return mod(floor(x),2.)<.5?.8:.66; }
  return .7; }
