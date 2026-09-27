/* ELA Unit 7 "Reading to Learn" - pencil still life: a woven straw beehive (a skep) on a wooden board beside an open book and a magnifying glass. */
#define CAM_POS vec3(-0.4758,0.4586,-0.8885)
#define CAM_TGT vec3(-0.3243,-0.0292,0.1280)
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

#define SK vec3(.1,.02,.12)
vec2 skep(vec3 p){ vec3 q=p-SK;
  float H=.2; q.xz*=.8; float y=clamp(q.y,0.,H); float R=.1*sqrt(max(1.-pow(y/H,2.2),0.))+.004;
  float core=(length(vec2(length(q.xz)-0.,0.))-R+.006); core=max(core,max(-q.y,q.y-H+.004))*.8;
  float fr=q.y/.021; float k=floor(fr); float ry=(k+.5)*.021; float yy=clamp(ry,0.,H);
  float Rr=.1*sqrt(max(1.-pow(yy/H,2.2),0.))+.004;
  float ring=length(vec2(length(q.xz)-Rr+.002,q.y-ry))-.0115; ring=max(ring,q.y-H+.002);
  float d=min(core,ring*.9); d=max(d,-q.y);
  float door=sdRBox(q-vec3(0.,.012,-.09),vec3(.022,.014,.04),.006); d=max(d,-door);
  float board=sdRBox(q-vec3(0.,-.01,0.),vec3(.14,.01,.13),.004);
  return vec2(d,board); }
vec3 bk(vec3 p){ vec3 q=p-vec3(-.17,.03,.1); q.xz=rot(.25)*q.xz; q.yz=rot(-.3)*q.yz; return q; }
vec3 mq(vec3 p){ vec3 q=p-vec3(-.12,.012,-.08); q.xz=rot(2.9)*q.xz; return q; }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.); r=U(r,.9-p.z,2.);
  vec2 s=skep(p); r=U(r,s.x,3.); r=U(r,s.y,4.);
  vec2 b=bookO(bk(p),.08,.1); r=U(r,b.x,5.); r=U(r,b.y,6.);
  r=U(r,sdRBox(p-vec3(-.17,.016,.19),vec3(.15,.016,.03),.004),6.);
  vec3 m=magnif(mq(p),.048); r=U(r,m.x,7.); r=U(r,m.y,8.); r=U(r,m.z,9.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75; if(id==2.) return .9;
  if(id==3.){ vec3 q=p-SK; float a=atan(q.z,q.x); float st=fract(a*14./6.2832+q.y*6.);
    float gv=fract(q.y/.021); if(length(q.xz)<.08&&q.y<.03&&q.z<-.06) return .12; return (gv<.12||gv>.9)?.35:(st<.12?.5:.72); }
  if(id==4.) return .55+.1*grain(p,50.);
  if(id==5.){ vec3 q=bk(p); if(q.x>.02){ vec2 u=vec2(q.x-.08,q.z-.035);
      vec2 h=u; h.x=abs(h.x)-(fract(h.y/.02+.5)<.5?0.:0.);
      vec2 c=vec2(mod(u.x+.0,.017)-.0085,mod(u.y,.02)-.01); vec2 ce=floor(vec2(u.x/.017,u.y/.02)); if(mod(ce.y,2.)>.5) c.x=mod(u.x+.0085,.017)-.0085;
      if(abs(u.x)<.05&&abs(u.y)<.03){ float hx=max(abs(c.x)*.866+abs(c.y)*.5,abs(c.x))-.007; if(abs(hx)<.0012) return .35; return .85; }
      if(u.y<-.045&&abs(u.x)<.055&&fract(u.y/.012)<.2) return .6; return .95; }
    return pageT(q,.08,.1,7.); }
  if(id==6.) return .42;
  if(id==7.) return .4; if(id==8.) return .96; if(id==9.) return .5;
  return .7; }
