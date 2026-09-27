/* Chinese Classics Unit 1 "Stories of Confucius" — pencil still life: an unrolled book of
   bamboo slips tied with two cords (its far end still rolled), a writing brush resting on
   a small stand, and a rectangular ink stone. Slips carry hint-dashes only, no script. */
#define CAM_POS vec3(-0.2933,0.4949,-0.9024)
#define CAM_TGT vec3(-0.0968,0.0039,0.1116)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define SW .016
#define NS 11.
/* slips frame: x across the slips, z along each slip */
vec3 slQ(vec3 p){ vec3 q=p-vec3(-.02,0.,.06); q.xz=rot(-.18)*q.xz; return q; }
float slips(vec3 p){
  vec3 q=slQ(p);
  float i=clamp(floor(q.x/SW+.5),0.,NS-1.);
  vec3 c=q-vec3(i*SW,.0035,0.);
  float d=sdRBox(c,vec3(SW*.44,.0032,.13),.0015);
  /* the rolled end on the right: a bundle of slips seen end-on */
  vec3 r=q-vec3(-SW*.5-.02,.02,0.);
  float roll=sdCylZ(r,.02,.13)-.001;
  roll=max(roll,-max(abs(length(r.xy)-.012)-.0012,abs(r.z)-.14));
  d=min(d,roll);
  return d; }
float cords(vec3 p){
  vec3 q=slQ(p); float d=1e5;
  for(int k=0;k<2;k++){ float z=k==0?-.075:.075; vec3 c=q-vec3(0.,.0075,z);
    float fl=max(abs(c.y)-.0012,max(abs(c.z)-.0022,max(-c.x-.02,c.x-(NS*SW-.002))));
    vec3 r=q-vec3(-SW*.5-.02,.02,z); float ring=sdTorus(r.xzy,.0215,.0022);
    d=min(d,min(fl-.0006,ring)); }
  return d; }
/* a round brush pot holding three brushes */
#define BP vec3(.15,0.,.13)
float pot(vec3 p){ vec3 q=p-BP; float r=.055+.004*sin(q.y*40.);
  float d=sdCylY(q-vec3(0.,.075,0.),r,.075)-.003;
  d=max(d,-sdCylY(q-vec3(0.,.16,0.),r-.008,.08));
  d=min(d,sdTorus(q-vec3(0.,.15,0.),r+.001,.004));
  d=min(d,sdTorus(q-vec3(0.,.012,0.),r+.002,.005));
  return d; }
vec3 brQk(vec3 p,float k){ vec3 q=p-(BP+vec3(0.,.02,0.)); q.xz=rot(k*2.1+.3)*q.xz; q.xy=rot(-.14-.05*k)*q.xy; return q; }
float brush1(vec3 q){ /* along +y, tip down inside the pot, cap loop up */
  float shaft=sdCylY(q-vec3(0.,.11,0.),.0055,.075);
  float fer=sdCylY(q-vec3(0.,.035,0.),.0068,.012)-.001;
  float loop=sdTorus((q-vec3(0.,.197,0.)).xzy,.007,.0015);
  float cap=sdCylY(q-vec3(0.,.184,0.),.0045,.006)-.001;
  return min(min(shaft,fer),min(loop,cap)); }
float brush(vec3 p){ float d=1e5; for(int k=0;k<3;k++){ float h=k==1?.03:0.; vec3 q=brQk(p,float(k)); q.y-=h; d=min(d,brush1(q)); } return d; }
/* ink stone with a sunk well at one end, and an ink stick lying on it */
#define IS vec3(.33,0.,-.02)
float inkstone(vec3 p){ vec3 q=p-IS; q.xz=rot(-.25)*q.xz;
  float d=sdRBox(q-vec3(0.,.016,0.),vec3(.075,.016,.11),.008);
  float dish=sdRBox(q-vec3(0.,.034,-.012),vec3(.058,.008,.08),.02);
  d=max(d,-dish);
  float well=length((q-vec3(0.,.03,.075))*vec3(1.,1.,1.6))-.035; d=max(d,-well);
  return d; }
float inkstick(vec3 p){ vec3 q=p-IS; q.xz=rot(-.25)*q.xz; q-=vec3(.0,.022,-.03); q.xz=rot(.5)*q.xz; q.xy=rot(.06)*q.xy;
  return sdRBox(q,vec3(.05,.007,.012),.003); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,slips(p),3.);
  r=U(r,cords(p),4.);
  r=U(r,pot(p),5.);
  r=U(r,brush(p),6.);
  r=U(r,inkstone(p),7.);
  r=U(r,inkstick(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=slQ(p); if(q.x<-SW*.5) return .62+.12*step(.5,fract(length(q.xy-vec2(-SW*.5-.02,.02))/.004));
    float i=floor(q.x/SW+.5); float u=q.x-i*SW; if(abs(u)>SW*.4) return .4;
    if(n.y>.8&&abs(u)<.0025&&q.z<.1&&q.z>-.11&&abs(q.z+.075)>.01&&abs(q.z-.075)>.01){
      float cell=floor(q.z/.016); float on=h1(vec2(i,cell)); if(fract(q.z/.016)<.45&&on>.5) return .35; }
    return .8; }
  if(id==4.) return .35;
  if(id==5.){ vec3 q=p-BP; if(abs(q.y-.08)<.03){ float a=atan(q.z,q.x); if(abs(fract(a*1.2+q.y*6.)-.5)<.05) return .35; } return .82; }
  if(id==6.) return fract(p.y/.07)<.08?.4:.68;
  if(id==7.){ vec3 q=p-IS; q.xz=rot(-.25)*q.xz; if(q.y<.025) return .35; return .22; }
  if(id==8.) return .15;
  return .7; }
