/* Practice room "Exponents, Roots and Scientific Notation" — pencil still life: three cubes built
   from small unit blocks, one, two and three blocks on a side (1, 8 and 27: a number cubed),
   and a hand lens for the very big and very small. */
#define CAM_POS vec3(-0.2178,0.2867,-0.6080)
#define CAM_TGT vec3(-0.1142,-0.0473,0.0880)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "roomparts_a.glsl"
#define UN .03
vec3 cpos(int i){ return i==0?vec3(-.17,0.,-.02):i==1?vec3(-.08,0.,0.):vec3(.07,0.,.03); }
/* distance to the nearest unit seam, measured only along the face the point lies on */
float grv(vec3 c,float h){ vec3 g=abs(fract((c+h)/UN+.5)-.5)*UN; vec3 a=abs(c); float gr=1e3;
  if(a.x<h-.004) gr=min(gr,g.x); if(a.y<h-.004) gr=min(gr,g.y); if(a.z<h-.004) gr=min(gr,g.z); return gr; }
float cubeN(vec3 q,float n){ vec3 h=vec3(n*UN*.5); vec3 c=q-vec3(0.,h.y,0.); float d=sdRBox(c,h,.002);
  if(n>1.){ float gr=grv(c,h.x); d=max(d,-max(gr-.0008,-(d+.0015))); }
  return d; }
vec3 tagQ(vec3 p,int i){ vec3 q=p-cpos(i)-vec3(0.,.0,-(float(i)+1.)*UN*.5-.03); q.yz=rot(-.5)*q.yz; return q; }
float tagD(vec3 q,int i){ float d=sdRBox(q-vec3(0.,.012,0.),vec3(.016,.012,.004),.002); d=carve(d,(q.xy-vec2(0.,.012))*vec2(1.,1.),49+i,.02,.0018,q.z+.004,.0016); return d; }
vec3 lsQ(vec3 p){ return place(p,vec3(.2,.007,-.05),.4); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  for(int i=0;i<3;i++){ vec3 q=place(p,cpos(i),.25-float(i)*.1);
    r=U(r,cubeN(q,float(i+1)),3.+float(i)); }
  vec3 l=lsQ(p);
  r=U(r,lensRim(l,.028),7.); r=U(r,lensGlass(l,.026),8.); r=U(r,lensHandle(l,.028)*1.,7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id>=3.&&id<=5.){ int i=int(id-3.); vec3 q=place(p,cpos(i),.25-float(i)*.1); float h=float(i+1)*UN*.5; vec3 c=q-vec3(0.,h,0.);
    return (i>0&&grv(c,h)<.0018)?.3:.75; }
  if(id==6.){ for(int i=0;i<3;i++){ vec3 q=tagQ(p,i); if(length(q-vec3(0.,.012,0.))<.03){ if(q.z<-.0025&&glyph((q.xy-vec2(0.,.012))/.02,49+i)*.02<.0022) return .15; } } return .85; }
  if(id==7.) return .35;
  if(id==8.) return .92;
  return .7; }
