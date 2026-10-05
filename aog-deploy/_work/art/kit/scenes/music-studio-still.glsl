/* The Studio (the home door for every instrument) — pencil still life: an acoustic guitar on its stand, a snare
   drum on its stand with a pair of sticks across the head, and a studio microphone on a boom stand reaching in
   over them. No names or logos. */
#define CAM_POS vec3(-2.3701,1.7436,-2.8575)
#define CAM_TGT vec3(-0.9469,0.6489,0.4265)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 40.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "musicparts.glsl"
#define GO vec3(-.34,0.,.12)
#define YAW -.7
#define G0 vec3(0.,.17,.02)
#define SN vec3(.34,.60,-.12)
#define MS vec3(.42,0.,.62)
#define MK vec3(.08,1.30,.30)
vec3 sq(vec3 p){ vec3 s=p-GO; s.xz=rot(YAW)*s.xz; return s; }
vec3 fSN(vec3 p){ vec3 q=p-SN; q.yz=rot(.10)*q.yz; return q; }
vec3 fMK(vec3 p){ vec3 q=p-MK; q.xy=rot(.35)*q.xy; return q; }
float stick(vec3 p,vec3 a,vec3 b){
  vec3 ba=b-a; float L=length(ba); vec3 u=ba/L;
  float h=clamp(dot(p-a,u),0.,L); float t=h/L;
  float r=mix(.0072,.0036,smoothstep(.62,.95,t));
  float d=length(p-a-u*h)-r;
  d=smin(d,length(p-b-u*.004)-.0056,.004);
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,60.-p.z,2.);
  vec3 s=sq(p);
  r=U(r,acoustic(toGuitar(s,G0),3.));
  r=U(r,gStand(s,G0,.74,.026,10.));
  r=U(r,drumD(fSN(p),.178,.07,10.,12.));
  vec3 ss=p-vec3(SN.x,0.,SN.z);
  float hw=tripod(ss,.3,.22,vec3(0.,.51,0.));
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.3; hw=min(hw,segD(ss,vec3(0.,.51,0.),vec3(cos(a)*.12,.535,sin(a)*.12))-.005); }
  /* the microphone stand: tripod, upright, a boom out over the snare, the mic hanging from its end */
  vec3 ms=p-MS;
  hw=min(hw,tripod(ms,.3,.3,vec3(0.,1.18,0.)));
  hw=min(hw,sdCylY(ms-vec3(0.,1.18,0.),.02,.022));
  vec3 B0=MS+vec3(.12,1.12,.1), B1=MK+vec3(0.,.09,0.);
  hw=min(hw,segD(p,B0-(B1-B0)*.35,B1)-.009);
  hw=min(hw,length(p-(B0-(B1-B0)*.35))-.03);                            /* counterweight */
  hw=min(hw,segD(p,B1,MK+vec3(0.,.05,0.))-.006);
  r=U(r,hw,15.);
  r=U(r,micD(fMK(p)),16.);
  /* sticks across the snare head */
  float st=stick(p,SN+vec3(-.16,.085,-.05),SN+vec3(.17,.09,.04));
  st=min(st,stick(p,SN+vec3(-.12,.085,.08),SN+vec3(.2,.1,-.09)));
  r=U(r,st,17.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 s=sq(p);
  if(id>=3.&&id<=8.) return acTone(id-3.,toGuitar(s,G0));
  if(id==10.) return .3;
  if(id==11.) return .12;
  if(id==12.) return .72;
  if(id==13.) return .88;
  if(id==14.) return .78;
  if(id==15.) return .32;
  if(id==16.) return micTone(fMK(p));
  if(id==17.) return .8;
  return .7; }
