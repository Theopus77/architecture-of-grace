/* Practice room "The Paragraph: a Claim and Reasons" — pencil still life: a spiral notebook with
   one indented paragraph written on it (hint-lines only), a pencil, and a little wall of toy
   bricks, one wide brick resting on three (a claim held up by reasons). */
#define CAM_POS vec3(-0.1673,0.2252,-0.5134)
#define CAM_TGT vec3(-0.0793,-0.0583,0.0775)
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
#define NB vec3(-.04,0.,-.02)
#define WALL vec3(.17,0.,.06)
#define PEN vec3(.08,.0065,-.1)
vec3 nbQ(vec3 p){ vec3 q=p-NB; q.xz=rot(-.12)*q.xz; return q; }
float nbD(vec3 q){ float d=sdRBox(q-vec3(0.,.006,0.),vec3(.085,.006,.11),.002);
  for(int i=0;i<9;i++){ float z=-.09+float(i)*.0225; d=min(d,sdTorus((q-vec3(-.085,.007,z)).yxz,.008,.0014)); }
  return d; }
float brick(vec3 q,vec3 c,vec3 s){ vec3 b=q-c; float d=sdRBox(b,s,.004);
  vec2 k=vec2(abs(b.x)-s.x*.5,b.z); if(s.x<.03) k.x=b.x; 
  for(int i=0;i<2;i++){ vec3 st=b-vec3((float(i)-.5)*s.x,s.y+.004,0.); if(s.x<.03) st=b-vec3(0.,s.y+.004,0.); d=min(d,sdCylY(st,.008,.004)-.001); }
  return d; }
float wallD(vec3 p){ vec3 q=place(p,WALL,-.3); float d=1e3;
  for(int i=0;i<3;i++) d=min(d,brick(q,vec3((float(i)-1.)*.05,.02,0.),vec3(.022,.02,.022)));
  d=min(d,brick(q,vec3(0.,.062,0.),vec3(.074,.018,.022)));
  return d; }
vec3 penQ(vec3 p){ vec3 q=p-PEN; q.xz=rot(2.7)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,nbD(nbQ(p)),3.);
  r=U(r,wallD(p),4.);
  r=U(r,pencilD2(penQ(p),.08),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=nbQ(p); if(q.y<.011) return .5; if(q.x<-.077) return .35;
    float lz=(q.z-.07)/-.018; float li=floor(lz+.5); float f=abs(lz-li);
    float x0=li==0.?-.035:-.062, x1=li==7.?.0:.068;
    if(li>=0.&&li<=7.&&f<.07&&q.x>x0&&q.x<x1) return .3;             /* the paragraph, as hint-lines */
    if(fract(lz+.5)<.03&&q.x>-.072) return .78;                       /* the ruled lines */
    return .93; }
  if(id==4.){ vec3 q=place(p,WALL,-.3); return q.y>.044?.45:.72; }
  if(id==5.) return pencilTone(penQ(p),.08);
  return .7; }
