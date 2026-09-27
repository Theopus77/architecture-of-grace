/* Practice room "Colors and Counting to Twenty" — pencil still life: a small wooden counting frame
   with two rods of ten beads (twenty in all), the beads in bands of different shades, and a
   painter's palette with six dabs of paint and a brush resting across it. */
#define CAM_POS vec3(-0.4083,0.3856,-0.7358)
#define CAM_TGT vec3(-0.1721,-0.0091,0.1149)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* counting frame: two posts on a base, two rods of ten beads */
vec3 abQ(vec3 p){ vec3 q=p-vec3(.0,0.,.1); q.xz=rot(.2)*q.xz; return q; }
float frameAb(vec3 q){ float d=sdRBox(q-vec3(0.,.01,0.),vec3(.16,.01,.04),.003);
  d=min(d,sdRBox(q-vec3(-.145,.1,0.),vec3(.008,.095,.012),.002));
  d=min(d,sdRBox(q-vec3(.145,.1,0.),vec3(.008,.095,.012),.002));
  d=min(d,sdCylX(q-vec3(0.,.075,0.),.0022,.145)); d=min(d,sdCylX(q-vec3(0.,.14,0.),.0022,.145));
  return d; }
/* bead positions: row 0 (low) has 10 beads pushed left 7 / right 3, row 1 all left */
float beadX(int row,int i){ float fi=float(i);
  if(row==0) return i<7?-.122+fi*.0195:.122-(9.-fi)*.0195;
  return -.122+fi*.0195; }
float beadsD(vec3 q,out float which){ float d=1e3; which=0.;
  for(int row=0;row<2;row++) for(int i=0;i<10;i++){
    vec3 c=q-vec3(beadX(row,i),row==0?.075:.14,0.);
    float b=length(c*vec3(1.35,1.,1.))/1.35-.0125;      /* squashed round bead */
    b=max(b,-sdCylX(c,.0035,.02));
    if(b<d){ d=b; which=float(i/5)+2.*float(row); } }
  return d; }
/* palette: a kidney-shaped board with a thumb hole, dabs of paint, a brush */
vec3 paQ(vec3 p){ vec3 q=p-vec3(.15,0.,-.06); q.xz=rot(-.35)*q.xz; return q; }
float pal2(vec2 u){ float d=length(u*vec2(.8,1.))-.095; d=max(d,-(length(u-vec2(.08,-.062))-.038)); return max(d,-(length(u-vec2(-.035,-.03))-.013)); }
float paletteD(vec3 q){ float d2=pal2(q.xz); return max(d2,abs(q.y-.0045)-.003)-.001; }
vec2 dabC(int i){ float a=float(i)*.7+1.5; return vec2(cos(a),sin(a))*.068*vec2(1.25,1.)+vec2(0.,.004); }
float dabsD(vec3 q){ float d=1e3; for(int i=0;i<6;i++){ vec2 c=dabC(i); vec3 e=q-vec3(c.x,.0085,c.y);
    d=min(d,length(e*vec3(1.,1.5,1.))/1.5-.009-.0015*sin(atan(e.z,e.x)*5.)); } return d; }
float brushD(vec3 q){ vec3 b=q-vec3(-.01,.02,.01); b.xz=rot(.6)*b.xz; b.xy=rot(-.06)*b.xy;
  float h=sdCapsule(b,vec3(-.11,0.,0.),vec3(.04,0.,0.),.0045-.0015*smoothstep(-.11,.04,b.x));
  float fer=sdCylX(b-vec3(.055,0.,0.),.0048,.016);
  float bri=sdCone(b.yxz-vec3(0.,.085,0.),.0045,.0012,.016);
  return min(min(h,fer),bri); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 a=abQ(p);
  r=U(r,frameAb(a),3.);
  float w; float bd=beadsD(a,w); r=U(r,bd,(w==0.||w==3.)?8.:4.);
  vec3 pq=paQ(p);
  r=U(r,paletteD(pq),5.); r=U(r,dabsD(pq),6.); r=U(r,brushD(pq),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .55+.08*grain(abQ(p),50.);
  if(id==4.) return .9;                                   /* five light beads, then five dark: easy to count */
  if(id==8.) return .2;
  if(id==5.) return .78;
  if(id==6.){ vec3 q=paQ(p); float best=1e3,k=0.; for(int i=0;i<6;i++){ float l=length(q.xz-dabC(i)); if(l<best){best=l;k=float(i);} }
    return .15+k*.14; }
  if(id==7.){ vec3 b=paQ(p)-vec3(-.01,.02,.01); b.xz=rot(.6)*b.xz; return b.x>.07?.2:b.x>.039?.8:.35; }
  return .7; }
