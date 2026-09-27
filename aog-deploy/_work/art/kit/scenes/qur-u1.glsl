// @opts {"expo":1.25,"warm":.35,"bloom":.8,"vig":.4,"sat":1.05}
/* Qur'an, Unit 1 "A Book Called the Qur'an": an open book on a folding wooden stand (a
   rehal) beneath a hanging pierced-brass lamp, against a wall of blue and gold eight-point
   star tiles. Soft daylight from a window to the left, the lamp's warm glow.
   No people, no figures, and no writing on the pages. */
#define CAM_POS vec3(0.,.8,-1.45)
#define CAM_TGT vec3(0.,.7,1.)
#define CAM_FOV 36.
#define SUN_DIR vec3(-1.,.5,-.75)
#define MAXT 12.
#define EXPOSURE 1.
#define SUN_E 16.
#define TAU_M .1
#define SHADOW_MAXSTEP .02
#include "lib.glsl"

#define WALLZ 1.05
#define LAMP vec3(0.,1.12,.3)
/* --- the eight-point star and cross pattern, in wall coordinates (metres) ---
   returns x: signed distance to star edges (neg inside star), y: region (0 cross, 1 star) */
vec2 tile(vec2 w){
  float s=.24; vec2 c=w/s; vec2 id=floor(c+.5); vec2 f=c-id;       /* star centred in each cell */
  vec2 a=abs(f); float sq=max(a.x,a.y)-.33;
  vec2 r=abs(rot(.785398)*f); float sq2=max(r.x,r.y)-.33;
  float star=max(sq,sq2)*0.+min(max(sq,sq2),1.)*0.+ max(sq,sq2);
  star=min(max(a.x,a.y),max(r.x,r.y))-.33;                          /* union of two squares = 8-pt star */
  return vec2(star*s, star<0.?1.:0.);
}
float wallRelief(vec3 p){ vec2 t=tile(p.xy); float g=smoothstep(.0,.004,abs(t.x)); return g*.002; }
#define RY .55
float rehal(vec3 p){
  vec3 q=p-vec3(0.,0.,.25); q.xz=rot(RY)*q.xz;
  /* two boards crossing in an X seen from the side; each 0.36 wide (x), 0.012 thick */
  vec3 a=q-vec3(0,.26,0); a.yz=rot(.62)*a.yz; float b1=sdRBox(a,vec3(.25,.34,.008),.003);
  vec3 b=q-vec3(0,.26,0); b.yz=rot(-.62)*b.yz; float b2=sdRBox(b,vec3(.25,.34,.008),.003);
  /* cut the boards' interlocking slots and the lower points */
  float d=min(b1,b2);
  d=max(d,-q.y);
  return d; }
/* the open book resting in the V of the stand */
vec2 book(vec3 p){
  vec3 q=p-vec3(0.,0.,.25); q.xz=rot(RY)*q.xz; q-=vec3(0.,.555,-.02); q.yz=rot(-.62)*q.yz;
  float x=abs(q.x);
  float curl=.018*sin(clamp(x/.2,0.,1.)*3.1416)+.02*(1.-exp(-x*25.));
  float pages=sdBox(vec3(x-.1,q.y-curl*.8,q.z),vec3(.097,.014,.14));
  float cover=sdRBox(vec3(x-.104,q.y+.014+curl*.3,q.z),vec3(.106,.004,.148),.002);
  return vec2(pages,cover); }
