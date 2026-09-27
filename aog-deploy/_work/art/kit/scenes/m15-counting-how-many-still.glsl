/* Room m15 "Counting and How Many" — pencil still life: a wooden ten-frame tray (two rows of
   five wells) with seven round counters set in it, three loose counters in front, and a
   tower of snap-together counting cubes. */
#define CAM_POS vec3(-0.3304,0.4602,-0.6712)
#define CAM_TGT vec3(-0.1876,-0.0351,0.0431)
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
#define CW .05
vec3 tfQ(vec3 p){ return place(p,vec3(-.03,0.,.03),-.12); }
vec2 cellC(vec3 q){ vec2 g=clamp(floor(q.xz/CW+vec2(2.5,1.)),vec2(0.),vec2(4.,1.)); return (g-vec2(2.,.5))*CW; }
float trayD(vec3 q){ float t=sdRBox(q-vec3(0.,.012,0.),vec3(CW*2.5+.008,.012,CW+.008),.004);
  vec2 c=cellC(q); float well=sdRBox(q-vec3(c.x,.02,c.y),vec3(CW*.5-.003,.012,CW*.5-.003),.003);
  return max(t,-well); }
float counterD(vec3 q,vec3 c){ vec3 k=q-c; float d=sdCylY(k,.016,.0035)-.0025; return max(d,-sdTorus(k-vec3(0.,.006,0.),.009,.0015)); }
float inTray(vec3 q,out float n){ vec2 g=clamp(floor(q.xz/CW+vec2(2.5,1.)),vec2(0.),vec2(4.,1.)); n=g.x+(1.-g.y)*5.;
  vec2 c=(g-vec2(2.,.5))*CW; return counterD(q,vec3(c.x,.02,c.y)); }
float countersD(vec3 p,vec3 q){ float n; float d=inTray(q,n); if(n>6.5) d=1e5;
  d=min(d,counterD(p,vec3(-.08,.006,-.1))); d=min(d,counterD(p,vec3(-.035,.006,-.12))); d=min(d,counterD(p,vec3(.005,.006,-.095)));
  return d; }
#define CB .02
vec3 cubeQ(vec3 p){ return place(p,vec3(.2,0.,.0),.35); }
float cubesD(vec3 q){ float y=clamp(floor(q.y/(2.*CB)),0.,3.); vec3 c=q-vec3(0.,(y+.5)*2.*CB,0.);
  float b=sdRBox(c,vec3(CB-.0006),.0025);
  float peg=sdCylY(c-vec3(0.,CB+.002,0.),.005,.002)-.0008; if(y>2.5) peg=max(peg,1e5);
  b=min(b,peg); b=max(b,-sdCylZ(c-vec3(0.,0.,-CB),.0055,.003));
  return b; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=tfQ(p);
  r=U(r,trayD(q),3.);
  r=U(r,countersD(p,q),4.);
  r=U(r,cubesD(cubeQ(p)),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .7+.08*grain(p,70.);
  if(id==4.) return .5;
  if(id==5.){ vec3 q=cubeQ(p); float y=floor(q.y/(2.*CB)); return mod(y,2.)<.5?.5:.82; }
  return .7; }
