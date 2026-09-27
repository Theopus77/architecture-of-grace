/* Room b7 "Genes and Heredity" — pencil still life: a DNA double-helix model on a round
   stand, an open pea pod with its row of peas (Mendel's peas), and a square card ruled into
   the four boxes of a Punnett square. */
#define CAM_POS vec3(-0.4819,0.5676,-1.1003)
#define CAM_TGT vec3(-0.2989,-0.0216,0.1277)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define HC vec3(0.,0.,.08)
#define HR .05
#define HK 22.
#define HY0 .03
#define HY1 .27
float strand(vec3 q,float ph){ float a=atan(q.z,q.x); float u=mod(a-HK*q.y-ph+PI,2.*PI)-PI;
  float d=length(vec2(length(q.xz)-HR,u*HR/sqrt(1.+HK*HK*HR*HR)))-.008;
  return max(d*.8,abs(q.y-(HY0+HY1)*.5)-(HY1-HY0)*.5); }
float strandsD(vec3 p){ vec3 q=p-HC; return min(strand(q,0.),strand(q,PI)); }
float rungsD(vec3 p){ vec3 q=p-HC; float sp=.02; float d=1e5;
  for(int j=-1;j<=1;j++){ float i=clamp(floor((q.y-HY0)/sp+.5)+float(j),0.,11.); float y=HY0+.01+i*sp; float a=HK*y;
    vec3 A=vec3(HR*cos(a),y,HR*sin(a)), B=vec3(-HR*cos(a),y,-HR*sin(a));
    d=min(d,sdCapsule(q,A,B,.0045)); }
  return d; }
float standD(vec3 p){ vec3 q=p-HC;
  float base=sdCylY(q-vec3(0.,.008,0.),.06,.008)-.003;
  float pole=sdCylY(q-vec3(0.,.15,0.),.0035,.14);
  float cap=length(q-vec3(0.,.29,0.))-.007;
  return min(min(base,pole),cap); }
vec3 podQ(vec3 p){ vec3 q=p-vec3(.17,.014,-.07); q.xz=rot(-.35)*q.xz; return q; }
float podD(vec3 q){ float bend=.12*q.x*q.x*6.; vec3 b=q-vec3(0.,bend,0.);
  float s=sdCapsule(b*vec3(1.,1.,1.),vec3(-.075,0.,0.),vec3(.075,0.,0.),.016);
  s=max(abs(s)-.0016,b.y-.004);
  float tip=sdCapsule(b,vec3(.075,0.,0.),vec3(.1,.01,0.),.003);
  float stem=sdCapsule(b,vec3(-.075,0.,0.),vec3(-.095,.012,0.),.0025);
  return min(s,min(tip,stem)); }
float peasD(vec3 q){ float d=1e5; for(int i=0;i<5;i++){ float x=-.056+.028*float(i); vec3 b=q-vec3(x,.12*x*x*6.+.001,0.); d=min(d,length(b)-.0125); } return d; }
float loosePeasD(vec3 p){ return min(length(p-vec3(.08,.012,-.12))-.012,length(p-vec3(.105,.012,-.135))-.012); }
vec3 cQ(vec3 p){ return place(p,vec3(-.16,0.,-.05),.3); }
float cardD(vec3 q){ return sdRBox(q-vec3(0.,.003,0.),vec3(.07,.003,.07),.002); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,strandsD(p),3.);
  r=U(r,rungsD(p),4.);
  r=U(r,standD(p),5.);
  vec3 q=podQ(p);
  r=U(r,podD(q),6.);
  r=U(r,min(peasD(q),loosePeasD(p)),7.);
  r=U(r,cardD(cQ(p)),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 q=p-HC; float y=q.y; float i=floor((y-HY0)/.02+.5); return mod(i,2.)<1.?.85:.6; }
  if(id==5.) return .4;
  if(id==6.) return .6;
  if(id==7.) return .7;
  if(id==8.){ vec3 q=cQ(p); if(q.y<.005) return .6;
    vec2 u=q.xz; if(abs(u.x)<.0018||abs(u.y)<.0018) return .15;
    if(abs(max(abs(u.x),abs(u.y))-.058)<.0018) return .15;
    for(int i=0;i<4;i++){ vec2 c=vec2(i<2?-.029:.029,mod(float(i),2.)<1.?-.029:.029); if(length(u-c)<.0075+.004*float(i==0)) return .35; }
    return .93; }
  return .7; }
