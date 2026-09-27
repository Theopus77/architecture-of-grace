/* Science Unit 12 "Waves and Information" — pencil still life: a toy spring (slinky)
   stretched in a wave, a glass prism, and a magnifying glass. */
#define CAM_POS vec3(-0.5622,0.2393,-0.7179)
#define CAM_TGT vec3(-0.2287,-0.0064,0.1595)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
float slinky(vec3 p){ vec3 q=p-vec3(0.,0.,.08); q.xz=rot(.2)*q.xz;
  /* a coil along x whose axis arcs over like a rainbow, feet on the table */
  float R=.13; vec2 c=vec2(0.,.0); vec2 u=q.xy-c; float ang=atan(u.x,u.y); ang=clamp(ang,-1.45,1.45);
  float s=ang*R;                           /* arc length along the axis */
  vec2 ax=c+R*vec2(sin(ang),cos(ang)); vec2 tn=vec2(cos(ang),-sin(ang)); vec2 nr=vec2(sin(ang),cos(ang));
  vec3 l=vec3(dot(q.xy-ax,tn),dot(q.xy-ax,nr),q.z);   /* local: x along axis */
  float rc=.045; float pitch=.013*(1.+.6*cos(ang*1.6)); 
  float a=atan(l.z,l.y); float t=(s-a/6.2832*pitch)/pitch; float k=floor(t+.5);
  float xx=(k+a/6.2832)*pitch-s+l.x*0.;
  float d=length(vec2(length(l.yz)-rc,l.x-((k+a/6.2832)*pitch-s)))-.003;
  return d*.5; }
vec3 prq(vec3 p){ vec3 q=p-vec3(-.25,0.,.0); q.xz=rot(.35)*q.xz; return q; }
float prism(vec3 p){ vec3 q=prq(p);
  vec2 v=q.xy-vec2(0.,.0); float tri=max(max(-v.y, dot(v,vec2(.866,.5))-.05), dot(v,vec2(-.866,.5))-.05);
  return max(tri,abs(q.z)-.06)-.002; }
vec3 mq(vec3 p){ vec3 q=p-vec3(.3,.0,.02); q.xz=rot(-.3)*q.xz; return q; }
vec2 magn(vec3 p){ vec3 q=mq(p)-vec3(0.,.055,0.); q.yz=rot(-1.2)*q.yz;
  float ring=length(vec2(length(q.xz)-.052,q.y))-.006;
  float lens=max(length(q.xz)-.05,abs(q.y)-.003+.002*length(q.xz)/.05*0.)-.0;
  lens=sdEll(q,vec3(.05,.005,.05));
  vec3 h=q-vec3(0.,0.,.058); float handle=sdCapsule(h,vec3(0.),vec3(0.,0.,.1),.009);
  float fer=sdCylZ(h-vec3(0.,0.,.008),.011,.009);
  return vec2(min(ring,min(handle,fer)),lens); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,slinky(p),3.);
  r=U(r,prism(p),4.);
  vec2 m=magn(p); r=U(r,m.x,5.); r=U(r,m.y,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return .85;
  if(id==5.){ vec3 q=mq(p); return q.z>.05?.3:.5; }
  if(id==6.) return .9;
  return .7; }
