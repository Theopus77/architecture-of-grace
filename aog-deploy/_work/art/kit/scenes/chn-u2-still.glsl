/* Chinese Classics Unit 2 "Stories of Laozi and Zhuangzi" — pencil still life: a gnarled
   little tree (Zhuangzi's "useless tree") in a shallow footed pot, a butterfly resting on the
   pot's rim (the butterfly dream), and a traveller's calabash gourd tied with a cord. */
#define CAM_POS vec3(-0.5045,0.4256,-1.1168)
#define CAM_TGT vec3(-0.2516,0.0714,0.1351)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define PC vec3(0.,0.,.1)
float pot(vec3 p){ vec3 q=p-PC;
  float d=sdRBox(q-vec3(0.,.045,0.),vec3(.16,.032,.09),.012);
  d=smax(d,-(q.y-.07),.004);
  float in_=sdRBox(q-vec3(0.,.08,0.),vec3(.148,.03,.078),.01); d=max(d,-in_);
  float lip=max(sdRBox(q-vec3(0.,.073,0.),vec3(.168,.005,.098),.004),-in_); d=min(d,lip);
  vec3 f=vec3(abs(q.x)-.12,q.y-.007,abs(q.z)-.06); d=min(d,sdRBox(f,vec3(.022,.009,.018),.005));
  return d; }
float soil(vec3 p){ vec3 q=p-PC; return max(sdRBox(q-vec3(0.,.06,0.),vec3(.146,.006,.076),.006),-1e5)-.002*fbm(q.xz*60.); }
float trunk(vec3 p){ vec3 q=p-PC;
  vec3 a=vec3(-.04,.06,0.),b=vec3(.01,.14,.01),c=vec3(-.05,.22,-.01),e=vec3(.03,.3,0.);
  float d=sdCapsule(q,a,b,.022);
  d=smin(d,sdCapsule(q,b,c,.016),.02);
  d=smin(d,sdCapsule(q,c,e,.011),.015);
  d=smin(d,sdCapsule(q,b,vec3(.12,.2,.02),.01),.015);
  d=smin(d,sdCapsule(q,c,vec3(-.15,.27,.0),.008),.012);
  d=smin(d,sdCapsule(q,a+vec3(0.,-.005,0.),vec3(-.1,.068,.02),.01),.02);   /* a surface root */
  d+=.003*(fbm(q.xy*80.+q.z*30.)-.5);
  return d; }
float pad(vec3 q,vec3 c,vec3 r){ vec3 u=(q-c)/r; float d=(length(u)-1.)*min(r.x,min(r.y,r.z)); d=max(d,-(q.y-c.y+r.y*.25));
  return d+.012*(fbm(q.xz*45.+c.xy*9.)-.5); }
float leaves(vec3 p){ vec3 q=p-PC;
  float d=pad(q,vec3(.13,.22,.02),vec3(.08,.035,.06));
  d=min(d,pad(q,vec3(-.16,.29,0.),vec3(.075,.032,.055)));
  d=min(d,pad(q,vec3(.03,.33,0.),vec3(.09,.04,.065)));
  return d; }
#define BF vec3(.12,.084,-.03)
float butterfly0(vec3 p){ vec3 q=p-(PC+BF); q.xz=rot(.5)*q.xz;
  vec2 w=vec2(abs(q.x),q.z); float open=.55; vec3 r=vec3(w.x*cos(open)+q.y*sin(open),0.,w.y); r.y=-w.x*sin(open)+q.y*cos(open);
  float up=length((r.xz-vec2(.018,.008))*vec2(1.,1.2))-.016, lo=length((r.xz-vec2(.012,-.012))*vec2(1.,1.1))-.011;
  float wing=max(min(up,lo),abs(r.y)-.0008);
  float body=sdCapsule(q,vec3(0.,.002,-.018),vec3(0.,.002,.016),.0028);
  return min(wing,body); }
float butterfly(vec3 p){ vec3 c=PC+BF; return butterfly0((p-c)/2.+c)*2.; }
#define GD vec3(.3,0.,-.03)
float gourd(vec3 p){ vec3 q=p-GD; q.xz=rot(-.6)*q.xz; q.xy=rot(1.45)*q.xy; q.y-=.0;   /* lying on its side, along x */
  vec3 u=q-vec3(0.,-.045,0.);
  float big=length(u*vec3(1.,1.,1.))-.045, small=length(u-vec3(0.,.075,0.))-.032;
  float d=smin(big,small,.022);
  d=smin(d,sdCylY(u-vec3(0.,.115,0.),.008,.012),.006);
  float cord=sdTorus(u-vec3(0.,.043,0.),.019,.0028);
  return min(d,cord); }
vec3 gQ(vec3 p){ vec3 q=p-GD; q.xz=rot(-.6)*q.xz; q.xy=rot(1.45)*q.xy; return q-vec3(0.,-.045,0.); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pot(p),3.);
  r=U(r,soil(p),4.);
  r=U(r,trunk(p),5.);
  r=U(r,leaves(p),6.);
  r=U(r,butterfly(p),7.);
  r=U(r,gourd(p-vec3(0.,.045,0.))*1.,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PC; if(q.z<-.08&&abs(q.x)<.12&&abs(q.y-.04)<.02&&abs(abs(q.y-.04)-.017)<.002) return .35; return .55; }
  if(id==4.) return .3;
  if(id==5.){ vec3 q=p-PC; return .45+.2*step(.5,fract(q.y*90.+fbm(q.xz*50.)*2.)); }
  if(id==6.) return .5+.3*fbm(p.xz*90.+p.y*40.);
  if(id==7.){ vec3 q=(p-(PC+BF))/2.; q.xz=rot(.5)*q.xz; float a=.85; vec2 w=vec2(abs(q.x),q.z);
    if(length(w-vec2(.024,.013))<.005) a=.3; if(abs(length((w-vec2(.018,.008))*vec2(1.,1.2))-.0145)<.0015) a=.3; if(abs(q.x)<.004) a=.2; return a; }
  if(id==8.){ vec3 u=gQ(p-vec3(0.,.045,0.)); if(abs(u.y-.043)<.004) return .3; if(u.y>.1) return .35; return .68; }
  return .7; }
