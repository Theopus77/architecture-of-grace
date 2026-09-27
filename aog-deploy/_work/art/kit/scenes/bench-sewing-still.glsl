/* FCS bench "The Sewing Table" (fcs-shop.html) — a sewing machine on a table with the hand-sewing
   kit around it, drawn at 1600x1000 so each part can be tapped (pencil/bench.py reads the ids).
   3 machine body  4 handwheel  5 needle  6 spool on the spool pin (and its thread)  7 cloth
   8 pincushion  9 spool of hand thread  10 scissors  11 buttons  12 hand needle and thread
   13 embroidery hoop  14 take-up lever  15 presser foot  16 needle plate and bobbin cover
   17 stitch dial  18 foot pedal  19 tension dial  */
#define CAM_POS vec3(0.03,0.92,-1.02)
#define CAM_TGT vec3(0.03,0.06,0.02)
#define CAM_FOV 38.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
/* ---- the machine, modelled at 1/1.7 scale and scaled up ---- */
#define SM vec3(.0,0.,.17)
#define K 2.1
vec3 smQ(vec3 p){ vec3 q=p-SM; q.xz=rot(-.12)*q.xz; return q/K; }
float bodyD(vec3 q){
  float bed=sdRBox(q-vec3(0.,.018,0.),vec3(.16,.018,.07),.008);
  float pil=sdRBox(q-vec3(.1,.08,0.),vec3(.04,.06,.035),.018);
  float arm=sdRBox(q-vec3(-.01,.15,0.),vec3(.14,.022,.03),.02);
  float head=sdRBox(q-vec3(-.125,.115,0.),vec3(.03,.055,.03),.014);
  return smin(bed,smin(smin(pil,arm,.03),head,.02),.012); }
float wheelD(vec3 q){ vec3 w=q-vec3(.165,.12,0.); float d=sdCylX(w,.045,.008)-.002; d=max(d,-(sdCylX(w,.034,.02)));
  d=min(d,sdCylX(w,.012,.012)); for(int i=0;i<4;i++){ vec3 s=w; s.yz=rot(float(i)*.785)*s.yz; d=min(d,sdBox(s,vec3(.006,.036,.004))); }
  return d; }
float needleD(vec3 q){ float d=sdCylY(q-vec3(-.13,.062,-.014),.0034,.014);
  d=min(d,sdCylY(q-vec3(-.13,.041,-.014),.0009,.008)); return d; }
float footD(vec3 q){ float d=sdRBox(q-vec3(-.13,.0395,-.02),vec3(.007,.0016,.012),.001);
  d=min(d,sdCylY(q-vec3(-.12,.053,-.008),.0024,.015)); return d; }
float plateD(vec3 q){ float d=sdRBox(q-vec3(-.1,.0362,-.03),vec3(.04,.0012,.035),.001);
  d=max(d,-sdBox(q-vec3(-.13,.036,-.02),vec3(.006,.003,.0025))); return d; }
float takeupD(vec3 q){ vec3 t=q-vec3(-.14,.15,-.033); float d=sdRBox(t,vec3(.014,.0035,.004),.002);
  return max(d,-sdBox(t-vec3(-.006,0.,0.),vec3(.004,.0012,.01))); }
float tensionD(vec3 q){ vec3 t=q-vec3(-.125,.118,-.032); float d=sdCylZ(t,.011,.004)-.001;
  return min(d,sdCylZ(t-vec3(0.,0.,-.005),.004,.003)); }
float dialD(vec3 q){ vec3 t=q-vec3(.1,.095,-.036); float d=sdCylZ(t,.02,.004)-.002;
  return min(d,sdRBox(t-vec3(0.,0.,-.006),vec3(.003,.014,.002),.001)); }
float spoolOn(vec3 q){ vec3 s=q-vec3(.02,.172,0.); float d=sdCylY(s-vec3(0.,.015,0.),.012,.015)-.001;
  d=min(d,sdCylY(s-vec3(0.,.002,0.),.016,.002)); d=min(d,sdCylY(s-vec3(0.,.029,0.),.016,.002)); d=min(d,sdCylY(s-vec3(0.,.02,0.),.002,.025));
  return d; }
