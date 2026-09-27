/* Room m35 "Functions and Slope" — pencil still life: a wooden ramp (a plank propped on a
   block) with a ball at its top, and beside it a little wooden staircase whose equal steps
   show rise over run, the same slope all the way up. */
#define CAM_POS vec3(-0.2869,0.3327,-0.6961)
#define CAM_TGT vec3(-0.1688,-0.0475,0.0961)
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
#define SLA .42
vec3 rmQ(vec3 p){ return place(p,vec3(0.,0.,.06),-.1); }
vec3 plankQ(vec3 q){ vec3 k=q-vec3(-.13,0.,0.); k.xy=rot(SLA)*k.xy; return k; }  /* along the slope */
float plankD(vec3 k){ return sdRBox(k-vec3(.16,.006,0.),vec3(.16,.006,.05),.002); }
float blockD(vec3 q){ return sdRBox(q-vec3(.17,.06,0.),vec3(.03,.06,.05),.003); }
float ballD(vec3 q){ vec3 k=plankQ(q); vec3 c=vec3(.25,.012+.022,0.); return length(k-c)-.022; }
float railsD(vec3 q){ vec3 k=plankQ(q); return min(sdRBox(k-vec3(.16,.016,-.047),vec3(.16,.005,.003),.001),sdRBox(k-vec3(.16,.016,.047),vec3(.16,.005,.003),.001)); }
vec3 stQ(vec3 p){ return place(p,vec3(.02,0.,-.12),-.1); }
float stairD(vec3 q){ float d=1e5; for(int i=0;i<5;i++){ float fi=float(i);
    d=min(d,sdRBox(q-vec3(.02*fi,.012+.024*fi,0.),vec3(.1-.02*fi,.012,.025),.0015)); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=rmQ(p);
  r=U(r,plankD(plankQ(q)),3.);
  r=U(r,railsD(q),4.);
  r=U(r,blockD(q),5.);
  r=U(r,ballD(q),6.);
  r=U(r,stairD(stQ(p)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 k=plankQ(rmQ(p)); if(k.y>.011&&abs(fract(k.x/.04)-.5)>.47) return .4; return .7+.08*grain(p,70.); }
  if(id==4.) return .5;
  if(id==5.) return .55+.08*grain(p,70.);
  if(id==6.){ vec3 k=plankQ(rmQ(p)); vec3 c=k-vec3(.25,.034,0.); float b=abs(c.x*.6+c.y*.8); return b<.004?.3:.8; }
  if(id==7.){ vec3 q=stQ(p); if(n.y>.8) return .88; return .6+.06*grain(p,80.); }
  return .7; }
