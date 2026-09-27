/* Room "Populations and Communities" — pencil still life: a woven straw bee skep (a whole
   colony's home) on a round board, a slab of honeycomb with its six-sided cells, and a wooden
   honey dipper. */
#define CAM_POS vec3(-0.4739,0.3279,-0.8142)
#define CAM_TGT vec3(-0.1958,-0.0198,0.0601)
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
#define SKP vec3(-.04,.012,.07)
float boardD(vec3 p){ vec3 q=p-vec3(SKP.x,0.,SKP.z); return sdCylY(q-vec3(0.,.006,0.),.12,.004)-.002; }
float skepD(vec3 p){ vec3 q=p-SKP;
  float r=length(q.xz);
  /* a dome of stacked straw coils */
  float yy=max(q.y,0.); float R=.1*sqrt(max(1.-pow(yy/.17,2.2),0.))+.004;
  float d=(r-R)*.8; d=max(d,-q.y); d=max(d,q.y-.175);
  float coil=.0025*(1.-abs(sin(q.y*3.1416/.014)));
  d-=coil; d=max(d,q.y-.172-.004);
  /* the doorway at the bottom front */
  vec3 e=q-vec3(0.,0.,-.1); float door=max(length(e.xy*vec2(1.,.8))-.028,-q.y); door=max(door,q.z+.06);
  d=max(d,-max(door,-.0));
  float knob=length(q-vec3(0.,.178,0.))-.012;
  return min(d,knob); }
vec3 hcQ(vec3 p){ vec3 q=p-vec3(.15,.014,-.1); q.xz=rot(-.3)*q.xz; return q; }
float combD(vec3 p){ vec3 q=hcQ(p);
  float slab=sdRBox(q,vec3(.09,.014,.06),.006);
  /* hex cells cut into the top */
  vec2 u=q.xz/.022; vec2 r=vec2(1.,1.732); vec2 h=r*.5; vec2 a=mod(u,r)-h, b=mod(u-h,r)-h; vec2 g=dot(a,a)<dot(b,b)?a:b;
  vec2 k=abs(g); float hx=max(k.x*.866+k.y*.5,k.y)-.36; float cell=max(hx*.022,-(q.y-.006));
  float edge=max(abs(q.x)-.083,abs(q.z)-.053);
  return max(slab,-max(cell,edge)); }
vec3 dpQ(vec3 p){ vec3 q=p-vec3(.08,.009,-.2); q.xz=rot(.2)*q.xz; return q; }
float dipD(vec3 p){ vec3 q=dpQ(p);
  float handle=sdCapsule(q,vec3(-.11,0.,0.),vec3(.0,0.,0.),.0055);
  float head=1e5; for(int i=0;i<5;i++){ float x=.012+float(i)*.009; head=min(head,sdCylX(q-vec3(x,0.,0.),.012-.002*abs(float(i)-2.),.0028)-.001); }
  float core=sdCylX(q-vec3(.03,0.,0.),.006,.03);
  return min(handle,min(head,core))-.0005; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,boardD(p),3.);
  r=U(r,skepD(p),4.);
  r=U(r,combD(p),5.);
  r=U(r,dipD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45+.15*grain(p,60.);
  if(id==4.){ vec3 q=p-SKP; float c=abs(sin(q.y*3.1416/.014)); float st=fract(atan(q.z,q.x)*18./6.2832+q.y*30.);
    if(c<.25) return .3; return st<.15?.5:.75; }
  if(id==5.){ vec3 q=hcQ(p); if(q.y<.005) return .5; return .72; }
  if(id==6.) return .5;
  return .7; }
