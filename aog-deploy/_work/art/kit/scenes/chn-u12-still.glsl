/* Chinese Classics Unit 12 "Close Reading the Analects" — pencil still life: a stitched book
   lying open on a low wooden book rest, a round reading glass laid on its right page (reading
   closely), and a thin bamboo bookmark slip. Hint-columns only, no script. */
#define CAM_POS vec3(-0.3016,0.2060,-0.5007)
#define CAM_TGT vec3(-0.1654,0.0016,0.0997)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define RC vec3(0.,0.,.12)
#define TILT -.35
/* rest: a low wedge; board frame q: x across, y up off the board, z up the slope */
vec3 rQ(vec3 p){ vec3 q=p-(RC+vec3(0.,.06,0.)); q.yz=rot(TILT)*q.yz; return q; }
float rest(vec3 p){ vec3 q=p-RC; vec3 b=rQ(p);
  float board=sdRBox(b-vec3(0.,-.008,0.),vec3(.2,.008,.13),.003);
  float lip=sdRBox(b-vec3(0.,.006,-.127),vec3(.2,.01,.006),.002);
  float body=max(sdRBox(q-vec3(0.,.04,.02),vec3(.18,.04,.11),.004),b.y+.012);
  body=max(body,-max(sdBox(q-vec3(0.,.02,0.),vec3(.14,.02,.2)),-1.));   /* an arched gap under it */
  return min(min(board,lip),body); }
vec2 book(vec3 p){ vec3 q=rQ(p); float x=abs(q.x);
  float lift=.02*sin(clamp(x/.17,0.,1.)*1.9)-.012*exp(-x*60.)+.005;
  float pages=sdBox(vec3(x-.085,q.y-lift*.5,q.z),vec3(.084,max(lift*.5,.003),.11))-.0012;
  float cover=sdRBox(vec3(x-.088,q.y+.0005,q.z),vec3(.088,.003,.114),.0015);
  return vec2(pages,cover); }
/* reading glass: a rim ring with a short handle, lying on the right page */
vec3 gQ(vec3 p){ vec3 q=rQ(p)-vec3(.09,.028,-.01); q.xz=rot(.5)*q.xz; return q; }
float glassRim(vec3 p){ vec3 q=gQ(p); float d=sdTorus(q,.045,.005);
  d=min(d,sdCapsule(q,vec3(.05,0.,0.),vec3(.13,-.002,0.),.007));
  d=min(d,sdCylX(q-vec3(.058,0.,0.),.008,.006)-.001);
  return d; }
float lens(vec3 p){ vec3 q=gQ(p); return max(length(q.xz)-.045,abs(q.y)-.0025+length(q.xz)*.03); }
float mark(vec3 p){ vec3 q=rQ(p)-vec3(-.08,.012,.02); q.xz=rot(.25)*q.xz; q.yz=rot(-.25)*q.yz;
  return sdRBox(q-vec3(0.,0.,.09),vec3(.008,.0015,.1),.001); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rest(p),3.);
  vec2 b=book(p); r=U(r,b.x,4.); r=U(r,b.y,5.);
  r=U(r,glassRim(p),6.);
  r=U(r,lens(p),7.);
  return r; }
float cols(vec3 q,float pitch,float w){ float x=abs(q.x); if(x<.012||x>.16||abs(q.z)>.09) return .95;
  float c=fract(q.x/pitch); float cell=floor(q.x/pitch); float len=.06+.03*h1(vec2(cell,3.));
  if(c<w&&q.z>.09-len*2.) return .6; return .95; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45+.12*grain(p,35.);
  if(id==4.){ vec3 q=rQ(p); float a=cols(q,.011,.22);
    vec3 g=gQ(p); float r=length(g.xz); if(r<.043) a=cols(q*.0+vec3(q.x,q.y,q.z)*1.,.022,.2)<.9?.45:.95;   /* bigger columns seen through the glass */
    if(abs(q.x)<.004) a=.72; return a; }
  if(id==5.) return .35;
  if(id==6.) return .35;
  if(id==7.) return .9;
  if(id==8.) return .6;
  return .7; }
