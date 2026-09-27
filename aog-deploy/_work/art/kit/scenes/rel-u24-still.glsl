/* World Religions Unit 24 "Capstone: The Sources Speak" — pencil still life of a research
   desk: a tall stack of three books with paper markers, a wooden box of note cards with tab
   dividers, and a long pencil. No figures, no real words. */
#define CAM_POS vec3(-0.2617,0.2906,-0.6236)
#define CAM_TGT vec3(-0.1552,-0.0526,0.0915)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define BK vec3(-.06,0.,.08)
#define S1 vec3(.12,.02,.085)
#define S2 vec3(.105,.017,.078)
#define S3 vec3(.095,.022,.07)
#define CB vec3(.18,0.,-.03)
vec3 b1(vec3 p){ return L(p,BK,.1); }
vec3 b2(vec3 p){ return L(p,BK+vec3(.005,2.*S1.y,0.),-.12); }
vec3 b3(vec3 p){ return L(p,BK+vec3(-.004,2.*(S1.y+S2.y),0.),.22); }
float markers(vec3 p){ vec3 q=b2(p); float m=sdBox(q-vec3(.03,S2.y*2.-.004,S2.z+.012),vec3(.008,.0006,.02));
  vec3 k=b1(p); m=min(m,sdBox(k-vec3(-.03,S1.y*2.-.004,S1.z+.014),vec3(.009,.0006,.02))); return m; }
float cardbox(vec3 q){ vec3 b=vec3(.06,.035,.08);
  float o=sdRBox(q-vec3(0,b.y,0),b,.003); o=max(o,-sdBox(q-vec3(0,b.y+.006,0),b-vec3(.005,0.,.005)));
  float cards=1e5; for(int i=0;i<9;i++){ float f=float(i); vec3 c=q-vec3(0,.043,-.06+f*.014); c.yz=rot(-.12)*c.yz;
    float h=.03; float card=sdBox(c,vec3(.052,h,.0008));
    if(i==2||i==6){ card=min(card,sdBox(c-vec3(-.03+float(i)*.008,h+.006,0),vec3(.012,.007,.0009))); }
    cards=min(cards,card); }
  return min(o,cards); }
float pencilD(vec3 q){
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.005)-.115);
  float t=clamp((q.x-.11)/.028,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.11-q.x,q.x-.138));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.118)-.009);
  float era=max(length(q.yz)-R*.93,abs(q.x+.133)-.007)-.0006;
  return min(min(body,cone),min(fer,era)); }
vec3 pq(vec3 p){ return L(p,vec3(.02,.0066,-.14),-.15); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bookD(b1(p),S1),3.);
  r=U(r,bookD(b2(p),S2),4.);
  r=U(r,bookD(b3(p),S3),5.);
  r=U(r,markers(p),6.);
  r=U(r,cardbox(L(p,CB,-.3)),7.);
  r=U(r,pencilD(pq(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return bookT(b1(p),S1,.35);
  if(id==4.) return bookT(b2(p),S2,.55);
  if(id==5.) return bookT(b3(p),S3,.42);
  if(id==6.) return .95;
  if(id==7.){ vec3 q=L(p,CB,-.3); if(max(abs(q.x)-.055,abs(q.z)-.075)>0.||q.y<.066) return .5+.08*grain(q,40.);
    return .92; }
  if(id==8.){ vec3 q=pq(p); if(q.x>.11) return q.x>.127?.12:.88; if(q.x<-.126) return .5; if(q.x<-.11) return fract(q.x/.003)<.35?.3:.7; return abs(q.z)<.0012?.35:.6; }
  return .7; }
