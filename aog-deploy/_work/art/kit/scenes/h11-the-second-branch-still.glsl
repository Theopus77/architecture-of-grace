/* Room h11 "The Second Branch" (the presidency) — pencil still life of the signing desk: a
   desk pen stand with a fountain pen set at an angle, a bill lying ready for a signature
   (hint-lines and a signature line only), and a wooden rubber stamp beside its open ink pad. */
#define CAM_POS vec3(-0.4092,0.5412,-0.7867)
#define CAM_TGT vec3(-0.2426,-0.0141,0.0686)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
vec3 stQ(vec3 p){ return place(p,vec3(-.02,0.,.11),-.1); }
float standD(vec3 q){ float b=sdRBox(q-vec3(0.,.016,0.),vec3(.1,.016,.05),.008);
  b=smin(b,sdRBox(q-vec3(0.,.034,0.),vec3(.085,.004,.038),.004),.004);
  float cup=sdCylY(q-vec3(-.04,.045,0.),.012,.012)-.002;
  cup=max(cup,-sdCylY(q-vec3(-.04,.06,0.),.007,.02));
  float cup2=sdCylY(q-vec3(.04,.045,0.),.012,.012)-.002;
  cup2=max(cup2,-sdCylY(q-vec3(.04,.06,0.),.007,.02));
  return min(b,min(cup,cup2)); }
float penAt(vec3 q,vec3 a,vec3 dir,float L){ float d=sdCapsule(q,a+dir*.012,a+dir*L,.0065);
  d=min(d,sdCylAB(q,a+dir*(L*.55),a+dir*(L*.6),.0075));
  float nib=sdCapsule(q,a,a+dir*.014,.0035);
  return min(d,nib); }
float pensD(vec3 q){ return min(penAt(q,vec3(-.04,.05,0.),normalize(vec3(-.35,1.,.3)),.15),penAt(q,vec3(.04,.05,0.),normalize(vec3(.3,1.,.35)),.14)); }
vec3 dcQ(vec3 p){ return place(p,vec3(-.02,0.,-.03),.12); }
float docD(vec3 q){ return sdRBox(q-vec3(0.,.0015,0.),vec3(.1,.0012,.07),.0008); }
#define SC vec3(.15,0.,-.04)
float stampD(vec3 p){ vec3 q=p-SC;
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.03,.008,.02),.003);
  float rubber=sdRBox(q-vec3(0.,.003,0.),vec3(.028,.003,.018),.001);
  float neck=sdCylY(q-vec3(0.,.035,0.),.008+.004*smoothstep(.05,.03,q.y),.018);
  float knob=sdEll(q-vec3(0.,.065,0.),vec3(.018,.015,.018));
  return min(min(base,rubber),min(neck,knob)); }
vec3 ipQ(vec3 p){ return place(p,vec3(.15,0.,.07),-.3); }
float padD(vec3 q){ float t=sdRBox(q-vec3(0.,.008,0.),vec3(.045,.008,.03),.003);
  t=max(t,-sdBox(q-vec3(0.,.016,0.),vec3(.04,.004,.025)));
  float felt=sdBox(q-vec3(0.,.012,0.),vec3(.04,.0015,.025));
  vec3 l=q-vec3(0.,.016,.03); l.yz=rot(-1.3)*l.yz;
  float lid=sdRBox(l-vec3(0.,.0,.03),vec3(.046,.0025,.031),.002);
  return min(min(t,felt),lid); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 s=stQ(p);
  r=U(r,standD(s),3.);
  r=U(r,pensD(s),4.);
  r=U(r,docD(dcQ(p)),5.);
  r=U(r,stampD(p),6.);
  r=U(r,padD(ipQ(p)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55+.2*fbm3(p*60.);
  if(id==4.) return .28;
  if(id==5.){ vec3 q=dcQ(p); if(q.y<.002) return .8; vec2 u=q.xz;
    if(abs(u.y-.045)<.003&&abs(u.x)<.05) return .45;
    if(u.y<.03&&u.y>-.03&&abs(u.x)<.08&&fract((u.y+.1)/.012)<.18){ float e=fract(sin(floor((u.y+.1)/.012)*7.3)*91.)*.04; if(u.x<.08-e) return .62; }
    if(abs(u.y+.05)<.0012&&u.x>.0&&u.x<.08) return .3;
    return .96; }
  if(id==6.){ vec3 q=p-SC; if(q.y<.006) return .25; if(q.y<.022) return .6+.08*grain(p,90.); return .45+.08*grain(p,90.); }
  if(id==7.){ vec3 q=ipQ(p); if(abs(q.y-.0135)<.001&&abs(q.x)<.04&&abs(q.z)<.025) return .2; return .55; }
  return .7; }