/* the top thread: spool, the guide on the arm, the take-up lever, down to the needle */
float threadD(vec3 q){ float d=sdCapsule(q,vec3(.008,.19,-.004),vec3(-.12,.176,-.03),.0007);
  d=min(d,sdCapsule(q,vec3(-.12,.176,-.03),vec3(-.15,.152,-.036),.0007));
  return min(d,sdCapsule(q,vec3(-.15,.152,-.036),vec3(-.13,.064,-.018),.0007)); }
float clothD(vec3 q){ vec3 c=q-vec3(-.175,.038,-.035); c.xz=rot(.25)*c.xz; return sdRBox(c,vec3(.075,.0012,.05),.001)+.0015*sin(c.x*60.)*sin(c.z*50.); }
/* ---- a foot pedal with its cord ---- */
float pedalD(vec3 p){ vec3 q=place(p,vec3(.66,0.,.26),.35);
  vec3 t=q-vec3(0.,.03,0.); t.yz=rot(.18)*t.yz;
  float d=sdRBox(t,vec3(.07,.018,.1),.02);
  d=min(d,sdRBox(q-vec3(0.,.006,0.),vec3(.075,.006,.105),.006));
  vec3 a=q-vec3(-.07,.01,.08); float cord=sdCapsule(q,vec3(-.06,.01,.09),vec3(-.2,.004,.18),.005);
  return min(d,cord); }
/* ---- the hand-sewing kit ---- */
#define PC vec3(-.6,0.,.2)
float cushion(vec3 p){ vec3 q=p-PC-vec3(0.,.05,0.); float a=atan(q.z,q.x);
  float d=sdEll(q,vec3(.075,.05,.075)); d+=.004*pow(abs(sin(a*4.)),.3)*smoothstep(.0,.04,length(q.xz))-.002; d*=.8;
  vec3 c=p-PC-vec3(0.,.1,0.); float r=.028+.012*pow(abs(cos(atan(c.z,c.x)*2.5)),3.);
  d=min(d,max(length(c.xz)-r,abs(c.y)-.003)-.001);
  vec3 s=p-PC-vec3(0.,.05,0.); for(int i=0;i<6;i++){ float fi=float(i); float a2=fi*2.4+.3; float el=.35+.35*fract(fi*.618);
    vec3 dir=normalize(vec3(cos(a2)*cos(el),sin(el)+.2,sin(a2)*cos(el)));
    vec3 b=dir*vec3(.07,.048,.07)*.95; vec3 e=b+dir*.035;
    d=min(d,sdCapsule(s,b,e,.0011)); d=min(d,length(s-e)-.0055); }
  return d; }
#define SP vec3(-.48,0.,-.2)
float spool(vec3 p){ vec3 q=p-SP;
  float f1=sdCylY(q-vec3(0.,.005,0.),.03,.005)-.001, f2=sdCylY(q-vec3(0.,.075,0.),.03,.005)-.001;
  float core=sdCylY(q-vec3(0.,.04,0.),.024+.0006*sin(q.y*1800.),.029);
  return max(min(min(f1,f2),core),-sdCylY(q,.005,.2)); }
vec3 nQ(vec3 p){ vec3 q=p-vec3(-.28,.002,-.3); q.xz=rot(-.2)*q.xz; return q; }
float needle(vec3 p){ vec3 q=nQ(p)/1.5;
  float t=clamp((q.x+.04)/.08,0.,1.);
  float n=sdCapsule(q,vec3(-.04,0.,0.),vec3(.04,0.,0.),.0016*(1.-t*.8));
  float eye=sdTorus((q-vec3(-.036,0.,0.)).xzy,.0025,.0008);
  vec3 w=q-vec3(-.036,0.,0.); float s=w.x; float c=.02*sin(clamp(-s/.1,0.,1.)*3.1);
  float th=max(length(vec2(w.y-.0005,w.z-c))-.0009,max(s,-s-.1));
  return min(min(n,eye),th)*1.5; }
vec3 scQ(vec3 p){ vec3 q=p-vec3(.27,.005,-.3); q.xz=rot(-.3)*q.xz; return q/2.; }
float scissors(vec3 p){ vec3 q=scQ(p); float d=1e5;
  for(int s=0;s<2;s++){ float sg=s==0?1.:-1.; vec3 k=q; k.xz=rot(sg*.3)*k.xz; k.y-=float(s)*.004;
    vec3 b=k-vec3(.045,0.,0.); float w=.008*(1.-clamp(b.x/.05,0.,1.))+.0012;
    float blade=max(max(abs(b.z)-w,abs(b.y)-.0016),abs(b.x)-.048);
    float ring=sdTorus(k-vec3(-.034,0.,sg*.004),.012,.0032);
    float arm=sdCapsule(k,vec3(0.),vec3(-.022,0.,sg*.01),.003);
    d=min(d,min(blade,min(ring,arm))); }
  return min(d,sdCylY(q,.003,.004))*2.; }
