/* The Unseen Realm Unit 13 "Enoch in the New Testament" — pencil still life: an old codex with
   wooden boards lying open, each page in two columns of hint-lines (a copyist's Ge'ez Bible, open
   at Jude), a second thick codex closed with a leather strap behind it (the Book of Enoch on the
   next shelf), and a quill standing in an inkwell. */
#define CAM_POS vec3(-0.4802,0.4274,-1.0380)
#define CAM_TGT vec3(-0.2602,-0.0126,0.0864)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "relush.glsl"
#define OPN vec3(-.02,0.,-.06)
#define CLS vec3(.02,0.,.16)
#define INK vec3(.24,0.,.02)
/* the open codex: two wooden boards, a text block that rises toward the spine */
vec3 opnQ(vec3 p){ vec3 q=p-OPN; q.xz=rot(-.1)*q.xz; return q; }
float openD(vec3 p,out float part){ vec3 q=opnQ(p); float x=abs(q.x);
  float board=sdRBox(vec3(x-.1,q.y-.005,q.z),vec3(.1,.005,.13),.003);
  float lift=.02*sin(clamp(x/.19,0.,1.)*1.9+.35)-.01*exp(-x*70.);
  float pages=sdBox(vec3(x-.094,q.y-.01-lift*.5,q.z),vec3(.088,.006+max(lift*.5,.0),.12))-.0015;
  pages=max(pages,-(x-.003));
  part=pages<board?1.:0.;
  return min(board,pages); }
float ribbonD(vec3 p){ vec3 q=opnQ(p); float d=sdBox(q-vec3(.004,.033,-.03),vec3(.003,.0006,.11));
  float tail=sdBox(q-vec3(.018,.004,-.14),vec3(.004,.0008,.02)); return min(d,tail); }
/* the closed codex: thick boards, a strap round it and a small clasp; lying a little turned */
vec3 clsQ(vec3 p){ vec3 q=p-CLS; q.xz=rot(.32)*q.xz; return q; }
float closedD(vec3 p){ vec3 q=clsQ(p); vec3 b=vec3(.1,.035,.13);
  float d=bookD(q,b);
  return d; }
float strapD(vec3 p){ vec3 q=clsQ(p); vec3 c=q-vec3(0.,.035,.04);
  float s=max(abs(sdBox2(c.xy,vec2(.103,.037)))-.0015,abs(c.z)-.012);
  float clasp=sdRBox(q-vec3(.07,.071,.04),vec3(.012,.002,.016),.001);
  return min(s,clasp); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  float pt; float o=openD(p,pt); r=U(r,o,pt>.5?4.:3.);
  r=U(r,ribbonD(p),5.);
  r=U(r,closedD(p),6.);
  r=U(r,strapD(p),7.);
  r=U(r,inkwellD(p-INK),8.);
  r=U(r,quillD(L(p,INK,-.5)),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=opnQ(p); return .45+.1*grain(q.zyx,40.); }
  if(id==4.){ vec3 q=opnQ(p); float a=.93; float x=abs(q.x);
    if(n.y>.5&&x>.02&&x<.17&&abs(q.z)<.1){
      float cx=(x-.02)/.15*2.; float cf=fract(cx);
      if(cf>.06&&cf<.9){ float l=fract((q.z+.1)/.0085); float row=floor((q.z+.1)/.0085);
        if(l<.24&&h1(vec2(floor(cx)+step(0.,q.x)*3.,row))>.07) a=.55;
        if(row>21.&&l<.24) a=.35; } }                         /* a red-ink heading line, drawn darker */
    if(n.y<.5) return fract(q.y/.0022)<.35?.72:.93;
    return a; }
  if(id==5.) return .35;
  if(id==6.){ vec3 q=clsQ(p); return bookT(q,vec3(.1,.035,.13),.45); }
  if(id==7.) return .3;
  if(id==8.){ vec3 q=p-INK; return q.y>.05?.3:.4; }
  if(id==9.) return quillT(L(p,INK,-.5));
  return .7; }
