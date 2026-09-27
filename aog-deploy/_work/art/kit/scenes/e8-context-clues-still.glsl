/* e8 "Context Clues" — a magnifying glass lying on a stack of two closed books, beside a
   pair of folded reading glasses. */
#define CAM_POS vec3(-0.3147,0.2159,-0.5641)
#define CAM_TGT vec3(-0.1092,-0.0032,0.0797)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
vec3 b1Q(vec3 p){ return place(p,vec3(0.,0.,.08),.15); }
vec3 b2Q(vec3 p){ return place(p,vec3(.005,.044,.085),-.1); }
float books(vec3 p){ return min(bookD(b1Q(p),vec3(.13,.022,.09)),bookD(b2Q(p),vec3(.115,.018,.08))); }
#define TOPY .082
vec3 mgQ(vec3 p){ vec3 q=p-vec3(.02,TOPY+.012,.07); q.xz=rot(.6)*q.xz; q.xy=rot(.12)*q.xy; return q; }
float mag(vec3 p){ vec3 q=mgQ(p);
  float rim=sdTorus(q,.055,.006);
  float lens=max(length(q.xz)-.052,abs(q.y)-.002-.004*(1.-dot(q.xz,q.xz)/.0027));
  float neck=sdCylX(q-vec3(.068,0.,0.),.007,.01);
  float handle=sdCapsule(q,vec3(.075,0.,0.),vec3(.16,0.,0.),.0095);
  float cap=sdCylX(q-vec3(.165,0.,0.),.0085,.004)-.001;
  return min(min(rim,lens),min(min(neck,handle),cap)); }
vec3 gQ(vec3 p){ vec3 q=p-vec3(.2,.012,-.08); q.xz=rot(-.3)*q.xz; return q; }
float specs(vec3 p){ vec3 q=gQ(p); float d=1e5;
  for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; vec3 c=q-vec3(sx*.028,0.,0.); c.yz=rot(-.9)*c.yz;
    float rim=length(vec2(length(c.xz*vec2(1.,1.25))-.021,c.y))-.0022;
    d=min(d,rim);
    d=min(d,sdCapsule(q,vec3(sx*.049,.0,.0),vec3(sx*.02,-.008,.05),.0017)); }   /* folded temples */
  vec3 b=q-vec3(0.,.006,.0); float br=sdCapsule(b,vec3(-.008,0.,0.),vec3(.008,0.,0.),.0018);
  return min(d,br); }
float lensG(vec3 p){ vec3 q=gQ(p); float d=1e5;
  for(int s=0;s<2;s++){ float sx=s==0?-1.:1.; vec3 c=q-vec3(sx*.028,0.,0.); c.yz=rot(-.9)*c.yz;
    d=min(d,max(length(c.xz*vec2(1.,1.25))-.021,abs(c.y)-.0008)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,books(p),3.);
  r=U(r,mag(p),4.);
  r=U(r,specs(p),5.);
  r=U(r,lensG(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ if(abs(n.y)<.5){ vec3 q=p.y<.044?b1Q(p):b2Q(p); if(q.x>-.1) return fract(p.y/.003)<.3?.7:.9; } return p.y<.044?.4:.55; }
  if(id==4.){ vec3 q=mgQ(p); if(length(q.xz)<.05) return .9; if(q.x>.075) return .3; return .45; }
  if(id==5.) return .3;
  if(id==6.) return .9;
  return .7; }
