/* Novel cover, Book One "The Year We Met Sammy" (Room 12): the green frog puppet sitting on
   the wooden box it comes out of, a small chalkboard behind with a chalk heart, two smooth
   stones and a small notebook on the table. */
#define CAM_POS vec3(0.0284,0.5169,-1.6718)
#define CAM_TGT vec3(-0.0350,0.2377,0.1047)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.35)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "novlib.glsl"
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,woodBox(pl(p,vec3(-.02,0,0),.15),vec3(.13,.06,.1)),3.);
  r=U(r,frog(pl(p,vec3(-.02,.12,-.01),.12)),4.);
  r=U(r,chalkboard(pl(p,vec3(.05,0,.3),-.1),vec2(.24,.2)),5.);
  r=U(r,min(stone(pl(p,vec3(.22,0,-.12),.4),vec3(.035,.018,.026)),stone(pl(p,vec3(.28,0,-.07),1.2),vec3(.025,.014,.02))),6.);
  r=U(r,notebook(pl(p,vec3(-.27,0,-.12),.35),vec2(.07,.09)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pl(p,vec3(-.02,0,0),.15); if(abs(fract(q.y/.04)-.5)>.46) return .3; return .62+.1*grain(q*vec3(1,1,1),30.); }
  if(id==4.){ float k=frogInk(pl(p,vec3(-.02,.12,-.01),.12)); return k>0.?k:.75; }
  if(id==5.){ vec3 q=pl(p,vec3(.05,0,.3),-.1); vec3 b=q-vec3(0,.28,0); b.yz=rot(.12)*b.yz;
    if(abs(b.x)<.22&&abs(b.y)<.18&&b.z<-.004){ float h=heartShape((b.xy-vec2(.13,-.02))/.09); if(abs(h)<.09) return .95; return .25; }
    return .6; }
  if(id==6.) return .45;
  if(id==7.){ float k=nbInk(pl(p,vec3(-.27,0,-.12),.35),vec2(.07,.09)); return k>0.?k:.85; }
  return .7; }
