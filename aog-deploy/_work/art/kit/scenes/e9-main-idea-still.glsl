/* Practice room "Main Idea and Details" — pencil still life: a small three-legged wooden stool
   (one seat held up by its legs), a page of writing with one line marked by a highlighter, and
   the highlighter lying on it (hint-lines only). */
#define CAM_POS vec3(-0.4252,0.3631,-0.7820)
#define CAM_TGT vec3(-0.2926,-0.0635,0.1068)
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
#define ST vec3(.03,0.,.06)
#define SH .15
#define PG vec3(-.13,0.,-.07)
float stoolD(vec3 q){ float d=cylS(q-vec3(0.,SH-.016,0.),.075,.018,.006);
  for(int i=0;i<3;i++){ float a=float(i)*2.094+.5; vec2 dir=vec2(cos(a),sin(a));
    d=min(d,sdCapsule(q,vec3(dir.x*.045,SH-.01,dir.y*.045),vec3(dir.x*.07,0.004,dir.y*.07),.0075));
    float a2=a+2.094; vec2 d2=vec2(cos(a2),sin(a2));
    d=min(d,sdCapsule(q,vec3(dir.x*.06,.05,dir.y*.06),vec3(d2.x*.06,.05,d2.y*.06),.004)); }
  return d; }
vec3 pgQ(vec3 p){ vec3 q=p-PG; q.xz=rot(.2)*q.xz; return q; }
float pageD(vec3 q){ return sdBox(q-vec3(0.,.0008,0.),vec3(.075,.0007,.095)); }
vec3 hlQ(vec3 p){ vec3 q=p-PG-vec3(.075,.009,-.07); q.xz=rot(2.5)*q.xz; return q; }
float hlD(vec3 q){ float b=sdRBox(q,vec3(.05,.0075,.0085),.005);
  float cap=sdRBox(q-vec3(.058,0.,0.),vec3(.016,.0085,.0095),.006);
  float tip=sdRBox(q-vec3(-.056,0.,0.),vec3(.008,.004,.005),.002);
  return min(min(b,cap),tip); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,stoolD(p-ST),3.);
  r=U(r,pageD(pgQ(p)),4.);
  vec3 h=hlQ(p);
  r=U(r,hlD(h),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-ST; if(q.y>SH-.004&&abs(length(q.xz)-.062)<.002) return .45; return .6+.12*grain(q.zyx,70.); }
  if(id==4.){ vec3 q=pgQ(p); float lz=(q.z-.075)/-.014; float li=floor(lz+.5); float f=abs(lz-li);
    if(li==0.&&abs(q.x)<.065&&f<.42) return .6;                      /* the highlighted line */
    if(li>=0.&&li<=10.&&f<.08&&q.x>(li==0.?-.05:-.062)&&q.x<(li==10.?.01:.062)) return .3;
    return .94; }
  if(id==5.){ vec3 q=hlQ(p); if(q.x>.04) return .4; if(q.x<-.05) return .3; return .62; }
  return .7; }
