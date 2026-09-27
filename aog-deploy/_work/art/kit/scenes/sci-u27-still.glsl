/* Science Unit 27 "Capstone: Argue From Evidence" — pencil still life: an open lab notebook
   with a hand-drawn bar chart, a magnifying glass resting on it, and a pencil. */
#define CAM_POS vec3(-0.4494,0.2303,-0.7140)
#define CAM_TGT vec3(-0.1314,-0.0040,0.1230)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 nq(vec3 p){ vec3 q=p-vec3(.0,.004,.06); q.xz=rot(-.15)*q.xz; q.yz=rot(-1.0)*q.yz; q.z-=.106; return q; }
vec2 book(vec3 p){ vec3 q=nq(p); float bd=length(p-vec3(0.,.08,.1))-.3; if(bd>.02) return vec2(bd); float x=abs(q.x);
  float lift=.012*sin(clamp(x/.15,0.,1.)*1.9)-.008*exp(-x*55.)+.012;
  float pages=sdBox(vec3(x-.075,q.y-lift*.5,q.z),vec3(.073,max(lift*.5,.003),.1))-.0015;
  float cover=sdRBox(vec3(x-.079,q.y+.001,q.z),vec3(.082,.003,.106),.0015);
  float spiral=1e5; float kz=clamp(floor(q.z/.014+.5),-6.,6.)*.014; spiral=sdTorus((q-vec3(0.,.012,kz)).xzy*vec3(1.,1.,1.),.008,.0014);
  spiral=length(vec2(length(vec2(q.x,q.y-.01))-.009,q.z-kz))-.0014;
  return vec2(pages,min(cover,spiral)); }
vec3 mq(vec3 p){ vec3 q=p-vec3(.16,-.028,-.06); q.xz=rot(.5)*q.xz; return q; }
vec2 magn(vec3 p){ vec3 q=mq(p); vec3 l=q-vec3(0.,.034,0.); l.yz=rot(.12)*l.yz;
  float ring=length(vec2(length(l.xz)-.052,l.y))-.006;
  float lens=sdEll(l,vec3(.05,.004,.05));
  vec3 h=l-vec3(0.,0.,-.058); float handle=sdCapsule(h,vec3(0.),vec3(0.,-.02,-.1),.009);
  return vec2(min(ring,handle),lens); }
vec3 pq(vec3 p){ vec3 q=p-vec3(-.12,.007,-.07); q.xz=rot(-.3)*q.xz; return q; }
float pencil(vec3 p){ vec3 q=pq(p);
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.005)-.115);
  float t=clamp((q.x-.11)/.028,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.11-q.x,q.x-.138));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.118)-.009);
  float era=max(length(q.yz)-R*.93,abs(q.x+.133)-.007)-.0006;
  return min(min(body,cone),min(fer,era)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 b=book(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  vec2 m=magn(p); r=U(r,m.x,5.); r=U(r,m.y,6.);
  r=U(r,pencil(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=nq(p); float a=.95;
    if(q.x<-.01){ vec2 u=vec2(q.x+.078,q.z); if(fract((u.y+.1)/.016)<.1&&abs(u.x)<.06) a=.7; }
    if(q.x>.01){ vec2 u=vec2(q.x-.078,q.z+.01);
      if(abs(u.x+.05)<.0015&&u.y>-.06&&u.y<.06) a=.25; if(abs(u.y+.06)<.0015&&u.x>-.05&&u.x<.055) a=.25;
      for(int i=0;i<4;i++){ float x0=-.035+float(i)*.024; float hh=.03+.025*float(i==2?2:i)*.6; 
        if(u.x>x0&&u.x<x0+.014&&u.y>-.06&&u.y<-.06+hh){ a=(abs(u.x-x0)<.0015||abs(u.x-x0-.014)<.0015||abs(u.y+.06-hh)<.0015)?.2:.55; } } }
    return a; }
  if(id==4.) return .4; if(id==5.) return .35; if(id==6.) return .92;
  if(id==7.){ vec3 q=pq(p); if(q.x>.11) return q.x>.127?.12:.88; if(q.x<-.126) return .5; if(q.x<-.11) return fract(q.x/.003)<.35?.3:.7; return abs(q.z)<.0012?.35:.6; }
  return .7; }
