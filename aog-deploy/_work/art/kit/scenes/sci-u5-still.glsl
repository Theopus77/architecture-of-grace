/* Science Unit 5 "Forces, Motion and Energy" — pencil still life: a toy car resting at the
   top of a wooden ramp, with a pinwheel on a stick standing beside it. */
#define CAM_POS vec3(-0.9176,0.3684,-0.9803)
#define CAM_TGT vec3(-0.4495,0.0236,0.2516)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define RY 3.5
vec3 rq(vec3 p){ vec3 q=p-vec3(-.02,0.,.06); q.xz=rot(RY)*q.xz; return q; }
#define ANG .3
float ramp(vec3 p){ vec3 q=rq(p);
  float sl=dot(q.xy-vec2(.25,0.),vec2(sin(ANG),cos(ANG)));
  float d=max(sdRBox(q-vec3(0.,.1,0.),vec3(.25,.1,.08),.004),sl);
  float lip=sdRBox(q-vec3(.0,.0,-.084),vec3(.25,.02,.004),.002); lip=max(lip,sl-.008);
  return max(min(d,lip),-q.y); }
vec3 carq(vec3 p){ vec3 q=rq(p); float s=.02; vec2 on=vec2(.2,0.)+vec2(-cos(ANG),sin(ANG))*(.2-s)/cos(ANG)*cos(ANG);
  vec2 c=vec2(s,(.25-s)*tan(ANG)); q.xy-=c; q.xy=rot(-ANG)*q.xy; return q; }
vec2 car(vec3 p){ vec3 q=carq(p)/1.4;
  float body=sdRBox(q-vec3(0.,.035,0.),vec3(.06,.016,.032),.01);
  float cab=sdRBox(q-vec3(-.008,.062,0.),vec3(.03,.014,.028),.01);
  cab=max(cab,-sdRBox(q-vec3(-.008,.064,0.),vec3(.022,.009,.04),.002));
  float pil=sdRBox(q-vec3(-.008,.064,0.),vec3(.004,.012,.029),.001);
  float w=1e5; for(int i=0;i<4;i++){ vec3 c=vec3(i<2?.038:-.038,.019,i%2==0?.034:-.034);
    w=min(w,sdCylZ(q-c,.019,.007)-.002); }
  return vec2(min(min(body,cab),pil),w)*1.4; }
#define PW vec3(-.36,0.,.12)
vec2 pin(vec3 p){ vec3 q=p-PW;
  float base=sdCylY(q-vec3(0.,.012,0.),.04,.01)-.003;
  float stick=sdCylY(q-vec3(0.,.14,0.),.005,.14);
  vec3 h=q-vec3(0.,.27,-.012); h.xz=rot(-.4)*h.xz;
  float hub=length(h)-.008;
  float a=atan(h.y,h.x); float r=length(h.xy);
  float blades=1e5;
  for(int i=0;i<4;i++){ vec2 v=rot(-float(i)*1.5708)*h.xy;
    float d2=max(max(-v.y,v.y-v.x),v.x-.07);
    float z=h.z+.02*(v.x/.07)*(v.y/.07); blades=min(blades,max(d2,abs(z)-.002)*.8); }
  return vec2(min(base,stick),min(hub,blades)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,ramp(p),3.);
  vec2 c=car(p); r=U(r,c.x,4.); r=U(r,c.y,5.);
  vec2 w=pin(p); r=U(r,w.x,6.); r=U(r,w.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .45+.25*grain(rq(p).zyx*vec3(1.,1.,1.),30.);
  if(id==4.){ vec3 q=carq(p)/1.4; if(abs(q.y-.036)<.004) return .9; return .35; }
  if(id==5.){ vec3 q=carq(p)/1.4; return length(q.xy-vec2(q.x>0.?.038:-.038,.019))<.008?.85:.2; }
  if(id==6.) return .55;
  if(id==7.){ vec3 q=p-PW-vec3(0.,.27,0.); float a=atan(q.y,q.x); return fract(a/6.2832*4.+.1)<.5?.4:.85; }
  return .7; }
