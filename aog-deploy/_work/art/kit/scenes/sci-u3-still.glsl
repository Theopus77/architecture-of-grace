/* Science Unit 3 "Living Things and Where They Live" — pencil still life: a young plant
   growing in a clay pot, a bird nest holding three eggs, and a small watering can. */
#define CAM_POS vec3(-0.6828,0.3475,-0.9528)
#define CAM_TGT vec3(-0.2528,0.0307,0.1789)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define PC vec3(.03,0.,.06)
vec2 pot(vec3 p){ vec3 q=p-PC;
  float body=sdCone(q-vec3(0.,.06,0.),.055,.075,.06)-.002;
  body=max(body,-(sdCylY(q-vec3(0.,.13,0.),.066,.02)));
  float rim=sdCylY(q-vec3(0.,.115,0.),.083,.013)-.003; rim=max(rim,-sdCylY(q-vec3(0.,.12,0.),.07,.03));
  float soil=sdCylY(q-vec3(0.,.1,0.),.07,.008)+.002*fbm(q.xz*80.);
  return vec2(min(body,rim),soil); }
float leaf(vec3 q,vec3 base,float ay,float tilt,float L){
  vec3 l=q-base; l.xz=rot(ay)*l.xz; l.xy=rot(tilt)*l.xy;
  l.y+=.25*l.x*l.x/L;
  return .6*sdEll(l-vec3(L*.5,0.,0.),vec3(L*.5,.005,L*.3)); }
float plant(vec3 p){ vec3 q=p-PC;
  float st=sdCapsule(q,vec3(0.,.1,0.),vec3(.006,.26,-.004),.005);
  float d=st;
  d=min(d,leaf(q,vec3(.004,.16,0.),.2,.6,.15));
  d=min(d,leaf(q,vec3(.003,.15,0.),3.4,.55,.14));
  d=min(d,leaf(q,vec3(.006,.2,0.),1.8,.7,.13));
  d=min(d,leaf(q,vec3(.006,.205,0.),-1.2,.7,.12));
  d=min(d,leaf(q,vec3(.006,.25,-.004),.8,1.,.09));
  d=min(d,leaf(q,vec3(.006,.25,-.004),3.9,1.,.085));
  return d; }
#define NC vec3(-.2,0.,.02)
vec2 nest(vec3 p){ vec3 q=p-NC;
  float r=length(q.xz); float bowl=length(vec2(r-.065,q.y-.035))-.032;
  bowl=smin(bowl,sdCylY(q-vec3(0.,.012,0.),.06,.01),.02);
  bowl+=.004*fbm(vec2(atan(q.z,q.x)*12.,q.y*120.))+.002*sin(atan(q.z,q.x)*40.+q.y*300.);
  float eggs=1e5;
  for(int i=0;i<3;i++){ float a=float(i)*2.1+.4; vec3 c=vec3(cos(a)*.025,.05,sin(a)*.025);
    vec3 e=q-c; e.xy=rot(.3*cos(a))*e.xy; e.zy=rot(.3*sin(a))*e.zy;
    eggs=min(eggs,sdEll(e-vec3(0.,.005,0.),vec3(.019,.026,.019)*(1.-.12*step(0.,e.y)*e.y/.026))); }
  return vec2(bowl*.8,eggs); }
vec3 cq(vec3 p){ vec3 q=p-vec3(.33,0.,.12); q.xz=rot(-.5)*q.xz; return q; }
float can(vec3 p){ vec3 q=cq(p);
  float body=sdCylY(q-vec3(0.,.06,0.),.055,.06)-.004;
  body=max(body,-sdCylY(q-vec3(0.,.13,0.),.05,.02));
  float spout=sdCapsule(q,vec3(.04,.04,0.),vec3(.14,.14,0.),.009);
  float rose=sdCone((q-vec3(.15,.15,0.)).yxz*vec3(1.,1.,1.),.012,.022,.012);
  vec3 h=q-vec3(-.02,.12,0.); float handle=length(vec2(length(h.xy)-.05,h.z))-.006; handle=max(handle,-h.y+.0);
  handle=max(handle,h.x-.035);
  return min(min(body,spout),min(rose,handle)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 a=pot(p); r=U(r,a.x,3.); r=U(r,a.y,4.);
  r=U(r,plant(p),5.);
  vec2 n=nest(p); r=U(r,n.x,6.); r=U(r,n.y,7.);
  r=U(r,can(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PC; return q.y>.1?.45:.55; }
  if(id==4.) return .2;
  if(id==5.) return .5;
  if(id==6.){ vec3 q=p-NC; float s=sin(atan(q.z,q.x)*30.+q.y*250.+fbm(q.xz*60.)*3.); return s>.6?.25:.45; }
  if(id==7.) return .88;
  if(id==8.){ vec3 q=cq(p); return abs(q.y-.1)<.004?.3:.6; }
  return .7; }
