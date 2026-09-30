/* The Unseen Realm Unit 17 "How the Story Was Received, and Capstone" — pencil still life: a
   thick old leather-bound codex with brass corner pieces and two brass clasps, lying open on a
   low slanted wooden book rest (pages in hint-lines only), a small stack of newer printed books,
   and a quill lying across a writing pad with a few hint-lines (the student's capstone essay). */
#define CAM_POS vec3(-0.2891,0.1885,-0.6755)
#define CAM_TGT vec3(-0.1497,-0.0284,0.0526)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define RST vec3(-.02,0.,.14)
#define BKS vec3(.2,0.,.0)
#define PAD vec3(-.04,0.,-.1)
#define SLANT .38
/* the book rest: a wedge of wood, low at the front, with a lip to hold the codex */
#define SC .72
vec3 rstQ(vec3 p){ vec3 q=(p-RST)/SC; q.xz=rot(-.08)*q.xz; return q; }
float restD(vec3 p){ vec3 q=rstQ(p);
  float b=sdRBox(q-vec3(0.,.05,0.),vec3(.2,.05,.1),.004);
  vec3 s=q-vec3(0.,.03,-.1); s.yz=rot(-SLANT)*s.yz;                    /* slanted top plane */
  b=max(b,s.y);
  float lip=sdRBox(q-vec3(0.,.035,-.097),vec3(.2,.012,.006),.002);
  return min(b,lip)*SC; }
/* the codex in its own frame: lying on the slanted top of the rest */
vec3 cdxQ(vec3 p){ vec3 q=rstQ(p)-vec3(0.,.03,-.1); q.yz=rot(-SLANT)*q.yz; return q-vec3(0.,.0,.12); }
float codexD(vec3 p,out float part){ vec3 q=cdxQ(p); float x=abs(q.x);
  float board=sdRBox(vec3(x-.105,q.y-.007,q.z),vec3(.105,.007,.125),.004);
  float lift=.028*sin(clamp(x/.2,0.,1.)*1.9+.3)-.014*exp(-x*60.);
  float pages=sdBox(vec3(x-.1,q.y-.02-lift*.5,q.z),vec3(.092,.008+max(lift*.5,0.),.114))-.002;
  pages=max(pages,-(x-.004));
  part=pages<board?1.:0.;
  return min(board,pages)*SC; }
float brassD(vec3 p){ vec3 q=cdxQ(p); float x=abs(q.x);
  /* corner pieces on the boards' outer corners */
  vec3 c=vec3(x-.19,q.y-.0145,abs(q.z)-.108); float corner=sdRBox(c,vec3(.02,.0015,.02),.002);
  corner=max(corner,-(c.x+c.z+.012));
  /* two clasps hanging open from the fore-edges: strap and hook */
  vec3 k=vec3(x-.215,q.y-.004,abs(q.z-.0)-.06);
  float strap=sdRBox(k-vec3(.01,-.004,0.),vec3(.018,.0018,.009),.001);
  float hook=sdRBox(k-vec3(.03,-.006,0.),vec3(.006,.003,.011),.0015);
  return min(corner,min(strap,hook))*SC; }
/* newer printed books, stacked */
vec3 bq(vec3 p,int i){ vec3 q=p-BKS-vec3(0.,i==0?0.:i==1?.036:i==2?.066:.092,0.); q.xz=rot(i==0?.15:i==1?-.1:i==2?.25:.05)*q.xz; return q; }
vec3 bs(int i){ return i==0?vec3(.085,.018,.065):i==1?vec3(.078,.015,.058):i==2?vec3(.07,.013,.052):vec3(.062,.012,.046); }
float booksD(vec3 p,out float w){ float d=1e3; w=0.;
  for(int i=0;i<4;i++){ float e=bookD(bq(p,i),bs(i)); if(e<d){ d=e; w=float(i); } }
  return d; }
/* the writing pad and a quill lying across it */
vec3 padQ(vec3 p){ vec3 q=p-PAD; q.xz=rot(.18)*q.xz; return q; }
float padD(vec3 p){ vec3 q=padQ(p); return sdRBox(q-vec3(0.,.004,0.),vec3(.08,.004,.058),.001); }
vec3 quQ(vec3 p){ vec3 q=padQ(p)-vec3(-.01,.0095,.0); q.xz=rot(-.35)*q.xz; return q; }
float quillLD(vec3 p){ vec3 q=quQ(p);                                    /* along x, nib to -x */
  float t=clamp((q.x+.09)/.2,0.,1.);
  float shaft=sdCapsule(q,vec3(-.09,0.,0.),vec3(.11,.003,0.),.0018);
  float nib=max(sdCapsule(q,vec3(-.11,-.001,0.),vec3(-.09,0.,0.),.0016),0.);
  float w=.02*sin(3.1416*clamp((q.x+.03)/.14,0.,1.))*(1.+.3*(q.x-.04)*10.*0.);
  float vane=max(abs(q.z+.002*sin(q.x*60.))-w,abs(q.y-.0015)-.0009);
  vane=max(vane,max(-.03-q.x,q.x-.11));
  return min(min(shaft,nib),vane); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,restD(p),3.);
  float pt; float c=codexD(p,pt); r=U(r,c,pt>.5?5.:4.);
  r=U(r,brassD(p),6.);
  float w; r=U(r,booksD(p,w),7.);
  r=U(r,padD(p),8.);
  r=U(r,quillLD(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=rstQ(p); return .55+.14*grain(q.zyx,35.); }
  if(id==4.){ vec3 q=cdxQ(p); float a=.36+.06*fbm(q.xz*40.);
    float x=abs(q.x); if(abs(max(abs(x-.105)/.105,abs(q.z)/.125)-.9)<.012) a=.25;   /* tooled border */
    return a; }
  if(id==5.){ vec3 q=cdxQ(p); float x=abs(q.x); float a=.93;
    if(q.y<.022&&x>.02) return fract(q.y/.0022)<.35?.72:.93;
    if(x>.025&&x<.175&&abs(q.z)<.095){ float row=floor((q.z+.095)/.0095); float l=fract((q.z+.095)/.0095);
      if(l<.24&&h1(vec2(step(0.,q.x),row))>.06) a=.55;
      if(row>16.&&x>.05&&x<.15&&l<.3) a=.4; }                                       /* a heading band */
        return a; }
  if(id==6.) return .6;
  if(id==7.){ float w; booksD(p,w); int i=int(w); return bookT(bq(p,i),bs(i),i==0?.45:i==1?.62:i==2?.4:.58); }
  if(id==8.){ vec3 q=padQ(p); if(n.y<.5) return .8; float l=fract((q.z+.05)/.011);
    if(q.z<.045&&q.z>-.05&&abs(q.x)<.068&&l<.14) return .62; if(q.z>.04&&q.z<.046&&abs(q.x)<.05) return .45; return .95; }
  if(id==9.){ vec3 q=quQ(p); if(q.x<-.085) return .25; if(abs(q.z)<.002) return .9; return fract(abs(q.z)*200.-q.x*30.)<.3?.5:.82; }
  return .7; }
