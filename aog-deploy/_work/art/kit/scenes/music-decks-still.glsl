/* The Turntables page — pencil still life: a turntable with a record on the platter, a blank
   centre label, the tonearm resting its needle in the grooves and a counterweight behind the
   pivot; beside it a small stack of plain record sleeves, one record peeking out. No labels,
   names or writing. */
#define CAM_POS vec3(-0.4146,0.7222,-0.9041)
#define CAM_TGT vec3(-0.0552,-0.0582,0.0408)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- the turntable ---- */
#define TC vec3(.06,0.,.02)
#define TRY -.3
#define PH .062      /* plinth top */
vec3 tq(vec3 p){ vec3 q=p-TC; q.xz=rot(TRY)*q.xz; return q; }
float plinth(vec3 q){
  float d=sdRBox(q-vec3(0.,PH*.5+.008,0.),vec3(.225,PH*.5-.008,.175),.008);
  vec3 f=vec3(abs(q.x)-.19,q.y-.005,abs(q.z)-.14);                       /* four feet */
  d=min(d,sdCylY(f,.018,.005)-.002);
  return d; }
#define PC vec2(-.035,0.)   /* platter centre */
float platter(vec3 q){ vec3 r=q-vec3(PC.x,PH+.007,PC.y);
  return sdCylY(r,.148,.007)-.0015; }
float record(vec3 q){ vec3 r=q-vec3(PC.x,PH+.0165,PC.y);
  return sdCylY(r,.146,.0012)-.0006; }
float label(vec3 q){ vec3 r=q-vec3(PC.x,PH+.0183,PC.y);
  float d=sdCylY(r,.048,.0004)-.0002;
  d=min(d,sdCylY(r-vec3(0.,.006,0.),.0028,.006)-.0005);                  /* spindle */
  return d; }
/* tonearm: pivot at the back right, an S-shaped tube down to the headshell */
#define PV vec3(.165,0.,.105)
#define HS vec3(.07,0.,-.075)
float armBase(vec3 q){
  vec3 r=q-vec3(PV.x,PH,PV.z);
  float d=sdCylY(r-vec3(0.,.008,0.),.028,.008)-.002;                     /* collar */
  d=min(d,sdCylY(r-vec3(0.,.026,0.),.009,.012)-.001);                   /* post */
  vec3 w=r-vec3(.012,.036,.055);                                         /* counterweight */
  d=min(d,sdCylZ(w,.016,.014)-.002);
  vec3 rest=q-vec3(.2,PH,-.02);                                          /* arm rest */
  d=min(d,sdCylY(rest-vec3(0.,.016,0.),.004,.016));
  return d; }
float arm(vec3 q){
  float y=PH+.036;
  vec3 a=vec3(PV.x,y,PV.z)+vec3(.012,0.,.04);
  vec3 b=vec3(PV.x,y,PV.z)+vec3(.0,0.,-.03);
  vec3 c=vec3(.13,y-.004,-.06);
  vec3 e=vec3(HS.x+.012,PH+.028,HS.z+.01);
  float d=sdCapsule(q,a,b,.0042);
  d=smin(d,sdCapsule(q,b,c,.0042),.004);
  d=smin(d,sdCapsule(q,c,e,.0042),.004);
  /* the headshell: a small tilted block with a finger lift */
  vec3 h=q-vec3(HS.x,PH+.026,HS.z); h.xz=rot(.5)*h.xz;
  d=min(d,sdRBox(h,vec3(.011,.006,.02),.003));
  d=min(d,sdCapsule(q,vec3(HS.x+.008,PH+.03,HS.z-.012),vec3(HS.x+.026,PH+.032,HS.z-.024),.0018));
  d=min(d,sdRBox(h-vec3(0.,-.008,-.004),vec3(.004,.004,.006),.0015));   /* cartridge */
  return d; }
float buttons(vec3 q){
  vec3 r=q-vec3(-.19,PH,-.145);
  float d=sdCylY(r-vec3(0.,.004,0.),.012,.004)-.0015;                    /* start button */
  d=min(d,sdCylY(r-vec3(.036,.0025,0.),.007,.0025)-.001);                /* speed buttons */
  d=min(d,sdCylY(r-vec3(.058,.0025,0.),.007,.0025)-.001);
  vec3 k=q-vec3(.19,PH,-.13);                                             /* pitch knob */
  d=min(d,sdCylY(k-vec3(0.,.007,0.),.012,.007)-.0015);
  return d; }
/* ---- the record sleeves ---- */
#define SC vec3(.46,0.,-.06)
float sleeve(vec3 p,vec3 c,float ry){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  return sdRBox(q,vec3(.155,.0032,.155),.0016); }
vec3 slq(vec3 p,int i){
  vec3 c=SC+(i==0?vec3(0.,.0032,0.):i==1?vec3(.012,.0098,-.01):vec3(-.006,.0164,.008));
  float ry=i==0?.12:i==1?-.1:.28;
  vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
float peek(vec3 p){ /* a record half out of the middle sleeve, toward the front */
  vec3 q=slq(p,1); return sdCylY(q-vec3(.03,0.,-.1),.146,.0011)-.0005; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=tq(p);
  float bb=sdBox(q-vec3(0.,.07,0.),vec3(.25,.08,.2));
  if(bb<.03){
    r=U(r,plinth(q),3.);
    r=U(r,platter(q),4.);
    r=U(r,record(q),5.);
    r=U(r,label(q),6.);
    r=U(r,arm(q),7.);
    r=U(r,armBase(q),8.);
    r=U(r,buttons(q),13.);
  } else r=U(r,bb,3.);
  for(int i=0;i<3;i++){ vec3 s=slq(p,i); r=U(r,sdRBox(s,vec3(.155,.0032,.155),.0016),9.+float(i)); }
  r=U(r,peek(p),12.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=tq(p);
  if(id==3.){ if(n.y>.7) return .62; return .45+.1*grain(vec3(q.x,q.y,q.z),26.); }
  if(id==4.) return .55;
  if(id==5.||id==12.){
    vec2 c=id==5.?q.xz-PC:(slq(p,1).xz-vec2(.03,-.1));
    float rr=length(c);
    /* a few wider bands between tracks, fine grooves in between */
    if(abs(rr-.078)<.0012||abs(rr-.1)<.0012||abs(rr-.123)<.0012) return .6;
    return .22+.04*sin(rr*2400.); }
  if(id==6.) return .88;
  if(id==7.) return .7;
  if(id==8.) return .35;
  if(id==13.) return .4;
  if(id>=9.&&id<=11.){
    vec3 s=slq(p,int(id-9.));
    if(s.y>0.&&id==11.){
      /* the top sleeve: a plain printed ring and two hint-lines, no words */
      float rr=length(s.xz-vec2(.0,.02));
      if(abs(rr-.085)<.0022) return .35;
      if(abs(s.z+.105)<.0022&&abs(s.x+.04)<.07) return .45;
      if(abs(s.z+.123)<.0022&&abs(s.x+.07)<.04) return .45; }
    return id==9.?.7:id==10.?.8:.9; }
  return .7; }
