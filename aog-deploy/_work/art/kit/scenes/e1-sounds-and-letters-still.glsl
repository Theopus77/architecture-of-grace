/* Room "Sounds and Letters" — pencil still life: a toy xylophone with eight bars stepping
   down in length and a mallet across it, beside two wooden letter blocks carved A and B. */
#define CAM_POS vec3(-0.4501,0.3470,-0.6896)
#define CAM_TGT vec3(-0.2006,-0.0002,0.0762)
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
#define XY vec3(-.07,0.,.08)
#define BH .045
vec3 xyQ(vec3 p){ return place(p,XY,.3)/1.45; }
float xylD(vec3 p){ vec3 q=xyQ(p);
  /* the frame: two rails that splay apart */
  float d=1e5;
  for(int s=0;s<2;s++){ float sg=float(s)*2.-1.;
    vec3 a=vec3(-.13,.01,sg*.045), b=vec3(.13,.01,sg*.028);
    d=min(d,sdCapsule(q,a,b,.008)); }
  return d; }
float barsD(vec3 p,out float k){ vec3 q=xyQ(p); float d=1e5; k=0.;
  for(int i=0;i<8;i++){ float x=-.11+float(i)*.031; float L=.062-float(i)*.0045;
    float b=sdRBox(q-vec3(x,.023,0.),vec3(.012,.005,L),.002);
    b=max(b,-sdCylY(q-vec3(x,.03,L-.012),.0025,.01)); b=max(b,-sdCylY(q-vec3(x,.03,-L+.012),.0025,.01));
    if(b<d){ d=b; k=float(i); } }
  return d; }
vec3 malQ(vec3 p){ vec3 q=xyQ(p)-vec3(.03,.036,-.03); q.xz=rot(.5)*q.xz; q.xy=rot(.12)*q.xy; return q; }
float malD(vec3 p){ vec3 q=malQ(p); return min(sdCapsule(q,vec3(-.13,0.,0.),vec3(.0,0.,0.),.004),length(q-vec3(.012,0.,0.))-.013); }
float block(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.006);
  d=carve(d,q.xy,g,.065,.0055,q.z+BH,.004);
  d=carve(d,vec2(-q.z,q.y),g2,.06,.005,q.x-BH,.004);
  return d; }
float letterInk(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-BH+.008&&glyph(q.xy/.065,g)*.065<.0078) return .18;
  if(q.x>BH-.008&&glyph(vec2(-q.z,q.y)/.06,g2)*.06<.0072) return .18;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-BH*.86)<.002) return .45;
  return .76; }
#define B1 vec3(.19,BH,-.05)
#define B2 vec3(.2,3.*BH+.001,-.055)
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,xylD(p)*1.45,3.);
  float k; r=U(r,barsD(p,k)*1.45,4.);
  r=U(r,malD(p)*1.45,5.);
  r=U(r,block(p,B1,-.35,66,67),6.);
  r=U(r,block(p,B2,-.1,65,66),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .35;
  if(id==4.){ float k; barsD(p,k); return mod(k,2.)<.5?.55:.8; }
  if(id==5.){ vec3 q=malQ(p); return q.x>-.002?.3:.7; }
  if(id==6.) return letterInk(p,B1,-.35,66,67);
  if(id==7.) return letterInk(p,B2,-.1,65,66);
  return .7; }
