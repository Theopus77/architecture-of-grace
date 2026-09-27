/* Room "Ser, Estar and Describing People" — pencil still life: a round hand mirror standing in
   a little wooden stand (who you are, how you look), a pair of round glasses folded in front, and
   an umbrella lying closed (how you are today: sunny or rainy). No faces: the mirror shows only
   soft reflected light. */
#define CAM_POS vec3(-0.2562,0.2323,-0.5182)
#define CAM_TGT vec3(-0.0801,0.0184,0.0353)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define MR vec3(-.04,0.,.07)
vec3 mrQ(vec3 p){ vec3 q=place(p,MR,.35); return q; }
float mirrorD(vec3 p){ vec3 q=mrQ(p);
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.05,.008,.03),.004);
  float posts=sdCylY(vec3(abs(q.x)-.058,q.y-.07,q.z),.004,.07);
  float feet=sdRBox(vec3(abs(q.x)-.058,q.y-.004,q.z),vec3(.008,.004,.025),.002);
  vec3 m=q-vec3(0.,.1,0.); m.yz=rot(.15)*m.yz;
  float frame=max(length(vec2(length(m.xy)-.05,m.z))-.006,0.);
  float glass=max(length(m.xy)-.05,abs(m.z)-.003);
  float pins=sdCylX(q-vec3(0.,.1,0.),.003,.06);
  return min(min(min(base,posts),feet),min(min(frame,glass),pins)); }
vec3 glQ(vec3 p){ vec3 q=p-vec3(.1,.0,-.1); q.xz=rot(-.35)*q.xz; return q; }
float glassesD(vec3 p){ vec3 q=glQ(p);
  vec3 f=q-vec3(0.,.02,0.); f.yz=rot(-.25)*f.yz;
  vec3 e=vec3(abs(f.x)-.028,f.y,f.z);
  float rim=sdTorus(e.xzy,.02,.002);
  float bridge=sdCapsule(f,vec3(-.009,.006,0.),vec3(.009,.006,0.),.0017);
  float t1=sdCapsule(f,vec3(.048,.004,.003),vec3(-.03,.004,.012),.0016);
  float t2=sdCapsule(f,vec3(-.048,.0,.004),vec3(.03,-.002,.02),.0016);
  return min(min(rim,bridge),min(t1,t2)); }
vec3 umQ(vec3 p){ vec3 q=p-vec3(.14,.018,.03); q.xz=rot(2.75)*q.xz; return q; }   /* along x, tip at +x */
float umbD(vec3 p){ vec3 q=umQ(p);
  float t=clamp((q.x+.1)/.2,0.,1.);
  float canopy=length(q.yz)-.016*(1.-t)-.002; canopy=max(canopy,abs(q.x)-.1);
  canopy+=.0015*smoothstep(.3,.9,abs(sin(atan(q.z,q.y)*4.)))*(1.-t);
  float shaft=sdCapsule(q,vec3(-.16,0.,0.),vec3(.13,0.,0.),.0025);
  vec3 h=q-vec3(-.17,0.,.0); float hook=max(length(vec2(length(h.xz-vec2(0.,.014))-.014,h.y))-.005,h.x);
  float grip=sdCapsule(q,vec3(-.17,0.,0.),vec3(-.14,0.,0.),.0065);
  float strap=sdRBox(q-vec3(-.02,0.,.0),vec3(.004,.018,.018),.002);
  return min(min(canopy,shaft),min(min(hook,grip),strap)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mirrorD(p),3.);
  r=U(r,glassesD(p),4.);
  r=U(r,umbD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=mrQ(p); vec3 m=q-vec3(0.,.1,0.); m.yz=rot(.15)*m.yz; if(length(m.xy)<.046&&m.z<0.) return .95-.25*smoothstep(.0,.04,m.x+m.y*.5+.02)*0.+(-.25*step(.01,m.x-m.y*.6))*1.; return .45+.12*grain(q,70.); }
  if(id==4.) return .25;
  if(id==5.){ vec3 q=umQ(p); if(q.x<-.13) return .35; return .45; }
  return .7; }
