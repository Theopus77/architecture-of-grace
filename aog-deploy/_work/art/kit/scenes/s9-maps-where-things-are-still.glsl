/* s9 "Maps: Where Things Are" — a round wooden compass rose with a raised eight-point star,
   a little toy house, and a picture map half unrolled with a dotted path and a river. */
#define CAM_POS vec3(-0.4575,0.3229,-0.4956)
#define CAM_TGT vec3(-0.1312,-0.0241,0.0736)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "roomparts_e.glsl"
vec3 cQ(vec3 p){ return plc(p,vec3(0.,0.,-.06),-.2); }
float rose(vec3 p){ vec3 q=cQ(p);
  float disc=sdCylY(q-vec3(0.,.007,0.),.09,.007)-.002;
  float s1=extrude(star2(q.xz,4.,.078,.022),q.y-.018,.004)-.001;
  vec2 u=rot(PI/4.)*q.xz; float s2=extrude(star2(u,4.,.05,.018),q.y-.016,.003)-.001;
  float ring=sdTorus(q-vec3(0.,.0145,0.),.082,.0025);
  return min(min(disc,ring),min(s1,s2)); }
float roseT(vec3 p,vec3 n){ vec3 q=cQ(p); float a=atan(q.z,q.x);
  if(q.y>.0135&&n.y>.5&&length(q.xz)<.079){ float m=mod(a,PI*.5); if(star2(q.xz,4.,.078,.022)<.0005) return m<PI*.25?.3:.88;
    if(star2(rot(PI/4.)*q.xz,4.,.05,.018)<.0005) return mod(a+PI*.25,PI*.5)<PI*.25?.45:.9; }
  if(abs(length(q.xz)-.082)<.004) return .5;
  return .8; }
vec3 hQ(vec3 p){ return plc(p,vec3(.02,0.,.12),-.5); }
vec3 mQ(vec3 p){ return plc(p,vec3(.2,0.,.02),.35); }
float mapSheet(vec3 p){ vec3 q=mQ(p);
  float sheet=sdBox(q-vec3(-.02,.0012,0.),vec3(.075,.0012,.07));
  float roll=sdCylZ(q-vec3(.068,.018,0.),.018,.072);
  roll=max(roll,-sdCylZ(q-vec3(.068,.018,0.),.012,.08));
  float inner=sdCylZ(q-vec3(.068,.018,0.),.005,.074);
  return min(min(sheet,roll),inner); }
float mapT(vec3 p){ vec3 q=mQ(p); vec2 u=q.xz;
  if(q.y>.004) return .85;
  float river=abs(u.y-.03*sin(u.x*40.)-.02)-.004; if(river<0.) return .5; if(abs(river)<.0012) return .3;
  float path=sdSeg2(u,vec2(-.08,-.05),vec2(.03,-.01)); if(path<.0025&&fract(u.x/.012)<.5) return .25;
  vec2 t=u-vec2(-.05,.045); if(star2(t,5.,.012,.005)<0.) return .3;
  return .9; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rose(p),3.);
  r=U(r,houseE(hQ(p),.05,.038,.06,.045),4.);
  r=U(r,mapSheet(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return roseT(p,n);
  if(id==4.){ vec3 q=hQ(p); if(q.y>.06) return .35;
    if(abs(q.x)<.012&&q.y<.035&&q.z<-.03) return .2;                         /* door */
    if(abs(q.z)<.011&&abs(q.y-.035)<.011&&abs(q.x)>.045) return .25;           /* side window */
    return .8; }
  if(id==5.) return mapT(p);
  return .7; }
