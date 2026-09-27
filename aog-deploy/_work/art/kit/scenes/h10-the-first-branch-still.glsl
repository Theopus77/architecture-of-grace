/* Room "The First Branch" (Congress) — pencil still life: a wooden gavel resting on its round
   sound block, two bound record books (the two houses) stacked side by side, and a small
   clasp purse (the power of the purse). */
#define CAM_POS vec3(-0.4200,0.3187,-0.6814)
#define CAM_TGT vec3(-0.1769,-0.0286,0.0303)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_b.glsl"
#define BL vec3(.12,0.,-.02)
#define PU vec3(-.01,0.,-.13)
float booksD(vec3 p){ vec3 a=place(p,vec3(-.1,0.,.06),.3); float d=bookD(a,vec3(.1,.022,.075));
  vec3 b=place(p,vec3(-.09,.046,.06),.18); d=min(d,bookD(b,vec3(.095,.02,.07))); return d; }
float blockD(vec3 p){ vec3 q=p-BL; float d=sdCylY(q-vec3(0.,.012,0.),.055,.012)-.003; d=min(d,sdTorus(q-vec3(0.,.012,0.),.056,.002)); return d; }
vec3 gvQ(vec3 p){ vec3 q=p-BL-vec3(-.01,.052,.0); q.xz=rot(-.5)*q.xz; q.xy=rot(-.08)*q.xy; return q; }   /* head along z, handle along x */
float gavelD(vec3 p){ vec3 q=gvQ(p);
  float head=sdCylZ(q,.026,.045)-.003;
  head=max(head,-max(abs(abs(q.z)-.03)-.0025,-(length(q.xy)-.0245)));   /* two turned grooves */
  float handle=sdCapsule(q,vec3(.02,0.,0.),vec3(.2,-.022,0.),.0075);
  float knob=length(q-vec3(.205,-.023,0.))-.011;
  return min(min(head,handle),knob); }
vec3 puQ(vec3 p){ return place(p,PU,-.4); }
float purseD(vec3 p){ vec3 q=puQ(p);
  float w=.05+.012*smoothstep(.07,.01,q.y);
  float bag=sdEll(q-vec3(0.,.04,0.),vec3(.056,.042,.024)); bag=max(bag,q.y-.07-.0*q.x);
  float top=length(q.xy-vec3(0.,.035,0.).xy)-.045;
  float frame=max(length(vec2(length(q.xy-vec2(0.,.03))-.045,q.z))-.0035,-(q.y-.055));
  float c1=length(q-vec3(-.007,.082,-.003))-.0065, c2=length(q-vec3(.007,.082,.003))-.0065;
  bag=max(bag,top-.0);
  return min(min(bag*.9,frame),min(c1,c2)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,booksD(p),3.);
  r=U(r,blockD(p),4.);
  r=U(r,gavelD(p),5.);
  r=U(r,purseD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ if(abs(n.y)<.5&&abs(n.x)<.7) return fract(p.y/.003)<.3?.7:.9; return .38; }
  if(id==4.) return .35+.15*grain(p-BL,70.);
  if(id==5.){ vec3 q=gvQ(p); return .45+.15*grain(q.zyx,90.); }
  if(id==6.){ vec3 q=puQ(p); if(q.y>.066) return .8; return .4+.1*fbm(q.xy*200.); }
  return .7; }
