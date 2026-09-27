/* ELA Unit 4 "Writing and Telling" - pencil still life: an open notebook with a pencil and three picture cards numbered 1, 2 and 3 standing in a wooden rack. */
#define CAM_POS vec3(-0.3427,0.4039,-0.8576)
#define CAM_TGT vec3(-0.2002,-0.0545,0.0974)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"

/* ---- ELA still-life parts (local frames, metres) ---- */
float sdB2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
vec3 place(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
/* closed hardcover book lying flat: h = half sizes (x width, y thickness, z depth), spine at -x */
vec2 bookC(vec3 q,vec3 h){
  float t=.0035;
  float top=sdRBox(q-vec3(0.,h.y-t*.5,0.),vec3(h.x,t*.5,h.z),.0012);
  float bot=sdRBox(q-vec3(0.,-h.y+t*.5,0.),vec3(h.x,t*.5,h.z),.0012);
  float sp=max(length(vec2((q.x+h.x-h.y*.55)*1.25,q.y))-h.y,max(abs(q.z)-h.z,q.x+h.x-h.y*.5));
  float pg=sdBox(q-vec3(.002,0.,0.),vec3(h.x-.006,h.y-t,h.z-.004));
  return vec2(min(min(top,bot),sp),pg); }
float bookCT(vec3 q,vec3 h,float cv){   /* cover tone cv; page edges get fine lines */
  if(abs(q.y)<h.y-.0035&&q.x>-h.x+.004) return fract(q.y/.0026)<.3?.72:.93;
  if(q.x<-h.x+.012&&abs(abs(q.z)-h.z*.7)<.003) return cv*.55;       /* raised bands on the spine */
  if(abs(q.y)>h.y-.004&&abs(max(abs(q.x)/h.x,abs(q.z)/h.z)-.86)<.012) return cv*.7; /* ruled border */
  return cv; }
/* open book lying flat: w = page width, dd = half depth, spine along z */
vec2 bookO(vec3 q,float w,float dd){
  float x=abs(q.x);
  float lift=.026*sin(clamp(x/(2.*w),0.,1.)*1.9)-.016*exp(-x*55.)+.008;
  float pages=sdBox(vec3(x-w,q.y-lift*.5,q.z),vec3(w-.002,max(lift*.5,.003),dd-.007))-.0015;
  float cover=sdRBox(vec3(x-w-.004,q.y+.001,q.z),vec3(w+.007,.0035,dd),.0015);
  return vec2(pages,cover); }
float lines2(vec2 u,vec2 hb,float gap,float seed){   /* hint lines (not words) in a box, ragged ends */
  if(abs(u.x)>hb.x||abs(u.y)>hb.y) return 0.;
  float row=floor(u.y/gap); float f=fract(u.y/gap);
  float end=hb.x-hb.x*.6*h1(vec2(row,seed))*step(.55,h1(vec2(row+3.,seed)));
  return (f<.2&&u.x<end)?1.:0.; }
float pageT(vec3 q,float w,float dd,float seed){
  float x=abs(q.x); vec2 u=vec2(x-w,q.z);
  if(x<.004) return .7;
  return lines2(u,vec2(w-.02,dd-.022),.012,seed+sign(q.x))>0.?.6:.95; }
/* hexagonal pencil along x, tip at +x */
float pencilL(vec3 q,float L){
  float R=.0066; vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x)-L);
  float t=clamp((q.x-L)/.028,0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(L-q.x,q.x-L-.028));
  float fer=max(length(q.yz)-R*.98,abs(q.x+L+.009)-.009);
  float era=max(length(q.yz)-R*.93,abs(q.x+L+.024)-.007)-.0006;
  return min(min(body,cone),min(fer,era)); }
float pencilT(vec3 q,float L){ if(q.x>L) return q.x>L+.017?.12:.88; if(q.x<-L-.018) return .5;
  if(q.x<-L) return fract(q.x/.003)<.35?.3:.7; return abs(q.z)<.0012?.35:.6; }
