/* Chinese Classics Unit 7 "Festivals and Everyday Life" — pencil still life: a round ribbed
   paper lantern with a tassel, hanging from a small wooden stand, and a plate of three
   mooncakes with pressed flower patterns (the Mid-Autumn festival). */
#define CAM_POS vec3(-0.4653,0.2898,-1.0141)
#define CAM_TGT vec3(-0.2149,0.0621,0.1123)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define LC vec3(-.02,.2,.14)
float lantern(vec3 p){ vec3 q=p-LC;
  float a=atan(q.z,q.x); float rib=.0025*abs(sin(a*8.));
  float d=(length(q/vec3(.1,.085,.1))-1.)*.085+rib;
  d=max(d,abs(q.y)-.072);
  d=min(d,sdCylY(q-vec3(0.,.075,0.),.042,.008)-.002);
  d=min(d,sdCylY(q-vec3(0.,-.075,0.),.042,.008)-.002);
  return d; }
float tassel(vec3 p){ vec3 q=p-LC;
  float cord=sdCylY(q-vec3(0.,-.095,0.),.002,.012);
  float knot=length(q-vec3(0.,-.11,0.))-.007;
  float t=clamp((-.115-q.y)/.05,0.,1.); float fr=max(length(q.xz)-(.006+.006*t),max(q.y+.115,-q.y-.165));
  float top=sdCylY(q-vec3(0.,.1,0.),.0018,.018);
  return min(min(cord,knot),min(fr,top)); }
float stand(vec3 p){ vec3 q=p-vec3(LC.x,0.,LC.z);
  float base=sdRBox(q-vec3(-.13,.01,0.),vec3(.05,.01,.05),.004);
  float post=sdRBox(q-vec3(-.13,.17,0.),vec3(.007,.16,.007),.002);
  float arm=sdRBox(q-vec3(-.06,.325,0.),vec3(.075,.006,.006),.002);
  float hook=sdTorus((q-vec3(0.,.312,0.)).xzy,.008,.0016);
  return min(min(base,post),min(arm,hook)); }
#define PL vec3(.26,0.,-.02)
float plate(vec3 p){ vec3 q=p-PL; float r=length(q.xz);
  float d=max(abs(q.y-.006-(r*r)*.8)-.003,r-.13)-.001;
  d=min(d,sdCylY(q-vec3(0.,.003,0.),.06,.003));
  return d; }
float cake(vec3 p,vec3 c){ vec3 q=p-c; float r=length(q.xz); float a=atan(q.z,q.x);
  float edge=.038+.002*cos(a*12.);
  float d=sdCylY(q,edge-.004,.014)-.004;
  return d; }
#define C1 vec3(.23,.024,-.04)
#define C2 vec3(.3,.024,.02)
#define C3 vec3(.24,.043,.03)
float cakes(vec3 p){ return min(min(cake(p,C1),cake(p,C2)),cake(p,C3)); }
float cakeTone(vec3 q,vec3 n){ if(n.y<.6) return .55; float r=length(q.xz); float a=atan(q.z,q.x);
  if(abs(r-.028)<.0015) return .3; float pet=abs(sin(a*3.))*.018; if(abs(r-pet)<.0015&&r<.024) return .3;
  if(r<.004) return .3; return .6; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lantern(p),3.);
  r=U(r,tassel(p),4.);
  r=U(r,stand(p),5.);
  r=U(r,plate(p),6.);
  r=U(r,cakes(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-LC; if(abs(q.y)>.066) return .3; float a=atan(q.z,q.x); if(abs(sin(a*8.))<.12) return .45; return .62; }
  if(id==4.) return .3;
  if(id==5.) return .42+.12*grain(p,40.);
  if(id==6.){ vec3 q=p-PL; float r=length(q.xz); return abs(r-.115)<.004?.5:.88; }
  if(id==7.){ vec3 c=C1; if(length(p-C2)<length(p-c)) c=C2; if(length(p-C3)<length(p-c)) c=C3; return cakeTone(p-c,n); }
  return .7; }
