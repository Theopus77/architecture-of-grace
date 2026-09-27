/* h16 "Put It All Together" — three jigsaw pieces fitted together with a fourth lying beside
   them ready to go in, and a stopwatch standing on its edge. */
#define CAM_POS vec3(-0.3291,0.2418,-0.6498)
#define CAM_TGT vec3(-0.0976,-0.0051,0.0754)
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
#define PS .05
/* one piece in a unit cell at the origin: tabs out on +x/+y edges when t>0, sockets when t<0 */
float piece2(vec2 u,vec4 t){ float d=sdBox2(u,vec2(.5));
  vec2 e[4]; e[0]=vec2(.5,0.); e[1]=vec2(0.,.5); e[2]=vec2(-.5,0.); e[3]=vec2(0.,-.5);
  for(int i=0;i<4;i++){ vec2 c=e[i]+normalize(e[i])*.13*sign(t[i]); float k=length(u-c)-.16;
    if(t[i]>0.) d=min(d,k); else if(t[i]<0.) d=max(d,-k); }
  return d; }
float pc(vec3 p,vec3 c,float ry,vec4 t){ vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d2=piece2(q.xz/(2.*PS),t)*2.*PS; vec2 w=vec2(d2,abs(q.y-.005)-.004); return min(max(w.x,w.y),0.)+length(max(w,0.))-.0008; }
#define G vec3(-.02,0.,.02)
#define GR .2
vec3 cell(float i,float j){ vec2 o=vec2(i,j)*2.*PS; o=rot(-GR)*o; return G+vec3(o.x,0.,o.y); }
float pA(vec3 p){ return pc(p,cell(0.,0.),GR,vec4(1.,1.,0.,0.)); }
float pB(vec3 p){ return pc(p,cell(1.,0.),GR,vec4(-1.,1.,-1.,0.)); }
float pC(vec3 p){ return pc(p,cell(0.,1.),GR,vec4(-1.,0.,0.,-1.)); }
float pD(vec3 p){ return pc(p-vec3(.19,0.,-.12),vec3(0.),.9,vec4(1.,0.,1.,-1.)); }
#define SW vec3(.1,0.,.2)
vec3 swQ(vec3 p){ vec3 q=place(p,SW,-.35); q.yz=rot(.15)*q.yz; return q-vec3(0.,.062,0.); }
float watch(vec3 p){ vec3 q=swQ(p);
  float body=sdCylZ(q,.055,.012)-.004;
  float bezel=sdTorus(q.xzy-vec3(0.,-.016,0.),.052,.0035);
  float stem=sdCylY(q-vec3(0.,.066,0.),.007,.008)-.001;
  float crown=sdCylY(q-vec3(0.,.08,0.),.011,.006)-.002;
  float ring=sdTorus((q-vec3(0.,.1,0.)).xyz,.011,.003);
  vec3 b=q; b.xy=rot(-.8)*b.xy; float btn=sdCylY(b-vec3(0.,.064,0.),.004,.007);
  return min(min(body,bezel),min(min(stem,crown),min(ring,btn))); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pA(p),3.);
  r=U(r,pB(p),4.);
  r=U(r,pC(p),5.);
  r=U(r,pD(p),6.);
  r=U(r,watch(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id>=3.&&id<=6.){ if(n.y<.5) return .5; float t=id==3.?.62:id==4.?.8:id==5.?.72:.66;
    return t-.1*step(.6,fbm(p.xz*60.)); }
  if(id==7.){ vec3 q=swQ(p); if(q.z<-.012){ float r=length(q.xy); if(r<.046){ float a=atan(q.y,q.x);
      if(r>.038&&fract(a/6.2832*60.)<.12) return .3; if(r>.034&&fract(a/6.2832*12.)<.05) return .2;
      if(sdSeg2(q.xy,vec2(0.),vec2(.012,.03))<.0018) return .15;
      if(sdSeg2(q.xy,vec2(0.),vec2(-.022,-.008))<.0014) return .2;
      if(r<.004) return .2; return .92; } }
    return .5; }
  return .7; }
