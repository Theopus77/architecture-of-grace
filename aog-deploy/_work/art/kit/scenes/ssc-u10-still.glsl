/* Social Studies Unit 10 "The First Civilizations" — pencil still life: a stone model of a
   step pyramid, a clay tablet with rows of wedge marks, and a clay jar. */
#define CAM_POS vec3(-0.2619,0.2202,-0.8101)
#define CAM_TGT vec3(-0.1449,0.0147,0.0703)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "ssceco.glsl"
#define PC vec3(.1,0.,.2)
vec3 pq(vec3 p){ vec3 q=p-PC; q.xz=rot(-.55)*q.xz; return q; }
float pyramid(vec3 p){
  vec3 q=pq(p);
  float d=1e5;
  for(int i=0;i<5;i++){ float fi=float(i); float hw=.15-fi*.028; float y=.019+fi*.038;
    d=min(d,sdRBox(q-vec3(0.,y,0.),vec3(hw,.019,hw),.002)); }
  d=min(d,sdRBox(q-vec3(0.,.2,0.),vec3(.022,.012,.022),.002));
  d+=.0015*(fbm3(q*120.)-.5);
  return d; }
vec3 tq(vec3 p){ vec3 q=p-vec3(-.17,.035,-.04); q.xz=rot(.3)*q.xz; q.yz=rot(-1.15)*q.yz; return q; }
float tablet(vec3 p){
  vec3 q=tq(p);
  float d=sdRBox(q,vec3(.055,.012,.075),.009);
  d+=.001*(fbm3(q*150.)-.5);
  /* rows of wedge dents */
  vec2 u=q.xz; float row=floor((u.y+.06)/.016); float yy=fract((u.y+.06)/.016)-.5;
  float xx=fract((u.x+.05)/.012+h1(vec2(row,3.))*.5)-.5;
  float wedge=max(abs(xx)*.012-.002-.0015*(yy+.5),abs(yy*.016)-.004);
  if(abs(u.x)<.046&&abs(u.y)<.064&&h1(vec2(floor((u.x+.05)/.012),row))>.25) d=max(d,-max(wedge,-(q.y-.009)));
  return d; }
vec2 jar(vec3 p){
  vec3 q=p-vec3(.33,0.,.02);
  float y=q.y; float t=clamp(y/.15,0.,1.);
  float R=.03+.035*sin(t*2.9)-.012*smoothstep(.8,1.,t);
  float d=(length(q.xz)-R)*.8; d=max(d,max(-y,y-.15));
  d=max(d,-sdCylY(q-vec3(0.,.15,0.),.022,.02));
  float lip=sdTorus(q-vec3(0.,.15,0.),.026,.005);
  float h=1e5; for(int i=0;i<2;i++){ vec3 c=q; c.x=abs(c.x); h=min(h,sdTorus((c-vec3(.043,.12,0.)).xzy,.014,.004)); }
  return vec2(min(d,lip),h); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pyramid(p),3.);
  r=U(r,tablet(p),4.);
  vec2 j=jar(p); r=U(r,j.x,5.); r=U(r,j.y,5.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=pq(p); float y=fract(q.y/.019); float bx=fract((q.x+q.z)/.03+floor(q.y/.019)*.5);
    if(abs(n.y)<.5&&(y<.07||bx<.05)) return .45; return .75; }                  /* stone courses */
  if(id==4.){ vec3 q=tq(p); if(q.y>.008) return .72; return .6; }
  if(id==5.){ vec3 q=p-vec3(.33,0.,.02); if(abs(q.y-.1)<.004||abs(q.y-.085)<.002) return .25; return .55; }
  return .7; }
