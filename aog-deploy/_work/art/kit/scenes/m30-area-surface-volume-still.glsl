/* Room "Area, Surface Area and Volume" — pencil still life: a rectangular block built from
   unit cubes (four by two by two, the seams showing), a tin can (a cylinder) and a wooden
   cone standing on its base. */
#define CAM_POS vec3(-0.3158,0.2717,-0.5020)
#define CAM_TGT vec3(-0.1311,0.0078,0.0522)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define UC .032
#define BK vec3(-.06,UC,.02)
#define CN vec3(.12,0.,.1)
#define CO vec3(.12,0.,-.08)
float blockD(vec3 p){ return sdRBox(p-BK,vec3(2.*UC,UC,UC),.002); }
float canD(vec3 p){ vec3 q=p-CN;
  float d=sdCylY(q-vec3(0.,.06,0.),.042,.06)-.002;
  d=min(d,sdTorus(q-vec3(0.,.121,0.),.041,.003)); d=min(d,sdTorus(q-vec3(0.,.002,0.),.041,.003));
  d-=.0008*smoothstep(.2,.8,abs(sin(q.y*180.)))*step(.02,q.y)*step(q.y,.1);
  return d; }
float coneD(vec3 p){ vec3 q=p-CO; return sdCone(q-vec3(0.,.055,0.),.04,.0005,.055)-.001; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,blockD(p),3.);
  r=U(r,canD(p),4.);
  r=U(r,coneD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 l=p-BK+vec3(2.*UC,UC,UC); vec3 g=abs(fract(l/UC+.5)-.5)*UC; float s=1e5;
    if(abs(n.x)<.5) s=min(s,g.x); if(abs(n.y)<.5) s=min(s,g.y); if(abs(n.z)<.5) s=min(s,g.z);
    return s<.0009?.3:.8; }
  if(id==4.){ vec3 q=p-CN; if(q.y>.035&&q.y<.09&&n.y<.5) return abs(q.y-.062)<.012?.5:.85; return .6; }
  if(id==5.) return .5+.15*grain(p-CO,90.);
  return .7; }
