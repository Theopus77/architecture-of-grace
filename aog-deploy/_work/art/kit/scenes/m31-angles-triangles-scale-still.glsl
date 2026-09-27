/* Room m31 "Angles, Triangles and Scale Drawings" — pencil still life on a drafting table: a
   clear protractor with its degree marks, a 30-60-90 set square with a triangular window,
   and a pencil, over a sheet with a small triangle drawn on it. */
#define CAM_POS vec3(-0.2870,0.4349,-0.4842)
#define CAM_TGT vec3(-0.1757,-0.0580,0.0247)
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
vec3 shQ(vec3 p){ return place(p,vec3(-.02,0.,.05),-.08); }
float sheetD(vec3 q){ return sdBox(q-vec3(0.,.0008,0.),vec3(.2,.0008,.14)); }
vec3 prQ(vec3 p){ vec3 q=place(p,vec3(-.06,.0038,-.02),.18); return q; }
float protD(vec3 q){ float R=.1; float r=length(q.xz);
  float d2=max(r-R,-q.z); d2=max(d2,-max(r-R*.55,-(q.z-.012)));
  d2=min(d2,sdBox2(q.xz-vec2(0.,.006),vec2(R,.006)));
  return extrude(d2,q.y,.0016,.0006); }
vec3 ssQ(vec3 p){ vec3 q=p-vec3(.12,.0074,.02); q.xz=rot(-.35)*q.xz; return q; }
float setsqD(vec3 q){ vec2 a=vec2(-.06,-.05),b=vec2(.12,-.05),c=vec2(-.06,.054);
  float t=sdTri2(q.xz,a,b,c);
  float inner=sdTri2(q.xz,a+vec2(.022,.013),b+vec2(-.058,.013),c+vec2(.022,-.034));
  float d2=max(t-.002,-(inner-.002));
  return extrude(d2,q.y,.0016,.0006); }
vec3 pnQ(vec3 p){ vec3 q=p-vec3(-.02,.0078,-.1); q.xz=rot(.12)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,sheetD(shQ(p)),3.);
  r=U(r,protD(prQ(p)),4.);
  r=U(r,setsqD(ssQ(p)),5.);
  r=U(r,pencilD2(pnQ(p),.075),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=shQ(p); vec2 u=q.xz;
    float tr=min(min(sdSeg2(u,vec2(-.17,.06),vec2(-.09,.06)),sdSeg2(u,vec2(-.09,.06),vec2(-.13,.12))),sdSeg2(u,vec2(-.13,.12),vec2(-.17,.06)));
    if(tr<.0014) return .2;
    vec2 g=abs(fract(u/.02+.5)-.5)*.02; if(min(g.x,g.y)<.0005) return .82;
    return .96; }
  if(id==4.){ vec3 q=prQ(p); float r=length(q.xz); float a=atan(q.z,q.x);
    if(q.y>.001&&r>.084&&r<.098&&q.z>.012){ float f=abs(fract(a/.08727+.5)-.5); float f2=abs(fract(a/.17453+.5)-.5);
      if(f2<.08&&r>.086) return .2; if(f<.08&&r>.091) return .35; }
    if(q.y>.001&&abs(r-.084)<.001&&q.z>.012) return .4;
    if(q.y>.001&&abs(q.x)<.0012&&q.z<.02) return .3;
    return .9; }
  if(id==5.){ vec3 q=ssQ(p); if(q.y>.001&&abs(fract(q.x/.01)-.5)>.44&&q.z<-.042&&q.x>-.05&&q.x<.1) return .35; return .85; }
  if(id==6.) return pencilTone(pnQ(p),.075);
  return .7; }