vec2 lamp(vec3 p){
  vec3 q=p-LAMP;
  float body=sdCylY(q,.055,.07)-.004;
  float dome=max(length(q-vec3(0,.05,0))-.075,-(q.y-.07));
  dome=min(dome,sdCone(q-vec3(0,.16,0),.03,.004,.05));
  float bottom=max(length(q+vec3(0,.06,0))-.07,q.y+.05);
  bottom=min(bottom,sdCone(q+vec3(0,.15,0),.004,.025,.04));
  float brass=min(min(dome,bottom),sdTorus(q-vec3(0,.07,0),.058,.006));
  brass=min(brass,sdTorus(q+vec3(0,.07,0),.058,.006));
  /* pierced vertical bands between glass panes */
  float ang=atan(q.z,q.x); float band=abs(fract(ang/6.2832*6.)-.5)*6.2832/6.*.058-.006;
  brass=min(brass,max(body-.002,band));
  float glass=body+.001;
  float chain=sdCapsule(q,vec3(0,.2,0),vec3(0,1.2,0),.006);
  return vec2(min(brass,chain),glass); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);                                     /* floor */
  r=U(r,max(WALLZ-p.z,-1.25-p.x),2.);                                     /* tile wall */
  /* window wall on the left with an arched opening */
  vec3 w=p-vec3(-1.35,0,0.);
  float wall=abs(w.x)-.1;
  vec2 o=vec2(w.z-.1,p.y-1.05); float arch=max(abs(o.x)-.33,o.y-.0); arch=min(arch,length(o)-.33);
  arch=max(arch,-(p.y-.45));
  r=U(r,max(wall,-arch),3.);
  r=U(r,rehal(p),4.);
  vec2 b=book(p); r=U(r,b.x,5.); r=U(r,b.y,6.);
  vec2 l=lamp(p); r=U(r,l.x,7.); r=U(r,l.y,8.);
  /* a low cushion-rug on the floor */
  r=U(r,sdRBox(p-vec3(0.,.01,.15),vec3(.75,.012,.45),.01),9.);
  return r;
}
Mat material(float id,vec3 p,inout vec3 n){
  float dc=distTo(p), fp=footprint(dc);
  if(id==2.){
    vec2 t=tile(p.xy); float g=smoothstep(.0015,.0035,abs(t.x));
    vec2 c=p.xy/.24; vec2 cid=floor(c+.5);
    vec2 tid=floor(p.xy/.24*2.+.5); n=normalize(n+vec3(h22(tid)-.5,0.)*.03);
    vec3 star=vec3(.03,.12,.42)*(.8+.35*h1(cid))*(.85+.3*fbmL(p.xy*60.,fp*60.,3));
    vec3 cross=vec3(.62,.58,.5)*(.88+.22*h1(cid+7.))*(.93+.1*fbmL(p.xy*25.,fp*25.,3));
    vec3 gold=vec3(.9,.62,.22);
    float rim=smoothstep(.009,.004,abs(t.x))*step(0.,-t.x+.009);
    vec3 a=mix(cross,star,t.y);
    /* a gold eight-point motif in each star and gold rims around the stars */
    float inner=min(max(abs(fract(c-.5).x-.5),abs(fract(c-.5).y-.5)),1.)*0.;
    vec2 f=c-cid; float ss=min(max(abs(f.x),abs(f.y)),max(abs(rot(.785)*f).x,abs(rot(.785)*f).y))-.1;
    float goldM=max(rim*.0,step(ss,0.));
    a=mix(a,gold,goldM);
    a=mix(vec3(.35,.32,.28),a,g);                           /* grout */
    BUMP(n,p,wallRelief,1.);
    Mat m=mat(a,mix(.5,.12,g)); m.spec=.05;
    if(goldM>.5){ m.metal=.9; m.rough=.3; }
    return m; }
  if(id==1.){ return mat(vec3(.25,.19,.13)*(.8+.3*fbm(p.xz*6.)),.8); }
  if(id==3.){ return mat(vec3(.55,.5,.44)*(.85+.2*fbm(p.yz*8.)),.9); }
  if(id==4.){ return mat(woodAlb(vec3(p.y*2.,p.x,p.z)*1.2,vec3(.28,.14,.06)),.45); }
  if(id==5.){ vec3 q=p-vec3(0.,0.,.25); q.xz=rot(RY)*q.xz; q-=vec3(0.,.555,-.02); q.yz=rot(-.62)*q.yz; float x=abs(q.x);
    vec3 a=paperAlb(q.xz,vec3(.78,.72,.58));
    /* an illuminated border: a thin gold and blue frame, no letters */
    vec2 b=abs(vec2(x-.1,q.z))-vec2(.078,.118);
    float fr=smoothstep(.0012,.0,abs(max(b.x,b.y)))+smoothstep(.0012,0.,abs(max(b.x,b.y)+.005))*.8;
    a=mix(a,vec3(.75,.5,.15),clamp(fr,0.,1.));
    a*=1.-.35*exp(-x*60.);                                  /* gutter shadow */
    Mat m=mat(a,.8); m.sss=.1; return m; }
  if(id==6.){ return mat(vec3(.22,.06,.04)*(.8+.3*fbm(p.xz*80.)),.5); }
  if(id==7.){ Mat m=mat(vec3(.75,.52,.25)*(.8+.3*fbm3(p*80.)),.28); m.metal=1.; return m; }
  if(id==8.){ Mat m=mat(vec3(.6,.35,.12),.1); m.emit=vec3(5.,2.4,.7)*(.7+.3*fbm3(p*90.)); return m; }
  if(id==9.){ /* a woven rug: red field, blue border, no figures */
    vec2 q=p.xz-vec2(0.,.15); vec2 e=abs(q)-vec2(.7,.4); float bd=step(-.06,max(e.x,e.y));
    vec3 a=mix(vec3(.35,.05,.04),vec3(.05,.08,.25),bd);
    float dm=abs(fract(q.x*6.+abs(q.y)*6.)-.5); a=mix(a,vec3(.55,.4,.2),smoothstep(.06,.02,abs(dm-.25))*(1.-bd)*.6);
    return mat(clothAlb(q,a),.95); }
  return mat(vec3(.5),.5);
}
vec3 shade(vec3 p,vec3 n,vec3 rd,Mat m,float t){
  float ao=calcAO(p,n,.25);
  vec3 c=vec3(0);
  /* window daylight (directional, shadowed by the window wall) */
  vec3 l=SUN(); float nl=max(dot(n,l),0.);
  float sh=nl>0.?softShadow(p+n*.002,l,.01,9.,24.):0.;
  vec3 sunC=vec3(1.,.9,.75)*6.;
  vec3 F0=mix(vec3(m.spec),m.alb,m.metal);
  c+=m.alb*(1.-m.metal)*sunC*nl*sh+sunC*ggx(n,-rd,l,max(m.rough,.08),F0)*sh;
  /* lamp */
  c+=pointLight(p,n,rd,m,LAMP-vec3(0,.02,0),vec3(1.,.6,.28)*.6,8.);
  /* bounce / room fill */
  c+=m.alb*(1.-m.metal)*vec3(.38,.33,.28)*ao*(.6+.4*n.y);
  c+=m.metal*m.alb*vec3(.45,.4,.35)*ao*.6;                  /* metals see the warm room */
  if(m.sss>0.) c+=m.alb*.3*ao;
  return c+m.emit;
}
vec3 background(vec3 ro,vec3 rd){ return skyFull(ro,rd)*.6; }
vec3 atmosphere(vec3 c,vec3 ro,vec3 rd,float t){ return c; }
vec3 post(vec3 c,vec3 ro,vec3 rd,float t){
  /* a faint glow of dust around the lamp */
  vec3 lp=LAMP-ro; float tc=dot(lp,rd); float d=length(lp-rd*tc);
  if(tc>0.&&tc<t) c+=vec3(1.,.6,.28)*.02/(d*d*40.+.05);
  return c; }
