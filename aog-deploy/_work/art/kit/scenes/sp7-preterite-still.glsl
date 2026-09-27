/* Practice room "The Preterite — Telling What Happened" — pencil still life of things that are
   finished: a desk calendar on a stand with past days crossed off, a torn ticket stub, and a
   burnt-out match lying beside its matchbox. */
#define CAM_POS vec3(-0.3130,0.3539,-0.7538)
#define CAM_TGT vec3(-0.1864,-0.0536,0.0958)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define CAL vec3(-.03,0.,.06)
#define TK vec3(-.1,.001,-.1)
#define MB vec3(.13,0.,-.07)
/* a tent-shaped desk calendar: two leaning boards meeting at the top, ring binding along it */
vec3 cQ(vec3 p){ vec3 q=p-CAL; q.xz=rot(-.2)*q.xz; return q; }
float calD(vec3 q){ vec3 f=q; f.yz=rot(-.3)*f.yz; float front=sdRBox(f-vec3(0.,.075,-.0),vec3(.1,.075,.002),.001);
  vec3 b=q-vec3(0.,0.,.09); b.yz=rot(.3)*b.yz; float back=sdRBox(b-vec3(0.,.075,0.),vec3(.1,.075,.002),.001);
  float d=min(front,back);
  for(int i=0;i<9;i++){ vec3 r=q-vec3(-.08+float(i)*.02,.143,.044); d=min(d,sdTorus(r.yxz,.006,.0012)); }
  return d; }
float pagesD(vec3 q){ vec3 f=q; f.yz=rot(-.3)*f.yz; return sdBox(f-vec3(0.,.07,-.004),vec3(.095,.068,.0012)); }
float tkD(vec3 q){ q.xz=rot(.4)*q.xz; float d=sdBox(q,vec3(.04,.0006,.022)); float tear=q.x-.034-.003*sin(q.z*300.); d=max(d,tear); return d-.0004; }
float boxD(vec3 q){ return sdRBox(q-vec3(0.,.009,0.),vec3(.03,.009,.02),.0015); }
float matchD(vec3 p){ vec3 q=p-MB-vec3(-.06,.0025,-.04); q.xz=rot(.5)*q.xz; float d=sdBox(q,vec3(.028,.0022,.0022)); d=min(d,sdEll(q-vec3(.03,0.,0.),vec3(.005,.0035,.0035))); return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 c=cQ(p);
  r=U(r,calD(c),3.);
  r=U(r,pagesD(c),4.);
  r=U(r,tkD((p-TK)/1.5)*1.5,5.);
  vec3 m=place(p,MB,.3);
  r=U(r,boxD(m/1.5)*1.5,6.);
  r=U(r,matchD(MB+(p-MB)/1.5)*1.5,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .5;
  if(id==4.){ vec3 f=cQ(p); f.yz=rot(-.3)*f.yz; vec2 u=f.xy-vec2(0.,.06); 
    if(u.y>.035){ if(abs(u.y-.048)<.003&&abs(u.x)<.05) return .35; return .93; }   /* a heading bar */
    vec2 g=vec2((u.x+.084)/.024,(.03-u.y)/.018); vec2 id2=floor(g); vec2 f2=fract(g)-.5;
    if(id2.x<0.||id2.x>6.||id2.y<0.||id2.y>4.) return .93;
    if(min(.5-abs(f2.x),.5-abs(f2.y))<.04) return .55;                               /* the grid */
    float k=id2.y*7.+id2.x; if(k<17.&&(abs(f2.x-f2.y)<.06||abs(f2.x+f2.y)<.06)) return .3;   /* past days crossed off */
    if(k==17.&&abs(length(f2*vec2(1.,1.3))-.36)<.05) return .25;                        /* today, circled */
    return .93; }
  if(id==5.){ vec3 q=(p-TK)/1.5; q.xz=rot(.4)*q.xz; if(abs(q.x-.012)<.001&&fract(q.z/.004)<.5) return .4; if(q.x<.0&&abs(q.z)<.012&&fract(q.z/.006)<.25&&q.x>-.03) return .45; return .88; }
  if(id==6.){ vec3 m=place(p,MB,.3)/1.5; if(abs(m.x)<.028&&abs(m.y-.009)<.007&&m.z<-.019) return .4; if(m.y>.017&&abs(m.x)<.02&&abs(m.z)<.012) return .55; return .8; }
  if(id==7.){ vec3 q=(p-MB)/1.5-vec3(-.06,.0025,-.04); q.xz=rot(.5)*q.xz; return q.x>.015?.15:.75; }
  return .7; }
