/* ELA Unit 1 "Sounds and Letters" — pencil still life: three wooden alphabet blocks with
   carved A, B and C (A stacked on B and C), an open picture book and a long pencil. */
#define CAM_POS vec3(-0.3090,0.3939,-0.8361)
#define CAM_TGT vec3(-0.1704,-0.0524,0.0939)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 200
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#define BH .052
float block(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(BH),.006);
  if(d>.02) return d;
  d=carve(d,q.xy,g,.075,.006,q.z+BH,.004);            /* front face */
  d=carve(d,vec2(-q.z,q.y),g2,.07,.0055,q.x-BH,.004);  /* right face */
  return d; }
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* an open picture book lying on the table, tipped a little toward us */
vec3 bookQ(vec3 p,float s){ vec3 q=p-vec3(.32,.03,.12); q.xz=rot(-.22)*q.xz; q.yz=rot(-.28)*q.yz; return q; }
vec2 bookD(vec3 p){
  vec3 q=bookQ(p,1.); float x=abs(q.x);
  float lift=.026*sin(clamp(x/.13,0.,1.)*1.9)-.016*exp(-x*55.)+.008;
  float pages=sdBox(vec3(x-.066,q.y-lift*.5,q.z),vec3(.064,max(lift*.5,.003),.088))-.0015;
  float cover=sdRBox(vec3(x-.07,q.y+.001,q.z),vec3(.073,.0035,.095),.0015);
  float prop=sdRBox(p-vec3(.32,.014,.2),vec3(.13,.014,.03),.003);   /* a folded cloth under the far edge */
  return vec2(pages,min(cover,prop)); }
float pencilD(vec3 p){
  vec3 q=p-vec3(-.03,2.*BH+.0068,-.005); q.xz=rot(3.0)*q.xz; q.yz=rot(.26)*q.yz;   /* along x, hex turned to show a face */
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x+.005)-.115);
  float t=clamp((q.x-.11)/.028,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(.11-q.x,q.x-.138));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.118)-.009);
  float era=max(length(q.yz)-R*.93,abs(q.x+.133)-.007)-.0006;
  return min(min(body,cone),min(fer,era)); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  r=U(r,block(p,vec3(-.2,BH,.01),.22,65,66),3.);
  r=U(r,block(p,vec3(-.083,BH,-.02),-.06,66,67),4.);
  r=U(r,block(p,vec3(.035,BH,.005),-.2,67,65),5.);
  vec2 b=bookD(p); r=U(r,b.x,6.); r=U(r,b.y,7.);
  r=U(r,pencilD(p),8.);
  return r; }
/* painted letters: the carved groove is inked dark, with a painted border on each face */
float letterInk(vec3 p,vec3 c,float ry,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-BH+.008&&glyph(q.xy/.075,g)*.075<.0085) return .18;
  if(q.x>BH-.008&&glyph(vec2(-q.z,q.y)/.07,g2)*.07<.008) return .18;
  vec2 f=q.z<-BH+.003?q.xy:q.x>BH-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-BH*.86)<.0022) return .45;
  return .76; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .7;
  if(id==2.) return .9;
  if(id==3.) return letterInk(p,vec3(-.2,BH,.01),.22,65,66);
  if(id==4.) return letterInk(p,vec3(-.083,BH,-.02),-.06,66,67);
  if(id==5.) return letterInk(p,vec3(.035,BH,.005),-.2,67,65);
  if(id==6.){ float a=.95; vec3 q=bookQ(p,1.); float x=abs(q.x);
    if(q.x>.01){ vec2 u=vec2(q.x-.066,q.z-.005);   /* right page: an apple, stem up */
      vec2 v=u*vec2(1.,.9); float lob=min(length(v-vec2(-.015,0.))-.032,length(v-vec2(.015,0.))-.032);
      lob=max(lob,-(length(v-vec2(0.,.04))-.011));             /* the dip at the top */
      if(lob<0.) a=.42; if(lob<0.&&length(u-vec2(-.012,.01))<.008) a=.8;   /* highlight */
      if(abs(lob)<.0018) a=.2;
      if(sdSeg2(u,vec2(0.,.03),vec2(.005,.055))<.0035) a=.2;                /* stem */
      float lf=length((rot(-.6)*(u-vec2(.02,.05)))*vec2(1.,2.4))-.014; if(lf<0.) a=.5; if(abs(lf)<.0015) a=.2;
      if(u.y<-.06&&u.y>-.066&&abs(u.x)<.035) a=.55; }
    if(q.x<-.01){ vec2 u=vec2(q.x+.066,q.z);  /* left page: a big A and lines */
      float g=glyph(u/.07-vec2(0.,.35),65)*.07-.005; if(g<0.) a=.35;
      float l=fract((u.y+.1)/.016); if(u.y<-.0&&u.y>-.07&&abs(u.x)<.045&&l<.22) a=.7; }
    if(x<.005) a=.7; return a; }
  if(id==7.) return .4;
  if(id==8.){ vec3 q=p-vec3(-.03,2.*BH+.0068,-.005); q.xz=rot(3.0)*q.xz; q.yz=rot(.26)*q.yz;
    if(q.x>.11) return q.x>.127?.12:.88;                    /* bare wood, graphite point */
    if(q.x<-.126) return .5;                                /* eraser */
    if(q.x<-.11) return fract(q.x/.003)<.35?.3:.7;          /* ferrule rings */
    return abs(q.z)<.0012?.35:.6; }
  return .7; }
