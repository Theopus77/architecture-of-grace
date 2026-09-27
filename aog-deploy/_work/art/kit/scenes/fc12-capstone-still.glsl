/* Practice room "Capstone — Plan, Cost, Produce" — pencil still life: a clipboard with a
   checklist (ticked boxes and hint-lines), a pocket calculator, and a measuring cup. */
#define CAM_POS vec3(-0.3047,0.3999,-0.7873)
#define CAM_TGT vec3(-0.1716,-0.0288,0.1054)
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
#define CB vec3(-.06,0.,.0)
#define CAL vec3(.12,0.,-.09)
#define MC vec3(.14,0.,.07)
/* the clipboard leans back on a book so the list faces us */
vec3 cbQ(vec3 p){ vec3 q=p-CB; q.xz=rot(-.15)*q.xz; q.yz=rot(.55)*q.yz; return q; }
float cbD(vec3 q){ float d=sdRBox(q-vec3(0.,.12,0.),vec3(.085,.12,.003),.004); return d; }
float clipD(vec3 q){ float d=sdRBox(q-vec3(0.,.225,-.007),vec3(.03,.012,.004),.003); d=min(d,sdCylX(q-vec3(0.,.232,-.011),.004,.02)); return d; }
float paperD(vec3 q){ return sdBox(q-vec3(0.,.11,-.0035),vec3(.075,.105,.0006)); }
float propD(vec3 p){ vec3 q=p-CB-vec3(0.,0.,.1); q.xz=rot(-.15)*q.xz; return sdRBox(q-vec3(0.,.04,0.),vec3(.09,.04,.03),.004); }
vec3 calQ(vec3 p){ vec3 q=p-CAL; q.xz=rot(.3)*q.xz; return q; }
float calD(vec3 q){ float d=sdRBox(q-vec3(0.,.008,0.),vec3(.04,.008,.06),.006);
  vec2 g=vec2(q.x,q.z+.012); vec2 id=clamp(floor(g/.018+.5),vec2(-1.,-2.),vec2(1.,1.)); vec2 c=g-id*.018;
  d=min(d,sdRBox(vec3(c.x,q.y-.017,c.y),vec3(.0065,.002,.0055),.0018));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 c=cbQ(p);
  r=U(r,cbD(c),3.);
  r=U(r,clipD(c),4.);
  r=U(r,paperD(c),5.);
  r=U(r,propD(p),6.);
  r=U(r,calD(calQ(p)),7.);
  vec3 m=place(p,MC,2.2);
  r=U(r,cupD(m,.04,.085,.026),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .6;
  if(id==4.) return .4;
  if(id==5.){ vec3 q=cbQ(p); vec2 u=q.xy-vec2(0.,.11); float row=floor((u.y+.09)/.034); float fy=u.y+.09-row*.034-.017;
    if(row>=0.&&row<5.){ vec2 b=vec2(u.x+.052,fy); float bx=abs(max(abs(b.x),abs(b.y))-.008);
      if(bx<.0012) return .25;                                                   /* the box */
      if(row>1.&&(sdSeg2(b,vec2(-.006,.0),vec2(-.001,-.006))<.0016||sdSeg2(b,vec2(-.001,-.006),vec2(.009,.01))<.0016)) return .2;  /* a tick */
      if(abs(fy)<.0015&&u.x>-.035&&u.x<(row==2.?.02:.055)) return .35; }
    return .94; }
  if(id==6.) return .55;
  if(id==7.){ vec3 q=calQ(p); if(q.y>.015) return .55; if(q.y>.013&&abs(q.x)<.03&&q.z>.03&&q.z<.05) return .45; return .35; }
  if(id==8.){ vec3 q=p-MC; float a=atan(q.x,-q.z); if(q.y>.015&&q.y<.07&&abs(a+.3)<.25&&fract(q.y/.013)<.12) return .3; return .9; }
  return .7; }
