/* b13 "6th Grade Review — Practice" — a clipboard of practice problems propped on a closed
   workbook, a pencil cup holding three pencils, and a rubber eraser. */
#define CAM_POS vec3(-0.5768,0.3928,-0.8144)
#define CAM_TGT vec3(-0.2909,-0.0157,0.1456)
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
/* clipboard frame: tipped back, resting on the book */
vec3 cbQ(vec3 p){ vec3 q=p-vec3(-.1,.05,.04); q.xz=rot(.18)*q.xz; q.yz=rot(-.3)*q.yz; return q; }
float board(vec3 p){ vec3 q=cbQ(p); return sdRBox(q,vec3(.11,.004,.15),.003); }
float paper(vec3 p){ vec3 q=cbQ(p); return sdBox(q-vec3(0.,.0048,-.012),vec3(.098,.0009,.128)); }
float clip(vec3 p){ vec3 q=cbQ(p)-vec3(0.,.008,.125);
  float plate=sdRBox(q,vec3(.045,.004,.018),.003);
  float roll=sdCylX(q-vec3(0.,.006,.012),.007,.042);
  float lever=sdRBox(q-vec3(0.,.012,-.004),vec3(.03,.002,.014),.002);
  return min(min(plate,roll),lever); }
float wbook(vec3 p){ vec3 q=place(p,vec3(-.07,0.,.29),.18); float d=bookD(q,vec3(.14,.022,.12));
  q=place(p,vec3(-.08,.044,.3),.1); return min(d,bookD(q,vec3(.13,.022,.115))); }
#define CUP vec3(.12,0.,.03)
float cup(vec3 p){ vec3 q=p-CUP; float o=sdCylY(q-vec3(0.,.055,0.),.042,.055)-.002;
  float i=sdCylY(q-vec3(0.,.062,0.),.037,.055); return max(o,-i); }
vec3 pq(vec3 p,vec3 b,float ax,float az,float ry){ vec3 q=p-(CUP+b); q.xz=rot(ry)*q.xz; q.xy=rot(ax)*q.xy; q.zy=rot(az)*q.zy; return q.yxz; }
float pencils(vec3 p){
  float d=pencilD2(pq(p,vec3(-.01,.12,.0),-.12,.0,.3)*vec3(1.,1.,1.),.09);
  d=min(d,pencilD2(pq(p,vec3(.012,.115,.008),.16,.1,1.3),.085));
  d=min(d,pencilD2(pq(p,vec3(.0,.11,-.012),.02,-.18,2.1),.08));
  return d; }
float eraser(vec3 p){ vec3 q=place(p,vec3(.22,.014,-.05),-.4); return sdRBox(q,vec3(.036,.014,.02),.006); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,board(p),3.);
  r=U(r,paper(p),4.);
  r=U(r,clip(p),5.);
  r=U(r,wbook(p),6.);
  r=U(r,cup(p),7.);
  r=U(r,pencils(p),8.);
  r=U(r,eraser(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5+.1*grain(cbQ(p),30.);
  if(id==4.){ vec3 q=cbQ(p); vec2 u=vec2(q.x,q.z);
    float a=.95;
    for(int i=0;i<3;i++){ float y=.075-float(i)*.075;
      if(glyph((u-vec2(-.075,y))/.028,49+i)*.028<.0022) a=.2;           /* problem numbers 1 2 3 */
      if(abs(u.y-y)<.0014&&u.x>-.05&&u.x<.03) a=.45;                    /* the problem, as a line */
      if(abs(u.y-(y-.03))<.0011&&u.x>-.05&&u.x<.075) a=.75;             /* answer line */
      if(sdBox2(u-vec2(.062,y),vec2(.012,.012))<.0) a=abs(sdBox2(u-vec2(.062,y),vec2(.012,.012)))<.0015?.3:a; }
    return a; }
  if(id==5.) return .35;
  if(id==6.){ if(abs(n.y)<.5) return fract(p.y/.004)<.3?.7:.88; return .55; }
  if(id==7.) return .62;
  if(id==8.) return .5;
  if(id==9.) return .78;
  return .7; }
