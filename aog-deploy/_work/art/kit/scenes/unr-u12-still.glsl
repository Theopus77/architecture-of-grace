/* The Unseen Realm Unit 12 "Reversing Hermon: The Forgotten Mission" — pencil still life: a
   weathered block of stone with an arched niche cut into its face (the niches in the cliff at
   Caesarea Philippi, below Mount Hermon), a large old iron key lying in front (Matthew 16:19),
   and a clay water pitcher (the Banias spring that pours from the rock). */
#define CAM_POS vec3(-0.4419,0.3034,-0.9411)
#define CAM_TGT vec3(-0.2453,0.0193,0.0862)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#define STN vec3(-.03,0.,.1)
#define KEY vec3(-.02,0.,-.12)
#define PIT vec3(.2,0.,.02)
float sdB2(vec2 p,vec2 b,float r){ vec2 d=abs(p)-b+r; return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }
/* the stone: a squared block, worn at the edges, with an arched niche and a small ledge */
vec3 stnQ(vec3 p){ vec3 q=p-STN; q.xz=rot(.18)*q.xz; return q; }
float niche2(vec2 u){ /* arch outline: box below, half disc above */
  float b=sdB2(u-vec2(0.,-.03),vec2(.052,.05),.002);
  float a=length(u-vec2(0.,.02))-.052;
  return min(b,a); }
float stoneD(vec3 p){ vec3 q=stnQ(p);
  float d=sdRBox(q-vec3(0.,.13,0.),vec3(.13,.13,.07),.012);
  if(d>.03) return d;
  d+=.004*(fbm(q.xy*30.+q.z*20.)-.5)+.002*vn3(q*140.);
  vec2 u=vec2(q.x,q.y-.135);
  float n=niche2(u);
  float cut=max(n,q.z+.02);                                        /* 5 cm deep into the front */
  cut=max(cut,-(q.z+.1));
  d=max(d,-cut);
  float frame=max(abs(niche2(u))-.0045,abs(q.z+.07)-.004);          /* a thin cut border round the arch */
  frame=max(frame,-(u.y+.08));
  d=max(d,-max(abs(niche2(u)-.012)-.0025,abs(q.z+.071)-.003));
  return d; }
float ledgeD(vec3 p){ vec3 q=stnQ(p);
  return sdRBox(q-vec3(0.,.012,-.075),vec3(.14,.012,.018),.004)+.002*vn3(q*120.); }
/* the key: ring bow, turned collar, long shaft, a bit with two teeth; lying on the table */
vec3 keyQ(vec3 p){ vec3 q=p-KEY; q.xz=rot(-.25)*q.xz; return q; }
float keyD(vec3 p){ vec3 q=(keyQ(p)-vec3(0.,.01,0.))/1.25;
  float bow=sdTorus(q-vec3(-.1,0.,0.),.024,.0065);
  bow=min(bow,sdTorus(q-vec3(-.1,0.,0.),.011,.0035));
  bow=min(bow,sdCapsule(q,vec3(-.113,0.,0.),vec3(-.087,0.,0.),.0035));
  float shaft=sdCylX(q-vec3(-.02,0.,0.),.0055,.058)-.001;
  float col=sdCylX(q-vec3(-.07,0.,0.),.0085,.006)-.0015;
  col=min(col,sdCylX(q-vec3(-.056,0.,0.),.0075,.003)-.001);
  float tip=sdCylX(q-vec3(.043,0.,0.),.0068,.006)-.001;
  vec3 b=q-vec3(.024,0.,-.018); float bit=sdRBox(b,vec3(.017,.0035,.016),.0015);
  bit=max(bit,-sdBox(b-vec3(.0,0.,-.012),vec3(.004,.01,.008)));
  return min(min(bow,shaft),min(col,min(tip,bit)))*1.25; }
/* the pitcher: round belly, narrow neck, flared lip with a pinched spout, strap handle */
float pitD(vec3 p){ vec3 q=p-PIT; q.xz=rot(3.5)*q.xz; float r=length(q.xz);
  float belly=sdEll(q-vec3(0.,.075,0.),vec3(.072,.075,.072));
  float neck=sdCylY(q-vec3(0.,.165,0.),.034-.01*sin(clamp((q.y-.13)/.07,0.,1.)*3.14),.035);
  float d=smin(belly,neck,.03); d=max(d,-q.y+.002);
  float foot=sdCylY(q-vec3(0.,.006,0.),.042,.006)-.002; d=min(d,foot);
  float lip=sdTorus(q-vec3(0.,.198,0.),.037,.005);
  vec3 s=q-vec3(.04,.197,0.); float spout=sdEll(s,vec3(.02,.006,.014)); spout=max(spout,-sdEll(s-vec3(-.004,.004,0.),vec3(.017,.005,.009)));
  d=min(d,min(lip,spout));
  d=max(d,-sdCylY(q-vec3(0.,.2,0.),.03,.03));                       /* the open mouth */
  vec3 h=q-vec3(-.058,.14,0.); float hd=sdB2(vec2(length(h.xy*vec2(1.,.8))-.042,h.z),vec2(.0035,.008),.003);
  hd=max(hd,h.x+.012);
  d=min(d,hd);
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stoneD(p),3.);
  r=U(r,ledgeD(p),4.);
  r=U(r,keyD(p),5.);
  r=U(r,pitD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=stnQ(p); float a=.7+.12*(fbm(q.xy*18.+q.z*9.)-.5);
    vec2 u=vec2(q.x,q.y-.135); if(q.z>-.068&&niche2(u)<0.) a=.42;            /* the niche's inside, in shade */
    if(abs(niche2(u)-.012)<.003&&q.z<-.066) a=.4;
    if(fract(q.y/.065+.3*fbm(q.xz*8.))<.03&&abs(q.x)>.09) a=.5;               /* tool marks */
    return a; }
  if(id==4.) return .66+.1*(fbm(p.xz*30.)-.5);
  if(id==5.) return .38;
  if(id==6.){ vec3 q=p-PIT; if(abs(q.y-.12)<.0025||abs(q.y-.105)<.0018) return .38; return .6+.05*fbm(q.xy*30.); }
  return .7; }
