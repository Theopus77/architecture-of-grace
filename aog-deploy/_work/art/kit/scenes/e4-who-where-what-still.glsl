/* e4 "Who, Where, What Happens" — a wooden toy house with a pitched roof and chimney (where),
   a storybook standing half open (the story), and a small candle lantern (what happens). */
#define CAM_POS vec3(-0.4295,0.2584,-0.6604)
#define CAM_TGT vec3(-0.1854,-0.0020,0.1046)
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
#define HS vec3(-.06,0.,.12)
vec3 hQ(vec3 p){ return place(p,HS,.3); }
float house(vec3 p){ vec3 q=hQ(p);
  float walls=sdRBox(q-vec3(0.,.05,0.),vec3(.07,.05,.05),.003);
  vec3 r=q-vec3(0.,.1,0.); float roof=max(max(abs(r.x)*.0+ (abs(r.z)*.8+r.y*1.)-.058,-r.y),abs(r.x)-.078);
  roof=max(max(abs(r.x)*.8+r.y-.07,-r.y+.0),abs(r.z)-.058)-.002; roof=max(roof,-max(max(abs(r.x)*.8+r.y-.062,-r.y-.01),abs(r.z)-.052));
  float ch=sdRBox(q-vec3(.035,.13,.018),vec3(.009,.025,.009),.002);
  return min(min(walls,roof),ch); }
float lantern(vec3 p){ vec3 q=p-vec3(.21,0.,.1);
  float base=sdCylY(q-vec3(0.,.008,0.),.035,.008)-.002;
  float top=sdCone(q-vec3(0.,.125,0.),.036,.012,.015)-.002;
  float d=min(base,top);
  for(int i=0;i<4;i++){ float a=float(i)*1.5708+.4; d=min(d,sdCylY(q-vec3(cos(a)*.03,.06,sin(a)*.03),.0028,.052)); }
  d=min(d,sdTorus((q-vec3(0.,.16,0.)).xzy,.018,.0028));
  return d; }
float glass(vec3 p){ vec3 q=p-vec3(.21,0.,.1); return abs(sdCylY(q-vec3(0.,.06,0.),.027,.05))-.001; }
float flameC(vec3 p){ vec3 q=p-vec3(.21,0.,.1);
  float c=sdCylY(q-vec3(0.,.035,0.),.009,.02);
  vec3 f=q-vec3(0.,.07,0.); float fl=length(vec3(f.x,f.y*.45,f.z))-.0075*(1.-clamp((f.y+.005)/.03,0.,1.))-.001;
  return min(c,fl); }
vec3 bQ(vec3 p){ return place(p,vec3(.07,0.,-.09),-.35); }
float sbook(vec3 p){ vec3 q=bQ(p); float d=bookD(q,vec3(.07,.014,.052));
  vec3 r=q-vec3(.02,.0,-.052); float rib=sdRBox(r-vec3(0.,.012,-.012),vec3(.004,.012,.0008),.0005);
  return min(d,rib); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,house(p),3.);
  r=U(r,lantern(p),4.);
  r=U(r,glass(p),5.);
  r=U(r,flameC(p),6.);
  r=U(r,sbook(p),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=hQ(p); if(q.y>.1){ if(n.y<.3) return .8; return fract((abs(q.x)*.8+q.y)/.01)<.25?.35:.55; }   /* roof shingles */
    if(q.z<-.048){ if(abs(q.x+.03)<.013&&q.y<.06) return abs(q.x+.03)>.01||q.y>.057?.25:.4;   /* door */
      vec2 w=vec2(q.x-.03,q.y-.06); if(sdBox2(w,vec2(.014))<0.) return abs(w.x)<.0012||abs(w.y)<.0012||sdBox2(w,vec2(.014))>-.002?.25:.55; }
    if(q.x<-.068&&abs(q.z)<.2){ vec2 w=vec2(q.z,q.y-.06); if(sdBox2(w,vec2(.013))<0.) return abs(w.x)<.0012||abs(w.y)<.0012||sdBox2(w,vec2(.013))>-.002?.25:.55; }
    return .82; }
  if(id==4.) return .35;
  if(id==5.) return .92;
  if(id==6.){ vec3 q=p-vec3(.21,0.,.1); return q.y>.058?.97:.85; }
  if(id==7.){ vec3 q=bQ(p); if(q.y>.026&&q.y<.03||n.y>.5){ vec2 u=q.xz; float fr=sdBox2(u-vec2(.004,0.),vec2(.05,.035));
      if(abs(fr)<.0015) return .35; float st=length((u-vec2(.004,.004))*vec2(1.,1.3))-.012; if(abs(st)<.0015) return .35; return .5; }
    if(abs(n.y)<.5&&q.x>-.06) return fract(q.y/.003)<.3?.7:.9; return .45; }
  return .7; }
