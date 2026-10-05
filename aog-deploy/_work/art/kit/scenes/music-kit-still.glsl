/* The Drum Kit page — pencil still life: a five-piece drum kit seen from the front and a little to the left:
   the bass drum facing us on its spurs (a port hole in its front head), two toms on a mount above it, a floor tom
   on three legs, a snare on its stand, a hi-hat, a crash on a boom stand, a ride, and the stool behind.
   No names or logos. */
#define CAM_POS vec3(-2.6021,1.5878,-2.6780)
#define CAM_TGT vec3(-1.2701,0.5667,0.5186)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 40.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "musicparts.glsl"
/* where things are */
#define BD vec3(0.,.29,0.)
#define T1 vec3(-.17,.79,.03)
#define T2 vec3(.18,.80,.03)
#define FT vec3(.52,.43,.22)
#define SN vec3(-.50,.61,.16)
#define HH vec3(-.88,0.,.26)
#define CR vec3(-.52,1.24,.46)
#define RD vec3(.70,1.02,.44)
/* each drum's own frame (axis along y, batter head at +y) */
vec3 fBD(vec3 p){ vec3 q=p-BD; return vec3(q.x,q.z,-q.y); }
vec3 fT1(vec3 p){ vec3 q=p-T1; q.yz=rot(.42)*q.yz; q.xy=rot(-.12)*q.xy; return q; }
vec3 fT2(vec3 p){ vec3 q=p-T2; q.yz=rot(.42)*q.yz; q.xy=rot(.12)*q.xy; return q; }
vec3 fFT(vec3 p){ return p-FT; }
vec3 fSN(vec3 p){ vec3 q=p-SN; q.yz=rot(.08)*q.yz; return q; }
vec3 fCR(vec3 p){ vec3 q=p-CR; q.yz=rot(-.12)*q.yz; q.xy=rot(-.22)*q.xy; return q; }
vec3 fRD(vec3 p){ vec3 q=p-RD; q.yz=rot(.24)*q.yz; q.xy=rot(.14)*q.xy; return q; }
vec2 drums(vec3 p){
  vec2 r=vec2(1e3,0.);
  r=U(r,drumD(fBD(p),.28,.2,10.,3.));
  r=U(r,drumD(fT1(p),.15,.095,6.,3.));
  r=U(r,drumD(fT2(p),.16,.1,6.,3.));
  r=U(r,drumD(fFT(p),.19,.2,8.,3.));
  r=U(r,drumD(fSN(p),.178,.07,10.,3.));
  return r; }
float cymbals(vec3 p){
  float d=cymbalD(fCR(p),.23);
  d=min(d,cymbalD(fRD(p),.27));
  vec3 h=p-HH-vec3(0.,.93,0.); d=min(d,cymbalD(h,.18));
  vec3 hb=p-HH-vec3(0.,.905,0.); hb.y=-hb.y; d=min(d,cymbalD(hb,.18));
  return d; }
float hardware(vec3 p){
  float d=1e3;
  /* bass drum spurs and the tom mount */
  vec3 sx=vec3(abs(p.x),p.yz);
  d=min(d,segD(sx,vec3(.22,.13,-.06),vec3(.34,.012,-.16))-.008);
  d=min(d,sdRBox(p-vec3(0.,.575,.02),vec3(.03,.012,.035),.006));
  d=min(d,segD(p,vec3(0.,.58,.02),vec3(0.,.70,.04))-.012);
  d=min(d,segD(p,vec3(0.,.70,.04),T1+vec3(.1,-.07,.02))-.008);
  d=min(d,segD(p,vec3(0.,.70,.04),T2+vec3(-.1,-.07,.02))-.008);
  /* floor tom legs */
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.7; vec2 o=vec2(cos(a),sin(a));
    vec3 top=FT+vec3(o.x*.205,.12,o.y*.205), ft=FT+vec3(o.x*.27,-.43+.012,o.y*.27);
    d=min(d,segD(p,top,ft)-.0065); d=min(d,length(p-ft)-.012); }
  /* snare stand and its basket */
  vec3 ss=p-vec3(SN.x,0.,SN.z);
  d=min(d,tripod(ss,.3,.22,vec3(0.,.52,0.)));
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.3; d=min(d,segD(ss,vec3(0.,.52,0.),vec3(cos(a)*.12,.545,sin(a)*.12))-.005); }
  /* hi-hat: stand, rod, pedal */
  vec3 hs=p-HH;
  d=min(d,tripod(hs,.26,.24,vec3(0.,.86,0.)));
  d=min(d,sdCylY(hs-vec3(0.,.98,0.),.004,.1));
  d=min(d,sdRBox(hs-vec3(0.,.03,.18),vec3(.045,.012,.13),.008));
  /* crash: a boom stand */
  vec3 cs=p-vec3(-.78,0.,.62);
  d=min(d,tripod(cs,.32,.28,vec3(0.,1.02,0.)));
  d=min(d,segD(p,vec3(-.78,1.02,.62),CR+vec3(0.,-.03,0.))-.009);
  d=min(d,sdCylY(cs-vec3(0.,1.02,0.),.016,.02));
  /* ride: a straight stand */
  vec3 rs=p-vec3(.86,0.,.62);
  d=min(d,tripod(rs,.32,.28,vec3(0.,.90,0.)));
  d=min(d,segD(p,vec3(.86,.90,.62),RD+vec3(0.,-.03,0.))-.009);
  return d; }
float stool(vec3 p){
  vec3 s=p-vec3(-.05,0.,.85);
  float d=sdCylY(s-vec3(0.,.5,0.),.16,.035)-.02;
  d=smin(d,sdCylY(s-vec3(0.,.455,0.),.13,.01),.02);
  d=min(d,tripod(s,.18,.27,vec3(0.,.45,0.)));
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,60.-p.z,2.);
  r=U(r,drums(p));
  r=U(r,cymbals(p),6.);
  r=U(r,hardware(p),7.);
  r=U(r,stool(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ if(length(p-SN)<.25) return .72; return .38+.06*grain(p*vec3(1.,6.,1.),40.); }   /* wood shells; the snare's is metal */
  if(id==4.){                                                           /* heads */
    vec3 b=fBD(p);
    if(b.y<-.15&&length(b.xz)<.29){
      if(length(b.xz-vec2(.1,.1))<.055) return .08;                     /* port hole */
      if(abs(length(b.xz)-.17)<.003) return .55;
      return .8; }
    return .88; }
  if(id==5.) return .78;                                                /* chrome */
  if(id==6.){
    vec3 c=fCR(p); float rr=length(c.xz);
    vec3 c2=fRD(p); if(length(c2)<length(c)){ c=c2; rr=length(c.xz); }
    vec3 c3=p-HH-vec3(0.,.92,0.); if(length(c3)<length(c)){ c=c3; rr=length(c.xz); }
    if(rr<.06) return .7;
    return .74+.04*sin(rr*260.);                                        /* lathe lines */ }
  if(id==7.) return .4;
  if(id==8.) return .16;
  return .7; }
