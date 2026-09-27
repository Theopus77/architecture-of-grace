/* Home page door 02 "The Front Porch" — pencil still life: a small porch lantern with a
   ring on top, a potted plant with round leaves behind it, and a folded letter on the table
   in front with hint-lines only. Families, the words that go home. */
#define CAM_POS vec3(-0.7056,0.3089,-1.0092)
#define CAM_TGT vec3(-0.3081,0.0439,0.1391)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.7,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
/* ---- the lantern ---- */
#define LC vec3(.02,0.,.06)
vec3 lq(vec3 p){ vec3 q=p-LC; q.xz=rot(.5)*q.xz; return q; }
float lanFrame(vec3 q){
  float base=sdRBox(q-vec3(0.,.014,0.),vec3(.062,.014,.062),.004);
  base=min(base,sdRBox(q-vec3(0.,.032,0.),vec3(.054,.005,.054),.002));
  vec3 c=vec3(abs(q.x)-.047,q.y-.12,abs(q.z)-.047);
  float posts=sdRBox(c,vec3(.0065,.085,.0065),.002);
  float band=sdRBox(q-vec3(0.,.208,0.),vec3(.056,.007,.056),.002);
  /* thin cross bars on each pane */
  float bars=min(sdBox(vec3(q.x,q.y-.12,abs(q.z)-.047),vec3(.045,.0025,.0025)),
                 sdBox(vec3(abs(q.x)-.047,q.y-.12,q.z),vec3(.0025,.0025,.045)));
  /* the roof: a low four-sided pyramid with an eave */
  vec3 r=q-vec3(0.,.215,0.);
  float pyr=max(max(abs(r.x),abs(r.z))-.07+r.y*1.05,max(-r.y,r.y-.058))*.69;
  float eave=sdRBox(r-vec3(0.,.004,0.),vec3(.071,.004,.071),.002);
  float cap=sdCylY(q-vec3(0.,.278,0.),.012,.008)-.002;
  float ring=sdTorus((q-vec3(0.,.305,0.)).xzy,.019,.0042);
  return min(min(min(base,posts),min(band,bars)),min(min(pyr,eave),min(cap,ring))); }
float lanGlass(vec3 q){ return sdBox(q-vec3(0.,.12,0.),vec3(.044,.083,.044)); }
/* ---- the potted plant, back left ---- */
#define PC vec3(-.22,0.,.2)
float potD(vec3 p){ vec3 q=p-PC;
  float body=sdCone(q-vec3(0.,.048,0.),.042,.056,.048)-.002;
  float rim=sdCylY(q-vec3(0.,.1,0.),.064,.012)-.003;
  float hole=sdCylY(q-vec3(0.,.12,0.),.054,.03);
  return max(min(body,rim),-hole); }
float soilD(vec3 p){ vec3 q=p-PC; return sdCylY(q-vec3(0.,.098,0.),.055,.004); }
vec2 leafQ(vec3 p,int i){ /* returns (leaf distance, stem distance) */
  vec3 q=p-PC-vec3(0.,.1,0.); float fi=float(i);
  float ang=fi*2.4+.3, tilt=.15+.6*fract(fi*.618+.2), len=.07+.08*fract(fi*.381+.1);
  vec3 dir=vec3(cos(ang)*sin(tilt),cos(tilt),sin(ang)*sin(tilt));
  vec3 tip=dir*len;
  float stem=sdCapsule(q,vec3(0.),tip,.0022);
  vec3 ax=normalize(vec3(dir.x,0.,dir.z)+1e-4); vec3 up=vec3(0.,1.,0.);
  vec3 sd=normalize(cross(up,ax));
  vec3 al=normalize(ax+up*(.5-tilt*.4)); vec3 nl=normalize(cross(sd,al));
  vec3 l=q-tip-al*.038;
  vec3 lp=vec3(dot(l,al),dot(l,nl),dot(l,sd));
  lp.y+=lp.z*lp.z*3.;                        /* cupped a little */
  float leaf=(length(lp/vec3(.046,.0045,.036))-1.)*.0045;
  return vec2(leaf,stem); }
vec2 plant(vec3 p){ float lf=1e5, st=1e5;
  for(int i=0;i<12;i++){ vec2 d=leafQ(p,i); lf=min(lf,d.x); st=min(st,d.y); }
  return vec2(lf,st); }
/* ---- the folded letter, front right ---- */
#define FC vec3(.2,0.,-.12)
vec3 fq(vec3 p){ vec3 q=p-FC; q.xz=rot(-.3)*q.xz; return q; }
float letterD(vec3 p){ vec3 q=fq(p);
  /* the lower two thirds lie flat; the top third is folded back and lifted a little */
  float flat_=sdRBox(q-vec3(0.,.0015,-.02),vec3(.1,.0012,.08),.0008);
  vec3 f=q-vec3(0.,.003,.06); f.yz=rot(-.55)*f.yz;
  float flap=sdRBox(f-vec3(0.,0.,.045),vec3(.1,.0011,.045),.0008);
  return min(flat_,flap); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=lq(p);
  r=U(r,lanFrame(q),3.);
  { /* the candle seen through the glass gets its own id, so it is outlined */
    float cx=min(abs(q.x),abs(q.z));
    bool cand=(cx<.015&&q.y>.04&&q.y<.135)||(cx<.006&&q.y>.137&&q.y<.17)||(cx<.022&&q.y>.04&&q.y<.05);
    r=U(r,lanGlass(q),cand?10.:4.); }
  r=U(r,potD(p),5.);
  r=U(r,soilD(p),6.);
  vec2 pl=plant(p); r=U(r,pl.x,7.); r=U(r,pl.y,8.);
  r=U(r,letterD(p),9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .72;
  if(id==2.) return .9;
  vec3 q=lq(p);
  if(id==3.) return .3;
  if(id==10.) return q.y>.136?.35:.5;
  if(id==4.){ /* glass: pale, with a candle seen through it */
    vec2 c=vec2(length(q.xz),q.y);
    float cx=max(abs(q.x),abs(q.z))>.043?min(abs(q.x),abs(q.z)):0.;
    if(cx<.015&&q.y>.04&&q.y<.135) return .42;
    if(cx<.006&&q.y>.137&&q.y<.17) return .4;
    if(cx<.022&&q.y>.04&&q.y<.05) return .5;
    return .93; }
  if(id==5.){ vec3 o=p-PC; if(o.y>.086) return .5; return .58+.05*fbm(o.xy*80.); }
  if(id==6.) return .3;
  if(id==7.){ return .5; }
  if(id==8.) return .45;
  if(id==9.){ vec3 f=fq(p);
    if(f.z<.05&&abs(f.x)<.082&&f.z>-.09&&fract((f.z+1.)/.015)<.4&&f.y<.006) {
      /* hint-lines; the last line on each paragraph is shorter */
      float row=floor((f.z+1.)/.015); float e=mod(row,4.)<.5?.02:.082;
      if(f.x<e) return .42; }
    return .95; }
  return .7; }
