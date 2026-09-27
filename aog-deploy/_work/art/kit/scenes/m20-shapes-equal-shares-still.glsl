/* m20 "Shapes and Equal Shares" — a round pie cut into four equal pieces with one piece
   slid out, and three wooden shape blocks behind it: a cube, a cylinder and a triangular
   prism. */
#define CAM_POS vec3(-0.3562,0.2938,-0.5297)
#define CAM_TGT vec3(-0.1790,-0.0254,0.0663)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_d.glsl"
#define PI_ vec3(.02,0.,-.04)
float pieD(vec3 q){ float r=length(q.xz);
  float d=sdCylY(q-vec3(0.,.012,0.),.095,.012)-.002;
  d=min(d,sdTorus(q-vec3(0.,.022,0.),.09,.009));
  return d; }
float quarter(vec3 q,float a){ vec3 k=q; k.xz=rot(-a)*k.xz;                  /* keep the wedge 0..90deg */
  float w=max(-k.x,-k.z)+.0015; return max(pieD(q),w); }
float pie(vec3 p){ vec3 q=p-PI_; float d=1e5;
  for(int i=0;i<3;i++){ float a=float(i)*1.5708+1.5708; d=min(d,quarter(q,a)); }
  vec3 s=q-vec3(.04,0.,.04); d=min(d,quarter(s,0.));
  return d; }
float plateD(vec3 p){ vec3 q=p-PI_-vec3(.015,0.,-.01); return sdCylY(q-vec3(0.,-.0,0.),.13,.002)-.001; }
float cube(vec3 p){ vec3 q=place(p,vec3(-.08,.035,.16),.35); return sdRBox(q,vec3(.035),.003); }
float cyl(vec3 p){ vec3 q=p-vec3(.05,0.,.2); return sdCylY(q-vec3(0.,.04,0.),.03,.04)-.002; }
float prism(vec3 p){ vec3 q=place(p,vec3(.17,0.,.14),-.4); q.y-=.0;
  float tri=max(abs(q.x)*1.732+q.y-.075,-q.y); tri=max(tri*.5,abs(q.z)-.035)-.002;
  return tri; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pie(p),3.);
  r=U(r,cube(p),4.);
  r=U(r,cyl(p),5.);
  r=U(r,prism(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=p-PI_; if(n.y<.6) return .75; float r=length(q.xz); if(p.y>.025) return .7;
    return .55+.1*step(.6,fbm(q.xz*80.)); }
  if(id==4.) return .6+.1*grain(p,40.);
  if(id==5.) return .75;
  if(id==6.) return .5+.1*grain(p.zyx,40.);
  return .7; }
