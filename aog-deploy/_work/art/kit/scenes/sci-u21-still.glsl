/* Science Unit 21 "Earth and Space" — pencil still life: a brass orrery (the Sun in the
   middle, Earth with its Moon, and a ringed planet on arms), and a small star-chart tube. */
#define CAM_POS vec3(-0.6451,0.2591,-0.7303)
#define CAM_TGT vec3(-0.2964,0.0021,0.1875)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define OC vec3(.02,0.,.08)
vec2 orrery(vec3 p){ vec3 q=p-OC;
  float base=sdCylY(q-vec3(0.,.01,0.),.07,.01)-.004;
  base=min(base,sdCone(q-vec3(0.,.04,0.),.03,.01,.025));
  float post=sdCylY(q-vec3(0.,.1,0.),.005,.06);
  float sun=length(q-vec3(0.,.17,0.))-.045;
  float arms=1e5, pl=1e5;
  /* arm 1: Earth and Moon */
  vec3 e=vec3(-.16,.15,-.05); arms=min(arms,sdCapsule(q,vec3(0.,.11,0.),vec3(e.x,.11,e.z),.003));
  arms=min(arms,sdCapsule(q,vec3(e.x,.11,e.z),e,.003));
  pl=min(pl,length(q-e)-.022);
  vec3 m=e+vec3(-.04,.02,-.02); arms=min(arms,sdCapsule(q,e,m,.0015)); pl=min(pl,length(q-m)-.008);
  /* arm 2: ringed planet */
  vec3 s=vec3(.2,.2,.02); arms=min(arms,sdCapsule(q,vec3(0.,.09,0.),vec3(s.x,.09,s.z),.003));
  arms=min(arms,sdCapsule(q,vec3(s.x,.09,s.z),s,.003));
  vec3 sq=q-s; sq.xy=rot(.4)*sq.xy; sq.yz=rot(.3)*sq.yz;
  pl=min(pl,length(sq)-.028);
  float ring=max(abs(length(sq.xz)-.045)-.009,abs(sq.y)-.0012);
  /* arm 3: small planet behind */
  vec3 v=vec3(.06,.13,.13); arms=min(arms,sdCapsule(q,vec3(0.,.1,0.),vec3(v.x,.1,v.z),.003)); arms=min(arms,sdCapsule(q,vec3(v.x,.1,v.z),v,.003)); pl=min(pl,length(q-v)-.014);
  return vec2(min(min(base,post),arms),min(min(sun,pl),ring)); }
vec3 cq(vec3 p){ vec3 q=p-vec3(-.3,.025,.0); q.xz=rot(.5)*q.xz; return q; }
float chart(vec3 p){ vec3 q=cq(p); float d=sdCylX(q,.025,.07)-.001; d=min(d,sdCylX(q-vec3(.072,0.,0.),.027,.008)-.001); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 o=orrery(p); r=U(r,o.x,3.); r=U(r,o.y,4.);
  r=U(r,chart(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 q=p-OC; if(length(q-vec3(0.,.17,0.))<.05) return .92;
    vec3 s=q-vec3(.2,.2,.02); if(length(s)<.05){ s.xy=rot(.4)*s.xy; s.yz=rot(.3)*s.yz; if(length(s)>.031) return fract(length(s.xz)/.006)<.4?.4:.7; return fract(s.y/.012)<.5?.5:.7; }
    return .55; }
  if(id==5.){ vec3 q=cq(p); return fract(q.x/.03)<.1?.3:.62; }
  return .7; }
