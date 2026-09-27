/* Science Unit 2 "Light, Sound and Waves" — pencil still life: a snare drum with two
   sticks resting on it, a flashlight lying on the table, and a tuning fork standing on its
   wooden sound box. */
#define CAM_POS vec3(-0.7600,0.3397,-0.9434)
#define CAM_TGT vec3(-0.3243,0.0187,0.2028)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define DC vec3(.02,0.,.06)
vec2 drum(vec3 p){
  vec3 q=p-DC;
  float shell=sdCylY(q-vec3(0.,.06,0.),.1,.052)-.002;
  float rims=min(sdTorus(q-vec3(0.,.113,0.),.101,.006),sdTorus(q-vec3(0.,.007,0.),.101,.006));
  float lugs=1e5; float a=atan(q.z,q.x); float s=6.2832/8.; float aa=mod(a+s*.5,s)-s*.5;
  vec2 lp=length(q.xz)*vec2(cos(aa),sin(aa)); vec3 l=vec3(lp.x-.104,q.y-.06,lp.y);
  lugs=sdRBox(l,vec3(.006,.018,.007),.003);
  vec3 s1=q-vec3(0.,.126,0.);
  float st=min(sdCapsule(s1,vec3(-.13,.0,-.05),vec3(.1,.0,.04),.0055),sdCapsule(s1,vec3(-.12,.012,.05),vec3(.11,.0,-.045),.0055));
  st=min(st,min(length(s1-vec3(.1,.0,.04))-.009,length(s1-vec3(.11,.0,-.045))-.009));
  return vec2(min(shell,lugs),min(rims,st)); }
vec3 fq(vec3 p){ vec3 q=p-vec3(-.29,.026,.05); q.xz=rot(.45)*q.xz; return q; }
float flash(vec3 p){ vec3 q=fq(p);
  float body=sdCylX(q,.022,.075)-.002;
  float head=sdCone(q.yxz*vec3(1.,-1.,1.)-vec3(0.,.1,0.),.023,.033,.028)-.002;
  float lens=sdCylX(q-vec3(-.13,0.,0.),.029,.002);
  head=max(head,-(sdCylX(q-vec3(-.13,0.,0.),.028,.006)));
  float sw=sdRBox(q-vec3(.0,.024,0.),vec3(.012,.004,.007),.003);
  float cap=sdCylX(q-vec3(.078,0.,0.),.02,.006)-.002;
  return min(min(body,head),min(min(sw,cap),lens)); }
vec2 fork(vec3 p){ vec3 q=p-vec3(.3,0.,.02); q.xz=rot(-.35)*q.xz;
  float box=sdRBox(q-vec3(0.,.045,0.),vec3(.085,.045,.05),.005);
  box=max(box,-(sdCylZ(q-vec3(0.,.045,-.05),.02,.02)));
  vec3 f=q-vec3(0.,.09,0.);
  float stem=sdCylY(f-vec3(0.,.02,0.),.006,.02);
  float yoke=abs(length(f.xy-vec2(0.,.06))-.018)-.004; yoke=max(max(yoke,f.y-.06),abs(f.z)-.004);
  float pr=sdRBox(vec3(abs(f.x)-.018,f.y-.14,f.z),vec3(.004,.08,.004),.002);
  return vec2(box,min(min(stem,yoke),pr)-.0005); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 d=drum(p); r=U(r,d.x,3.); r=U(r,d.y,4.);
  r=U(r,flash(p),5.);
  vec2 f=fork(p); r=U(r,f.x,6.); r=U(r,f.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=p-DC; if(q.y>.11) return .9;   /* white drum head */
    float a=atan(q.z,q.x)/6.2832*16.; float z=abs(fract(a)-.5)*2.; float y=(q.y-.012)/.1;   /* zigzag cords */
    if(y>0.&&y<1.&&abs(z-y)<.06) return .2; return .45; }
  if(id==4.) return .55;
  if(id==5.){ vec3 q=fq(p); if(q.x<-.128) return .92; return abs(q.x+.1)<.003?.2:.3; }
  if(id==6.){ vec3 q=p-vec3(.3,0.,.02); return .62; }
  if(id==7.) return .78;
  return .7; }
