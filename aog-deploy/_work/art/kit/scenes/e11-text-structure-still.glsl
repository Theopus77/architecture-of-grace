/* e11 "How a Text Is Built" — an open book on a wooden reading stand, its pages laid out in
   a heading, paragraphs and a boxed diagram; beside it three blocks carved 1, 2, 3 built into
   a staircase (first, next, last). */
#define CAM_POS vec3(-0.3666,0.2280,-0.5527)
#define CAM_TGT vec3(-0.1586,0.0060,0.0986)
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
#define ST vec3(-.04,0.,.14)
#define SA -.9
vec3 sQ(vec3 p){ vec3 q=place(p,ST,.2); q.yz=rot(SA)*q.yz; return q; }    /* board frame: x across, z up the slope */
float stand(vec3 p){ vec3 q0=place(p,ST,.2);
  vec3 q=sQ(p);
  float board=sdRBox(q-vec3(0.,-.006,.08),vec3(.13,.006,.1),.003);
  float ledge=sdRBox(q-vec3(0.,.008,-.018),vec3(.13,.012,.005),.002);
  float leg=sdRBox(q0-vec3(0.,.05,.1),vec3(.09,.05,.006),.003);
  float foot=sdRBox(q0-vec3(0.,.006,.03),vec3(.12,.006,.08),.003);
  return min(min(board,ledge),min(leg,foot)); }
float book(vec3 p){ vec3 q=sQ(p)-vec3(0.,.004,.075);
  float x=abs(q.x); float lift=.012*sin(clamp(x/.11,0.,1.)*1.9)-.008*exp(-x*60.);
  float pages=sdBox(vec3(x-.058,q.y-lift*.5-.003,q.z),vec3(.056,max(lift*.5,.003),.08))-.001;
  float cover=sdRBox(vec3(x-.062,q.y,q.z),vec3(.064,.002,.086),.001);
  return min(pages,cover); }
#define BH .033
float block(vec3 p,vec3 c,float ry,int g){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.005);
  if(d>.02) return d;
  d=carve(d,q.xy,g,.06,.005,q.z+BH,.0035);
  return d; }
vec3 bc(int i){ return i==0?vec3(.1,BH,-.06):(i==1?vec3(.175,BH,-.03):vec3(.175,3.*BH,-.03)); }
float blocks(vec3 p){ return min(min(block(p,bc(0),-.15,49),block(p,bc(1),-.15,50)),block(p,bc(2),-.1,51)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stand(p),3.);
  r=U(r,book(p),4.);
  r=U(r,block(p,bc(0),-.15,49),5.);
  r=U(r,block(p,bc(1),-.15,50),6.);
  r=U(r,block(p,bc(2),-.1,51),7.);
  return r; }
float inkB(vec3 p,vec3 c,float ry,int g){ vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-BH+.006&&glyph(q.xy/.06,g)*.06<.0075) return .15;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-BH*.84)<.0018) return .45;
  return .78; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45+.15*grain(place(p,ST,.2),40.);
  if(id==4.){ vec3 q=sQ(p)-vec3(0.,.004,.075); float a=.94; float x=abs(q.x);
    if(q.y<.0) return .45;
    vec2 u=vec2(x-.058,q.z);
    if(q.x<0.){ if(abs(u.y-.058)<.004&&abs(u.x)<.03) a=.3;                  /* heading */
      float l=fract((u.y+.07)/.011); if(u.y<.045&&u.y>-.068&&abs(u.x)<.042&&l<.2&&!(u.y>-.012&&u.y<-.004)) a=.55; }
    else { float b=sdBox2(u-vec2(0.,.03),vec2(.04,.03)); if(abs(b)<.0016) a=.3;   /* a boxed diagram */
      if(b<0.&&sdSeg2(u-vec2(0.,.03),vec2(-.03,-.02),vec2(.03,.02))<.0015) a=.35;
      float l=fract((u.y+.07)/.011); if(u.y<-.012&&u.y>-.068&&abs(u.x)<.042&&l<.2) a=.55; }
    if(x<.004) a=.6; return a; }
  if(id==5.) return inkB(p,bc(0),-.15,49);
  if(id==6.) return inkB(p,bc(1),-.15,50);
  if(id==7.) return inkB(p,bc(2),-.1,51);
  return .7; }
