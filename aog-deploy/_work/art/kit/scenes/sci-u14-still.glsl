/* Science Unit 14 "Ecosystems and Heredity" — pencil still life: an open pea pod with its
   row of peas (the plant Mendel studied), loose peas, and a ladybird on a leaf. */
#define CAM_POS vec3(-0.5853,0.2783,-0.7901)
#define CAM_TGT vec3(-0.2233,0.0116,0.1623)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 pq(vec3 p){ vec3 q=p-vec3(.0,.028,.07); q.xz=rot(.25)*q.xz; return q; }
vec2 pod(vec3 p){ vec3 q=pq(p); float bd=length(q*vec3(.8,1.,1.))-.2; if(bd>.02) return vec2(bd);
  float L=.2; float t=clamp(q.x/L,-1.,1.);
  float bend=.03*(1.-t*t); vec3 c=q-vec3(0.,-bend+.03,0.);
  float w=.038*sqrt(max(1.-t*t,0.))+.002;
  float shell=sdEll(c,vec3(L,.03,.042)); 
  float inner=sdEll(c-vec3(0.,.01,0.),vec3(L-.012,.026,.034));
  float half1=max(shell,-inner); half1=max(half1,c.y-.006);
  float top=1e5;
  float peas=1e5;
  for(int i=0;i<7;i++){ float x=(float(i)-3.)*.043; float tt=x/L; float b=.03*(1.-tt*tt);
    peas=min(peas,length(q-vec3(x,-b+.03+.004,0.))-.019*(1.-.25*tt*tt)); }
  float stem=sdCapsule(q,vec3(-L,.03,0.),vec3(-L-.03,.05,.0),.003);
  return vec2(min(min(half1,top),stem),peas); }
float loose(vec3 p){ float d=length(p-vec3(-.25,.018,.02))-.018; d=min(d,length(p-vec3(-.2,.017,-.03))-.017); d=min(d,length(p-vec3(-.29,.016,-.04))-.016); return d; }
#define PC vec3(.3,0.,.06)
float leaf(vec3 q,vec3 base,float ay,float tilt,float L){ float bd=length(q-base)-L*1.2; if(bd>.02) return bd;
  vec3 l=q-base; l.xz=rot(ay)*l.xz; l.xy=rot(tilt)*l.xy; l.y+=.25*l.x*l.x/L;
  return .6*sdEll(l-vec3(L*.5,0.,0.),vec3(L*.5,.005,L*.3)); }
vec2 leafbug(vec3 p){ vec3 q=p-PC;
  float body=sdCone(q-vec3(0.,.05,0.),.045,.06,.05)-.002; body=max(body,-(sdCylY(q-vec3(0.,.11,0.),.052,.02)));
  float rim=sdCylY(q-vec3(0.,.095,0.),.067,.011)-.003; rim=max(rim,-sdCylY(q-vec3(0.,.1,0.),.056,.03));
  float soil=sdCylY(q-vec3(0.,.085,0.),.056,.006);
  float stake=1e5;
  float st=sdCapsule(q,vec3(0.,.09,0.),vec3(.004,.22,0.),.004);
  float lv=leaf(q,vec3(.003,.13,0.),.3,.5,.09); lv=min(lv,leaf(q,vec3(.003,.135,0.),3.4,.5,.085));
  lv=min(lv,leaf(q,vec3(.004,.18,0.),1.6,.7,.075)); lv=min(lv,leaf(q,vec3(.004,.18,0.),-1.4,.7,.07));
  lv=min(lv,leaf(q,vec3(.004,.215,0.),.8,.9,.05)); lv=min(lv,leaf(q,vec3(.004,.215,0.),3.9,.9,.05));
  float hp=1e5;
  return vec2(min(min(body,rim),stake),min(min(st,lv),min(soil,hp))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 a=pod(p); r=U(r,a.x*.6,3.); r=U(r,a.y,4.);
  r=U(r,loose(p),5.);
  vec2 l=leafbug(p); r=U(r,l.x,6.); r=U(r,l.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .6; if(id==4.) return .55; if(id==5.) return .55;
  if(id==6.) return .5;
  if(id==7.) return (p.y<.1)?.2:.5;
  if(id==66.){ vec3 q=p; if(abs(q.z)<.0015) return .3; float v=abs(fract((q.x+abs(q.z)*1.3)/.03)-.5); return v<.04?.4:.62; }
  if(id==77.){ vec3 b=p-vec3(.01,.006,.004); if(b.x>.026) return .15; if(abs(b.z)<.0012) return .15;
    vec2 s=vec2(abs(b.z),b.x); if(length(s-vec2(.012,.008))<.006||length(s-vec2(.011,-.011))<.0055) return .15; return .6; }
  return .7; }
