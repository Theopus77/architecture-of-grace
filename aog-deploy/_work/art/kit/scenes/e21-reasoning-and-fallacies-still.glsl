/* Room e21 "Reasoning and Fallacies" — pencil still life: an iron chain lying in a curve on
   the table with one link pried open (a chain of reasoning is only as strong as its weakest
   link), a magnifying glass resting on a closed book, ready to check each step. */
#define CAM_POS vec3(-0.2270,0.2434,-0.5792)
#define CAM_TGT vec3(-0.1290,-0.0720,0.0782)
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
#define LL .014
#define LR .011
#define LT .004
vec2 cpath(float s){ return vec2(-.17+s*.75,-.02-.12*sin(s*5.+.2)); }   /* the chain's centre line on the table */
float linkD(vec3 q,bool open_){ float d2=length(vec2(max(abs(q.x)-LL,0.),q.y))-LR;
  float d=length(vec2(d2,q.z))-LT;
  if(open_) d=max(d,-sdBox(q-vec3(LL+LR,0.,0.),vec3(.006,.006,.01)));
  return d; }
float chainD(vec3 p){ if(p.y>.03) return p.y-.025; float d=1e5; float ds=.026/.75;
  float s0=clamp(floor((p.x+.17)/.75/ds),0.,15.);
  for(int k=-3;k<=3;k++){ float i=s0+float(k); if(i<0.||i>15.) continue;
    float s=i*ds; vec2 c=cpath(s), c2=cpath(s+.01); vec2 t=normalize(c2-c);
    vec3 q=p-vec3(c.x,0.,c.y); q.xz=mat2(t.x,-t.y,t.y,t.x)*q.xz;
    bool odd=mod(i,2.)>.5;
    if(odd){ q.y-=LR+LT; } else { q.y-=LT+.0005; q=q.xzy; }
    d=min(d,linkD(q,i==9.)); }
  return d; }
vec3 bkQ(vec3 p){ return place(p,vec3(.14,0.,.1),-.25); }
vec3 mgQ(vec3 p){ vec3 q=p-vec3(.12,.052,.08); q.xz=rot(-.7)*q.xz; q.xy=rot(.08)*q.xy; return q; }
float lensD(vec3 q){ float r=length(q.xz-vec2(0.,0.)); return max(r-.05,abs(q.y)-.004+r*r*1.2); }
float rimD(vec3 q){ return length(vec2(length(q.xz)-.053,q.y))-.0055; }
float handleD(vec3 q){ float n=sdCapsule(q,vec3(.056,0.,0.),vec3(.075,0.,0.),.005);
  float h=sdCapsule(q,vec3(.075,0.,0.),vec3(.16,0.,0.),.009+.0*q.x);
  return min(n,h); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,chainD(p),3.);
  r=U(r,bookD(bkQ(p),vec3(.12,.022,.085)),4.);
  vec3 m=mgQ(p);
  r=U(r,lensD(m),5.);
  r=U(r,rimD(m),6.);
  r=U(r,handleD(m),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4+.15*fbm3(p*200.);
  if(id==4.){ vec3 q=bkQ(p); if(abs(n.y)<.5&&q.x>-.1){ return fract(q.y/.004)<.3?.7:.88; } return .42; }
  if(id==5.){ vec3 q=mgQ(p); float g=q.x-q.z; if(abs(g-.02)<.005) return .98; return .88; }
  if(id==6.) return .35;
  if(id==7.){ vec3 q=mgQ(p); if(q.x<.08) return .4; return .55+.08*grain(p,90.); }
  return .7; }
