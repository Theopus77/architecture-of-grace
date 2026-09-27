/* Room "Context Clues and Word Parts" — pencil still life: a magnifying glass resting on an
   open book of hint-lines, and three jigsaw pieces (two joined, one waiting to fit). */
#define CAM_POS vec3(-0.3524,0.2769,-0.6358)
#define CAM_TGT vec3(-0.1334,-0.0752,0.0214)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
vec3 bookQ(vec3 p){ vec3 q=p-vec3(-.03,.0,.08); q.xz=rot(-.12)*q.xz; return q; }
vec2 bookD(vec3 p){ vec3 q=bookQ(p); float x=abs(q.x);
  float lift=.022*sin(clamp(x/.14,0.,1.)*1.9)-.014*exp(-x*55.)+.012;
  float pages=sdBox(vec3(x-.072,q.y-lift*.5-.004,q.z),vec3(.07,max(lift*.5,.003),.1))-.0015;
  float cover=sdRBox(vec3(x-.076,q.y+.001+.004,q.z),vec3(.08,.0035,.106),.0015);
  return vec2(pages*.9,cover); }
/* magnifier: ring and lens lying tilted across the right page, handle out to the right */
vec3 magQ(vec3 p){ vec3 q=p-vec3(.06,.042,.05); q.xz=rot(-.6)*q.xz; q.xy=rot(.12)*q.xy; return q; }
float magD(vec3 p){ vec3 q=magQ(p);
  float ring=sdTorus(q,.055,.0065);
  float lens=max(sdCylY(q,.052,.003)-.002,0.);
  float neck=sdCylX(q-vec3(.068,0.,0.),.008,.01)-.002;
  float handle=sdCapsule(q,vec3(.075,0.,0.),vec3(.18,0.,0.),.0105);
  return min(min(ring,lens),min(neck,handle)); }
/* a jigsaw piece: square with tab (+) or blank (-) on each side; k = (right, top, left, bottom) */
float piece2(vec2 u,vec4 k){ float s=.04;
  float d=sdBox(vec3(u,0.),vec3(s,s,1.)); d=max(abs(u.x)-s,abs(u.y)-s);
  vec2 c[4]; c[0]=vec2(s,0.); c[1]=vec2(0.,s); c[2]=vec2(-s,0.); c[3]=vec2(0.,-s);
  for(int i=0;i<4;i++){ vec2 cc=c[i]*(1.+.28*abs(k[i])/1.); float tab=length(u-c[i]-normalize(c[i])*.008)-.0115;
    if(k[i]>.5) d=min(d,tab); if(k[i]<-.5) d=max(d,-tab); }
  return d; }
float pieceD(vec3 p,vec3 c,float a,vec4 k){ vec3 q=place(p,c,a); float d2=piece2(q.xz,k); return max(d2,abs(q.y-.0045)-.0045)-.0008; }
#define P1 vec3(.13,0.,-.12)
#define P2 vec3(.22,0.,-.11)
#define P3 vec3(.03,0.,-.2)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=bookD(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  r=U(r,magD(p),5.);
  r=U(r,pieceD(p,P1,0.,vec4(1.,-1.,1.,-1.)),6.);
  r=U(r,pieceD(p,P1+vec3(.08,0.,0.),0.,vec4(1.,1.,-1.,-1.)),7.);
  r=U(r,pieceD(p,P3,.5,vec4(-1.,1.,1.,1.)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bookQ(p); float x=abs(q.x); if(x<.005) return .7;
    vec2 u=vec2(x-.072,q.z); float l=fract((u.y+.1)/.014);
    if(abs(u.x)<.052&&abs(u.y)<.082&&l<.2&&!(u.y>.07&&u.x>.01)) return .55; return .95; }
  if(id==4.) return .4;
  if(id==5.){ vec3 q=magQ(p); if(length(q.xz)<.05&&abs(q.y)<.006) return .9; if(q.x>.074) return .3+.1*grain(q.zyx,60.); return .5; }
  if(id==6.) return .55;
  if(id==7.) return .8;
  if(id==8.) return .45;
  return .7; }
