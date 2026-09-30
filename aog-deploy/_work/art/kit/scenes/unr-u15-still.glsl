/* The Unseen Realm Unit 15 "How Heiser Read the Bible" — pencil still life: a baked clay tablet
   from Ugarit with rows of little wedge marks (hint marks only), leaning against a stack of two
   thick reference books, and an archaeologist's pointed trowel lying in front (the tablets were
   dug up at Ras Shamra after a farmer's plough struck a tomb in 1928). */
#define CAM_POS vec3(-0.3798,0.2432,-0.7696)
#define CAM_TGT vec3(-0.2186,-0.0074,0.0720)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define BKS vec3(.06,0.,.12)
#define TAB vec3(.0,0.,.0)
#define TRW vec3(-.06,0.,-.13)
/* two books, one on the other, the top one turned a little */
vec3 bk1Q(vec3 p){ vec3 q=p-BKS; q.xz=rot(.12)*q.xz; return q; }
vec3 bk2Q(vec3 p){ vec3 q=p-BKS-vec3(.01,.056,.0); q.xz=rot(-.1)*q.xz; return q; }
#define B1 vec3(.13,.028,.1)
#define B2 vec3(.115,.024,.088)
/* the tablet: a thick rounded slab, pillowed faces, leaning back against the books */
vec3 tabQ(vec3 p){ vec3 q=p-TAB; q.xz=rot(.15)*q.xz; q.y-=.0; q.yz=rot(.3)*q.yz; return q-vec3(0.,.1,0.); }
float tabletD(vec3 p){ vec3 q=tabQ(p);
  float d=sdRBox(q,vec3(.075,.1,.012),.01);
  d-=.006*max(0.,1.-pow(abs(q.x)/.085,2.))*max(0.,1.-pow(abs(q.y)/.11,2.));   /* pillowed faces */
  if(d>.02) return d;
  d+=.0025*(fbm(q.xy*40.)-.5);
  float ch=length(q.xy-vec2(.07,.1))-.022; d=max(d,-ch);          /* a chipped corner */
  return d; }
float wedges(vec2 u){ /* rows of small wedge impressions: 1 = none, <1 = mark */
  float row=floor((u.y+.085)/.017); float fy=fract((u.y+.085)/.017);
  if(row<0.||row>9.||abs(u.x)>.058) return 1.;
  float cx=(u.x+.06)/.012; float col=floor(cx); float fx=fract(cx);
  float h=h1(vec2(col,row));
  if(h<.2) return 1.;
  if(h>.75){ /* a standing wedge: head triangle and a tail down */
    vec2 w=vec2(fx-.5,fy-.6); float tri=max(abs(w.x)*1.4+w.y*.8,-w.y-.12);
    return min(tri,sdSeg2(vec2(fx,fy),vec2(.5,.55),vec2(.5,.15))-.07)<.12?0.:1.; }
  vec2 w=vec2(fx-.3,fy-.5); float tri=max(abs(w.y)*1.4+w.x*.8,-w.x-.12);   /* a lying wedge */
  return min(tri,sdSeg2(vec2(fx,fy),vec2(.3,.5),vec2(.85,.5))-.07)<.12?0.:1.; }
/* the trowel: a flat pointed blade, a bent tang and a turned wooden handle */
vec3 trwQ(vec3 p){ vec3 q=p-TRW; q.xz=rot(-.3)*q.xz; return q; }
float bladeD(vec3 p){ vec3 q=trwQ(p)-vec3(.04,.004,0.);
  vec2 u=q.xz; float tri=max(abs(u.y)-(.1-u.x)*.36,max(u.x-.1,-u.x-.02));
  tri=max(tri,-u.x-.03);
  vec2 w=vec2(u.x+.02,u.y); float heel=max(abs(w.y)-.036,abs(w.x)-.0);
  float d2=min(tri,max(abs(u.y)-.036,max(-u.x-.02,u.x)));
  return max(d2,abs(q.y)-.0012)-.0006; }
float handleD(vec3 p){ vec3 q=trwQ(p);
  float tang=sdCapsule(q,vec3(.02,.005,0.),vec3(-.005,.022,0.),.0035);
  tang=min(tang,sdCapsule(q,vec3(-.005,.022,0.),vec3(-.03,.022,0.),.0035));
  float fer=sdCylX(q-vec3(-.038,.022,0.),.0085,.008)-.001;
  float h=sdCapsule(q,vec3(-.05,.022,0.),vec3(-.14,.022,0.),.011+.0);
  h=smin(h,sdCylX(q-vec3(-.052,.022,0.),.0105,.004),.004);
  return min(min(tang,fer),h); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,bookD(bk1Q(p),B1),3.);
  r=U(r,bookD(bk2Q(p),B2),4.);
  r=U(r,tabletD(p),5.);
  r=U(r,bladeD(p),6.);
  r=U(r,handleD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return bookT(bk1Q(p),B1,.4);
  if(id==4.) return bookT(bk2Q(p),B2,.55);
  if(id==5.){ vec3 q=tabQ(p); float a=.62+.1*(fbm(q.xy*30.)-.5);
    if(q.z<-.008&&wedges(q.xy)<.5) a=.42;
    if(q.z<-.008&&abs(q.y-.1+.017*10.)<.0012&&abs(q.x)<.06) a=.45;
    return a; }
  if(id==6.) return .8;
  if(id==7.){ vec3 q=trwQ(p); if(q.x>-.045) return .4; return .55+.12*grain(q.zyx*vec3(1.,1.,1.),60.); }
  return .7; }
