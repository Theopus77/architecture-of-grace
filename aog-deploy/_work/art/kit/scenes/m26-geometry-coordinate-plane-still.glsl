/* m26 "Geometry and the Coordinate Plane" — a pegboard (geoboard) marked with two axes, a rubber
   band stretched round three pegs into a triangle, a clear set square and a pencil. */
#define CAM_POS vec3(-0.3786,0.5028,-0.4069)
#define CAM_TGT vec3(-0.1247,-0.0560,0.0808)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_mid.glsl"
#define PP .03
#define BT .016
vec3 gbQ(vec3 p){ return place(p,vec3(.0,0.,.1),-.2); }
float board(vec3 p){ vec3 q=gbQ(p); return sdRBox(q-vec3(0.,BT*.5,0.),vec3(.125,BT*.5,.125),.004); }
vec2 pegC(vec3 q){ return clamp(floor(q.xz/PP+.5),-3.,3.)*PP; }
float pegs(vec3 p){ vec3 q=gbQ(p); vec2 c=pegC(q); vec3 r=q-vec3(c.x,BT,c.y);
  float s=sdCylY(r-vec3(0.,.006,0.),.0021,.006)-.0005; return min(s,sdCylY(r-vec3(0.,.0125,0.),.0034,.001)-.0006); }
/* the triangle's corners, in peg steps */
vec2 A=vec2(-2.,-1.)*PP, B=vec2(2.,-2.)*PP, C=vec2(1.,2.)*PP;
float band(vec3 p){ vec3 q=gbQ(p); float h=BT+.008;
  vec3 a=vec3(A.x,h,A.y), b=vec3(B.x,h,B.y), c=vec3(C.x,h,C.y);
  return min(min(sdCapsule(q,a,b,.0028),sdCapsule(q,b,c,.0028)),sdCapsule(q,c,a,.0028)); }
/* a clear 45-degree set square lying flat, and a pencil */
vec3 ssQ(vec3 p){ return place(p,vec3(.2,0.,-.02),.5); }
float setsq(vec3 p){ vec3 q=ssQ(p);
  float t=max(max(-q.x,-q.z),(q.x+q.z)*.7071-.1);
  float hole=max(max(-(q.x-.022),-(q.z-.022)),(q.x+q.z)*.7071-.052);
  float d2=max(t,-hole); return extrude(d2,q.y-.002,.002)-.0006; }
vec3 pcQ(vec3 p){ vec3 q=place(p,vec3(.13,.0062,-.15),-.15); return q; }
float pencil(vec3 p){ return pencilD2(pcQ(p),.075); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,pegs(p),4.);
  r=U(r,band(p),5.);
  r=U(r,setsq(p),6.);
  r=U(r,pencil(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gbQ(p); float a=.62+.1*grain(q,45.);
    if(n.y>.7){ if(abs(q.x)<.0028&&abs(q.z)<.112||abs(q.z)<.0028&&abs(q.x)<.112) a=.15;   /* the two axes */
      if(length(q.xz-C)<.0075) a=.2; }
    return a; }
  if(id==4.) return .45;
  if(id==5.) return .25;
  if(id==6.){ vec3 q=ssQ(p); float a=.88; if(n.y>.7&&q.x<.006&&fract(q.z/.01)<.2&&q.z<.09) a=.4; return a; }
  if(id==7.) return pencilTone(pcQ(p),.075);
  return .7; }
