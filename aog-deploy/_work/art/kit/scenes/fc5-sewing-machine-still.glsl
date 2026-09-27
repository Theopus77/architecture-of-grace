/* Practice room "The Sewing Machine" — pencil still life: a classic sewing machine (bed, pillar,
   arm, needle over a piece of cloth, hand wheel, a spool on its pin), a pincushion and a spool. */
#define CAM_POS vec3(-0.3565,0.4067,-0.7857)
#define CAM_TGT vec3(-0.2222,-0.0253,0.1145)
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
#define SM vec3(.0,0.,.06)
#define PC vec3(-.2,0.,-.07)
#define SPL vec3(.2,0.,-.09)
vec3 smQ(vec3 p){ vec3 q=p-SM; q.xz=rot(-.12)*q.xz; return q; }
float bodyD(vec3 q){
  float bed=sdRBox(q-vec3(0.,.018,0.),vec3(.16,.018,.07),.008);
  float pil=sdRBox(q-vec3(.1,.08,0.),vec3(.04,.06,.035),.018);
  float arm=sdRBox(q-vec3(-.01,.15,0.),vec3(.14,.022,.03),.02);
  float head=sdRBox(q-vec3(-.125,.115,0.),vec3(.03,.055,.03),.014);
  return smin(bed,smin(smin(pil,arm,.03),head,.02),.012); }
float wheelD(vec3 q){ vec3 w=q-vec3(.165,.12,0.); float d=sdCylX(w,.045,.008)-.002; d=max(d,-(sdCylX(w,.034,.02)));
  d=min(d,sdCylX(w,.012,.012)); for(int i=0;i<4;i++){ vec3 s=w; s.yz=rot(float(i)*.785)*s.yz; d=min(d,sdBox(s,vec3(.006,.036,.004))); }
  return d; }
float needleD(vec3 q){ float d=sdCylY(q-vec3(-.135,.06,-.012),.0035,.012);
  d=min(d,sdCylY(q-vec3(-.135,.043,-.012),.0008,.01));
  d=min(d,sdRBox(q-vec3(-.12,.041,-.012),vec3(.012,.002,.007),.001));
  d=min(d,sdCylY(q-vec3(-.12,.058,-.008),.0025,.02));
  return d; }
float spoolOn(vec3 q){ vec3 s=q-vec3(.02,.172,0.); float d=sdCylY(s-vec3(0.,.015,0.),.012,.015)-.001;
  d=min(d,sdCylY(s-vec3(0.,.002,0.),.016,.002)); d=min(d,sdCylY(s-vec3(0.,.029,0.),.016,.002)); d=min(d,sdCylY(s-vec3(0.,.02,0.),.002,.025)); return d; }
float clothD(vec3 q){ vec3 c=q-vec3(-.1,.037,-.02); c.xz=rot(.3)*c.xz; return sdRBox(c,vec3(.07,.0012,.045),.001)+.0015*sin(c.x*60.)*sin(c.z*50.); }
float cushD(vec3 q){ float a=atan(q.z,q.x); float d=sdEll(q-vec3(0.,.028,0.),vec3(.04,.03,.04))+.002*abs(sin(a*4.)); return d; }
float pinsD(vec3 q){ float d=1e3; for(int i=0;i<3;i++){ float a=float(i)*2.1+.3; vec3 b=vec3(cos(a)*.015,.052,sin(a)*.015); vec3 t=b+vec3(cos(a)*.01,.018,sin(a)*.01);
    d=min(d,sdCapsule(q,b,t,.0008)); d=min(d,length(q-t)-.0035); } return d; }
float spoolD(vec3 q){ float d=sdCylY(q-vec3(0.,.02,0.),.017,.017)-.001; d=min(d,sdCylY(q-vec3(0.,.002,0.),.022,.002)); d=min(d,sdCylY(q-vec3(0.,.038,0.),.022,.002)); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=smQ(p);
  r=U(r,bodyD(q),3.);
  r=U(r,wheelD(q),4.);
  r=U(r,needleD(q),5.);
  r=U(r,spoolOn(q),6.);
  r=U(r,clothD(q),7.);
  r=U(r,cushD(p-PC),8.);
  r=U(r,pinsD(p-PC),5.);
  r=U(r,spoolD(p-SPL),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=smQ(p); if(q.y<.036&&q.y>.03&&q.z<-.06) return .4; if(abs(q.y-.15)<.003&&q.z<-.02) return .6; return .35; }
  if(id==4.) return .45;
  if(id==5.) return .75;
  if(id==6.){ return (n.y>.6||n.y<-.6)?.6:(fract(p.y/.002)<.4?.4:.6); }
  if(id==7.){ vec3 c=smQ(p)-vec3(-.1,.037,-.02); c.xz=rot(.3)*c.xz; if(abs(c.z+.012)<.0015&&c.x<.02) return .3; return .82; }
  if(id==8.){ vec3 q=p-PC; float a=atan(q.z,q.x); return abs(sin(a*4.))<.12?.35:.55; }
  return .7; }
