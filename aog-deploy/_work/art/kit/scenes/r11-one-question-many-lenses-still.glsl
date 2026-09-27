/* Room "One Question, Many Lenses" (comparative religion) — pencil still life: a glass prism
   standing on end (one light, many colours), a brass spyglass lying across the table, and a
   small stack of books of different sizes. Objects only. */
#define CAM_POS vec3(-0.3881,0.2624,-0.6039)
#define CAM_TGT vec3(-0.1765,-0.0021,0.0612)
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
#define PR vec3(.06,0.,.02)
#define BK vec3(-.08,0.,.09)
float booksD(vec3 p){ float d=bookD(place(p,BK,.15),vec3(.11,.024,.08));
  d=min(d,bookD(place(p,BK+vec3(.01,.05,0.),-.12),vec3(.085,.012,.065)));
  d=min(d,bookD(place(p,BK+vec3(-.005,.076,.005),.3),vec3(.07,.018,.05)));
  return d; }
vec3 prQ(vec3 p){ return place(p,PR,.5); }
float prismD(vec3 p){ vec3 q=prQ(p); float s=.042;
  vec2 u=q.xz; float tri=max(max(-u.y-s*.5,dot(u,vec2(.866,.5))-s*.5),dot(u,vec2(-.866,.5))-s*.5);
  return max(tri,abs(q.y-.075)-.075)-.002; }
vec3 sgQ(vec3 p){ vec3 q=p-vec3(.08,.0,-.12); q.xz=rot(-.3)*q.xz; return q; }   /* along x */
float spyD(vec3 p){ vec3 q=sgQ(p);
  float d=1e5;
  float r0=.022;
  d=min(d,sdCylX(q-vec3(-.1,r0,0.),r0,.05)-.001);
  d=min(d,sdCylX(q-vec3(-.02,r0,0.),r0-.004,.035)-.001);
  d=min(d,sdCylX(q-vec3(.045,r0,0.),r0-.008,.03)-.001);
  d=min(d,sdCylX(q-vec3(.085,r0,0.),r0-.011,.012)-.001);
  for(int i=0;i<3;i++){ float x=-.15+float(i)*.065+.0*float(i); float rr=r0+.002-float(i)*.004; d=min(d,sdCylX(q-vec3(x+.1*float(i==0),r0,0.),rr,.004)-.001); }
  d=min(d,sdCylX(q-vec3(-.152,r0,0.),r0+.002,.005)-.001);
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,booksD(p),3.);
  r=U(r,prismD(p),4.);
  r=U(r,spyD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ if(abs(n.y)<.5&&abs(n.x)<.7) return fract(p.y/.003)<.3?.7:.9; return .45; }
  if(id==4.){ vec3 q=prQ(p); if(n.y>.5) return .9; return .75+.15*sin(q.y*60.+q.x*80.); }
  if(id==5.){ vec3 q=sgQ(p); return q.x<-.05?.4:.6; }
  return .7; }
