/* Hindu Texts Unit 1 "Rama, Sita and Hanuman" — pencil still life: a heavy mace (gada)
   standing on its head-end, a strung bow lying before it, and two arrows. Objects only. */
#define CAM_POS vec3(-0.5158,0.6110,-1.5187)
#define CAM_TGT vec3(-0.3238,0.0509,0.0821)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "hinbud.glsl"
#define MC vec3(.12,0.,.1)
/* the mace: a ribbed round head on the table, a banded handle rising, a pommel on top */
float mace(vec3 p){ vec3 q=p-MC;
  vec3 h=q-vec3(0.,.085,0.);
  float a=atan(h.z,h.x); float rib=.008*smoothstep(.1,.95,abs(sin(a*5.)));
  float head=length(h*vec3(1.,.92,1.))-.08-rib;
  float band=sdTorus(h,.079,.006);
  float collar=sdCylY(q-vec3(0.,.172,0.),.022,.012)-.003;
  float crown=sdCone(q-vec3(0.,.195,0.),.026,.012,.012);
  float shaft=sdCylY(q-vec3(0.,.3,0.),.011,.11);
  float rings=1e5; for(int i=0;i<3;i++) rings=min(rings,sdTorus(q-vec3(0.,.24+float(i)*.05,0.),.012,.0035));
  float pom=length(q-vec3(0.,.42,0.))-.018;
  float base=sdCylY(q-vec3(0.,.004,0.),.03,.004);
  return min(min(min(head,band),min(collar,crown)),min(min(shaft,rings),min(pom,base))); }
vec3 bowQ(vec3 p){ vec3 q=p-vec3(-.12,.0,-.08); q.xz=rot(.25)*q.xz; q.yz=rot(-1.45)*q.yz; q.y+=0.; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,mace(p),3.);
  vec3 b=p-vec3(-.05,.2,.085); b.x=-b.x; b.xz=rot(.1)*b.xz; b.xy=rot(-1.22)*b.xy; b.y=-b.y;   /* the bow leans on the mace, arc to the left */
  r=U(r,bowD(b,.2),4.);
  vec3 a1=p-vec3(.12,.0045,-.08); a1.xz=rot(.25)*a1.xz; r=U(r,arrowD(a1,.2),5.);
  vec3 a2=p-vec3(.15,.0045,-.12); a2.xz=rot(.18)*a2.xz; r=U(r,arrowD(a2,.2),5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-MC; if(q.y>.2&&q.y<.41) return .38; return .55; }
  if(id==4.) return .42;
  if(id==5.){ return .6; }
  return .7; }
