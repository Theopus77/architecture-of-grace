/* Practice room "Number Concepts and Data" — pencil still life: a pie cut into eighths with one
   slice pulled out, a wooden ruler with carved 1 2 3, and a little bar graph of stacked cubes. */
#define CAM_POS vec3(-0.2605,0.2958,-0.6652)
#define CAM_TGT vec3(-0.1487,-0.0642,0.0851)
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
#define PIE vec3(0.,0.,.04)
#define PR .1
#define RUL vec3(-.02,.004,-.12)
#define BARS vec3(.19,0.,.06)
#define CU .02
float wedge(vec2 u,float a0,float a1){ vec2 n0=vec2(sin(a0),-cos(a0)), n1=vec2(-sin(a1),cos(a1)); return max(dot(u,n0),dot(u,n1)); }
float pieBody(vec3 q){ float d=sdCylY(q-vec3(0.,.018,0.),PR,.016)-.003;
  d=min(d,sdTorus(q-vec3(0.,.034,0.),PR-.006,.008));
  float r=length(q.xz), a=atan(q.z,q.x);                      /* cuts between the slices */
  float k=abs(fract(a/(PI/4.)+.5)-.5)*(PI/4.)*r; d=max(d,-max(k-.0012,-q.y+.02));
  return d; }
float plateD(vec3 q){ float r=length(q.xz); return max(abs(q.y-.003-r*r*.6)-.0022,r-PR-.028)-.001; }
float pieD(vec3 q){ float d=pieBody(q); return max(d,-wedge(q.xz,-2.4,-2.4+PI/4.)); }
float sliceD(vec3 q){ vec2 off=vec2(cos(-2.4+PI/8.),sin(-2.4+PI/8.))*.075; vec3 s=q-vec3(off.x,0.,off.y);
  return max(pieBody(s),wedge(s.xz,-2.4+.01,-2.4+PI/4.-.01)); }
vec3 rulQ(vec3 p){ vec3 q=p-RUL; q.xz=rot(.1)*q.xz; return q; }
float rulD(vec3 q){ float d=sdRBox(q,vec3(.15,.004,.018),.0015);
  for(int i=0;i<3;i++){ vec2 c=vec2(-.1+float(i)*.1,.005); d=carve(d,vec2(q.x-c.x,-(q.z-c.y)),49+i,.016,.0014,q.y-.004,.0015); }
  return d; }
float barsD(vec3 p){ vec3 q=place(p,BARS,-.25); float d=1e3;
  for(int i=0;i<3;i++){ float h=i==0?1.:i==1?3.:2.; vec3 c=q-vec3((float(i)-1.)*2.2*CU,0.,0.);
    for(int k=0;k<4;k++){ if(float(k)>=h) break; d=min(d,sdRBox(c-vec3(0.,CU*(2.*float(k)+1.),0.),vec3(CU*.97),.003)); } }
  return d; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=p-PIE;
  r=U(r,plateD(q),3.);
  r=U(r,pieD(q-vec3(0.,.004,0.)),4.);
  r=U(r,sliceD(q-vec3(0.,.004,0.)),4.);
  r=U(r,rulD(rulQ(p)),5.);
  r=U(r,barsD(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.) return .9;
  if(id==4.){ vec3 q=p-PIE; if(n.y<.5&&length(q.xz)<PR-.004) return .68;     /* the filling at the cut */
    if(length(q.xz)>PR-.02) return .62; return .8+.08*fbm(q.xz*90.); }
  if(id==5.){ vec3 q=rulQ(p); if(q.y>.003){ if(q.z>.008&&fract(q.x/.01+.5)<.12) return .3;
      if(q.z>.012&&fract(q.x/.005+.5)<.2) return .45;
      for(int i=0;i<3;i++){ vec2 c=vec2(-.1+float(i)*.1,.005); if(glyph(vec2(q.x-c.x,-(q.z-c.y))/.016,49+i)*.016<.0016) return .2; } }
    return .78; }
  if(id==6.){ vec3 q=place(p,BARS,-.25); float f=fract(q.y/(2.*CU)); return (f<.04||f>.96)?.35:.72; }
  return .7; }
