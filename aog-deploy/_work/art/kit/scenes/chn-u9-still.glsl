/* Chinese Classics Unit 9 "The Confucian Classics" — pencil still life: a cloth-covered book
   case (a tao) standing open, showing its stitched volumes, with two bone pegs on the flap; a
   second closed case lying beside it; and one volume lying open in front. Hint-lines only. */
#define CAM_POS vec3(-0.4235,0.4457,-0.6803)
#define CAM_TGT vec3(-0.1344,-0.0189,0.1434)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* two closed book cases (tao): cloth wraps top, bottom, back and a front flap; the ends are open
   and show the stacked volumes; two ivory clasps hold the flap on its cord loops */
#define CA vec3(-.02,0.,.14)
#define CB vec3(.05,.092,.16)
vec3 aQ(vec3 p){ vec3 q=p-CA-vec3(0.,.046,0.); q.xz=rot(.12)*q.xz; return q; }
vec3 bQ(vec3 p){ vec3 q=p-CB-vec3(0.,.04,0.); q.xz=rot(-.2)*q.xz; return q; }
float cloth(vec3 q,vec3 h){ float o=sdRBox(q,h,.005); return max(o,-sdBox(q,vec3(h.x+.1,h.y-.004,h.z-.004))); }
float pages(vec3 q,vec3 h){ return sdBox(q,vec3(h.x-.004,h.y-.004,h.z-.004)); }
float clasps(vec3 q,vec3 h){ float d=1e5; for(int i=0;i<2;i++){ float x=i==0?-.045:.045;
    vec3 c=q-vec3(x,0.,-h.z-.006); d=min(d,sdCapsule(c,vec3(0.,-.01,0.),vec3(0.,.01,0.),.0045));
    d=min(d,sdTorus((q-vec3(x,0.,-h.z-.002)).xzy,.007,.0016)); } return d; }
#define HA vec3(.13,.046,.09)
#define HB vec3(.11,.04,.078)
/* an open volume lying at the front right */
vec3 oQ(vec3 p){ vec3 q=p-vec3(.22,.004,-.08); q.xz=rot(-.2)*q.xz; return q; }
vec2 openBook(vec3 p){ vec3 q=oQ(p); float x=abs(q.x);
  float lift=.012*sin(clamp(x/.09,0.,1.)*1.9)-.008*exp(-x*60.)+.004;
  float pages=sdBox(vec3(x-.045,q.y-lift*.5,q.z),vec3(.044,max(lift*.5,.002),.06))-.001;
  float cover=sdRBox(vec3(x-.047,q.y-.0,q.z),vec3(.048,.0025,.064),.001);
  return vec2(pages,cover); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 a=aQ(p), b=bQ(p);
  r=U(r,cloth(a,HA),3.);
  r=U(r,pages(a,HA),4.);
  r=U(r,cloth(b,HB),5.);
  r=U(r,pages(b,HB),8.);
  r=U(r,min(clasps(a,HA),clasps(b,HB)),9.);
  vec2 o=openBook(p); r=U(r,o.x,6.); r=U(r,o.y,7.);
  return r; }
float weave(vec3 p){ vec2 u=vec2(p.x+p.z,p.x-p.z)*90.; return .45+.07*step(.5,fract(u.x))*step(.5,fract(u.y)); }
float vols(vec3 q,vec3 h,vec3 n){ /* page ends: four stacked volumes, each with a darker cover line */
  float k=(q.y+h.y)/(2.*h.y)*4.; float f=fract(k); if(f<.1||f>.92) return .3; return fract(q.z/.0022)<.4?.72:.9; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.||id==5.){ vec3 q=id==3.?aQ(p):bQ(p); vec3 h=id==3.?HA:HB;
    if(n.y>.6&&abs(q.x+h.x*.5)<.013&&abs(q.z)<h.z*.65) return .93;                      /* blank paper title slip */
    if(n.y>.6&&abs(abs(q.x+h.x*.5)-.013)<.0013&&abs(q.z)<h.z*.65) return .35;
    if(q.z<-h.z+.004&&abs(q.y+.0)<.0015) return .3;                                     /* edge of the front flap */
    return weave(p)-(id==5.?.05:0.); }
  if(id==4.||id==8.){ vec3 q=id==4.?aQ(p):bQ(p); vec3 h=id==4.?HA:HB; return vols(q,h,n); }
  if(id==9.) return .93;
  if(id==6.){ vec3 q=oQ(p); float x=abs(q.x); float a=.94;
    if(x>.012&&x<.08&&abs(q.z)<.05){ float l=fract(q.x/.009); if(l<.22) a=.62; }
    if(x<.004) a=.7; return a; }
  if(id==7.) return .38;
  return .7; }
