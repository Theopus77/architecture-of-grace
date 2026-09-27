/* Room "Geometry and the Coordinate Plane" — pencil still life: a pegboard (geoboard) with a
   five-by-five grid of pegs and a rubber band stretched into a triangle, tipped up on a
   block so its grid faces us, and a clear set square lying in front. */
#define CAM_POS vec3(-0.2653,0.2312,-0.4895)
#define CAM_TGT vec3(-0.0941,0.0050,0.0362)
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
#define GB vec3(-.02,0.,.08)
#define GS .032
vec3 gbQ(vec3 p){ vec3 q=place(p,GB,.2); q.y-=.052; q.yz=rot(-.62)*q.yz; return q; }   /* board tipped back */
float boardD(vec3 p){ vec3 q=gbQ(p); return sdRBox(q-vec3(0.,.009,.0),vec3(.09,.009,.09),.005); }
float pegsD(vec3 p){ vec3 q=gbQ(p); vec2 c=clamp(floor(q.xz/GS+.5),-2.,2.)*GS;
  vec3 k=q-vec3(c.x,.018,c.y); return min(sdCylY(k-vec3(0.,.008,0.),.0032,.008),sdCylY(k-vec3(0.,.016,0.),.0045,.0015)-.0008); }
vec3 pg(vec2 ij){ return vec3(ij.x*GS,.03,ij.y*GS); }
float bandD(vec3 p){ vec3 q=gbQ(p);
  vec3 a=pg(vec2(-2.,-2.)), b=pg(vec2(2.,-1.)), c=pg(vec2(-1.,2.));
  float d=min(min(sdCapsule(q,a,b,.0022),sdCapsule(q,b,c,.0022)),sdCapsule(q,c,a,.0022));
  return d; }
float propD(vec3 p){ vec3 q=place(p,GB+vec3(0.,0.,.075),.2); return sdRBox(q-vec3(0.,.035,0.),vec3(.07,.035,.012),.004); }
vec3 ssQ(vec3 p){ vec3 q=p-vec3(.13,.0,-.13); q.xz=rot(.4)*q.xz; return q; }
float squareD(vec3 p){ vec3 q=ssQ(p);
  vec2 u=q.xz; float L=.13;
  float tri=max(max(-u.x,-u.y),(u.x+u.y-L)*.7071);
  float hole=max(max(-u.x+.022,-u.y+.022),(u.x+u.y-L+.06)*.7071);
  float d2=max(tri,-hole);
  return max(d2,abs(q.y-.002)-.002)-.0005; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,boardD(p),3.);
  r=U(r,pegsD(p),4.);
  r=U(r,bandD(p),5.);
  r=U(r,propD(p),6.);
  r=U(r,squareD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gbQ(p); if(q.y>.016){ vec2 g=abs(fract(q.xz/GS+.5)-.5)*GS; if(min(g.x,g.y)<.0006&&max(abs(q.x),abs(q.z))<.075) return .55; } return .8; }
  if(id==4.) return .4;
  if(id==5.) return .2;
  if(id==6.) return .5;
  if(id==7.){ vec3 q=ssQ(p); if(q.x<.01&&fract(q.z/.01)<.15&&q.z>.02) return .35; if(q.z<.01&&fract(q.x/.01)<.15&&q.x>.02) return .35; return .92; }
  return .7; }
