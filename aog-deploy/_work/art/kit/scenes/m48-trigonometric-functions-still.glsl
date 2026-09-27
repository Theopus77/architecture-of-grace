/* m48 "Trigonometric Functions" — a wooden wheel standing on an axle stand with a peg on its
   rim, and beside it a board propped upright with one wave painted across it, starting level
   with the wheel's centre; a pencil lies in front. */
#define CAM_POS vec3(-0.5169,0.1566,-0.7111)
#define CAM_TGT vec3(-0.1907,0.0168,0.1740)
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
#define WC vec3(-.1,.14,.1)
#define WR .09
#define ROT -.25
#define PANG .9
vec3 wQ(vec3 p){ vec3 q=p-WC; q.xz=rot(ROT)*q.xz; return q; }   /* wheel frame: disc in xy, axle along z */
float wheel(vec3 p){ vec3 q=wQ(p); float r=length(q.xy);
  float rim=extrude(abs(r-WR+.008)-.008,q.z,.009,.003);
  float hub=sdCylZ(q,.017,.013)-.002;
  float sp=1e5; for(int i=0;i<6;i++){ float a=float(i)*PI/3.+.2; vec2 dir=vec2(cos(a),sin(a));
    vec2 u=vec2(dot(q.xy,dir),dot(q.xy,vec2(-dir.y,dir.x)));
    sp=min(sp,sdRBox(vec3(u.x-WR*.5,u.y,q.z),vec3(WR*.42,.0045,.0045),.002)); }
  return min(min(rim,hub),sp); }
float peg(vec3 p){ vec3 q=wQ(p); vec2 c=(WR-.008)*vec2(cos(PANG),sin(PANG));
  float d=sdCylZ(q-vec3(c,-.02),.0055,.014)-.001; d=min(d,length(q-vec3(c,-.035))-.008); return d; }
float stand(vec3 p){ vec3 q=wQ(p);
  float ax=sdCylZ(q-vec3(0.,0.,.02),.005,.03);
  float up=sdRBox(q-vec3(0.,-WC.y*.5+.01,.04),vec3(.012,WC.y*.5,.008),.003);
  float ft=sdRBox(q-vec3(0.,-WC.y+.012,.02),vec3(.07,.012,.05),.004);
  return min(min(ax,up),ft); }
/* wave board: its left edge sits right of the wheel, facing the camera and leaning back */
#define BC vec3(.2,.104,.13)
#define BW .15
#define BH .1
vec3 bQ(vec3 p){ vec3 q=p-BC; q.xz=rot(ROT)*q.xz; q.yz=rot(-.12)*q.yz; return q; }
float board(vec3 p){ vec3 q=bQ(p); return sdRBox(q,vec3(BW,BH,.007),.003); }
float boardLeg(vec3 p){ vec3 q=p-BC; q.xz=rot(ROT)*q.xz;
  /* two small wooden blocks behind hold it up */
  float l=sdRBox(q-vec3(-BW*.6,-BC.y+.025,.04),vec3(.018,.025,.018),.004);
  l=min(l,sdRBox(q-vec3(BW*.6,-BC.y+.025,.04),vec3(.018,.025,.018),.004));
  return l; }
vec3 pencilQ(vec3 p){ return place(p,vec3(.05,.0062,-.12),.25); }
float pencil(vec3 p){ return pencilD2(pencilQ(p),.07); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,wheel(p),3.);
  r=U(r,peg(p),4.);
  r=U(r,stand(p),5.);
  r=U(r,board(p),6.);
  r=U(r,boardLeg(p),5.);
  r=U(r,pencil(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .62+.08*grain(wQ(p).zxy,5.);
  if(id==4.) return .35;
  if(id==5.) return .45;
  if(id==6.){ vec3 q=bQ(p); if(q.z>-.006) return .5; float a=.93;
    if(abs(q.x)>BW-.01||abs(q.y)>BH-.01) return .55;
    float x=(q.x+BW-.02)/(2.*BW-.04); float yc=-.012;                   /* axis line */
    if(abs(q.y-yc)<.0012&&x>0.&&x<1.) a=.55;
    float A=.065; float w=yc+A*sin(x*2.*PI*1.5+PANG);
    if(x>0.&&x<1.&&abs(q.y-w)<.0028*sqrt(1.+pow(A*3.*PI/(2.*BW)*cos(x*3.*PI+PANG),2.))) a=.1;
    return a; }
  if(id==7.) return pencilTone(pencilQ(p),.07);
  return .7; }
