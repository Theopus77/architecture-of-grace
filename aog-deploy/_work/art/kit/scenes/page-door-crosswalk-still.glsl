/* Home door "The Standards Crosswalk" — pencil still life of a drafting table: a flat sheet ruled
   into a grid of rows with two matched columns, a rolled blueprint behind it, a T-square lying
   across the sheet and a pencil. A map lining one thing up with another. Hint-lines only, never words. */
#define CAM_POS vec3(-0.3476,0.2365,-0.5487)
#define CAM_TGT vec3(-0.1426,-0.0444,0.0437)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.45)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "selparts.glsl"
#define SH vec3(0.,0.,0.)
#define SHR .12
#define RL vec3(.02,.032,.17)
#define RLR .1
#define TS vec3(-.01,.0045,-.035)
#define TSR .12
#define PN vec3(.13,.0068,-.15)
/* the flat sheet: a grid of ruled rows, two columns, short marks matched across */
float sheetD(vec3 p){ vec3 q=P(p,SH,SHR); return sdRBox(q-vec3(0.,.0015,0.),vec3(.17,.0012,.115),.001); }
float sheetT(vec3 p){ vec3 q=P(p,SH,SHR); vec2 u=q.xz;
  if(abs(abs(u.x)-.155)<.0014&&abs(u.y)<.1) return .45;                      /* the border */
  if(abs(abs(u.y)-.1)<.0014&&abs(u.x)<.155) return .45;
  if(abs(u.x)<.155&&abs(u.y)<.1){
    float r=(u.y+.1)/.025; if(fract(r)<.06) return .55;                      /* ruled rows */
    if(abs(u.x+.02)<.0012||abs(u.x-.03)<.0012) return .55;                   /* the column lines */
    float row=floor(r); float cy=fract(r);
    if(cy>.35&&cy<.6){
      if(u.x<-.03&&u.x>-.14+.04*h1(vec2(row,1.))) return .6;               /* left hint-line */
      if(u.x>.04&&u.x<.14-.04*h1(vec2(row,2.))) return .6;                 /* right hint-line */
      if(u.x>-.01&&u.x<.02&&h1(vec2(row,5.))>.25) return .5; }             /* a mark that lines them up */
  }
  return .95; }
/* the rolled blueprint behind, a spiral at its ends */
float rollD(vec3 p){ vec3 q=P(p,RL,RLR); return sdCylX(q,.03,.17)-.001; }
float rollT(vec3 p){ vec3 q=P(p,RL,RLR); float rr=length(q.yz);
  if(abs(q.x)>.168){ return fract(rr/.006+atan(q.z,q.y)/6.283)<.25?.35:.8; }
  if(abs(q.x-.1)<.004) return .5;                                           /* a paper band */
  return .82; }
/* the T-square: a long blade with ticks, a head across its left end */
float tsqD(vec3 p){ vec3 q=P(p,TS,TSR);
  float bl=sdRBox(q-vec3(.02,0.,0.),vec3(.2,.0022,.016),.0012);
  float hd=sdRBox(q-vec3(-.19,.006,0.),vec3(.012,.0065,.06),.002);
  return min(bl,hd); }
float tsqT(vec3 p){ vec3 q=P(p,TS,TSR);
  if(q.x<-.176) return .45;
  if(q.y>.0015&&q.z>.004&&fract(q.x/.01)<.12) return q.z>(fract(q.x/.05)<.2?-.004:.006)?.35:.8;   /* ticks */
  return .8; }
float pen(vec3 p){ vec3 q=p-PN; q.xz=rot(.5)*q.xz; return pencilL(q,.09); }
float penT(vec3 p){ vec3 q=p-PN; q.xz=rot(.5)*q.xz; return pencilT(q,.09); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,sheetD(p),3.);
  r=U(r,rollD(p),4.);
  r=U(r,tsqD(p),5.);
  r=U(r,pen(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return sheetT(p);
  if(id==4.) return rollT(p);
  if(id==5.) return tsqT(p);
  if(id==6.) return penT(p);
  return .7; }
