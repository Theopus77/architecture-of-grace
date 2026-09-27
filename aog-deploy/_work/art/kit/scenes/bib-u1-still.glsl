/* Bible Unit 1 "Beginnings" — pencil still life: a great old book open on a wooden
   lectern (the biggest book in the house), a rolled scroll tied with a cord, and a clay
   oil lamp with a small flame. Pages carry only hint-lines of text. No figures. */
#define CAM_POS vec3(-0.369,0.287,-0.753)
#define CAM_TGT vec3(-0.310,0.045,0.120)
#define CAM_FOV 33.
#define SUN_DIR vec3(-.7,.8,-.25)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define LC vec3(-.02,.0,.08)
#define TILT -.55
/* lectern frame: local x across, y up off the slanted board, z up the slope */
vec3 lecQ(vec3 p){ vec3 q=p-(LC+vec3(0.,.115,0.)); q.yz=rot(TILT)*q.yz; return q; }
float lectern(vec3 p){
  vec3 q=p-LC;
  float base=sdRBox(q-vec3(0.,.035,.03),vec3(.15,.035,.1),.006);
  /* the wedge body under the board */
  vec3 b=lecQ(p); float board=sdRBox(b-vec3(0.,-.008,0.),vec3(.17,.009,.125),.003);
  float lip=sdRBox(b-vec3(0.,.008,-.122),vec3(.17,.012,.006),.002);
  float wedge=max(sdBox(q-vec3(0.,.07,.03),vec3(.145,.07,.1)),b.y+.01);
  return min(min(base,wedge),min(board,lip)); }
vec2 codex(vec3 p){
  vec3 q=lecQ(p)-vec3(0.,.0,.005);
  float x=abs(q.x);
  float lift=.028*sin(clamp(x/.15,0.,1.)*1.9)-.018*exp(-x*50.)+.008;
  float pages=sdBox(vec3(x-.078,q.y-lift*.5,q.z),vec3(.076,max(lift*.5,.003),.108))-.0015;
  float cover=sdRBox(vec3(x-.082,q.y+.001,q.z),vec3(.086,.004,.116),.002);
  return vec2(pages,cover); }
/* a double scroll lying on the table: two rolls on wooden rods, a band of sheet between */
float scroll(vec3 p){
  vec3 q=p-vec3(-.33,0.,.1); q.xz=rot(-.3)*q.xz;
  float d=1e5;
  for(int i=0;i<2;i++){ float s=i==0?-1.:1.; vec3 c=q-vec3(0.,.024,s*.03);
    d=min(d,sdCylX(c,.022,.085)-.001);
    d=min(d,sdCylX(c,.005,.125));
    d=min(d,sdCylX(c-vec3(.1,0,0),.017,.003)-.001); d=min(d,sdCylX(c+vec3(.1,0,0),.017,.003)-.001);
    d=min(d,length(c-vec3(.13,0,0))-.008); d=min(d,length(c+vec3(.13,0,0))-.008); }
  d=min(d,sdBox(q-vec3(0.,.0015,0.),vec3(.085,.0012,.03)));
  return d; }
#define LP vec3(.33,0.,.08)
float lamp0(vec3 p){
  vec3 q=p-LP; q.xz=rot(3.3)*q.xz;
  float body=(length((q-vec3(0,.026,0))/vec3(.058,.03,.05))-1.)*.03;
  float spout=sdCapsule(q,vec3(.03,.035,0),vec3(.085,.045,0),.012);
  spout=max(spout,-sdCapsule(q,vec3(.06,.05,0),vec3(.09,.056,0),.006));
  float fill=max(length(q-vec3(-.005,.058,0))-.014,-(length(q-vec3(-.005,.058,0))-.009));
  float body2=smin(body,spout,.01); body2=max(body2,-(length(q-vec3(-.005,.064,0))-.012));
  float handle=sdTorus((q-vec3(-.06,.035,0)).xzy,.017,.004);
  float foot=sdCylY(q-vec3(0,.004,0),.03,.004);
  return min(min(body2,handle),foot); }
float lamp(vec3 p){ return lamp0((p-LP)/1.45+LP)*1.45; }
float flame(vec3 p){ p=(p-LP)/1.45+LP; vec3 q=p-LP; q.xz=rot(3.3)*q.xz; q-=vec3(.088,.078,0.);
  float r=.011*(1.-smoothstep(-.014,.036,q.y))+.0015; return (length(vec3(q.x,q.y*.5+.004,q.z))-r)*1.45; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lectern(p),3.);
  vec2 c=codex(p); r=U(r,c.x,4.); r=U(r,c.y,5.);
  r=U(r,scroll(p),6.);
  r=U(r,lamp(p),7.);
  r=U(r,flame(p),8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .45;
  if(id==4.){ vec3 q=lecQ(p); float x=abs(q.x); float a=.94;
    /* two columns of hint-lines on each page, a square initial at the top left */
    float col=abs(abs(x-.078)-.034); float l=fract((q.z+.2)/.0105);
    if(col<.03&&abs(q.z)<.092&&l<.28) a=.62;
    if(q.x<0.&&abs(x-.122)<.014&&q.z>.062&&q.z<.09) a=.4;
    if(x<.006) a=.7;
    return a; }
  if(id==5.) return .3;
  if(id==6.){ vec3 q=p-vec3(-.33,0.,.1); q.xz=rot(-.3)*q.xz; if(abs(q.x)>.087) return .35; if(q.y<.004&&fract(q.x/.01)<.3&&abs(q.x)<.07) return .6; return .88; }
  if(id==7.) return .55;
  if(id==8.) return 1.;
  return .7; }
