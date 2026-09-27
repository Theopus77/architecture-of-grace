/* Worksheets page — pencil still life: a clipboard holding a small stack of worksheets with
   hint-lines, a sharpened pencil lying across it and a pink-style block eraser. */
#define CAM_POS vec3(-0.2696,0.2689,-0.5852)
#define CAM_TGT vec3(-0.1695,-0.0064,0.0860)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* clipboard frame: propped on its back edge so it leans toward the viewer */
vec3 cq(vec3 p){ vec3 q=p-vec3(0.,.0,.06); q.xz=rot(.18)*q.xz; q.yz=rot(-.22)*q.yz; q.y-=.008; return q; }
/* in cq: board lies in x/z plane... after tipping, local z runs up the board */
float boardD(vec3 p){ vec3 q=cq(p); return sdRBox(q-vec3(0.,0.,.16),vec3(.115,.004,.16),.006); }
float sheetD(vec3 p){ vec3 q=cq(p); float d=1e9;
  for(int i=0;i<3;i++){ float f=float(i); vec3 s=q-vec3(.004*f-.004,.0055+.0012*f,.145+.003*f);
    s.xz=rot(.02*f-.02)*s.xz; d=min(d,sdBox(s,vec3(.1,.0004,.135))); }
  return d-.0002; }
float clipD(vec3 p){ vec3 q=cq(p)-vec3(0.,.012,.3);
  float plate=sdRBox(q,vec3(.05,.005,.018),.004);
  float roll=sdCylX(q-vec3(0.,.008,.012),.006,.04)-.001;
  float ring=sdTorus((q-vec3(0.,.01,.035)).xzy*vec3(1.,1.,1.),.012,.0025);
  return min(min(plate,roll),ring); }
/* pencil lying on the table in front of the board */
vec3 pq(vec3 p){ vec3 q=p-vec3(.06,.0066,-.07); q.xz=rot(-.35)*q.xz; q.yz=rot(.26)*q.yz; return q; }
float pencilD(vec3 p){ vec3 q=pq(p);
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.005)-.075);
  float t=clamp((q.x-.07)/.028,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.07-q.x,q.x-.098));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.078)-.009);
  float era=max(length(q.yz)-R*.93,abs(q.x+.093)-.007)-.0006;
  return min(min(body,cone),min(fer,era)); }
vec3 eq(vec3 p){ vec3 q=p-vec3(.17,.011,.01); q.xz=rot(.5)*q.xz; return q; }
float eraserD(vec3 p){ vec3 q=eq(p); float d=sdRBox(q,vec3(.028,.011,.016),.005);
  d=max(d,q.x+q.y*.8-.03); return d; }   /* one worn, bevelled corner */
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,boardD(p),3.);
  r=U(r,sheetD(p),4.);
  r=U(r,clipD(p),5.);
  r=U(r,pencilD(p),6.);
  r=U(r,eraserD(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return .45+.1*fbm(p.xy*30.);
  if(id==4.){ vec3 q=cq(p); vec2 u=vec2(q.x,q.z-.145);
    if(u.y>.1&&u.y<.108&&u.x>-.08&&u.x<.02) return .3;                 /* heading bar */
    for(int i=0;i<3;i++){ float y=.07-float(i)*.07;                          /* three items */
      vec2 c=u-vec2(-.075,y); if(abs(length(c)-.008)<.0015) return .3;    /* number circle */
      if(abs(u.y-y)<.0014&&u.x>-.06&&u.x<.07) return .35;
      if(abs(u.y-y+.022)<.0012&&u.x>-.06&&u.x<.04) return .45;
      if(abs(u.y-y+.044)<.0012&&u.x>-.06&&u.x<.055) return .5; }
    return .95; }
  if(id==5.) return .35;
  if(id==6.){ vec3 q=pq(p);
    if(q.x>.07) return q.x>.087?.12:.88;
    if(q.x<-.086) return .5;
    if(q.x<-.07) return fract(q.x/.003)<.35?.3:.7;
    return abs(q.z)<.0012?.35:.6; }
  if(id==7.) return .75;
  return .7; }
