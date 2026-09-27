// @opts {"expo":1.55,"warm":.8,"bloom":.7,"vig":.35,"sat":1.15}
/* U.S. History, Unit 1 "Early Encounters": the great mound of Cahokia at dusk on the
   Mississippi floodplain — a terraced, flat-topped earthen mound with a thatched house on
   top, a timber palisade across the plain, a few houses, and a dugout canoe on the river
   in the foreground. The sun has just touched the horizon to the right. No people. */
#define CAM_POS vec3(0.,2.6,0.)
#define CAM_TGT vec3(0.,11.,450.)
#define CAM_FOV 16.
#define SUN_DIR vec3(1.,.05,.75)
#define MAXT 6000.
#define EXPOSURE 1.
#define TAU_M .2
#define FOG_DENS .0005
#define FOG_H 80.
#define CLOUDS
#define CLOUD_COVER .5
#define SUN_E 24.
#include "lib.glsl"
#include "pieces.glsl"

#define MC vec3(0.,0.,560.)
float plain(vec2 xz){ return (fbm(xz*.01)-.5)*1.2+ .6 + smoothstep(1400.,3000.,xz.y)*fbm(xz*.0015)*60.+smoothstep(1000.,1300.,xz.y)*(4.+(vn(xz*.05)+vn(xz*.13)*.5)*6.); }
float mound(vec3 p){
  vec3 q=p-MC;
  /* first terrace: broad platform, then the main block with a flat top */
  float t1=sdRBox(q-vec3(-10.,5.,-75.),vec3(95.,5.,55.),10.);
  float t2=sdRBox(q-vec3(95.,9.,0.),vec3(40.,9.,70.),12.);
  float b =sdRBox(q-vec3(-10.,15.,15.),vec3(100.,15.,95.),20.);
  float top=sdRBox(q-vec3(-35.,31.,25.),vec3(45.,2.,45.),6.);
  b=min(b,t2);
  float d=min(min(t1,b),top);
  /* battered earthen sides: offset by height (slope) and erosion noise */
  d=d-14.+ (q.y)*.75;
  d+= (fbm(q.xz*.03)-.5)*5.+(fbm(q.xz*.15+q.y*.1)-.5)*1.2;
  return d*.55;
}
float house(vec3 p,vec3 c,float r,float h){
  vec3 q=p-c; float wall=sdCylY(q-vec3(0,h*.35,0),r,h*.35);
  float roof=sdCone(q-vec3(0,h*.95,0),r*1.25,.05,h*.45);
  return min(wall,roof); }
float palisade(vec3 p){
  /* posts along a gentle arc across the plain, with square bastions */
  float z0=330.+ .0006*p.x*p.x;
  vec3 q=p-vec3(0,0,z0);
  float cell=.55; float x=mod(q.x+cell*.5,cell)-cell*.5;
  float post=max(length(vec2(x,q.z))-.24,q.y-(4.6+.35*h1(vec2(floor(q.x/cell),1.))));
  float wall=max(post,abs(q.x)-260.);
  float bx=mod(q.x+20.,40.)-20.;
  float bast=max(sdBox(vec3(bx,q.y-3.,q.z+3.),vec3(3.,3.6,3.2)),abs(q.x)-260.);
  bast=max(bast,-sdBox(vec3(bx,q.y-4.,q.z+3.),vec3(2.7,3.,2.9)));
  return min(wall,bast); }
float canoe(vec3 p){
  vec3 q=p-vec3(4.,-.16,40.); q.xz=rot(1.25)*q.xz;
  float hull=(length(q/vec3(.5,.42,3.3))-1.)*.35;
  hull=max(hull,q.y-.16);
  float in_=(length((q-vec3(0,.06,0))/vec3(.34,.26,2.85))-1.)*.26;
  return max(hull,-in_); }
float paddle(vec3 p){ vec3 q=p-vec3(4.,-.16,40.); q.xz=rot(1.25)*q.xz;
  return min(sdCapsule(q,vec3(-.1,.18,.5),vec3(.28,.2,-1.1),.02),sdRBox(q-vec3(.3,.2,-1.25),vec3(.07,.012,.22),.01)); }
