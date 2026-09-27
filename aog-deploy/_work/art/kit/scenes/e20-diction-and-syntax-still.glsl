/* Room "Diction and Syntax" — pencil still life: a wooden rack holding a row of letter tiles
   (A, B, C and blanks: words chosen and put in order), a square glass inkwell and a feather
   quill resting in it. */
#define CAM_POS vec3(-0.5378,0.3536,-0.8975)
#define CAM_TGT vec3(-0.2282,-0.0114,0.0758)
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
#define RK vec3(-.02,0.,-.07)
#define IW vec3(.35,0.,-.03)
vec3 rkQ(vec3 p){ return place(p,RK,.12)/1.3; }
float rackD(vec3 p){ vec3 q=rkQ(p);
  float base=sdRBox(q-vec3(0.,.008,0.),vec3(.2,.008,.035),.003);
  float back=sdRBox(q-vec3(0.,.02,.024),vec3(.2,.02,.01),.003);
  float lip=sdRBox(q-vec3(0.,.02,-.03),vec3(.2,.005,.004),.002);
  return min(min(base,back),lip); }
/* tiles lean back against the rack's back */
int tileG(int i){ return i==0?65:i==2?66:i==3?67:0; }
vec3 tileQ(vec3 q,int i){ vec3 t=q-vec3(-.16+float(i)*.064,.043,.0); t.yz=rot(-.22)*t.yz; return t; }
float tilesD(vec3 p){ vec3 q=rkQ(p); float d=1e5;
  for(int i=0;i<6;i++){ vec3 t=tileQ(q,i); float b=sdRBox(t,vec3(.028,.028,.007),.004);
    int g=tileG(i); if(g>0) b=carve(b,t.xy,g,.042,.0042,t.z+.007,.0025);
    d=min(d,b); }
  return d; }
float tileTone(vec3 p){ vec3 q=rkQ(p); for(int i=0;i<6;i++){ vec3 t=tileQ(q,i); if(abs(t.x)<.03&&abs(t.y)<.03){ int g=tileG(i);
    if(g>0&&t.z<-.004&&glyph(t.xy/.042,g)*.042<.006) return .15; } } return .85; }
float inkwellD(vec3 p){ vec3 q=place(p,IW,.3);
  float body=sdRBox(q-vec3(0.,.03,0.),vec3(.04,.03,.04),.008);
  float hole=sdCylY(q-vec3(0.,.06,0.),.013,.02);
  float collar=sdCylY(q-vec3(0.,.064,0.),.018,.006)-.002;
  return max(min(body,collar),-hole); }
/* quill: shaft from inside the well up and back to the left, vane along the upper part */
vec3 quillA(){ return IW+vec3(0.,.04,0.); }
vec3 quillB(){ return IW+vec3(.03,.22,.08); }
float quillD(vec3 p){ vec3 a=quillA(), b=quillB(); vec3 ab=b-a; float L=length(ab); vec3 u=ab/L;
  vec3 pa=p-a; float h=clamp(dot(pa,u),0.,L); vec3 c=a+u*h;
  float bend=.012*sin(h/L*3.1416);
  float shaft=length(pa-u*h-vec3(bend,0.,0.))-.0035*(1.-.5*h/L);
  /* the vane: a flat leaf-shape along the shaft, in the plane holding u and x */
  vec3 w=normalize(cross(u,vec3(0.,0.,1.))); vec3 v=cross(u,w);
  float t=dot(pa,u); float s=dot(pa,w); float n=dot(pa,v);
  float half_=.025*sin(clamp((t-.05)/(L-.05),0.,1.)*3.1416)*mix(1.,.6,step(0.,s));
  float vane=max(max(abs(s+.003)-half_,abs(n)-.0015),max(.05-t,t-L));
  vane=max(vane,-(abs(fract(t/.022+s*20.)-.5)-.47)*0.);
  return min(shaft,vane*.8); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,rackD(p)*1.3,3.);
  r=U(r,tilesD(p)*1.3,4.);
  r=U(r,inkwellD(p),5.);
  r=U(r,quillD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .4+.15*grain(rkQ(p),60.);
  if(id==4.) return tileTone(p);
  if(id==5.){ vec3 q=place(p,IW,.3); return q.y>.055?.25:.5; }
  if(id==6.){ vec3 a=quillA(), b=quillB(); vec3 u=normalize(b-a); vec3 w=normalize(cross(u,vec3(0.,0.,1.))); float t=dot(p-a,u), s=dot(p-a,w);
    if(abs(s)<.0025) return .5; return fract(t/.006+abs(s)*30.)<.3?.62:.88; }
  return .7; }
