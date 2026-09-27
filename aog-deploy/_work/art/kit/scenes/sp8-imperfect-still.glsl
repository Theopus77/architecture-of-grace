/* Room "The Imperfect and Telling a Story" — pencil still life: an old glass-chimney oil lamp
   (once upon a time, by lamplight), an open storybook with a ribbon marker (hint-lines only),
   and an old iron key lying in front. */
#define CAM_POS vec3(-0.4819,0.3406,-0.7821)
#define CAM_TGT vec3(-0.2068,-0.0032,0.0629)
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
#define LP vec3(-.07,0.,.09)
float lampD(vec3 p){ vec3 q=p-LP;
  float foot=sdCylY(q-vec3(0.,.008,0.),.05,.006)-.003;
  float stem=sdCylY(q-vec3(0.,.03,0.),.012+.006*smoothstep(.045,.02,q.y),.02);
  float font=sdEll(q-vec3(0.,.07,0.),vec3(.05,.03,.05));
  float collar=sdCylY(q-vec3(0.,.1,0.),.022,.006)-.002;
  vec3 c=q-vec3(0.,.155,0.); float r=.018+.012*exp(-pow((c.y+.02)/.022,2.))-.004*smoothstep(.0,.05,c.y);
  float chim=max(abs(length(c.xz)-r)-.0015,abs(c.y)-.05);
  float knob=sdCylX(q-vec3(.03,.1,0.),.005,.008);
  return min(min(min(foot,stem),min(font,collar)),min(chim,knob)); }
vec3 bookQ(vec3 p){ vec3 q=p-vec3(.11,0.,.02); q.xz=rot(-.3)*q.xz; q.yz=rot(-.22)*q.yz; return q; }
vec2 bookO(vec3 p){ vec3 q=bookQ(p); float x=abs(q.x);
  float lift=.024*sin(clamp(x/.12,0.,1.)*1.9)-.014*exp(-x*55.)+.012;
  float pages=sdBox(vec3(x-.064,q.y-lift*.5-.004,q.z),vec3(.062,max(lift*.5,.003),.088))-.0015;
  float cover=sdRBox(vec3(x-.068,q.y+.001+.004,q.z),vec3(.071,.0035,.094),.0015);
  float prop=sdRBox(p-vec3(.11,.013,.12),vec3(.12,.013,.03),.003);
  float rib=sdRBox(q-vec3(.0,.003,-.1),vec3(.003,.0008,.018),.0005);
  return vec2(pages*.9,min(min(cover,prop),rib)); }
vec3 kyQ(vec3 p){ vec3 q=p-vec3(.04,.006,-.13); q.xz=rot(.25)*q.xz; return q/1.5; }
float keyD(vec3 p){ vec3 q=kyQ(p);
  float bow=length(vec2(length(q.xz-vec2(-.05,0.))-.014,q.y))-.0035;
  float shank=sdCapsule(q,vec3(-.036,0.,0.),vec3(.05,0.,0.),.0035);
  float bit=sdRBox(q-vec3(.042,0.,.009),vec3(.008,.003,.008),.001); bit=max(bit,-sdBox(q-vec3(.042,0.,.012),vec3(.002,.01,.004)));
  float ring=sdCylX(q-vec3(-.03,0.,0.),.005,.003);
  return min(min(bow,shank),min(bit,ring)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,lampD(p),3.);
  vec2 b=bookO(p); r=U(r,b.x,4.); r=U(r,b.y,5.);
  r=U(r,keyD(p)*1.5,6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-LP; if(q.y>.105) return .92; if(q.y>.04&&q.y<.1) return .7; return .45; }
  if(id==4.){ vec3 q=bookQ(p); float x=abs(q.x); if(x<.005) return .7; vec2 u=vec2(x-.064,q.z); float l=fract((u.y+.1)/.013);
    if(abs(u.x)<.046&&abs(u.y)<.075&&l<.2) return .55; if(q.x>0.&&u.y>.055&&u.x<-.02&&abs(u.y-.066)<.012) return .3; return .95; }
  if(id==5.) return .4;
  if(id==6.) return .3;
  return .7; }