vec2 map(vec3 p){
  vec2 r=vec2(1e5,-1.);
  float g=plain(p.xz);
  float bank=smoothstep(125.,140.,p.z);                         /* river in the foreground */
  float gh=mix(-1.2,g,bank)+ (1.-bank)*0.;
  float nb=smoothstep(-2.,-12.,p.x+ (fbm(p.xz*.08)-.5)*10.)*smoothstep(4.,12.,p.z)*smoothstep(40.,24.,p.z);
  gh=max(gh,mix(-1.2,.8+fbm(p.xz*.3)*.6,nb));
  r=U(r,(p.y-gh)*.8,1.);
  r=U(r,max(p.y-(-.05),p.z-140.),2.);
  if(abs(p.z-MC.z)<260.&&abs(p.x)<300.) r=U(r,mound(p),3.);
  if(abs(p.z-340.)<40.) r=U(r,palisade(p),4.);
  if(abs(p.z-MC.z)<120.){ r=U(r,house(p,MC+vec3(-35.,26.3,25.),6.,8.),5.); }
  if(p.z>345.&&p.z<380.){ float hx=mod(p.x+18.,36.)-18.; float hz=p.z-362.;
    if(abs(p.x)<250.) r=U(r,house(vec3(hx,p.y-g,hz),vec3(0),3.,4.2),5.); }
  /* groves on the plain */
  float grove=smoothstep(.55,.7,fbm(p.xz*.004+2.))*(9.+vn(p.xz*.3)*3.)*smoothstep(900.,1100.,p.z);
  if(grove>0.) r=U(r,(p.y-g-grove)*.6,6.);
  if(length(p-vec3(4.,0,40.))<5.){ r=U(r,canoe(p),7.); r=U(r,paddle(p),7.); }
  return r;
}
float grassH(vec3 p){ return grassHt(p.xz,footprint(distTo(p))); }
float thatchH(vec3 p){ return vn(vec2(atan(p.x,p.z)*60.,p.y*3.))*.5+fbm(p.xz*4.)*.5; }
Mat material(float id,vec3 p,inout vec3 n){
  float dc=distTo(p), fp=footprint(dc);
  if(id==1.){ vec3 g=grassAlb(p.xz,vec3(.09,.095,.04),fp);
    g=mix(vec3(.09,.075,.05)*(.7+.6*fbmL(p.xz*2.,fp*2.,4)),g,max(smoothstep(128.,136.,p.z),smoothstep(-.3,.5,p.y))); /* mud bank */
    if(dc<150.) BUMP(n,p,grassH,.12*smoothstep(150.,20.,dc));
    return mat(g,.9); }
  if(id==2.){ n=normalize(mix(vec3(0,1,0),waterN(p.xz*.6,dc),.35)); Mat m=mat(vec3(.015,.02,.02),.05); m.refl=1.; m.spec=.02; return m; }
  if(id==3.){ /* earthen mound under short grass, bare where worn */
    vec3 g=grassAlb(p.xz,vec3(.09,.09,.04),fp);
    vec3 e=vec3(.2,.13,.08)*(.7+.5*fbm(p.xz*.2));
    g=mix(g,e,smoothstep(.55,.8,fbm(p.xz*.05+p.y*.02))*.7+ (1.-n.y)*.25);
    return mat(g,.9); }
  if(id==4.){ return mat(vec3(.10,.075,.05)*(.7+.5*fbm(vec2(p.x*9.,p.y*.8))),.85); }
  if(id==5.){ float y=p.y; Mat m=mat(vec3(.25,.19,.1)*(.6+.6*vn(vec2(atan(p.x,p.z)*80.,p.y*2.))),.9);
    return m; }
  if(id==6.){ float lh=fbm3L(p*.4,fp*.4,4); Mat m=mat(vec3(.035,.045,.02)*(.4+1.2*lh),.8); m.sss=.2; return m; }
  if(id==7.){ return mat(woodAlb(p*vec3(.3,1.,1.),vec3(.12,.07,.04)),.7); }
  return mat(vec3(.5),.5);
}
vec3 shade(vec3 p,vec3 n,vec3 rd,Mat m,float t){
  return shadeOutdoor(p,n,rd,m,t,12.,t>200.?20.:1.,vec3(.1,.1,.06));
}
vec3 background(vec3 ro,vec3 rd){ return skyFull(ro,rd); }
vec3 atmosphere(vec3 c,vec3 ro,vec3 rd,float t){ return aerial(c,ro,rd,t); }
vec3 post(vec3 c,vec3 ro,vec3 rd,float t){ return c; }
