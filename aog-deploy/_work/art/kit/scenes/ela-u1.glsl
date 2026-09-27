// @opts {"expo":1.2,"warm":.5,"bloom":.7,"vig":.38,"sat":1.06}
/* English Language Arts, Unit 1 "Sounds and Letters" (K–2): wooden alphabet blocks stacked
   on a rug beside an open picture book, under a warm lamp; soft daylight from a window.
   The blocks carry coloured panels, not letters, so there is no writing in the picture.
   No people. */
#define CAM_POS vec3(-.05,.42,-.66)
#define CAM_TGT vec3(0.,.14,.45)
#define CAM_FOV 34.
#define SUN_DIR vec3(-1.,.6,-.35)
#define MAXT 12.
#define EXPOSURE 1.
#define SHADOW_MAXSTEP .02
#include "lib.glsl"

#define LAMP vec3(.6,.5,.75)
float block(vec3 p,vec3 c,float a,float s){ vec3 q=p-c; q.xz=rot(a)*q.xz; return sdRBox(q,vec3(s*.5),s*.06); }
/* returns distance, and writes which block (for its colours) */
#define BS .1
void blockXf(int i,out vec3 c,out float a){
  vec3 B=vec3(-.2,0.,.32); float s=BS;
  if(i<3){ c=B+vec3(float(i-1)*.108,s*.5,0.); a=.05*float(i-1); }
  else if(i<5){ c=B+vec3(float(i-3)*.108-.054,s*1.5,.005); a=-.12+.2*float(i-3); }
  else if(i==5){ c=B+vec3(.0,s*2.5,-.01); a=.3; }
  else { c=vec3(.0,s*.5,.2); a=.7; } }
float blocks(vec3 p,out float bid){
  float d=1e5; bid=0.;
  for(int i=0;i<7;i++){ vec3 c; float a; blockXf(i,c,a);
    float b=block(p,c,a,BS); if(b<d){ d=b; bid=float(i); } }
  return d; }
vec2 book(vec3 p){
  vec3 q=p-vec3(.2,0.,.2); q.xz=rot(-.35)*q.xz;
  float x=abs(q.x);
  float curl=.012*sin(clamp(x/.17,0.,1.)*3.1416)+.012*(1.-exp(-x*30.));
  float pages=sdBox(vec3(x-.085,q.y-.012-curl,q.z),vec3(.082,.006,.11));
  float cover=sdRBox(vec3(x-.088,q.y-.004,q.z),vec3(.09,.004,.118),.002);
  return vec2(pages,cover); }
