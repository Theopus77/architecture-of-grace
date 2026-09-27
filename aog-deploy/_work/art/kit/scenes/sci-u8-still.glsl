/* Science Unit 8 "Ecosystems and the Flow of Energy" — pencil still life: a mossy log with
   mushrooms growing on it (decomposers at work), an oak leaf and an acorn. */
#define CAM_POS vec3(-0.5457,0.2637,-0.7867)
#define CAM_TGT vec3(-0.1906,0.0022,0.1473)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 lq(vec3 p){ vec3 q=p-vec3(.0,.06,.07); q.xz=rot(.3)*q.xz; return q; }
float logD(vec3 p){ vec3 q=lq(p);
  float r=.058+.004*fbm(vec2(atan(q.z,q.y)*6.,q.x*20.));
  float d=max(length(q.yz)-r,abs(q.x)-.19);
  d+=.0015*sin(atan(q.z,q.y)*28.+fbm(q.xy*30.)*4.)*step(abs(q.x),.186);
  float br=sdCapsule(q,vec3(-.06,.04,-.01),vec3(-.1,.1,-.03),.012); br=max(br,-(length(q.yz)-.04));
  return min(d,br); }
float shroom(vec3 q,float s){ q/=s;   /* a round-capped mushroom: domed cap, curled rim, thick stem */
  float stem=sdCone(q-vec3(0.,.018,0.),.011,.008,.018);
  float cap=sdEll(q-vec3(0.,.034,0.),vec3(.026,.024,.026)); cap=max(cap,-(q.y-.03));
  float rim=sdTorus(q-vec3(0.,.031,0.),.022,.0045);
  return min(min(stem,cap),rim)*s; }
vec2 mush(vec3 p){ vec3 q=lq(p);
  float d=shroom(q-vec3(.05,.052,-.02),2.);
  d=min(d,shroom(q-vec3(.11,.048,-.028),1.4));
  vec3 g=p-vec3(-.29,0.,-.02); d=min(d,shroom(g,1.6));
  d=min(d,shroom(g-vec3(.05,0.,.03),1.4));
  return vec2(d,0.); }
vec3 oq(vec3 p){ vec3 q=p-vec3(.33,.005,-.02); q.xz=rot(.7)*q.xz; return q; }
float oak(vec3 p){ vec3 q=oq(p)/1.8;
  float x=q.x; float t=clamp((x+.07)/.14,0.,1.);
  float w=.035*sin(t*3.1416)*(1.+.35*sin(t*6.2832*2.5)) ;
  float d=abs(q.z)-max(w,.002); d=max(d,abs(x)-.07);
  float stem=sdCapsule(q,vec3(-.07,0.,0.),vec3(-.095,0.,.005),.002);
  q.y-=.01*sin(t*3.)+.004*q.z*q.z*400.;
  return min(max(d,abs(q.y)-.0015),stem)*.7*1.8; }
vec2 acorn(vec3 p){ vec3 q=p-vec3(.2,.018,-.09); q.xy=rot(1.3)*q.xy; q.xz=rot(.5)*q.xz;
  float nut=sdEll(q-vec3(0.,-.006,0.),vec3(.016,.022,.016));
  float cup=sdEll(q-vec3(0.,.01,0.),vec3(.019,.014,.019)); cup=max(cup,-(q.y-.006)*1.);
  cup=min(cup,sdCapsule(q,vec3(0.,.02,0.),vec3(0.,.03,0.),.002));
  return vec2(nut,max(cup,.004-q.y)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  r=U(r,logD(p),3.);
  r=U(r,mush(p).x,4.);
  r=U(r,oak(p),5.);
  vec2 a=acorn(p); r=U(r,a.x,6.); r=U(r,a.y,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=lq(p); if(abs(q.x)>.186){ float r=length(q.yz); return fract(r/.008)<.3?.35:.65; }
    return .35+.2*fbm(q.yz*60.); }
  if(id==4.){ float c=.72; if(n.y>.3&&fract((p.x*37.+p.z*53.)*9.)<.06) c=.45; return n.y<-.2?.4:c; }
  if(id==5.){ vec3 q=oq(p)/1.8; if(abs(q.z)<.0015) return .25; float v=abs(fract((q.x+abs(q.z)*1.2)/.025)-.5); return v<.05&&abs(q.z)<.03?.35:.55; }
  if(id==6.) return .55;
  if(id==7.){ vec3 q=p; return fract((q.x+q.z)*300.)<.4?.3:.5; }
  return .7; }