/* magnifying glass lying flat (ring in xz), handle along +x. x: ring+collar, y: glass, z: handle */
vec3 magnif(vec3 q,float R){
  float ring=sdB2(vec2(length(q.xz)-R,q.y),vec2(.0045,.007))-.002;
  float glass=max(length(q.xz)-R+.002,abs(q.y)-.0025+length(q.xz)*.02)-.0005;
  float col=sdCylX(q-vec3(R+.016,0.,0.),.0085,.012)-.001;
  float hd=sdCapsule(q,vec3(R+.03,0.,0.),vec3(R+.14,0.,0.),.0105);
  hd=max(hd,-sdTorus((q-vec3(R+.14,0.,0.)).yxz,.011,.002));
  return vec3(min(ring,col),glass,hd); }
/* rolled scroll along x with end knobs */
vec2 scrollX(vec3 q,float L,float r){
  float roll=sdCylX(q,r,L)-.001;
  float rods=min(sdCylX(q-vec3(L+.012,0.,0.),r*.35,.012),sdCylX(q+vec3(L+.012,0.,0.),r*.35,.012));
  rods=min(rods,min(length(q-vec3(L+.026,0.,0.))-r*.55,length(q+vec3(L+.026,0.,0.))-r*.55));
  return vec2(roll,rods); }
/* round ink bottle with neck and lip, base at y=0 */
float inkwell(vec3 q,float r){
  float body=sdCylY(q-vec3(0.,r*.55,0.),r-.006,r*.55-.006)-.006;
  float sh=length(vec2(max(length(q.xz)-r*.45,0.),q.y-r*1.1))-r*.28;
  float neck=sdCylY(q-vec3(0.,r*1.35,0.),r*.36,r*.2)-.002;
  float lip=sdTorus(q-vec3(0.,r*1.55,0.),r*.36,.004);
  float d=smin(min(body,sh),neck,.01); d=min(d,lip);
  return max(d,-(sdCylY(q-vec3(0.,r*1.6,0.),r*.27,r*.3))); }
/* feather quill along x (tip at +x), vane in the xz plane */
float quill(vec3 q,float L){
  float t=clamp((q.x+L)/(2.*L),0.,1.);
  float bend=.02*sin(t*3.1416);
  vec3 c=q-vec3(0.,bend,0.);
  float shaft=sdCapsule(c,vec3(-L,0.,0.),vec3(L,0.,0.),.0022);
  float vt=clamp((q.x+L*.95)/(L*1.55),0.,1.);
  float w=.024*pow(sin(vt*3.1416),.7)*(1.-.25*vt);
  float vane=max(max(abs(c.z-w*.25)-w,abs(c.y)-.0012),abs(q.x+L*.18)-L*.78)*.8;
  return min(shaft,vane-.0006); }
float quillT(vec3 q,float L){ if(q.x>L*.62) return .35; float w=sin(q.x*260.+q.z*120.); return abs(q.z)<.0025?.8:(w>.6?.62:.8); }
/* candle stick in a dish holder with a finger ring, base at y=0 */
vec3 candle(vec3 q,float H){
  float dish=max(sdCylY(q-vec3(0.,.008,0.),.06,.008)-.003,-(sdCylY(q-vec3(0.,.02,0.),.052,.008)));
  float cup=sdCylY(q-vec3(0.,.02,0.),.022,.012)-.002;
  float ringH=sdTorus((q-vec3(.07,.012,0.)).xzy,.014,.004);
  float stick=sdCylY(q-vec3(0.,.032+H*.5,0.),.017,H*.5)-.001;
  stick=smin(stick,length(q-vec3(.013,.032+H*.8,-.012))-.004,.006);   /* a drip */
  float wick=sdCapsule(q,vec3(0.,.032+H,0.),vec3(.001,.032+H+.012,0.),.0013);
  vec3 f=q-vec3(0.,.032+H+.03,0.); f.y*=.55; float fl=length(f)-.0095; fl=smin(fl,sdCapsule(q,vec3(0.,.032+H+.02,0.),vec3(0.,.032+H+.06,0.),.0008),.012);
  return vec3(min(min(dish,cup),ringH),min(stick,wick),fl); }
