/* Science Unit 24 "Physics: Motion and Forces" — pencil still life: a large wooden spinning
   top balanced on its point, a stopwatch, and a steel ball rolling along a ruler. */
#define CAM_POS vec3(-0.5128,0.2432,-0.7530)
#define CAM_TGT vec3(-0.1740,-0.0064,0.1387)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define TC vec3(.03,0.,.08)
vec3 tq(vec3 p){ vec3 q=p-TC; q.xy=rot(.12)*q.xy; return q; }
float top(vec3 p){ vec3 q=tq(p);
  float r=length(q.xz); float y=q.y;
  float body=max(r-(y<.07? (y-.004)*1.25 : .0825-(y-.07)*.8),max(-y+.004,y-.11));
  body=smin(body,sdEll(q-vec3(0.,.075,0.),vec3(.085,.022,.085)),.01);
  float stem=sdCylY(q-vec3(0.,.13,0.),.009,.035)-.002;
  float knob=length(q-vec3(0.,.168,0.))-.012;
  float tip=sdCone(q-vec3(0.,.006,0.),.0,.006,.006);
  return min(min(body,stem),min(knob,tip))*.9; }
vec3 sq(vec3 p){ vec3 q=p-vec3(-.25,0.,.0); q.xz=rot(.4)*q.xz; q.yz=rot(-1.25)*q.yz; q.y-=0.; return q; }
vec2 watch(vec3 p){ vec3 q=p-vec3(-.25,.055,.02); q.xz=rot(.35)*q.xz; q.yz=rot(-.35)*q.yz;
  float c=sdCylZ(q,.05,.012)-.004;
  float crown=sdCylY(q-vec3(0.,.062,0.),.008,.008)-.002; crown=min(crown,sdTorus((q-vec3(0.,.078,0.)).xzy,.01,.003));
  float btn=sdCylY((q-vec3(.036,.044,0.)).xyz*mat3(1.)- vec3(0.,0.,0.),.005,.006);
  vec3 bq=q; bq.xy=rot(.7)*bq.xy; btn=sdCylY(bq-vec3(0.,.058,0.),.005,.006);
  float face=sdCylZ(q-vec3(0.,0.,-.016),.043,.001);
  float hand=sdCapsule(q,vec3(0.,0.,-.018),vec3(.022,.028,-.018),.0018);
  float st=sdCylY(q-vec3(0.,-.057,-.015),.03,.004)*0.+sdRBox(q-vec3(0.,-.045,.03),vec3(.012,.04,.005),.003);
  return vec2(min(min(c,crown),min(btn,st)),min(face,hand)-.0); }
vec2 ruler(vec3 p){ vec3 q=p-vec3(.28,.007,.02); q.xz=rot(-.3)*q.xz;
  float r=sdRBox(q,vec3(.14,.007,.03),.0015);
  float ball=length(q-vec3(.03,.007+.026,-.0))-.026;
  return vec2(r,ball); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,top(p),3.);
  vec2 w=watch(p); r=U(r,w.x,4.); r=U(r,w.y,5.);
  vec2 u=ruler(p); r=U(r,u.x,6.); r=U(r,u.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=tq(p); float b=q.y; if(abs(b-.075)<.006) return .25; if(abs(b-.05)<.004||abs(b-.1)<.004) return .35; return .65; }
  if(id==4.) return .4;
  if(id==5.){ vec3 q=p-vec3(-.25,.055,.02); q.xz=rot(.35)*q.xz; q.yz=rot(-.35)*q.yz; float a=atan(q.y,q.x); float r=length(q.xy);
    if(r>.034&&r<.041&&fract(a/6.2832*12.)<.1) return .2; if(r<.012&&q.z<-.0165) return .9; return .92; }
  if(id==6.){ vec3 q=p-vec3(.28,.007,.02); q.xz=rot(-.3)*q.xz; if(q.y>.006&&q.z<-.01){ float t=fract(q.x/.01); float L=fract(q.x/.05)<.2?.016:.008; if(t<.14&&q.z<-.03+L) return .2; } return .8; }
  if(id==7.) return .6;
  return .7; }
