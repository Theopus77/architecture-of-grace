/* Science Unit 15 "Earth and Space Systems" — pencil still life: a large ammonite fossil
   in a slab of stone, a geologist's rock hammer, and a cluster of quartz crystals. */
#define CAM_POS vec3(-0.5668,0.2467,-0.7471)
#define CAM_TGT vec3(-0.2230,-0.0065,0.1571)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 aq(vec3 p){ vec3 q=p-vec3(.02,0.,.08); q.xz=rot(.2)*q.xz; return q; }
vec2 fossil(vec3 p){ vec3 q=aq(p);
  float slab=sdRBox(q-vec3(0.,.02,0.),vec3(.16,.02,.12),.012)+.004*fbm(q.xz*30.);
  /* ammonite stands upright, facing the camera (xy plane) */
  vec3 a=q-vec3(-.01,.12,-.02); a.xz=rot(-.4)*a.xz;
  float r=length(a.xy); float th=atan(a.y,a.x);
  float k=.9/6.2832; /* log spiral growth per turn */
  float lr=log(max(r,1e-4)/.1); float turn=(lr/(k*6.2832)-th/6.2832); float fr=fract(turn);
  float wr=r*(1.-exp(-k*6.2832)); /* whorl width at this radius */
  float tube=abs(fr-.5)*wr*2.-wr*.5; 
  float shell=max(length(vec2(max(tube,0.)+min(tube,0.),a.z))-.0, r-.1);
  float disc=max(sdEll(a,vec3(.1,.1,.035)),-(.0));
  float ribs=.0008*sin(th*28.);
  float sh=disc+ribs*step(r,.1)+ .012*smoothstep(.3,.5,abs(fr-.5))*step(r,.1);
  sh=max(sh,-q.y+.03);
  return vec2(slab,sh); }
vec3 hq(vec3 p){ vec3 q=p-vec3(-.23,.012,-.02); q.xz=rot(.5)*q.xz; return q; }
vec2 hammer(vec3 p){ vec3 q=hq(p);
  float handle=sdCapsule(q,vec3(-.1,0.,0.),vec3(.1,0.,0.),.012);
  float grip=sdCapsule(q,vec3(-.1,0.,0.),vec3(-.02,0.,0.),.0145);
  vec3 h=q-vec3(.11,.0,0.);
  float head=sdRBox(h-vec3(0.,0.,-.02),vec3(.014,.014,.04),.003);
  float pick=sdCone(h.xzy*vec3(1.,1.,1.)-vec3(0.,.06,0.),.013,.003,.04);
  head=min(head,max(pick,-h.z-.0));
  return vec2(min(handle,head),grip); }
vec2 crystals(vec3 p){ vec3 q=p-vec3(.3,0.,.02);
  float base=sdEll(q,vec3(.05,.025,.04))+.004*fbm3(q*40.);
  float c=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); vec3 d=normalize(vec3(sin(fi*2.3)*.5,1.,cos(fi*1.7)*.5));
    vec3 x=q-vec3(sin(fi*1.3)*.02,.01,cos(fi*2.1)*.015); 
    vec3 u=normalize(cross(d,vec3(1.,0.,0.))); vec3 w=cross(d,u);
    vec3 l=vec3(dot(x,u),dot(x,d),dot(x,w)); float L=.05+.03*fract(fi*.61);
    float a=atan(l.z,l.x); float s=1.0472; float aa=mod(a+s*.5,s)-s*.5; float hr=length(l.xz)*cos(aa);
    float R=.012; float prism=max(hr-R,abs(l.y-L*.5)-L*.5);
    float tip=max(hr-R*(1.-(l.y-L)/.018),max(l.y-L-.018,L-l.y));
    c=min(c,min(prism,tip)); }
  return vec2(base,c*.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 f=fossil(p); r=U(r,f.x,3.); r=U(r,f.y,4.);
  vec2 h=hammer(p); r=U(r,h.x,5.); r=U(r,h.y,6.);
  vec2 c=crystals(p); r=U(r,c.x,7.); r=U(r,c.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .55+.15*fbm(p.xz*50.);
  if(id==4.){ vec3 a=aq(p)-vec3(-.01,.12,-.02); a.xz=rot(-.4)*a.xz; float r=length(a.xy); float th=atan(a.y,a.x);
    float k=.9/6.2832; float turn=log(max(r,1e-4)/.1)/(k*6.2832)-th/6.2832; float fr=fract(turn);
    if(abs(fr-.5)>.4) return .12; float rib=abs(fract(th*28./6.2832)-.5); return rib<.04?.45:.7; }
  if(id==5.){ vec3 q=hq(p); return q.x>.095?.35:.6; }
  if(id==6.) return .3;
  if(id==7.) return .45; if(id==8.) return .9;
  return .7; }
