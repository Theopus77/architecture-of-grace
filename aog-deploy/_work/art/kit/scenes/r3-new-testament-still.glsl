/* Practice room "The Biblical Lens II: The New Testament" — pencil still life: a thick
   leather-bound codex with four ribbon markers hanging from it (four parts of one collection),
   a bundle of rolled letters tied with a cord, and a clay ink pot with a reed pen. Objects only;
   no writing, no figures. */
#define CAM_POS vec3(-0.2956,0.2903,-0.6323)
#define CAM_TGT vec3(-0.1874,-0.0582,0.0938)
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
#define BK vec3(-.02,0.,.05)
#define BS vec3(.1,.035,.075)
#define RL vec3(-.16,0.,-.08)
#define INK vec3(.16,0.,-.06)
vec3 bkQ(vec3 p){ vec3 q=p-BK; q.xz=rot(-.25)*q.xz; return q; }
float ribbonsD(vec3 q){ float d=1e3; for(int i=0;i<4;i++){ float x=-.05+float(i)*.03; float L=.045+.015*float(i%2);
    vec3 r=q-vec3(x,0.,0.); r.x*=1.8;             /* flattened: ribbons are wide and thin */
    vec3 a=vec3(0.,2.*BS.y-.001,-BS.z+.002), m=vec3(0.,.004,-BS.z-.008), e=vec3(0.,.0015,-BS.z-L);
    d=min(d,min(sdCapsule(r,a,m,.0028),sdCapsule(r,m,e,.0022))*.55); }
  return d; }
float bossD(vec3 q){ float d=1e3; for(int i=0;i<2;i++) for(int k=0;k<2;k++){ d=min(d,length(q-vec3((float(i)-.5)*1.6*BS.x,2.*BS.y+.001,(float(k)-.5)*1.6*BS.z))-.006); }
  return d; }
vec3 rlQ(vec3 p){ vec3 q=p-RL; q.xz=rot(.5)*q.xz; return q; }
float rollsD(vec3 q){ float d=1e3; for(int i=0;i<3;i++){ vec3 c=q-vec3(0.,i==2?.034:.0145,(float(i)-.5)*.029*(i==2?0.:1.)-(i==2?0.:0.)); if(i<2) c.z=q.z-(float(i)-.5)*.03;
    d=min(d,max(length(c.yz)-.0145,abs(c.x)-.065+float(i)*.006)); } return d; }
float cordD(vec3 q){ return sdTorus((q-vec3(.01,.025,0.)).yxz*vec3(1.,1.,1.),.028,.0018); }
float inkD(vec3 q){ float d=sdEll(q-vec3(0.,.025,0.),vec3(.03,.028,.03)); d=max(d,q.y-.045); d=min(d,sdCylY(q-vec3(0.,.048,0.),.014,.005)-.002);
  d=max(d,-sdCylY(q-vec3(0.,.05,0.),.009,.01)); return d; }
float penD(vec3 q){ return sdCapsule(q,vec3(0.,.03,0.),vec3(-.05,.15,.02),.0028); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 b=bkQ(p);
  r=U(r,bookD(b,BS),3.);
  r=U(r,bossD(b),4.);
  r=U(r,ribbonsD(b),5.);
  vec3 l=rlQ(p);
  r=U(r,rollsD(l),6.);
  r=U(r,cordD(l),5.);
  r=U(r,inkD(p-INK),7.);
  r=U(r,penD(p-INK),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 b=bkQ(p); if(b.y>2.*BS.y-.002){ vec2 u=b.xz; if(abs(abs(u.x)-.07)<.0022&&abs(u.y)<.05||abs(abs(u.y)-.05)<.0022&&abs(u.x)<.07) return .25;
      if(abs(abs(u.x)-.058)<.0015&&abs(u.y)<.04||abs(abs(u.y)-.04)<.0015&&abs(u.x)<.058) return .3; return .45; }
    if(b.x>-BS.x+.01&&b.y<2.*BS.y-.004&&b.y>.004) return .9; return .4; }
  if(id==4.) return .6;
  if(id==5.) return .35;
  if(id==6.){ vec3 l=rlQ(p); if(abs(l.x)>.055) return .6; return .85-.06*fbm(l.xy*80.); }
  if(id==7.) return .55;
  if(id==8.) return .6;
  return .7; }
