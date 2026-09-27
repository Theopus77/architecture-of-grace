/* m52 "Capstone: Model It" — a pocket calculator with its keys and blank display, a sheet of
   graph paper with a rising line drawn on it and a pencil, and four stacks of coins growing taller. */
#define CAM_POS vec3(-0.3318,0.1750,-0.5659)
#define CAM_TGT vec3(-0.1282,-0.0424,0.0725)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
vec3 gQ(vec3 p){ vec3 q=p-vec3(.06,0.,-.02); q.xz=rot(.08)*q.xz; return q; }
float graph(vec3 p){ vec3 q=gQ(p); return sdBox(q-vec3(0.,.0008,0.),vec3(.12,.0008,.09)); }
vec3 cQ(vec3 p){ vec3 q=p-vec3(-.14,.0,.06); q.xz=rot(-.35)*q.xz; q.yz=rot(-.12)*q.yz; return q; }
float calc(vec3 p){ vec3 q=cQ(p);
  float b=sdRBox(q-vec3(0.,.011,0.),vec3(.045,.009,.07),.006);
  vec2 k=q.xz-vec2(0.,-.02); vec2 c=clamp(floor(k/.019+.5),vec2(-1.,-2.),vec2(2.,1.)); vec2 o=k-c*.019;
  o.x+=.0095*0.; float key=sdRBox(vec3(o.x+.0095-.0095,q.y-.021,o.y),vec3(.0065,.0025,.0055),.0018);
  key=sdRBox(vec3(k.x-(c.x-.5)*.019,q.y-.021,k.y-c.y*.019),vec3(.0068,.0025,.0058),.0018);
  float disp=sdRBox(q-vec3(0.,.02,.042),vec3(.034,.0015,.013),.002);
  return min(b,min(key,disp)); }
float stacks(vec3 p){ float d=1e5;
  for(int i=0;i<4;i++){ float fi=float(i); d=min(d,coinStack(p-vec3(.02+fi*.05,0.,.16-fi*.012),.019,.0045,3+i*4)); }
  return d; }
vec3 pnQ(vec3 p){ vec3 q=p-vec3(.12,.0068,-.13); q.xz=rot(.25)*q.xz; return q; }
float pen(vec3 p){ return pencilD2(pnQ(p),.075); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,graph(p),3.);
  r=U(r,calc(p),4.);
  r=U(r,stacks(p),5.);
  r=U(r,pen(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=gQ(p); vec2 u=q.xz; float a=.95;
    vec2 g=abs(fract(u/.012)-.5); if(min(g.x,g.y)<.06) a=.78;
    if(abs(u.x+.1)<.0013&&u.y>-.075&&u.y<.075) a=.3; if(abs(u.y+.075)<.0013&&u.x>-.1&&u.x<.11) a=.3;
    float y=-.075+(u.x+.1)*.55+.012*sin(u.x*40.); if(abs(u.y-y)<.0022&&u.x>-.1&&u.x<.08) a=.15;
    return a; }
  if(id==4.){ vec3 q=cQ(p); if(q.y>.0185&&abs(q.z-.042)<.013&&abs(q.x)<.034) return .75;
    if(q.y>.02) return .7; return .35; }
  if(id==5.){ if(abs(n.y)<.6) return fract(p.y/.0045)<.25?.35:.7; return .78; }
  if(id==7.) return pencilTone(pnQ(p),.075);
  return .7; }
