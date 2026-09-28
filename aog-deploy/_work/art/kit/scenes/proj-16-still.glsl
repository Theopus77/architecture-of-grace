/* FACS project 16 "Plan and cook a budget meal for four" — pencil still life: a covered pot
   with its lid, a stack of four dinner plates, a cost sheet on a clipboard with a column of
   hint-lines (no real writing), and a pocket calculator beside it. */
#define CAM_POS vec3(-0.5548,0.4997,-0.9329)
#define CAM_TGT vec3(-0.2665,-0.0082,0.1396)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "medparts_a.glsl"
#include "projparts.glsl"
#define PT vec3(.09,0.,.12)
#define PS vec3(-.06,0.,.09)
#define CL vec3(-.03,0.,-.08)
#define CA vec3(.17,.008,-.07)
float pot(vec3 p){ vec3 q=p-PT;
  float body=max(abs(length(q.xz)-.075)-.0035,abs(q.y-.055)-.055); body=min(body,sdCylY(q-vec3(0.,.003,0.),.075,.003));
  float lid=max(abs(length(q-vec3(0.,.04,0.))-.1)-.0025,.112-q.y); lid=max(lid,length(q.xz)-.079);
  float knob=sdCylY(q-vec3(0.,.148,0.),.011,.005)-.003;
  float ears=min(sdTorus((q-vec3(.084,.09,0.)).xzy,.012,.004),sdTorus((q-vec3(-.084,.09,0.)).xzy,.012,.004));
  ears=max(ears,-(abs(q.x)-.075));
  return min(min(body,lid),min(knob,ears)); }
float plates(vec3 p){ vec3 q=p-PS; float d=1e5;
  for(int i=0;i<4;i++){ vec3 l=q-vec3(0.,.004+float(i)*.009,0.); float r=length(l.xz);
    float f=.003*smoothstep(.06,.1,r);
    d=min(d,max(max(abs(l.y-f)-.0022,r-.1),-1.)); d=min(d,sdTorus(l-vec3(0.,.003,0.),.1,.0026)); }
  return d; }
vec3 cL(vec3 p){ vec3 q=p-CL; q.xz=rot(.25)*q.xz; return q; }
float board(vec3 p){ vec3 q=cL(p); float d=sdRBox(q-vec3(0.,.003,0.),vec3(.075,.003,.1),.004);
  d=min(d,sdRBox(q-vec3(0.,.009,.088),vec3(.03,.005,.012),.003)); return d; }
float sheet(vec3 p){ vec3 q=cL(p); return sdRBox(q-vec3(0.,.0068,-.006),vec3(.066,.0008,.088),.0005); }
float calc(vec3 p){ vec3 q=p-CA; q.xz=rot(-.3)*q.xz; return sdRBox(q,vec3(.04,.008,.062),.006); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,pot(p),3.);
  r=U(r,plates(p),4.);
  r=U(r,board(p),5.);
  r=U(r,sheet(p),6.);
  r=U(r,calc(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.) return .4;
  if(id==4.){ vec3 q=p-PS; float r=length(q.xz); return abs(r-.075)<.0015?.5:.92; }
  if(id==5.) return .45;
  if(id==6.){ vec3 q=cL(p)-vec3(0.,0.,-.006);
    float row=fract((q.z+.07)/.016); bool inRows=q.z<.07&&q.z>-.075&&row<.12;
    if(abs(q.z-.072)<.0012&&abs(q.x)<.045) return .3;                                /* a heading bar */
    if(inRows&&q.x>-.055&&q.x<.01) return .5;                                         /* item lines */
    if(inRows&&q.x>.025&&q.x<.055) return .42;                                        /* the cost column */
    if(abs(q.z+.08)<.0015&&q.x>.02&&q.x<.058) return .25;                            /* the total, underlined */
    return .95; }
  if(id==7.){ vec3 q=p-CA; q.xz=rot(-.3)*q.xz; if(q.y>.006){ if(q.z>.025&&abs(q.x)<.032&&q.z<.052) return .85;
      vec2 g=vec2((q.x+.032)/.016,(q.z+.055)/.017); if(g.x>0.&&g.x<4.&&g.y>0.&&g.y<4.5){ vec2 f=fract(g); if(f.x>.15&&f.x<.85&&f.y>.2&&f.y<.8) return .55; } }
    return .3; }
  return .7; }
