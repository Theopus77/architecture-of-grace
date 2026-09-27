/* Room "Adding and Subtracting within 1,000" — pencil still life: place-value blocks: a
   hundreds flat (ten by ten), a small stack of two more flats, three tens rods and a scatter
   of unit cubes. */
#define CAM_POS vec3(-0.2966,0.2049,-0.4802)
#define CAM_TGT vec3(-0.1267,-0.0440,0.0299)
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
#define U1 .016
#define F1 vec3(-.07,U1*.5,.07)
#define F2 vec3(-.055,U1*1.5+.0005,.06)
#define RD vec3(.08,U1*.5,.0)
float cubes(vec3 q,vec3 n){ return sdRBox(q,n*U1*.5,.0015); }
float flatsD(vec3 p){ return min(cubes(p-F1,vec3(10.,1.,10.)),cubes(p-F2,vec3(10.,1.,10.))); }
vec3 rodC(int i){ return RD+vec3(float(i)*.032,0.,float(i)*.014); }
float rodsD(vec3 p){ float d=1e5; for(int i=0;i<3;i++) d=min(d,cubes(p-rodC(i),vec3(1.,1.,10.))); return d; }
float unitsD(vec3 p){ float d=1e5;
  for(int i=0;i<6;i++){ float fi=float(i); vec3 c=vec3(.03+.028*fi+.008*sin(fi*3.),U1*.5,-.13-.02*cos(fi*2.3));
    if(i==5) c=vec3(.06,U1*1.5+.0005,-.13);
    d=min(d,cubes(place(p,c,fi*.7),vec3(1.))); }
  return d; }
/* seam lines painted where the unit cubes meet */
float seams(vec3 l,vec3 n3){ vec3 g=abs(fract(l/U1+.5)-.5)*U1; float s=1e5;
  if(n3.x>1.) s=min(s,g.x); if(n3.y>1.) s=min(s,g.y); if(n3.z>1.) s=min(s,g.z); return s; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,flatsD(p),3.);
  r=U(r,rodsD(p),4.);
  r=U(r,unitsD(p),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 l=abs(p.y-F2.y)<U1*.5+.001&&length(max(abs(p.xz-F2.xz)-vec2(.081),0.))<.001?p-F2:p-F1; return seams(l+vec3(U1*5.,U1*.5,U1*5.),vec3(10.,1.,10.))<.0009?.35:.82; }
  if(id==4.){ float best=1e5; vec3 l=vec3(0.); for(int i=0;i<3;i++){ vec3 d=p-rodC(i); float m=max(abs(d.x),abs(d.z)*.1); if(m<best){best=m; l=d;} } return seams(l+vec3(U1*.5,U1*.5,U1*5.),vec3(1.,1.,10.))<.0009?.3:.62; }
  if(id==5.) return .45;
  return .7; }
