/* Science Unit 22 "Chemistry: Atoms, Bonding and Reactions" — pencil still life: a model
   atom on a stand (a nucleus with three electron orbits), beside three element tiles carved
   1, 2 and 3 (hydrogen, helium, lithium). */
#define CAM_POS vec3(-0.7531,0.2972,-0.7834)
#define CAM_TGT vec3(-0.3718,0.0162,0.2201)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
#define AC vec3(.03,.17,.08)
vec2 atom(vec3 p){ vec3 q=p-AC;
  float nuc=1e5;
  for(int i=0;i<7;i++){ float fi=float(i); vec3 c=.013*vec3(sin(fi*2.4),cos(fi*3.7),sin(fi*1.3+1.)); nuc=min(nuc,length(q-c)-.012); }
  float orb=1e5, el=1e5;
  for(int i=0;i<3;i++){ float fi=float(i); vec3 o=q; o.xy=rot(fi*1.047+.3)*o.xy; o.yz=rot(1.2)*o.yz;
    orb=min(orb,sdTorus(o,.1,.0025));
    float a=fi*2.1+.5; el=min(el,length(o-vec3(cos(a)*.1,0.,sin(a)*.1))-.01); }
  float stand=min(sdCylY(p-vec3(AC.x,.008,AC.z),.055,.008)-.003,sdCapsule(p,vec3(AC.x,0.,AC.z),AC-vec3(0.,.02,0.),.0045));
  return vec2(min(stand,orb),min(nuc,el)); }
#define T 0.042
float tile(vec3 p,vec3 c,float ry,int g){ vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(T,T,.012),.004);
  if(d>.02) return d;
  return carve(d,q.xy-vec2(0.,-.004),g,.05,.0045,q.z+.012,.003); }
float tiles(vec3 p){ float d=tile(p,vec3(-.32,T,.02),.35,49);
  d=min(d,tile(p,vec3(-.22,T,.0),.2,50)); d=min(d,tile(p,vec3(-.26,T+.001,.0)+vec3(.05,0.,-.06)*0.+vec3(.0,0.,0.)*0.+vec3(0.,0.,1e3),0.,51));
  vec3 q=p-vec3(-.12,.012,-.03); q.xz=rot(.1)*q.xz; float l=sdRBox(q,vec3(T,.012,T),.004);
  l=carve(l,vec2(q.x,q.z+.004),51,.05,.0045,q.y-.012,.003);
  return min(d,l); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 a=atom(p); r=U(r,a.x,3.); r=U(r,a.y,4.);
  r=U(r,tiles(p),5.);
  return r; }
float ink(vec3 q,int g,vec2 uv,float face){ if(face<.004&&glyph(uv/.05,g)*.05<.006) return .15;
  if(face<.004&&length(max(abs(uv)-vec2(T*.8),0.))>0.&&max(abs(uv.x),abs(uv.y))<T*.86) return .4; return .8; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.) return length(p-AC)<.04?.3:.5;
  if(id==5.){ vec3 q=p-vec3(-.32,T,.02); q.xz=rot(.35)*q.xz; if(abs(q.z+.012)<.004&&glyph((q.xy-vec2(0.,-.004))/.05,49)*.05<.006) return .15;
    q=p-vec3(-.22,T,.0); q.xz=rot(.2)*q.xz; if(abs(q.z+.012)<.004&&glyph((q.xy-vec2(0.,-.004))/.05,50)*.05<.006) return .15;
    q=p-vec3(-.12,.012,-.03); q.xz=rot(.1)*q.xz; if(abs(q.y-.012)<.004&&glyph(vec2(q.x,q.z+.004)/.05,51)*.05<.006) return .15;
    return .78; }
  return .7; }
