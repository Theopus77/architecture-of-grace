/* Practice room "Buddhism: The Four Noble Truths" — pencil still life: a carved wooden wheel with
   eight spokes standing in a stand (the Eightfold Path), a lotus flower floating in a shallow
   bowl, and a heart-shaped bodhi leaf on the table. Objects only; no figures. */
#define CAM_POS vec3(-0.3559,0.4349,-0.9212)
#define CAM_TGT vec3(-0.2040,-0.0542,0.0981)
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
#define WH vec3(-.02,0.,.07)
#define WR .085
#define BWL vec3(.12,0.,-.11)
#define LF vec3(-.1,.003,-.15)
vec3 whQ(vec3 p){ vec3 q=p-WH; q.xz=rot(.3)*q.xz; return q; }
float wheelD(vec3 q){ vec3 c=q-vec3(0.,WR+.025,0.);
  float rim=max(abs(length(c.xy)-WR)-.007,abs(c.z)-.008);
  float hub=sdCylZ(c,.018,.011)-.002;
  float a=atan(c.y,c.x); float k=PI/4.; float aa=mod(a+k*.5,k)-k*.5; vec2 s=length(c.xy)*vec2(cos(aa),sin(aa));
  float spk=max(max(abs(s.y)-.0045,abs(c.z)-.006),max(s.x-WR,.015-s.x));
  float d=min(min(rim,hub),spk);
  for(int i=0;i<8;i++){ float b=float(i)*k; vec2 t=vec2(cos(b),sin(b))*(WR+.012); d=min(d,length(vec3(c.xy-t,c.z))-.0065); }   /* knobs on the rim */
  return d*.9; }
float standD(vec3 q){ float d=sdRBox(q-vec3(0.,.012,0.),vec3(.06,.012,.025),.004); d=max(d,-(length(q.xy-vec2(0.,WR+.025))-WR-.004)); return d; }
float bowlD(vec3 q){ vec3 c=q-vec3(0.,.1,0.); float d=max(abs(length(c)-.1)-.003,c.y+.068); d=max(d,-q.y); return d; }
float waterD(vec3 q){ return max(q.y-.022,length(q-vec3(0.,.1,0.))-.097); }
float lotusD(vec3 q){ q/=1.9; vec3 c=q-vec3(0.,.0125,0.); float d=1e3;
  for(int ring=0;ring<2;ring++){ float n=8.; float tilt=ring==0?.55:1.05; float L=ring==0?.034:.026; float off=ring==0?0.:PI/8.;
    for(int i=0;i<8;i++){ float a=float(i)*PI/4.+off; vec3 v=c; v.xz=rot(a)*v.xz; v.xy=rot(tilt)*v.xy;
      d=min(d,sdEll(v-vec3(L*.5,0.,0.),vec3(L*.5,.0025,L*.24))); } }
  d=min(d,sdCylY(c-vec3(0.,.012,0.),.008,.006)-.002);
  return d*1.9; }
float leafD2(vec3 p){ vec3 q=(p-LF)/1.6; q.xz=rot(.8)*q.xz; vec2 u=q.xz; float y=q.y-length(u)*length(u)*2.;
  /* a heart-shaped leaf with a long drawn-out tip along +x */
  float r=length(u*vec2(1.,1.1)); float a=atan(u.y,u.x);
  float R=.04*(1.-.35*abs(sin(a*.5))*0.)*(.72+.28*cos(a))+.0;
  R+=.028*exp(-a*a*18.);                         /* the drip tip */
  R-=.012*exp(-(abs(a)-PI)*(abs(a)-PI)*20.);      /* the notch at the stem */
  float d=max(r-R,abs(y)-.0012)*.7;
  d=min(d,sdCapsule(q,vec3(-.008,.001,0.),vec3(-.03,.001,-.004),.0015));
  return d*1.6; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 w=whQ(p);
  r=U(r,wheelD(w),3.);
  r=U(r,standD(w),4.);
  vec3 b=place(p,BWL,.3);
  r=U(r,bowlD(b),5.);
  r=U(r,waterD(b),6.);
  r=U(r,lotusD(b),7.);
  r=U(r,leafD2(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55+.12*grain(whQ(p).zyx,70.);
  if(id==4.) return .45;
  if(id==5.) return .6;
  if(id==6.) return .7;
  if(id==7.) return .9;
  if(id==8.){ vec3 q=(p-LF)/1.6; q.xz=rot(.8)*q.xz; if(abs(q.z)<.001&&q.x>-.03) return .3; float v=abs(fract((q.x-abs(q.z)*1.2)/.014)-.5); if(v<.06&&abs(q.z)>.003) return .38; return .55; }
  return .7; }
