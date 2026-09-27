/* Math Unit 11 "Geometry and the Coordinate Plane" — pencil still life: a large half-circle
   protractor standing on its straight edge, a set square leaning beside it and a pencil. */
#define CAM_POS vec3(-0.2897,0.1895,-0.7310)
#define CAM_TGT vec3(-0.1843,0.0056,0.0919)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define PRR .13
vec3 prQ(vec3 p){ vec3 q=p-vec3(.04,.004,-.01); q.xz=rot(.15)*q.xz; return q; }
float protractor(vec3 p){ vec3 q=prQ(p);
  float d=max(length(q.xy)-PRR,-q.y); d=max(d,-max(length(q.xy)-PRR*.55,.012-q.y));
  return max(d,abs(q.z)-.003)-.0015; }
vec3 ssQ(vec3 p){ vec3 q=p-vec3(-.16,0.,.12); q.xz=rot(-.25)*q.xz; q.xy=rot(-.0)*q.xy; q.yz=rot(-.25)*q.yz; return q; }
float setsq(vec3 p){ vec3 q=ssQ(p); vec2 u=q.xy; float L=.2;
  float tri=max(max(-u.x,-u.y),(u.x+u.y*1.)/1.414-L*.707);
  float hole=max(max(.035-u.x,.035-u.y),(u.x+u.y)/1.414-L*.707+.05);
  tri=max(tri,-hole);
  return max(tri,abs(q.z)-.003)-.0015; }
float pencilD(vec3 p){
  vec3 q=p-vec3(.02,.0068,-.1); q.xz=rot(2.7)*q.xz; q.yz=rot(.26)*q.yz;
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.005)-.115);
  float t=clamp((q.x-.11)/.028,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.11-q.x,q.x-.138));
  return min(body,cone); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,protractor(p),3.);
  r=U(r,setsq(p),4.);
  r=U(r,pencilD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=prQ(p); float r=length(q.xy); float a=atan(q.y,q.x); float deg=a/PI*180.;
    float f=abs(fract(deg/10.+.5)-.5)*10.*PI/180.*r, g=abs(fract(deg/2.+.5)-.5)*2.*PI/180.*r;
    if(r>PRR-.028&&f<.0013) return .12; if(r>PRR-.014&&g<.0008) return .35;
    if(abs(r-PRR*.72)<.001) return .4;
    return .8; }
  if(id==4.){ vec3 q=ssQ(p); float f=fract(q.x/.01); if(q.y<.014&&q.x>.04&&f<.15) return .2; return .68; }
  if(id==5.){ vec3 q=p-vec3(.02,.0068,-.1); q.xz=rot(2.7)*q.xz; q.yz=rot(.26)*q.yz; if(q.x>.11) return q.x>.127?.12:.88; return .5; }
  return .7; }
