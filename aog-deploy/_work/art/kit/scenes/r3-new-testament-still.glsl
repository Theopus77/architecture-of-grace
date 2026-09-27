/* Practice room "The Biblical Lens II: The New Testament" — pencil still life: an early
   leather codex (the collection gathered into one book) closed with a strap, a bundle of
   rolled letters tied with a cord (the letters sent to the first churches), and a clay oil
   lamp with a small flame. Objects only, no figures and no writing. */
#define CAM_POS vec3(-0.1713,0.2236,-0.8179)
#define CAM_TGT vec3(-0.1102,-0.0270,0.0866)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* the codex: thick wooden boards, a page block set in, a rounded spine and a leather strap */
#define CX vec3(-.02,0.,.02)
#define CS vec3(.11,.036,.145)
vec3 cq(vec3 p){ vec3 q=p-CX; q.xz=rot(.28)*q.xz; return q; }
float codexD(vec3 q){ vec3 s=CS; float t=.007;
  float b1=sdRBox(q-vec3(0.,t*.5,0.),vec3(s.x,t*.5,s.z),.0025);
  float b2=sdRBox(q-vec3(0.,2.*s.y-t*.5,0.),vec3(s.x,t*.5,s.z),.0025);
  float pg=sdRBox(q-vec3(.003,s.y,0.),vec3(s.x-.006,s.y-t+.0006,s.z-.006),.002);
  float sp=max(sdCylZ(q-vec3(-s.x+.008,s.y,0.),s.y+.001,s.z-.001),q.x+s.x-.008);
  /* two raised bands across the spine */
  for(int i=0;i<3;i++){ float z=(float(i)-1.)*.07; sp=min(sp,max(sdCylZ(q-vec3(-s.x+.008,s.y,z),s.y+.0035,.004),q.x+s.x-.009)); }
  return min(min(b1,b2),sp); }
float pagesD(vec3 q){ vec3 s=CS; float t=.007;
  return sdRBox(q-vec3(.003,s.y,0.),vec3(s.x-.006,s.y-t+.0006,s.z-.006),.002); }
float strapD(vec3 q){ vec3 s=CS;
  /* a leather strap wrapped across the book near the fore edge, round the front */
  vec3 a=q-vec3(s.x*.55,s.y,0.);
  float band=max(sdRBox(a,vec3(.013,s.y+.0025,s.z+.0025),.002),-sdBox(a,vec3(.02,s.y-.0005,s.z-.0005)));
  float tongue=sdRBox(q-vec3(s.x*.55,2.*s.y+.0025,-s.z*.5),vec3(.009,.0015,.03),.0012);
  float boss=length((q-vec3(s.x*.55,2.*s.y+.004,-s.z*.2))/vec3(1.,.5,1.))-.009;
  return min(min(band,tongue),boss*.5); }
/* three rolled letters, two below and one on top, tied with a cord */
#define LT vec3(.25,0.,-.12)
vec3 lq(vec3 p){ vec3 q=p-LT; q.xz=rot(-.35)*q.xz; return q; }
float rollX(vec3 c,float r,float h){ float d=sdCylX(c,r,h)-.0015; return d; }
float lettersD(vec3 q){
  float r=.016;
  float d=rollX(q-vec3(-.004,r,-r*1.02),r,.07);
  d=min(d,rollX(q-vec3(.006,r,r*1.02),r,.064));
  d=min(d,rollX(q-vec3(0.,r+r*1.72,0.),r,.067));
  return d; }
float cordD(vec3 q){ float r=.016;
  vec3 c=q-vec3(0.,r*1.9,0.);
  float e=length(c.yz/vec2(.0335,.0355))-1.;
  float d=max(abs(e*.033)-.0022,abs(c.x)-.003);
  return d; }
/* a clay oil lamp (as in the Bible room pictures), scaled up */
#define LP vec3(.31,0.,.14)
float lamp0(vec3 p){
  vec3 q=p-LP; q.xz=rot(3.3)*q.xz;
  float body=(length((q-vec3(0,.026,0))/vec3(.058,.03,.05))-1.)*.03;
  float spout=sdCapsule(q,vec3(.03,.035,0),vec3(.085,.045,0),.012);
  spout=max(spout,-sdCapsule(q,vec3(.06,.05,0),vec3(.09,.056,0),.006));
  float body2=smin(body,spout,.01); body2=max(body2,-(length(q-vec3(-.005,.064,0))-.012));
  float handle=sdTorus((q-vec3(-.06,.035,0)).xzy,.017,.004);
  float foot=sdCylY(q-vec3(0,.004,0),.03,.004);
  return min(min(body2,handle),foot); }
float lamp(vec3 p){ return lamp0((p-LP)/1.5+LP)*1.5; }
float flame(vec3 p){ p=(p-LP)/1.5+LP; vec3 q=p-LP; q.xz=rot(3.3)*q.xz; q-=vec3(.088,.07,0.);
  float t=clamp((q.y+.006)/.05,0.,1.); float r=.0105*pow(sin(3.1416*pow(t,.62)),.8)*(1.-.15*t);
  float d=length(q.xz)-r; d=max(d,max(-q.y-.006,q.y-.044)); return d*.7*1.5; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 c=cq(p);
  r=U(r,codexD(c),3.);
  r=U(r,pagesD(c),9.);
  r=U(r,strapD(c),4.);
  vec3 l=lq(p);
  r=U(r,lettersD(l),5.);
  r=U(r,cordD(l),6.);
  r=U(r,lamp(p),7.);
  r=U(r,flame(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=cq(p); vec3 s=CS;
    if(q.y>2.*s.y-.001){ vec2 u=abs(q.xz); if(abs(max(u.x/s.x,u.y/s.z)-.8)<.012) return .3; } /* tooled border */
    return .45; }
  if(id==4.) return .28;
  if(id==5.){ vec3 q=lq(p); if(abs(abs(q.x)-.067)<.004) return .6; return .88; }
  if(id==6.) return .35;
  if(id==7.) return .55;
  if(id==8.) return .97;
  if(id==9.){ vec3 q=cq(p); return fract(q.y/.0032)<.28?.72:.93; }
  return .7; }
