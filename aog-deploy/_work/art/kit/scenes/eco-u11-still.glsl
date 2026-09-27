/* Economics Unit 11 "Scarcity, Choice and Opportunity Cost" — pencil still life: a brass
   balance with an apple in one pan and a small book in the other (choosing one means giving
   up the other), and a single coin between them. */
#define CAM_POS vec3(-0.2242,0.2067,-0.5934)
#define CAM_TGT vec3(-0.1350,0.0503,0.0772)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define SC vec3(.1,0.,.16)
vec2 scales(vec3 p){
  vec3 q=p-SC;
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.08,.012,.045),.004);
  float post=sdCylY(q-vec3(0.,.1,0.),.007,.09);
  vec3 b=q-vec3(0.,.19,0.); b.xy=rot(.12)*b.xy;
  float beam=sdRBox(b,vec3(.14,.005,.006),.002);
  float piv=length(q-vec3(0.,.19,0.))-.013;
  float pans=1e5, rods=1e5;
  for(int i=0;i<2;i++){ float s=float(i)*2.-1.; vec2 e=rot(-.12)*vec2(s*.135,0.); vec3 top=vec3(e.x,.19+e.y,0.);
    vec3 pc=vec3(top.x,top.y-.1,0.);
    rods=min(rods,sdCapsule(q,top,pc+vec3(0.,.005,0.),.002));
    vec3 pn=q-pc; pans=min(pans,max(abs(length(pn-vec3(0.,.06,0.))-.075)-.0025,pn.y)); }
  return vec2(min(min(base,post),min(beam,piv)),min(pans,rods)); }
vec2 goods(vec3 p){
  vec3 q=p-SC;
  vec2 e=rot(-.12)*vec2(-.135,0.); vec3 lc=vec3(e.x,.19+e.y-.1-.015,0.);
  vec2 f=rot(-.12)*vec2(.135,0.); vec3 rc=vec3(f.x,.19+f.y-.1-.015,0.);
  vec3 a=q-lc-vec3(0.,.034,0.);
  float apple=length(a*vec3(1.,1.1,1.))-.034; apple+=.008*exp(-length(a.xz)*70.)*step(0.,a.y);
  float stem=sdCapsule(a,vec3(0.,.025,0.),vec3(.003,.045,0.),.0022);
  vec3 bk=q-rc-vec3(0.,.012,0.); bk.xz=rot(.3)*bk.xz;
  float book=sdRBox(bk,vec3(.042,.011,.03),.002);
  return vec2(min(apple*.9,stem),book); }
float coin(vec3 p){ return coinD(p-vec3(-.07,.003,.08),.026,.003); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 s=scales(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  vec2 g=goods(p); r=U(r,g.x,5.); r=U(r,g.y,6.);
  r=U(r,coin(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.) return .55;
  if(id==5.) return .4;
  if(id==6.){ if(abs(n.y)<.6) return .85; return .35; }
  if(id==7.) return .6;
  return .7; }
