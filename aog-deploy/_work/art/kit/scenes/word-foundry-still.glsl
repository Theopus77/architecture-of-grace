/* The Word Foundry — pencil still life: a wooden printer's type tray with six compartments;
   three big wooden letter blocks carved A, B and C sit face up in the front row, small plain
   type sorts fill the back row, and a small anvil with a horn stands beside the tray. */
#define CAM_POS vec3(-0.4298,0.4801,-0.6435)
#define CAM_TGT vec3(-0.1287,-0.0618,0.0340)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- the type tray ---- */
#define TC vec3(-.02,0.,.05)
#define TRY -.3
#define TW .165
#define TD .115
#define TH .032
vec3 tq(vec3 p){ vec3 q=p-TC; q.xz=rot(TRY)*q.xz; return q; }
float tray(vec3 q){
  float outer=sdRBox(q-vec3(0.,TH*.5,0.),vec3(TW,TH*.5,TD),.003);
  float inner=sdBox(q-vec3(0.,TH*.5+.007,0.),vec3(TW-.012,TH*.5,TD-.012));
  float d=max(outer,-inner);
  /* dividers: two across, one along */
  float cw=(TW-.012)*2./3.;
  vec3 v=vec3(abs(q.x)-cw*.5,q.y-TH*.5,q.z);
  d=min(d,sdRBox(v,vec3(.004,TH*.5-.001,TD-.012),.0015));
  d=min(d,sdRBox(q-vec3(0.,TH*.5-.001,0.),vec3(TW-.012,TH*.5-.002,.004),.0015));
  return d; }
/* compartment centres: column -1..1, row 0 (front) or 1 (back) */
vec3 cellC(float i,float row){ float cw=(TW-.012)*2./3.; return vec3(i*cw,.007,row>.5?(TD-.012)*.5:-(TD-.012)*.5); }
#define BS .036     /* half size of a big letter block */
#define BHT .046    /* its height */
float letterBlock(vec3 q,float i,int g){
  vec3 c=cellC(i,0.)+vec3(.0,0.,.002); vec3 b=q-c;
  b.xz=rot(i*.05)*b.xz;
  float d=sdRBox(b-vec3(0.,BHT*.5,0.),vec3(BS,BHT*.5,BS),.0035);
  if(d>.01) return d;
  return carve(d,b.xz*vec2(1.,1.),g,.056,.0058,b.y-BHT,.004); }
/* the back row: little plain sorts standing in rows */
float sorts(vec3 q){
  float d=1e5;
  for(int i=-1;i<=1;i++){
    vec3 c=cellC(float(i),1.);
    vec3 s=q-c;
    vec2 id=clamp(floor(s.xz/vec2(.016,.02)+vec2(2.,1.5)),vec2(0.),vec2(3.,2.));
    vec2 o=(id-vec2(1.5,1.))*vec2(.016,.02);
    float hgt=.018+.006*h1(id+float(i)*7.);
    float k=sdRBox(vec3(s.x-o.x,s.y-hgt*.5,s.z-o.y),vec3(.0068,hgt*.5,.0085),.0012);
    if(i==1&&id.y>1.5) k=1e5;                  /* a few taken out */
    d=min(d,k); }
  return d; }
/* ---- the anvil ---- */
#define AC vec3(.2,0.,-.19)
#define AS 1.2     /* anvil scale */
#define ARY -.55
vec3 aq(vec3 p){ vec3 q=p-AC; q.xz=rot(ARY)*q.xz; return q/AS; }
float anvil(vec3 q){
  float face=sdRBox(q-vec3(.01,.072,0.),vec3(.052,.011,.026),.003);
  face=max(face,-sdBox(q-vec3(.042,.083,0.),vec3(.005,.006,.005)));   /* hardy hole */
  float waist=sdRBox(q-vec3(.01,.046,0.),vec3(.034,.02,.019),.004);
  waist=smin(waist,face,.012);
  float base=sdRBox(q-vec3(.01,.012,0.),vec3(.048,.012,.03),.004);
  base=smin(base,waist,.014);
  /* the horn: a tapered cone out of the face's left end, curving down a little */
  vec3 h=q-vec3(-.042,.072,0.);
  float t=clamp(-h.x/.07,0.,1.);
  float hr=mix(.018,.003,t);
  float horn=length(vec2(h.y+t*t*.01,h.z))-hr;
  horn=max(horn,max(h.x-.0,-h.x-.07))*.8;
  return smin(base,horn,.006); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=tq(p);
  float bb=sdBox(q-vec3(0.,.03,0.),vec3(TW+.01,.05,TD+.01));
  if(bb<.03){
    r=U(r,tray(q),3.);
    r=U(r,letterBlock(q,-1.,65),4.);
    r=U(r,letterBlock(q,0.,66),5.);
    r=U(r,letterBlock(q,1.,67),6.);
    r=U(r,sorts(q),7.);
  } else r=U(r,bb,3.);
  r=U(r,anvil(aq(p))*AS,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=tq(p);
  if(id==3.) return .58+.12*grain(vec3(q.z,q.y,q.x),28.);
  if(id>=4.&&id<=6.){
    float i=id-5.; vec3 b=q-cellC(i,0.)-vec3(0.,0.,.002); b.xz=rot(i*.05)*b.xz;
    int g=id==4.?65:id==5.?66:67;
    float gd=glyph(b.xz/.056,g)*.056;
    if(b.y>BHT-.005&&gd<.0072) return .12;                               /* the carved letter */
    if(b.y>BHT-.0005) return .8;
    return .62+.1*grain(vec3(b.x,b.y*3.,b.z),40.); }
  if(id==7.) return .5;
  if(id==8.) return .35;
  return .7; }
