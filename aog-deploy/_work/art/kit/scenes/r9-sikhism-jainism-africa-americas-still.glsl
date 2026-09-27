/* Room r9 "Sikhism, Jainism, and the Traditions of Africa and the Americas" — pencil still
   life, objects only: a hand drum with a laced skin head (the drum of community gatherings),
   a plain steel bangle (the kara) and a small wooden comb (the kangha), two of the Five Ks,
   and a little clay oil lamp. No figures. */
#define CAM_POS vec3(-0.4144,0.4671,-0.8952)
#define CAM_TGT vec3(-0.2628,-0.0213,0.1226)
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
#define DC vec3(.0,0.,.08)
float drumR(float y){ /* goblet profile: wide head, waist, flared foot */
  float t=clamp(y/.22,0.,1.);
  return mix(.05,.075,smoothstep(.55,1.,t))-.024*exp(-pow((t-.42)/.16,2.))+.012*smoothstep(.12,0.,t); }
float drumD(vec3 p){ vec3 q=p-DC; float r=length(q.xz);
  float d=max(r-drumR(q.y),abs(q.y-.11)-.11)*.8;
  return d; }
float headD(vec3 p){ vec3 q=p-DC; return sdCylY(q-vec3(0.,.222,0.),.078,.003)-.0015; }
float ropeD(vec3 p){ vec3 q=p-DC; float a=atan(q.z,q.x); float r=length(q.xz);
  float ring=sdTorus(q-vec3(0.,.205,0.),.079,.0035); ring=min(ring,sdTorus(q-vec3(0.,.14,0.),.066,.003));
  float k=floor(a/.2618+.5)*.2618; float ph=mod(floor(a/.2618+.5),2.);
  vec3 A=vec3(.079*cos(k),.205,.079*sin(k)); vec3 B=vec3(.066*cos(k+.2618*(ph<.5?1.:-1.)),.14,.066*sin(k+.2618*(ph<.5?1.:-1.)));
  float v=sdCapsule(q,A,B,.0018);
  return min(ring,v); }
float karaD(vec3 p){ vec3 q=p-vec3(-.1,.009,-.07); return length(vec2(length(q.xz)-.04,q.y*.8))-.0085; }
vec3 kgQ(vec3 p){ vec3 q=p-vec3(.1,.0055,-.08); q.xz=rot(-.3)*q.xz; return q/1.6; }
float kanghaD(vec3 q){ vec2 u=q.xz; float body=sdBox2(u-vec2(0.,.01),vec2(.035,.008))-.004;
  body=min(body,length(u-vec2(0.,.022))-.018); body=max(body,u.y-.028); body=max(body,-u.y-.004+.0);
  float tx=(fract(u.x/.0045)-.5)*.0045; float teeth=max(max(abs(tx)-.0012,abs(u.x)-.034),abs(u.y+.012)-.012);
  float d2=min(body,teeth);
  return extrude(d2,q.y,.003,.001); }
#define LP vec3(-.14,0.,.03)
float lampD(vec3 p){ vec3 q=(p-LP)/1.4; float r=length(q.xz*vec2(1.,1.25));
  float bowl=max(abs(length((q-vec3(0.,.03,0.))*vec3(1.,1.3,1.))-.03)-.003,q.y-.022);
  bowl=max(bowl,-q.y);
  float spout=sdCapsule(q,vec3(.02,.019,0.),vec3(.04,.024,0.),.006);
  spout=max(spout,-sdCapsule(q,vec3(.02,.022,0.),vec3(.045,.027,0.),.0035));
  float wick=sdCapsule(q,vec3(.036,.022,0.),vec3(.044,.03,0.),.0018);
  return min(min(bowl,spout),wick)*1.4; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,drumD(p),3.);
  r=U(r,headD(p),4.);
  r=U(r,ropeD(p),5.);
  r=U(r,karaD(p),6.);
  r=U(r,kanghaD(kgQ(p))*1.6,7.);
  r=U(r,lampD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-DC; float a=atan(q.z,q.x); if(q.y<.13&&q.y>.03){ float zz=abs(fract(a/.35+q.y*12.)-.5); if(abs(q.y-.08)<.02&&zz<.1) return .3; } return .5+.1*grain(p,60.); }
  if(id==4.) return .86;
  if(id==5.) return .4;
  if(id==6.) return .7;
  if(id==7.) return .6+.08*grain(p,90.);
  if(id==8.){ vec3 q=(p-LP)/1.4; if(q.y>.02) return .5; return .6; }
  return .7; }
