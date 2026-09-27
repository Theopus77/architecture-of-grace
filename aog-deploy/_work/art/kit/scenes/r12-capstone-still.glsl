/* Room r12 "Capstone: An Inquiry into Religion in Public Life" — pencil still life of an
   inquiry desk: a tabletop lectern with an open book on its slope (present and defend), a
   stack of three books bristling with paper bookmarks (gather the voices), and a small
   wooden box of index cards (weigh the evidence). No figures, no symbols. */
#define CAM_POS vec3(-0.2589,0.3171,-0.6814)
#define CAM_TGT vec3(-0.1440,-0.0530,0.0898)
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
vec3 lcQ(vec3 p){ return place(p,vec3(0.,0.,.08),-.25); }
#define LT .45
vec3 slQ(vec3 q){ vec3 s=q-vec3(0.,.075,0.); s.yz=rot(-LT)*s.yz; return s; }
float lecternD(vec3 q){
  float sd=max(max(-q.y,abs(q.z)-.068),q.y-(.072+.48*q.z));
  float w1=extrude(sd,q.x-.075,.007,.002);
  float w2=extrude(sd,q.x+.075,.007,.002);
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.09,.006,.075),.003);
  float top=sdRBox(slQ(q)-vec3(0.,.0,.0),vec3(.095,.005,.085),.003);
  float lip=sdRBox(slQ(q)-vec3(0.,.012,-.083),vec3(.095,.008,.004),.002);
  return min(min(min(w1,w2),base),min(top,lip)); }
vec2 obD(vec3 q){ vec3 s=slQ(q)-vec3(0.,.007,0.); float x=abs(s.x);
  float lift=.012*sin(clamp(x/.085,0.,1.)*1.9)-.008*exp(-x*55.)+.004;
  float pages=sdBox(vec3(x-.043,s.y-lift*.5,s.z),vec3(.042,max(lift*.5,.002),.07))-.001;
  float cover=sdRBox(vec3(x-.046,s.y+.001,s.z),vec3(.047,.002,.074),.001);
  return vec2(pages,cover); }
float stackD(vec3 p){ float d=1e5;
  vec3 q=place(p,vec3(.2,.018,-.03),.2); d=min(d,sdRBox(q,vec3(.08,.018,.058),.003));
  q=place(p,vec3(.2,.047,-.03),-.1); d=min(d,sdRBox(q,vec3(.072,.011,.052),.003));
  q=place(p,vec3(.2,.07,-.03),.35); d=min(d,sdRBox(q,vec3(.062,.012,.046),.003));
  return d; }
float marksD(vec3 p){ float d=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); vec3 q=place(p,vec3(.2,.07,-.03),.35);
    vec3 c=q-vec3(-.03+.03*fi,.001*fi,-.05); d=min(d,sdBox(c,vec3(.005,.0005,.014+.004*fi))); }
  return d; }
vec3 bxQ(vec3 p){ return place(p,vec3(-.17,0.,-.07),.4); }
float cardBoxD(vec3 q){ float b=sdRBox(q-vec3(0.,.025,0.),vec3(.05,.025,.035),.003);
  b=max(b,-sdBox(q-vec3(0.,.04,0.),vec3(.045,.03,.03)));
  float cards=sdBox(q-vec3(0.,.035,0.),vec3(.044,.022,.029));
  cards=max(cards,-sdBox(q-vec3(0.,.07,0.),vec3(.05,.006,.03)*vec3(1.,1.,1.)));
  float tab=sdBox(q-vec3(.01,.068,-.012),vec3(.018,.006,.0006));
  return min(b,min(cards,tab)); }
float cardsIn(vec3 q){ return sdBox(q-vec3(0.,.04,0.),vec3(.044,.024,.029)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 l=lcQ(p);
  r=U(r,lecternD(l),3.);
  vec2 b=obD(l); r=U(r,b.x,4.); r=U(r,b.y,5.);
  r=U(r,stackD(p),6.);
  r=U(r,marksD(p),7.);
  r=U(r,cardBoxD(bxQ(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5+.1*grain(p,60.);
  if(id==4.){ vec3 s=slQ(lcQ(p)); float x=abs(s.x); if(x<.004) return .7;
    if(x>.01&&x<.078&&abs(s.z)<.055&&fract((s.z+.1)/.011)<.2){ float e=fract(sin(floor((s.z+.1)/.011)*9.1+sign(s.x))*33.)*.025; if(x<.078-e) return .62; }
    return .95; }
  if(id==5.) return .35;
  if(id==6.){ if(abs(n.y)<.5){ return fract(p.y/.003)<.3?.7:.86; } return .45; }
  if(id==7.) return .95;
  if(id==8.){ vec3 q=bxQ(p); if(q.y>.045&&abs(q.x)<.045&&abs(q.z)<.03) return fract(q.z/.003)<.3?.7:.93; return .55+.08*grain(p,80.); }
  return .7; }
