/* FACS project 9 "Homemade pizza from fresh dough" — pencil still life: a whole round pizza on
   its pan, puffed hand-stretched crust, bubbling cheese with pepperoni and pepper rings, cut in
   eight with one slice pulled out a little, and a pizza-cutter wheel lying beside the pan. */
#define CAM_POS vec3(-0.2593,0.3722,-0.5880)
#define CAM_TGT vec3(-0.0807,-0.0383,0.0759)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define PC vec3(-.01,0.,.04)
#define PR .155
/* move the pulled-out slice (sector between angles -.39 and .39 about +x toward the viewer) */
vec3 pzL(vec3 p){ vec3 q=p-PC; float a=atan(q.z,q.x);
  if(abs(a+.6)<.3927) q-=vec3(cos(-.6),0.,sin(-.6))*.028;
  return q; }
float sectorCut(vec3 q){ float a=atan(q.z,q.x); float k=6.2832/8.; float aa=mod(a+.6+k*.5,k)-k*.5;
  return abs(sin(aa))*length(q.xz)-.0012; }
float pan(vec3 p){ vec3 q=p-PC; float d=sdCylY(q-vec3(0.,.003,0.),PR+.012,.003)-.001;
  d=min(d,sdTorus(q-vec3(0.,.006,0.),PR+.012,.0035)); return d; }
float crust(vec3 p){ vec3 q=pzL(p); float r=length(q.xz);
  float base=sdCylY(q-vec3(0.,.012,0.),PR,.0045)-.002;
  float rim=sdTorus(q-vec3(0.,.016,0.),PR-.008,.0095+.0015*sin(atan(q.z,q.x)*11.));
  float d=min(base,rim); d=max(d,-sectorCut(q)+.0);
  d=max(d,r-PR-.004);
  return d+.0006*vn3(q*400.); }
float cheese(vec3 p){ vec3 q=pzL(p); float r=length(q.xz);
  float d=max(r-PR+.018-.004*sin(atan(q.z,q.x)*9.),abs(q.y-.019)-.003);
  d-=.0022*smoothstep(.5,.85,vn3(q*230.));
  return max(d,-sectorCut(q))*.8; }
vec2 tops(vec3 p){ vec3 q=pzL(p); vec2 r=vec2(1e5,5.);
  for(int i=0;i<11;i++){ float fi=float(i); float a=fi*2.4+.3; float rr=.03+.09*fract(fi*.618);
    vec3 k=q-vec3(rr*cos(a),.0235,rr*sin(a));
    if(i<7) r=U(r,sdCylY(k,.0135,.0015)-.001,5.);
    else { vec3 m=k; m.xz=rot(a)*m.xz; r=U(r,max(abs(length(m.xz*vec2(1.,1.35))-.011)-.0022,abs(m.y)-.0014),6.); } }
  r.x=max(r.x,-sectorCut(q));
  return r; }
float cutter(vec3 p){ vec3 q=p-vec3(.22,0.,-.06); q.xz=rot(-.5)*q.xz;
  vec3 w=q-vec3(-.035,.004,0.); w.xy=rot(1.5708)*w.xy;
  float wheel=max(length(w.xz)-.03,abs(w.y)-.0012);
  float hub=sdCylY(w,.008,.0045);
  float arm=sdRBox(q-vec3(-.01,.009,.0055),vec3(.03,.004,.0015),.0015);
  float grip=sdCapsule(q,vec3(.015,.011,.0),vec3(.1,.013,0.),.009);
  return min(min(wheel,hub),min(arm,grip)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pan(p),3.);
  vec3 q=p-PC; float bd=sdCylY(q-vec3(0.,.018,0.),PR+.035,.015);
  if(bd>.01) r.x=min(r.x,bd);
  else { r=U(r,crust(p),4.); r=U(r,cheese(p),7.); r=U(r,tops(p)); }
  r=U(r,cutter(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .55;
  if(id==4.) return .66-.12*vn3(p*300.);
  if(id==7.) return .9-.25*step(.7,vn3(p*380.));
  if(id==5.) return .3+.1*step(.8,vn3(p*900.));
  if(id==6.) return .5;
  if(id==8.){ vec3 q=p-vec3(.22,0.,-.06); q.xz=rot(-.5)*q.xz; return q.x>.01?.4:.8; }
  return .7; }
