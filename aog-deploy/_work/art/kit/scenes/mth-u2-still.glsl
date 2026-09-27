/* Math Unit 2 "Adding and Subtracting" — pencil still life: a big wooden plus sign and a
   minus sign standing on the table, beside two towers of snap-together counting cubes
   (three and two). */
#define CAM_POS vec3(-0.3076,0.2013,-0.7629)
#define CAM_TGT vec3(-0.1977,0.0096,0.0946)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* plus: two crossing bars, standing upright, turned a little toward the light */
vec3 plQ(vec3 p){ vec3 q=p-vec3(.02,.105,.05); q.xz=rot(.1)*q.xz; return q; }
float plusD(vec3 p){ vec3 q=plQ(p);
  return min(sdRBox(q,vec3(.105,.032,.026),.012),sdRBox(q,vec3(.032,.105,.026),.012)); }
vec3 miQ(vec3 p){ vec3 q=p-vec3(.2,.032,.0); q.xz=rot(-.2)*q.xz; return q; }
float minusD(vec3 p){ return sdRBox(miQ(p),vec3(.085,.032,.026),.012); }
/* snap cubes: a cube with a knob on top and a hole under */
#define CS .032
float cubes(vec3 p,vec3 c,float ry,float n){ vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float y=clamp(floor(q.y/(2.*CS)),0.,n-1.); vec3 l=q-vec3(0.,(y+.5)*2.*CS,0.);
  float d=sdRBox(l,vec3(CS*.97),.003);
  float knob=sdCylY(l-vec3(0.,CS+.004,0.),.009,.004)-.001;
  if(y==n-1.) d=min(d,knob);
  return max(d,sdBox(q-vec3(0.,n*CS,0.),vec3(CS*1.1,n*CS+.01,CS*1.1))); }
float cubeTone(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; float y=floor(q.y/(2.*CS)); return mod(y,2.)<.5?.3:.85; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,plusD(p),3.);
  r=U(r,minusD(p),4.);
  r=U(r,cubes(p,vec3(-.21,0.,.06),.3,3.),5.);
  r=U(r,cubes(p,vec3(-.15,0.,-.08),-.2,2.),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .55;
  if(id==4.) return .4;
  if(id==5.) return cubeTone(p,vec3(-.21,0.,.06),.3);
  if(id==6.) return cubeTone(p,vec3(-.15,0.,-.08),-.2)>.5?.3:.85;
  return .7; }
