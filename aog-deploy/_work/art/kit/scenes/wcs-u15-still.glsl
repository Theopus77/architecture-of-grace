/* WCS Unit 15 "Comparing Systems" — pencil still life: a desk globe on a tilted meridian ring
   and turned stand, with a pair of round reading glasses resting on a closed book. */
#define CAM_POS vec3(-0.4448,0.3018,-1.0823)
#define CAM_TGT vec3(-0.1810,0.0618,0.1046)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define GC vec3(0.,.22,.1)
#define TL .41
vec3 gQ(vec3 p){ vec3 q=p-GC; q.xy=rot(TL)*q.xy; return q; }
float globe(vec3 p){ return length(p-GC)-.11; }
float ring(vec3 p){ vec3 q=gQ(p); float d=max(abs(length(q.xy)-.12)-.004,abs(q.z)-.005)-.001;
  d=max(d,-(q.x+.02)); d=min(d,sdCylY(q-vec3(0.,.12,0.),.005,.012)); d=min(d,sdCylY(q+vec3(0.,.12,0.),.005,.012)); return d; }
float stand(vec3 p){ vec3 q=p-vec3(GC.x,0.,GC.z);
  float d=sdCylY(q-vec3(0.,.01,0.),.07,.01)-.004; d=min(d,sdCone(q-vec3(0.,.045,0.),.03,.012,.025));
  vec3 lo=gQ(p)+vec3(0.,.12,0.); d=min(d,sdCapsule(p,vec3(GC.x,.06,GC.z),GC+vec3(sin(TL)*.12,-cos(TL)*.12,0.)*1.+vec3(0.,-.01,0.),.006));
  return d; }
vec3 bQ(vec3 p){ vec3 q=p-vec3(.24,0.,-.03); q.xz=rot(-.2)*q.xz; return q; }
float book(vec3 p){ vec3 q=bQ(p); float c=sdRBox(q-vec3(0.,.02,0.),vec3(.12,.02,.085),.004); return c; }
float pages(vec3 p){ vec3 q=bQ(p); return sdRBox(q-vec3(.006,.02,0.),vec3(.117,.016,.08),.001); }
float glasses(vec3 p){ vec3 q=bQ(p)-vec3(0.,.046,-.01); q.xz=rot(.25)*q.xz;
  vec3 a=q-vec3(-.035,.0,0.), b=q-vec3(.035,.0,0.); a.yz=rot(-.12)*a.yz; b.yz=rot(-.12)*b.yz;
  float d=min(sdTorus(a.xzy.xzy,.026,.0028),sdTorus(b,.026,.0028));
  d=min(sdTorus(a,.026,.0028),sdTorus(b,.026,.0028));
  float br=sdTorus((q-vec3(0.,.0,.008)).xzy*vec3(1.,1.,1.),.009,.002); br=max(br,-(q.z-.008));
  d=min(d,max(sdTorus(vec3(q.x,q.y,q.z-.008).xzy,.0,.0)+1.,br));
  d=min(d,sdCapsule(q,vec3(-.06,.0,.004),vec3(-.075,.0,.08),.0022)); d=min(d,sdCapsule(q,vec3(.06,.0,.004),vec3(.07,.0,.08),.0022));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,globe(p),3.);
  r=U(r,ring(p),4.);
  r=U(r,stand(p),5.);
  r=U(r,book(p),6.);
  r=U(r,pages(p),7.);
  r=U(r,glasses(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gQ(p); vec3 s=normalize(q); float lat=asin(s.y), lon=atan(s.z,s.x);
    float land=fbm(vec2(lon*1.6,lat*2.2)+3.)-.52;
    if(abs(fract(lat*6./3.1416)-.5)>.47||abs(fract(lon*6./3.1416)-.5)>.48) return .45;
    if(abs(land)<.012) return .25; return land>0.?.55:.85; }
  if(id==4.) return .5;
  if(id==5.) return .45+.1*grain(p,40.);
  if(id==6.){ vec3 q=bQ(p); if(abs(q.x+.09)<.003) return .25; return .38; }
  if(id==7.) return fract(bQ(p).y/.003)<.3?.7:.9;
  if(id==8.) return .25;
  return .7; }
