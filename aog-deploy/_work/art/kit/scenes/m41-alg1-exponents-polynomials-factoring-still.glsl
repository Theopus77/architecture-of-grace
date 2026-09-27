/* Practice room "Algebra I: Exponents, Polynomials, Factoring" — pencil still life: algebra tiles
   laid out as one rectangle (a big x-squared tile, five long x strips and six small unit squares:
   x squared plus five x plus six as x plus two times x plus three), with a pencil and two spare
   tiles beside it. */
#define CAM_POS vec3(-0.2341,0.4175,-0.3226)
#define CAM_TGT vec3(-0.0951,-0.0248,0.0437)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define X .1
#define O .024
#define TH .012
#define RC vec3(-.07,0.,.0)
vec3 rcQ(vec3 p){ vec3 q=p-RC; q.xz=rot(.2)*q.xz; return q; }
float tile(vec3 q,vec2 c,vec2 s){ return sdRBox(q-vec3(c.x,TH*.5,c.y),vec3(s.x*.5-.0012,TH*.5,s.y*.5-.0012),.0015); }
/* rectangle (x+3) wide by (x+2) deep: columns x | 1 1 1 ; rows x | 1 1 */
float rectD(vec3 q,out float kind){ float d=1e3; kind=0.;
  float t=tile(q,vec2(X*.5,X*.5),vec2(X)); if(t<d){ d=t; kind=1.; }
  for(int i=0;i<3;i++){ t=tile(q,vec2(X+O*(float(i)+.5),X*.5),vec2(O,X)); if(t<d){ d=t; kind=2.; } }
  for(int j=0;j<2;j++){ t=tile(q,vec2(X*.5,X+O*(float(j)+.5)),vec2(X,O)); if(t<d){ d=t; kind=2.; }
    for(int i=0;i<3;i++){ t=tile(q,vec2(X+O*(float(i)+.5),X+O*(float(j)+.5)),vec2(O)); if(t<d){ d=t; kind=3.; } } }
  return d; }
vec3 pnQ(vec3 p){ vec3 q=p-vec3(.1,.0065,-.1); q.xz=rot(2.9)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  float k; float d=rectD(rcQ(p),k);
  r=U(r,d,k==1.?3.:k==2.?4.:5.);
  vec3 s=place(p,vec3(.17,0.,.08),.9); r=U(r,tile(s,vec2(0.),vec2(O,X)),4.);
  vec3 u=place(p,vec3(.16,0.,-.01),-.3); r=U(r,tile(u,vec2(0.),vec2(O)),5.);
  r=U(r,pencilD2(pnQ(p),.05),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return .72;
  if(id==5.) return .9;
  if(id==6.) return pencilTone(pnQ(p),.05);
  return .7; }