vec2 lamp(vec3 p){
  vec3 q=p-LAMP;
  float shade=abs(sdCone(q,.2,.13,.14))-.004;
  shade=max(shade,abs(q.y)-.14);
  float pole=sdCylY(p-vec3(LAMP.x,LAMP.y*.5,LAMP.z),.012,LAMP.y*.5);
  float base=sdCylY(p-vec3(LAMP.x,.012,LAMP.z),.14,.012);
  float bulb=length(q+vec3(0,.02,0))-.045;
  return vec2(min(min(shade,pole),base),bulb); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);                              /* floor boards */
  r=U(r,1.3-p.z,2.);                                /* wall */
  r=U(r,sdRBox(p-vec3(0.,.004,.35),vec3(.95,.006,.6),.004),3.);   /* rug */
  float bid; r=U(r,blocks(p,bid),10.+bid);
  vec2 b=book(p); r=U(r,b.x,4.); r=U(r,b.y,5.);
  vec2 l=lamp(p); r=U(r,l.x,6.); r=U(r,l.y,7.);
  /* window wall at the left with an opening */
  vec3 w=p-vec3(-1.5,0,0); vec2 o=vec2(w.z-.5,p.y-.95);
  float op=max(abs(o.x)-.45,abs(o.y)-.5);
  r=U(r,max(abs(w.x)-.08,-op),2.);
  return r;
}
Mat material(float id,vec3 p,inout vec3 n){
  float dc=distTo(p), fp=footprint(dc);
  if(id==1.){ vec3 q=vec3(p.z*8.,p.y,p.x); float pl=floor(p.x/.14);
    vec3 a=woodAlb(vec3(p.z+pl*3.7,p.y+pl*.1,p.x*.3),vec3(.3,.17,.08))*(.85+.3*h1(vec2(pl,1.)));
    a*=mix(.5,1.,smoothstep(.0,.004,abs(fract(p.x/.14)-.5)*.14-.066));
    Mat m=mat(a,.35); m.spec=.04; return m; }
  if(id==2.){ vec3 a=vec3(.62,.58,.5)*(.97+.04*fbmL(p.xy*30.,fp*30.,3));
    if(p.y<.38&&p.z>1.2) a=vec3(.36,.46,.5)*(.97+.04*fbm(p.xy*40.));          /* wainscot */
    if(abs(p.y-.39)<.012&&p.z>1.2) a=vec3(.8,.78,.72);
    return mat(a,.9); }
  if(id==3.){ vec2 q=p.xz-vec2(0.,.35); vec2 e=abs(q)-vec2(.95,.6);
    float bd=smoothstep(-.1,-.09,max(e.x,e.y)); float bd2=smoothstep(-.14,-.13,max(e.x,e.y));
    vec3 a=mix(vec3(.55,.42,.3),vec3(.18,.3,.42),bd2-bd); a=mix(a,vec3(.5,.18,.12),bd);
    a=clothAlb(q*.5,a)*(.9+.2*fbmL(q*20.,fp*20.,3));
    return mat(a,.95); }
  if(id>=10.){ float bid=id-10.;
    vec3 cols[6]=vec3[6](vec3(.6,.08,.06),vec3(.06,.2,.55),vec3(.1,.4,.12),vec3(.75,.5,.05),vec3(.45,.12,.4),vec3(.08,.4,.5));
    vec3 panel=cols[int(mod(bid,6.))];
    /* natural wood edges, a coloured inset panel on each face (no letters) */
    vec3 a=woodAlb(p*3.,vec3(.55,.38,.2));
    vec3 c; float ang; blockXf(int(bid),c,ang); vec3 q=p-c; q.xz=rot(ang)*q.xz;
    vec3 nl=n; nl.xz=rot(ang)*nl.xz; vec3 an=abs(nl);
    vec2 f; float fi;
    if(an.x>an.y&&an.x>an.z){ f=q.yz; fi=nl.x>0.?0.:1.; } else if(an.y>an.z){ f=q.xz; fi=nl.y>0.?2.:3.; } else { f=q.xy; fi=nl.z>0.?4.:5.; }
    vec2 g=abs(f)/BS;
    float inset=smoothstep(.37,.35,max(g.x,g.y));
    float groove=smoothstep(.012,.0,abs(max(g.x,g.y)-.36));
    vec3 pc=cols[int(mod(bid*2.+fi,6.))];
    a=mix(a,pc*(.9+.15*fbm(f*80.)),inset)*(1.-.5*groove);
    Mat m=mat(a,.45); m.spec=.05; return m; }
  if(id==4.){ /* the picture: a simple painted scene of hills and a sun, no words */
    vec3 q=p-vec3(.2,0.,.2); q.xz=rot(-.35)*q.xz; float x=q.x; vec2 u=vec2(abs(x)-.085,q.z);
    vec3 a=paperAlb(q.xz,vec3(.86,.83,.74));
    if(abs(u.x)<.068&&abs(u.y)<.09){
      vec2 v=vec2(x,q.z);
      vec3 sky=mix(vec3(.55,.75,.9),vec3(.85,.9,.9),.5-v.y*3.);
      float hill=v.y+.02-.03*sin(v.x*28.)-.02*cos(v.x*13.);
      a=hill<0.?mix(vec3(.3,.55,.2),vec3(.2,.42,.15),smoothstep(0.,-.06,hill)):sky;
      a=mix(a,vec3(.95,.75,.2),smoothstep(.022,.018,length(v-vec2(.12,.05))));
      a=mix(a,vec3(.8,.2,.15),smoothstep(.012,.008,length(v-vec2(-.1,-.03))));   /* a red ball */
      a*=.95; }
    a*=1.-.35*exp(-abs(x)*70.);
    Mat m=mat(a,.75); m.sss=.1; return m; }
  if(id==5.){ return mat(vec3(.1,.18,.4),.5); }
  if(id==6.){ vec3 q=p-LAMP; if(abs(q.y)<.141&&length(q.xz)>.1){ Mat m=mat(vec3(.8,.7,.55),.9); m.emit=vec3(1.4,.9,.45)*(.9+.1*fbm(q.xz*200.)); return m; }
    Mat m=mat(vec3(.55,.4,.2),.3); m.metal=1.; return m; }
  if(id==7.){ Mat m=mat(vec3(1.),.1); m.emit=vec3(30.,18.,8.); return m; }
  return mat(vec3(.5),.5);
}
vec3 shade(vec3 p,vec3 n,vec3 rd,Mat m,float t){
  float ao=calcAO(p,n,.2);
  vec3 c=vec3(0);
  vec3 l=SUN(); float nl=max(dot(n,l),0.);
  float sh=nl>0.?softShadow(p+n*.002,l,.01,9.,24.):0.;
  vec3 sunC=vec3(1.,.93,.82)*4.5;
  vec3 F0=mix(vec3(m.spec),m.alb,m.metal);
  c+=m.alb*(1.-m.metal)*sunC*nl*sh+sunC*ggx(n,-rd,l,max(m.rough,.08),F0)*sh;
  c+=pointLight(p,n,rd,m,LAMP-vec3(0,.05,0),vec3(1.,.65,.32)*.9,6.);
  c+=m.alb*(1.-m.metal)*vec3(.34,.3,.27)*ao*(.55+.45*n.y);
  c+=m.metal*m.alb*vec3(.4,.35,.3)*ao*.6;
  if(m.sss>0.) c+=m.alb*.2*ao;
  return c+m.emit;
}
vec3 background(vec3 ro,vec3 rd){ return skyFull(ro,rd)*.5; }
vec3 atmosphere(vec3 c,vec3 ro,vec3 rd,float t){ return c; }
vec3 post(vec3 c,vec3 ro,vec3 rd,float t){ return c; }