/* flat card / sheet with bevel */
float card(vec3 q,vec2 h,float t){ return sdRBox(q,vec3(h.x,t,h.y),min(t,.002)); }
/* local glyphs for punctuation (codes 58 : 59 ; 44 , 63 ?) and more letters */
float glyphE(vec2 p,int g){
  if(g==58) return min(length(p-vec2(0.,.2))-.02,length(p-vec2(0.,-.3))-.02);
  if(g==59) return min(length(p-vec2(0.,.2))-.02,min(length(p-vec2(0.,-.3))-.02,seg(p,vec2(0.,-.3),vec2(-.08,-.5))));
  if(g==44) return min(length(p-vec2(0.,-.25))-.03,seg(p,vec2(.0,-.25),vec2(-.1,-.48)));
  if(g==63) return min(arc(p,vec2(0.,.2),.2,-PI*.5,PI*1.1),min(seg(p,vec2(0.,0.),vec2(0.,-.12)),length(p-vec2(0.,-.36))-.02));
  if(g==33) return min(seg(p,vec2(0.,.4),vec2(0.,-.12)),length(p-vec2(0.,-.36))-.02);
  return glyph(p,g); }
float carveE(float d3,vec2 uv,int g,float sz,float w,float z,float dep){
  float gd=glyphE(uv/sz,g)*sz-w; return max(d3,-max(gd,abs(z)-dep)); }

vec3 nq(vec3 p){ vec3 q=p-vec3(.22,.004,.02); q.xz=rot(-.3)*q.xz; return q; }
vec2 note(vec3 p){ vec3 q=nq(p); float x=abs(q.x);
  float pages=sdRBox(vec3(x-.075,q.y-.002,q.z),vec3(.073,.0025,.1),.0015);
  float cover=sdRBox(vec3(x-.077,q.y-.0005,q.z),vec3(.078,.0013,.103),.001);
  float rings=1e5; for(int i=0;i<8;i++){ vec3 c=q-vec3(0.,.004,-.085+float(i)*.024); rings=min(rings,sdTorus(c.xzy,.007,.0016)); }
  return vec2(min(pages,cover),rings); }
float rackX(float i){ return -.24+i*.085; }
vec3 kq(vec3 p,int i){ float fi=float(i); vec3 q=p-vec3(rackX(fi),.078,.06-fi*.004); q.yz=rot(.12)*q.yz; return q; }
vec2 rack(vec3 p){ float base=sdRBox(p-vec3(-.155,.012,.06),vec3(.14,.012,.028),.004);
  float d=1e5; for(int i=0;i<3;i++) d=min(d,card(kq(p,i).xzy,vec2(.037,.058),.0016));
  return vec2(base,d); }
vec3 pq(vec3 p){ vec3 q=p-vec3(.21,.0132,-.02); q.xz=rot(2.55)*q.xz; q.yz=rot(.26)*q.yz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 k=rack(p); r=U(r,k.x,3.); r=U(r,k.y,4.);
  vec2 nb=note(p); r=U(r,nb.x,5.); r=U(r,nb.y,6.);
  r=U(r,pencilL(pq(p),.09),7.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.) return .55+.1*grain(p,50.);
  if(id==4.){ for(int i=0;i<3;i++){ vec3 q=kq(p,i); if(abs(q.x)<.04&&abs(q.y)<.06){
      if(q.z>0.) return .8;
      int g=i==0?49:i==1?50:51; if(glyph((q.xy-vec2(0.,.022))/.045,g)*.045<.0045) return .15;
      if(abs(max(abs(q.x)/.037,abs(q.y)/.058)-.88)<.02) return .5;
      if(q.y<-.012&&q.y>-.045&&abs(q.x)<.024&&fract(q.y/.011)<.25) return .55; } } return .94; }
  if(id==5.){ vec3 q=nq(p); if(q.y<.0035) return .45; float x=abs(q.x);
    if(abs(q.x-.02)<.001||abs(q.x+.13)<.001) return .55;
    if(x>.01&&x<.14&&q.z<.085&&q.z>-.09&&fract(q.z/.012)<.12) return .66; return .95; }
  if(id==6.) return .4;
  if(id==7.) return pencilT(pq(p),.09);
  return .7; }
