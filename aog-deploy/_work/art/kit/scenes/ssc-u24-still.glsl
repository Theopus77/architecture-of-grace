/* Social Studies Unit 24 "Capstone: Inquiry from the Sources" — pencil still life: an open
   old book with a magnifying glass lying across it, a stack of papers and letters tied with
   string, and an old photograph propped against the stack. */
#define CAM_POS vec3(-0.3152,0.1650,-0.7288)
#define CAM_TGT vec3(-0.2090,-0.0216,0.0704)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
vec3 oq(vec3 p){ vec3 q=p-vec3(.06,.03,.1); q.xz=rot(-.18)*q.xz; q.yz=rot(-.25)*q.yz; return q; }
vec2 book(vec3 p){
  vec3 q=oq(p); float x=abs(q.x);
  float lift=.028*sin(clamp(x/.14,0.,1.)*1.9)-.016*exp(-x*55.)+.008;
  float pages=sdBox(vec3(x-.072,q.y-lift*.5,q.z),vec3(.07,max(lift*.5,.003),.095))-.0015;
  float cover=sdRBox(vec3(x-.076,q.y+.001,q.z),vec3(.079,.0035,.102),.0015);
  float prop=sdRBox(p-vec3(.06,.016,.19),vec3(.15,.016,.03),.003);
  return vec2(pages,min(cover,prop)); }
vec3 gq(vec3 p){ vec3 q=p-vec3(.1,.058,.06); q.xz=rot(-.5)*q.xz; q.xy=rot(.12)*q.xy; return q; }
vec2 glass(vec3 p){
  vec3 q=gq(p);
  float rim=sdTorus(q,.05,.0065);
  float lens=sdCylY(q,.046,.003);
  float coll=sdCylX(q-vec3(.06,0.,0.),.009,.008);
  float handle=sdCapsule(q,vec3(.065,0.,0.),vec3(.17,-.01,0.),.0095);
  return vec2(min(rim,coll),min(lens,handle)); }
vec3 sq(vec3 p){ vec3 q=p-vec3(-.19,0.,.05); q.xz=rot(.3)*q.xz; return q; }
vec2 stack(vec3 p){
  vec3 q=sq(p);
  float d=1e5;
  for(int i=0;i<7;i++){ float fi=float(i); vec3 c=q-vec3(0.,.004+fi*.0075,0.); c.xz=rot((h1(vec2(fi,4.))-.5)*.2)*c.xz;
    d=min(d,sdRBox(c,vec3(.075,.0032,.055),.001)); }
  float str=min(sdTorus(q.yxz-vec3(.028,0.,0.),.0,.0),1e5);
  str=max(abs(length(vec2(q.x*.0+q.y-.028,q.z)*vec2(1.6,1.))-.05)-.002,abs(q.x)-.002);
  str=min(str,max(abs(length(vec2(q.y-.028,q.x)*vec2(1.2,1.))-.07)-.002,abs(q.z)-.002));
  vec3 ph=q-vec3(.02,.075,.06); ph.yz=rot(-.35)*ph.yz;
  float photo=sdRBox(ph,vec3(.045,.035,.0015),.0008);
  return vec2(d,photo); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec2 b=book(p); r=U(r,b.x,3.); r=U(r,b.y,4.);
  vec2 g=glass(p); r=U(r,g.x,5.); r=U(r,g.y,6.);
  vec2 s=stack(p); r=U(r,s.x,7.); r=U(r,s.y,8.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=oq(p); float x=abs(q.x);
    if(x>.015&&x<.13&&abs(q.z)<.08&&fract((q.z+.1)/.011)<.2) return .62;       /* text hint-lines */
    return .93; }
  if(id==4.) return .4;
  if(id==5.) return .42;
  if(id==6.){ vec3 q=gq(p); if(q.x>.055) return .35; return .97; }
  if(id==7.){ vec3 q=sq(p); if(abs(n.y)<.6) return fract(q.y/.0075)<.35?.55:.88; return .9; }
  if(id==8.){ vec3 q=sq(p)-vec3(.02,.075,.06); if(q.y>.0&&q.z<.02&&abs(q.x)<.04&&abs(q.y)<.03) return .4; return .45; }
  return .7; }
