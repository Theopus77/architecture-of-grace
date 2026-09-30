/* The Unseen Realm Unit 9 "Giants in the Land" — pencil still life: a shepherd's leather bag
   standing with its drawstring, a sling lying in front of it with its cords, five smooth stones,
   and a wooden cubit rod with notches carved 1, 2, 3 (Og's bed, Goliath's height). */
#define CAM_POS vec3(-0.6194,0.4756,-1.0580)
#define CAM_TGT vec3(-0.4298,-0.0811,0.1059)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define BAG vec3(.02,0.,.06)
#define ROD vec3(-.02,.011,.2)
/* the bag: a soft leather sack, gathered at the neck, with a folded rim and a cord */
vec3 bagQ(vec3 p){ vec3 q=p-BAG; q.xz=rot(-.3)*q.xz; return q; }
float bagD(vec3 p){ vec3 q=bagQ(p);
  float sag=.006*sin(q.x*40.)*smoothstep(.03,.15,q.y);
  float body=sdEll(q-vec3(0.,.085,0.),vec3(.1,.09,.068));
  body=max(body,-(q.y-.002));
  float yy=q.y-.17; float nr=.036+max(yy,0.)*.6+.004*sin(atan(q.z,q.x)*9.);
  float neck=max(length(q.xz*vec2(1.,1.25))-nr,abs(yy-.012)-.028);
  float d=smin(body+sag,neck,.03);
  d=max(d,q.y-.212);                                 /* open top */
  float ins=max(length(q.xz*vec2(1.,1.25))-nr+.006,-(q.y-.19)); d=max(d,-ins);
  d+=.0015*fbm(q.xy*60.);
  return d; }
float cordD(vec3 p){ vec3 q=bagQ(p)-vec3(0.,.168,0.);
  float t=sdTorus(vec3(q.x,q.y,q.z*1.25),.043,.0045);
  float e1=sdCapsule(q,vec3(.04,-.002,-.012),vec3(.07,-.07,-.05),.004);
  float e2=sdCapsule(q,vec3(.038,-.002,-.02),vec3(.055,-.06,-.07),.004);
  return min(t,min(e1,e2)); }
/* the sling: a leather pouch lying flat and two cords curving away on the table */
#define PCH vec3(-.17,.0,-.08)
float slingPouch(vec3 p){ vec3 q=p-PCH; q.xz=rot(.5)*q.xz;
  float d=sdEll(q-vec3(0.,.008,0.),vec3(.045,.012,.028));
  d=max(d,-sdEll(q-vec3(0.,.024,0.),vec3(.035,.016,.02)));
  return d; }
float slingCord(vec3 p){ float d=1e3;
  vec3 q=p-PCH; q.xz=rot(.5)*q.xz;
  for(int s=0;s<2;s++){ float sg=s==0?1.:-1.;
    vec3 a=vec3(sg*.043,.006,0.);
    for(int i=0;i<9;i++){ float t=float(i+1)/9.;
      vec3 b=vec3(sg*(.043+.2*t),.0035,.05*sin(t*3.1+float(s)*1.4)*t+sg*.02*t);
      d=min(d,sdCapsule(q,a,b,.0035)); a=b; } }
  vec3 k=q-vec3(-.243,.004,-.025); d=min(d,length(k*vec3(1.,1.3,1.))-.008);   /* finger loop knot */
  d=min(d,sdTorus((q-vec3(-.262,.003,-.03)).xzy*vec3(1.,1.,1.),.016,.0033));
  return d; }
/* five smooth stones: river pebbles, one resting in the sling */
vec3 st(int i){ return i==0?vec3(-.17,.028,-.08):i==1?vec3(-.06,.021,-.13):i==2?vec3(-.015,.018,-.1):i==3?vec3(-.045,.018,-.075):vec3(-.035,.052,-.105); }
vec3 stR(int i){ return i==0?vec3(.028,.018,.022):i==1?vec3(.03,.021,.024):i==2?vec3(.024,.018,.02):i==3?vec3(.027,.018,.021):vec3(.024,.017,.019); }
float stonesD(vec3 p,out float which){ float d=1e3; which=0.;
  for(int i=0;i<5;i++){ vec3 q=p-st(i); q.xz=rot(float(i)*1.3)*q.xz; q.xy=rot(float(i)*.2-.3)*q.xy;
    float e=sdEll(q,stR(i))+.0012*vn3(q*140.);
    if(e<d){ d=e; which=float(i); } }
  return d; }
/* the cubit rod: a squared wooden rod with notches, marks 1 2 3 carved on the top face */
vec3 rodQ(vec3 p){ vec3 q=p-ROD; q.xz=rot(-.12)*q.xz; return q; }
float rodD(vec3 p){ vec3 q=rodQ(p);
  float d=sdRBox(q,vec3(.3,.011,.018),.003);
  if(d>.02) return d;
  float nx=mod(q.x+.3,.075)-.0375; d=max(d,-max(max(abs(nx)-.0016,abs(q.z+.018)-.006),-(q.y-.004)+.0));
  for(int i=0;i<3;i++){ float cx=-.1+float(i)*.075; d=carve(d,vec2(q.x-cx-.0375,q.z+.002),49+i,.022,.0018,q.y-.011,.0018); }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bagD(p),3.);
  r=U(r,cordD(p),4.);
  r=U(r,slingPouch(p),5.);
  r=U(r,slingCord(p),6.);
  float w; r=U(r,stonesD(p,w),7.);
  r=U(r,rodD(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=bagQ(p); float a=.55+.1*fbm(q.xy*30.);
    if(abs(q.y-.04)<.003) a=.35;                            /* a stitched seam near the base */
    if(q.y>.185) a=.45; return a; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-PCH; q.xz=rot(.5)*q.xz; return abs(length(q.xz*vec2(1.,1.6))-.035)<.002?.3:.5; }
  if(id==6.) return .45;
  if(id==7.){ float w; stonesD(p,w); return .62+.08*mod(w,3.)+.06*fbm(p.xz*80.); }
  if(id==8.){ vec3 q=rodQ(p); float a=.62+.12*grain(q.zyx*vec3(1.,1.,1.),30.);
    float nx=mod(q.x+.3,.075)-.0375; if(abs(nx)<.003&&q.z<-.01) a=.25;
    if(q.y>.009){ for(int i=0;i<3;i++){ float cx=-.1+float(i)*.075; if(glyph(vec2(q.x-cx-.0375,q.z+.002)/.022,49+i)*.022<.0025) a=.2; } }
    return a; }
  return .7; }
