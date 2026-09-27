/* Room m23 "Fractions: Add, Subtract, Multiply" — pencil still life: a pie in its dish cut
   into eight equal slices with one slice lifted out onto a small plate (one eighth), and a
   pie server lying beside the dish. */
#define CAM_POS vec3(-0.3107,0.3773,-0.6640)
#define CAM_TGT vec3(-0.1769,-0.0867,0.0053)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_c.glsl"
#define PC vec3(-.02,0.,.06)
#define PR .1
float dishD(vec3 p){ vec3 q=p-PC; float r=length(q.xz);
  float wall=max(abs(r-PR-.006-q.y*.35)-.0025,abs(q.y-.016)-.016);
  float floor_=max(r-PR-.006,abs(q.y-.002)-.002);
  float lip=sdTorus(q-vec3(0.,.033,0.),PR+.018,.004);
  return min(min(wall,floor_),lip); }
float wedgeOut(vec2 u,float a0,float a1){ float a=atan(u.y,u.x); return (a>a0&&a<a1)?1.:0.; }
float pieD(vec3 p){ vec3 q=p-PC; float r=length(q.xz); float a=atan(q.z,q.x);
  float top=.036+.004*smoothstep(PR-.02,PR,r)-.002*smoothstep(0.,PR,r);
  float body=max(r-PR-.004-q.y*.3,max(q.y-top,.004-q.y));
  float rim=sdTorus(q-vec3(0.,.036,0.),PR-.004,.007+.0015*sin(a*40.));
  float d=min(body,rim);
  /* cuts every eighth */
  float k=floor(a/(PI/4.)+.5)*(PI/4.); vec2 dir=vec2(cos(k),sin(k)); float cut=abs(q.x*dir.y-q.z*dir.x)-.0012;
  cut=max(cut,-dot(q.xz,dir));
  d=max(d,-max(cut,-(q.y-.012)));
  /* the missing slice, toward the viewer */
  float s0=-PI*.5-.2, s1=s0+PI/4.; vec2 n0=vec2(-sin(s0),cos(s0)), n1=vec2(sin(s1),-cos(s1));
  float wedge=max(-dot(q.xz,n0),-dot(q.xz,n1)); wedge=max(wedge,-q.y+.0045);
  d=max(d,-wedge);
  return d; }
#define SL vec3(.16,0.,-.1)
float plateD(vec3 p){ vec3 q=p-SL; float r=length(q.xz);
  float d=max(abs(q.y-.003-r*r*.9)-.0022,r-.075)-.0008;
  return min(d,sdTorus(q-vec3(0.,.0035+.075*.075*.9,0.),.075,.0025)); }
float sliceD(vec3 p){ vec3 q=p-SL-vec3(0.,.0065,0.); q.xz=rot(-1.8)*q.xz; q.x+=.036; q/=.72; float r=length(q.xz);
  float a=PI/8.; vec2 n0=vec2(-sin(-a),cos(-a)), n1=vec2(sin(a),-cos(a));
  float w=max(-dot(q.xz,n0),-dot(q.xz,n1));
  float top=.032+.004*smoothstep(PR-.02,PR,r);
  float body=max(max(w,r-PR),max(q.y-top,-q.y));
  float rim=max(sdTorus(q-vec3(0.,.032,0.),PR-.004,.007),w);
  return min(body,rim)*.72; }
vec3 svQ(vec3 p){ vec3 q=p-vec3(-.13,.004,-.13); q.xz=rot(.6)*q.xz; return q; }
float serverD(vec3 q){ float blade=extrude(sdTri2(q.xz,vec2(.0,-.022),vec2(.0,.022),vec2(.075,0.))-.004,q.y,.0012,.0005);
  float neck=sdCapsule(q,vec3(-.005,.001,0.),vec3(-.03,.008,0.),.003);
  float handle=sdRBox(q-vec3(-.08,.009,0.),vec3(.05,.005,.009),.004);
  return min(blade,min(neck,handle)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,dishD(p),3.);
  r=U(r,pieD(p),4.);
  r=U(r,plateD(p),5.);
  r=U(r,sliceD(p),6.);
  r=U(r,serverD(svQ(p)),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .6;
  if(id==4.){ vec3 q=p-PC; if(n.y<.6) return .82; float r=length(q.xz); float a=atan(q.z,q.x);
    float k=floor(a/(PI/4.))*(PI/4.)+PI/8.; vec2 c=vec2(cos(k),sin(k))*.055; vec2 u=q.xz-c; u=rot(k)*u;
    if(abs(u.y)<.0018&&abs(u.x)<.012) return .3;
    if(r>PR-.012) return .55; return .7; }
  if(id==5.) return .9;
  if(id==6.){ if(n.y<.6) return .82; return .7; }
  if(id==7.){ vec3 q=svQ(p); if(q.x<-.03) return .4; return .82; }
  return .7; }