float button(vec3 p,vec3 c,float r){ vec3 q=p-c; float d=sdCylY(q-vec3(0.,.004,0.),r,.003)-.001;
  d=max(d,-(sdTorus(q-vec3(0.,.008,0.),r*.7,.0012)));
  vec2 h=abs(q.xz)-vec2(r*.25); return max(d,-(length(h)-r*.1)); }
float buttonsD(vec3 p){ return min(min(button(p,vec3(.06,0.,-.29),.022),button(p,vec3(.12,0.,-.24),.018)),button(p,vec3(.1,0.,-.33),.015)); }
#define HP vec3(.56,0.,-.14)
float hoopD(vec3 p){ vec3 q=p-HP;
  float inner=sdTorus(q-vec3(0.,.007,0.),.1,.006);
  float outer=sdTorus(q-vec3(0.,.012,0.),.108,.007);
  float cloth=sdCylY(q-vec3(0.,.013,0.),.1,.0008);
  float screw=sdCapsule(q,vec3(.108,.012,0.),vec3(.135,.012,0.),.006);
  return min(min(inner,outer),min(cloth,screw)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.5-p.z,2.);
  vec3 q=smQ(p);
  r=U(r,bodyD(q)*K,3.);
  r=U(r,wheelD(q)*K,4.);
  r=U(r,needleD(q)*K,5.);
  r=U(r,spoolOn(q)*K,6.);
  r=U(r,threadD(q)*K,22.);
  r=U(r,clothD(q)*K,7.);
  r=U(r,cushion(p),8.);
  r=U(r,spool(p),9.);
  r=U(r,scissors(p),10.);
  r=U(r,buttonsD(p),11.);
  r=U(r,needle(p),12.);
  r=U(r,hoopD(p),13.);
  r=U(r,takeupD(q)*K,14.);
  r=U(r,footD(q)*K,15.);
  r=U(r,plateD(q)*K,16.);
  r=U(r,dialD(q)*K,17.);
  r=U(r,pedalD(p),18.);
  r=U(r,tensionD(q)*K,19.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7+.06*grain(p,14.);
  if(id==2.) return .9;
  if(id==3.){ vec3 q=smQ(p); if(q.y<.036&&q.y>.03&&q.z<-.06) return .4; if(abs(q.y-.15)<.003&&q.z<-.02) return .6; return .8; }
  if(id==4.) return .5;
  if(id==5.) return .6;
  if(id==6.){ return (n.y>.6||n.y<-.6)?.6:(fract(p.y/.003)<.4?.35:.55); }
  if(id==7.){ vec3 c=smQ(p)-vec3(-.175,.038,-.035); c.xz=rot(.25)*c.xz; if(abs(c.z+.012)<.0015&&c.x>-.01&&fract(c.x/.008)<.6) return .3; return .8; }
  if(id==8.){ vec3 q=p-PC; if(q.y>.095) return .45; float a=atan(q.z,q.x); return fract(a*4./3.1416+.5)<.06?.4:.6; }
  if(id==9.){ vec3 q=p-SP; if(q.y<.011||q.y>.069) return .72; return fract(q.y/.0035)<.3?.35:.55; }
  if(id==10.) return .5;
  if(id==11.) return .62;
  if(id==12.) return .4;
  if(id==13.){ vec3 q=p-HP; if(length(q.xz)<.095&&q.y<.015){ /* a row of running stitches on the cloth */
      if(abs(q.z)<.002&&abs(q.x)<.07&&fract(q.x/.02)<.55) return .25; return .93; } return .6; }
  if(id==14.) return .45;
  if(id==15.) return .55;
  if(id==16.){ vec3 q=smQ(p); return (abs(q.x+.085)<.0012||abs(q.x+.075)<.0012||abs(q.x+.065)<.0012)?.3:.72; }
  if(id==22.) return .3;
  if(id==17.) return .4;
  if(id==18.) return .35;
  if(id==19.) return .45;
  return .7; }
