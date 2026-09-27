/* FACS project 2 "Sew a button onto a felt card" — pencil still life: a square felt card leaning
   back, a big two-hole button sewn on its middle with thick yarn, the yarn running down to a large
   plastic needle with a big eye on the table, and a ball of yarn behind. */
#define CAM_POS vec3(-0.4442,0.3840,-0.7588)
#define CAM_TGT vec3(-0.2049,0.0203,0.1318)
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
#define CB vec3(-.04,0.,.0)
#define TH .38
#define YB vec3(.13,.058,.13)
#define NB vec3(.1,0.,-.11)
/* card-local coordinates: u across, v up the card, w out of its face toward the viewer */
vec3 cardUVW(vec3 p){ vec3 q=p-CB; float c=cos(TH),s=sin(TH);
  return vec3(q.x,q.y*c+q.z*s,q.y*s-q.z*c); }
vec3 cardPt(vec3 l){ float c=cos(TH),s=sin(TH); return CB+vec3(l.x,l.y*c+l.z*s,l.y*s-l.z*c); }
float card(vec3 p){ vec3 l=cardUVW(p);
  float d=sdRBox(l-vec3(0.,.092,-.0035),vec3(.09,.09,.0035),.0025);
  return d+.0007*fbm(l.xy*160.); }
float button(vec3 p){ vec3 l=cardUVW(p)-vec3(0.,.095,.0);
  vec3 b=vec3(l.x,l.z-.0045,l.y);
  float d=sdCylY(b,.037,.0035)-.0015;
  d=max(d,-sdCylY(b-vec3(0.,.005,0.),.029,.0018));
  d=max(d,-(length(vec2(abs(l.x)-.013,l.y))-.0055));
  return d; }
float yarn(vec3 p){ vec3 l=cardUVW(p);
  /* two passes of yarn over the bar between the holes */
  float d=sdCapsule(l,vec3(-.013,.0975,.0062),vec3(.013,.0975,.0066),.0022);
  d=min(d,sdCapsule(l,vec3(-.013,.0925,.0062),vec3(.013,.0925,.0066),.0022));
  /* the tail comes round the bottom edge and runs to the needle eye */
  vec3 a=cardPt(vec3(.05,.004,.004)), b=vec3(.03,.004,-.08), e=NB+vec3(0.,.006,0.); e.xz+=rot(-.35)*vec2(-.07,0.);
  d=min(d,sdCapsule(p,cardPt(vec3(.03,.06,-.008)),a+vec3(0.,.0,.004),.0026));
  d=min(d,sdCapsule(p,a+vec3(0.,.0,.004),b,.0026));
  d=min(d,sdCapsule(p,b,e,.0026));
  return d+.0008*sin(dot(p,vec3(1.,1.,1.))*1400.); }
float needle(vec3 p){ vec3 q=p-NB-vec3(0.,.005,0.); q.xz=rot(.35)*q.xz;
  float body=sdCapsule(q,vec3(-.07,0.,0.),vec3(.065,0.,0.),.006);
  body=smin(body,sdEll(q-vec3(-.07,0.,0.),vec3(.02,.005,.0095)),.005);
  float tip=sdEll(q-vec3(.068,0.,0.),vec3(.02,.0055,.0055));
  float d=min(body,tip);
  d=max(d,-sdRBox(q-vec3(-.071,0.,0.),vec3(.012,.02,.0032),.003));
  return d; }
float ball(vec3 p){ vec3 q=p-YB; float r=length(q);
  vec3 a=q; a.xy=rot(.7)*a.xy; float g=abs(sin(atan(a.y,a.z)*26.));
  return r-.058+.0012*g; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,card(p),3.);
  r=U(r,button(p),4.);
  r=U(r,yarn(p)*.9,5.);
  r=U(r,needle(p),6.);
  r=U(r,ball(p),7.);
  r=U(r,sdCapsule(p,YB+vec3(-.04,-.04,-.02),YB+vec3(-.07,-.057,-.05),.0032),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 l=cardUVW(p); float m=max(abs(l.x),abs(l.y-.092));
    return .68+.06*fbm(l.xy*90.)-(abs(m-.078)<.0012&&fract((l.x+l.y)*70.)<.5?.25:0.); }
  if(id==4.){ vec3 l=cardUVW(p)-vec3(0.,.095,0.); return length(l.xy)>.026?.5:.62; }
  if(id==5.) return .42+.12*sin(dot(p,vec3(1.,1.,1.))*1400.);
  if(id==6.) return .82;
  if(id==7.){ vec3 q=p-YB; vec3 a=q; a.xy=rot(.7)*a.xy; vec3 b=q; b.yz=rot(1.1)*b.yz; return .5+.1*sin(atan(a.y,a.z)*26.)+.1*sin(atan(b.x,b.y)*22.); }
  return .7; }
