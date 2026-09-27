/* Practice room "Soy and Estoy — Who I Am, How I Am" — pencil still life: two matching bud vases
   each holding the same kind of tulip, one standing up fresh and one drooping (the same flower,
   a different state), and a round hand mirror lying in front (who I am). */
#define CAM_POS vec3(-0.3536,0.4392,-0.8662)
#define CAM_TGT vec3(-0.2081,-0.0295,0.1105)
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
#define V1 vec3(-.08,0.,.06)
#define V2 vec3(.08,0.,.07)
#define MR vec3(.02,.006,-.1)
float vaseD(vec3 q){ float r=.02+.012*sin(clamp(q.y/.09,0.,1.)*2.6)-.006*smoothstep(.06,.09,q.y); float d=max(length(q.xz)-r,abs(q.y-.045)-.045)*.8; d=max(d,-sdCylY(q-vec3(0.,.09,0.),.006,.02)); return d; }
/* stem from the vase mouth: straight up for the fresh tulip, arching over for the tired one */
vec3 stemP(float t,float droop){ float a=droop*t*2.3; return vec3((1.-cos(a))*.075*droop+.0,.085+(droop>0.?sin(a)*.075:.11*t),0.); }
float tulipD(vec3 q,float droop,out float part){ float d=1e3; part=0.;
  for(int i=0;i<8;i++){ float t0=float(i)/8., t1=float(i+1)/8.; d=min(d,sdCapsule(q,stemP(t0,droop),stemP(t1,droop),.0024)); }
  vec3 top=stemP(1.,droop); vec3 up=normalize(stemP(1.,droop)-stemP(.85,droop));
  vec3 h=q-top; vec3 w=normalize(cross(up,vec3(0.,0.,1.))); vec3 z=cross(w,up);
  vec3 l=vec3(dot(h,w),dot(h,up),dot(h,z));                     /* flower frame: y along the stem */
  float cb=length(l-vec3(0.,.02,0.))-.035; float cup=cb>.01?cb:sdEll(l-vec3(0.,.02,0.),vec3(.016,.024,.016));
  float a=atan(l.z,l.x); float notch=(l.y-.03)-.008*abs(sin(a*1.5));   /* three petal tips */
  cup=max(cup,notch); cup=max(cup,-sdEll(l-vec3(0.,.03,0.),vec3(.011,.02,.011)));
  if(cup<d){ d=cup; part=1.; }
  vec3 lf=q-vec3(0.,.085,0.); lf.xy=rot(droop>0.?-.25:.3)*lf.xy; lf.z-=lf.y*lf.y*1.5;
  float bnd=length(lf-vec3(0.,.04,0.))-.05; float leaf=bnd>.01?bnd:max(sdEll(lf-vec3(0.,.04,.0),vec3(.003,.045,.009))*.5,-lf.y);
  if(leaf*.7<d){ d=leaf*.7; part=2.; }
  return d; }
vec3 mrQ(vec3 p){ vec3 q=p-MR; q.xz=rot(.5)*q.xz; return q; }
float mirrorD(vec3 q){ float d=sdCylY(q,.04,.005)-.002; d=min(d,sdCapsule(q,vec3(.045,0.,0.),vec3(.1,0.,0.),.007)); return d; }
float glassD(vec3 q){ return sdCylY(q-vec3(0.,.005,0.),.034,.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 a=place(p,V1,-.4), b=place(p,V2,-.4);
  r=U(r,min(vaseD(a),vaseD(b)),3.);
  float pa,pb; float ta=tulipD(a,0.,pa), tb=tulipD(b,1.,pb);
  float t=min(ta,tb); float pp=ta<tb?pa:pb;
  r=U(r,t,pp==1.?5.:4.);
  vec3 m=mrQ(p);
  r=U(r,mirrorD(m),6.);
  r=U(r,glassD(m),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .78;
  if(id==4.) return .5;
  if(id==5.) return .55;
  if(id==6.) return .65;
  if(id==7.){ vec3 m=mrQ(p); float s2=m.x+m.z*.6; return abs(s2-.008)<.005||abs(s2+.008)<.002?.99:.8; }
  return .7; }
