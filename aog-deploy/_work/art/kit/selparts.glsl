/* AOG render kit — selparts.glsl: calm still-life parts for the SEL room banners (include
   after lib.glsl and studio.glsl). Every part is modelled in its own frame: metres, y up,
   resting on the table at y=0, centred on x=z=0. Place one with P(p, centre, turn).
   Parts return a distance; the matching ...T() gives its grey tone (0 dark .. 1 paper). */
vec3 P(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
float sdB2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
float sdEll(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }

/* ---- mug: radius r, height h, handle on +x ---- */
float mug(vec3 q,float r,float h){
  float o=sdCylY(q-vec3(0.,h*.5,0.),r,h*.5)-.002;
  float i=sdCylY(q-vec3(0.,h*.5+.008,0.),r-.006,h*.5);
  float body=max(o,-i);
  float tea=sdCylY(q-vec3(0.,h*.72,0.),r-.006,.002);          /* the drink, a little below the rim */
  vec3 t=q-vec3(r+.004,h*.52,0.); float hd=length(vec2(length(t.xy)-h*.24,t.z))-.0055;
  hd=max(hd,r-.002-q.x);
  return min(min(body,tea),hd); }
float mugT(vec3 q,float r,float h,float base){
  if(length(q.xz)<r-.005&&q.y>h*.6) return .3;                 /* the drink */
  if(abs(q.y-h*.82)<.004&&length(q.xz)>r-.001) return base*.6;  /* a painted band */
  return base; }

/* ---- bowl: radius R, height H; seams=1. paints mended gold seams ---- */
float bowl(vec3 q,float R,float H){
  float s=length(q-vec3(0.,R*1.02,0.))-R;
  float shell=abs(s)-.004;
  shell=max(shell,q.y-H);
  float foot=sdTorus(q-vec3(0.,.006,0.),R*.42,.006);
  return min(shell,max(foot,-q.y)); }
float bowlT(vec3 q,float R,float H,float base,float seams){
  float a=atan(q.z,q.x);
  if(seams>0.){
    float s1=abs(q.y-(H*.55+.018*sin(a*3.+1.)+.008*sin(a*7.)));
    float s2=abs(a-(.5+q.y*6.+.1*sin(q.y*90.))); float s3=abs(a-(-2.2+q.y*4.));
    if(s1<.0035||(s2<.07&&q.y<H*.55)||(s3<.06&&q.y>H*.55)) return .08; }
  if(q.y>H-.004) return base*1.05;
  return base; }

/* ---- small wooden chair (seat height sh), back on -z ---- */
float chair(vec3 q,float sh){
  float w=sh*.62, d=sh*.6;
  float seat=sdRBox(q-vec3(0.,sh,0.),vec3(w,.008,d),.004);
  vec2 lx=vec2(abs(q.x)-w+.012,abs(q.z)-d+.012);
  float legs=sdB2(lx,vec2(.0065))-.001; legs=max(legs,abs(q.y-sh*.5)-sh*.5);
  float posts=max(sdB2(vec2(abs(q.x)-w+.012,q.z+d-.012),vec2(.0065))-.001,abs(q.y-sh*1.45)-sh*.45);
  float rail1=sdRBox(q-vec3(0.,sh*1.82,-d+.012),vec3(w-.006,sh*.09,.006),.003);
  float rail2=sdRBox(q-vec3(0.,sh*1.45,-d+.012),vec3(w-.006,sh*.05,.005),.003);
  float str=sdRBox(q-vec3(0.,sh*.3,0.),vec3(w-.012,.004,.004),.002);   /* the stretcher */
  return min(min(min(seat,legs),min(posts,rail1)),min(rail2,str)); }
float chairT(vec3 q,float sh){ return .55+.12*grain(q*vec3(1.,1.,1.),28.); }

/* ---- ball (radius r) with painted bands ---- */
float ball(vec3 q,float r){ return length(q-vec3(0.,r,0.))-r; }
float ballT(vec3 q,float r){ vec3 v=normalize(q-vec3(0.,r,0.)); float a=abs(v.x*.8+v.y*.6);
  return a<.18?.35:abs(v.z)<.12?.5:.85; }

/* ---- apple (radius r), pear when pear=1. ---- */
float apple(vec3 q,float r,float pear){
  vec3 c=q-vec3(0.,r*.95,0.); float rr=length(c.xz);
  float d=length(vec2(rr,c.y*(1.1-.1*pear)))-r*(1.-.08*smoothstep(0.,r,c.y)*(1.-pear));
  if(pear>0.){ d=smin(d,length(c-vec3(0.,r*.95,0.))-r*.6,r*.4); }
  d+=.35*r*exp(-rr*rr/(r*r*.04))*smoothstep(0.,r,c.y)*(1.-pear);   /* the dip at the top */
  float top=pear>0.?r*1.55:r*.9;
  float stem=sdCapsule(q,vec3(0.,r*.95+top-.006,0.),vec3(.004,r*.95+top+r*.35,.002),.0022);
  return min(d*.8,stem); }
float appleT(vec3 q,float r){ return q.y>r*1.7?.3:.52+.06*(fbm(q.xz*90.+q.y*40.)-.5); }

/* ---- woven basket (radius R, height H) with a hoop handle over the top ---- */
float basket(vec3 q,float R,float H){
  float rr=length(q.xz); float rad=R*(.82+.18*q.y/H);
  float wall=max(abs(rr-rad)-.005,abs(q.y-H*.5)-H*.5);
  float bot=sdCylY(q-vec3(0.,.004,0.),R*.82,.004);
  float rim=sdTorus(q-vec3(0.,H,0.),R,.007);
  vec3 t=q-vec3(0.,H,0.); float hdl=length(vec2(length(t.xy)-R*.95,t.z))-.007; hdl=max(hdl,-t.y);
  return min(min(wall,bot),min(rim,hdl)); }
float basketT(vec3 q,float R,float H){ float a=atan(q.z,q.x)*R/.018; float b=q.y/.014;
  return (mod(floor(a)+floor(b),2.)<1.?.5:.7)-(fract(b)<.18?.15:0.); }

/* ---- flower pot (top radius r, height h) with soil ---- */
float pot(vec3 q,float r,float h){
  float rr=length(q.xz); float rad=r*(.72+.28*q.y/h);
  float wall=max(abs(rr-rad)-.005,abs(q.y-h*.5)-h*.5);
  float rim=sdRBox(vec3(rr-r-.002,q.y-h+.012,0.),vec3(.009,.013,1.),.004);
  float soil=sdCylY(q-vec3(0.,h-.02,0.),r-.006,.004);
  float bot=sdCylY(q-vec3(0.,.004,0.),r*.72,.004);
  return min(min(wall,rim),min(soil,bot)); }
float potT(vec3 q,float r,float h){ if(length(q.xz)<r-.004&&q.y<h-.012) return .28; return .62; }
/* a young plant: stem of height sh and n pairs of leaves (leaf length ll) */
float sprout(vec3 q,float sh,float ll,float n){
  float bend=.015*sin(q.y/sh*2.);
  float d=sdCapsule(q-vec3(bend,0.,0.),vec3(0.),vec3(0.,sh,0.),.003);
  for(int i=0;i<4;i++){ if(float(i)>=n) break;
    float y=sh*(1.-float(i)*.28); float a=float(i)*1.7;
    for(int s=-1;s<=1;s+=2){
      vec3 t=q-vec3(bend,y,0.); t.xz=rot(a)*t.xz; t.x*=float(s);
      t-=vec3(ll*.55,ll*.18,0.); t.xy=rot(-.45)*t.xy;
      float lf=sdEll(t,vec3(ll*.55,.0025,ll*.26)); d=min(d,lf); } }
  return d; }

/* ---- watering can (body radius r, height h), spout toward +x ---- */
float wcan(vec3 q,float r,float h){
  float body=sdCylY(q-vec3(0.,h*.5,0.),r,h*.5)-.003;
  body=max(body,-sdCylY(q-vec3(0.,h+.001,0.),r-.006,.004));
  float sp=sdCapsule(q,vec3(r*.6,h*.2,0.),vec3(r*2.3,h*1.05,0.),.0075);
  float rose=sdCone((q-vec3(r*2.35,h*1.1,0.))*mat3(1.),.009,.018,.012);
  vec3 t=q-vec3(-r*.1,h,0.); float hdl=length(vec2(length(t.xy)-r*.85,t.z))-.006; hdl=max(hdl,-t.y+.004);
  hdl=max(hdl,t.x-r*.2);
  vec3 t2=q-vec3(-r,h*.55,0.); float hdl2=length(vec2(length(t2.xy)-h*.28,t2.z))-.006; hdl2=max(hdl2,t2.x+.004);
  return min(min(body,sp),min(min(rose,hdl),hdl2)); }
float wcanT(vec3 q,float r,float h){ if(abs(q.y-h*.15)<.004||abs(q.y-h*.85)<.004) return .4; return .66; }

/* ---- a closed hardcover book lying flat: h = half sizes, spine at -x ---- */
vec2 bookC(vec3 q,vec3 h){
  float t=.0035;
  float top=sdRBox(q-vec3(0.,h.y-t*.5,0.),vec3(h.x,t*.5,h.z),.0012);
  float bot=sdRBox(q-vec3(0.,-h.y+t*.5,0.),vec3(h.x,t*.5,h.z),.0012);
  float sp=max(length(vec2((q.x+h.x-h.y*.55)*1.25,q.y))-h.y,max(abs(q.z)-h.z,q.x+h.x-h.y*.5));
  float pg=sdBox(q-vec3(.002,0.,0.),vec3(h.x-.006,h.y-t,h.z-.004));
  return vec2(min(min(top,bot),sp),pg); }
float bookCT(vec3 q,vec3 h,float cv){
  if(abs(q.y)<h.y-.0035&&q.x>-h.x+.004) return fract(q.y/.0026)<.3?.72:.93;
  if(q.x<-h.x+.012&&abs(abs(q.z)-h.z*.7)<.003) return cv*.55;
  if(abs(q.y)>h.y-.004&&abs(max(abs(q.x)/h.x,abs(q.z)/h.z)-.86)<.012) return cv*.7;
  return cv; }
/* an open journal: w = page width, dd = half depth, spine along z */
vec2 bookO(vec3 q,float w,float dd){
  float x=abs(q.x);
  float lift=.022*sin(clamp(x/(2.*w),0.,1.)*1.9)-.014*exp(-x*55.)+.008;
  float pages=sdBox(vec3(x-w,q.y-lift*.5,q.z),vec3(w-.002,max(lift*.5,.003),dd-.007))-.0015;
  float cover=sdRBox(vec3(x-w-.004,q.y+.001,q.z),vec3(w+.007,.0035,dd),.0015);
  return vec2(pages,cover); }
float lines2(vec2 u,vec2 hb,float gap,float seed){   /* hint lines, never words */
  if(abs(u.x)>hb.x||abs(u.y)>hb.y) return 0.;
  float row=floor(u.y/gap); float f=fract(u.y/gap);
  float end=hb.x-hb.x*.6*h1(vec2(row,seed))*step(.55,h1(vec2(row+3.,seed)));
  return (f<.2&&u.x<end)?1.:0.; }
float pageT(vec3 q,float w,float dd,float seed){
  float x=abs(q.x); vec2 u=vec2(x-w,q.z);
  if(x<.004) return .7;
  if(q.x>0.&&seed>50.){ /* a small drawn heart on the right page (a feelings journal) */
    vec2 v=(u-vec2(0.,.035))/.03; v.y-=sqrt(abs(v.x))*.5; float hh=length(v)-.6;
    if(abs(hh)<.09) return .25; if(u.y<.0) return lines2(u+vec2(0.,.03),vec2(w-.022,dd*.4),.012,seed)>0.?.6:.95; return .95; }
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

/* ---- pocket compass lying flat (radius R) with a hinge ring toward -z ---- */
float compass(vec3 q,float R){
  float cs=sdCylY(q-vec3(0.,.008,0.),R,.008)-.002;
  float bez=sdTorus(q-vec3(0.,.016,0.),R-.002,.003);
  float nd=sdRBox(q-vec3(0.,.0165,0.),vec3(.0025,.0012,R*.75),.001);
  float ring=sdTorus((q-vec3(0.,.008,-R-.012)).xzy,.011,.0028);
  float knob=sdCylZ(q-vec3(0.,.008,-R-.002),.0055,.005);
  return min(min(cs,bez),min(nd,min(ring,knob))); }
float compassT(vec3 q,float R){ float rr=length(q.xz); float a=atan(q.x,q.z);
  if(q.y>.015&&rr<R-.004){
    if(abs(q.x)<.0028&&abs(q.z)<R*.75) return q.z>0.?.12:.7;      /* needle: dark north half */
    if(rr>R*.78&&abs(fract(a/(PI/8.)+.5)-.5)<.07) return .25;      /* tick marks */
    if(abs(rr-R*.72)<.0012) return .4;
    return .92; }
  return .5; }
/* a map sheet, unrolled, with curled ends at +-x (half sizes hx, hz) */
float mapS(vec3 q,float hx,float hz){
  float sh=sdBox(q-vec3(0.,.0012,0.),vec3(hx,.0008,hz));
  float r1=max(length(q.xy-vec2(hx,.009))-.009,abs(q.z)-hz); r1=max(r1,-(length(q.xy-vec2(hx,.009))-.0075));
  float r2=max(length(q.xy-vec2(-hx,.011))-.011,abs(q.z)-hz); r2=max(r2,-(length(q.xy-vec2(-hx,.011))-.0095));
  return min(sh,min(r1,r2)); }
float mapT(vec3 q){ float c=fbm(q.xz*14.); float l=fract(c*7.);
  if(l<.08) return .5;                                              /* contour lines */
  if(abs(q.z-.03*sin(q.x*30.))<.0016) return .35;                   /* a path */
  return .9; }

/* ---- candle lantern (half width w, height h) ---- */
float lantern(vec3 q,float w,float h){
  float base=sdRBox(q-vec3(0.,.01,0.),vec3(w,.01,w),.003);
  float top=sdRBox(q-vec3(0.,h-.012,0.),vec3(w,.008,w),.003);
  float roof=max(sdRBox(q-vec3(0.,h+.012,0.),vec3(w*.9,.02,w*.9),.002),dot(vec2(max(abs(q.x),abs(q.z)),q.y-h),normalize(vec2(1.,1.2)))-w*.55);
  vec2 c=vec2(abs(q.x)-w+.004,abs(q.z)-w+.004);
  float posts=max(sdB2(c,vec2(.004)),abs(q.y-h*.5)-h*.5);
  float candle=sdCylY(q-vec3(0.,.02+h*.15,0.),w*.3,h*.15)-.001;
  float flame=sdEll(q-vec3(0.,.02+h*.3+.014,0.),vec3(.005,.013,.005));
  vec3 t=q-vec3(0.,h+.045,0.); float ring=length(vec2(length(t.xy)-.018,t.z))-.003; ring=max(ring,-t.y);
  return min(min(min(base,top),min(roof,posts)),min(candle,min(flame,ring))); }
float lanternT(vec3 q,float w,float h){
  if(length(q.xz)<w*.3+.002&&q.y>.02&&q.y<h-.025) return q.y>.02+h*.3?.97:.86;   /* candle and flame stay pale */
  return .32; }

/* ---- sand timer (radius r, height h) ---- */
float timer(vec3 q,float r,float h){
  float cap1=sdCylY(q-vec3(0.,.007,0.),r,.007)-.002, cap2=sdCylY(q-vec3(0.,h-.007,0.),r,.007)-.002;
  float y=(q.y-h*.5)/(h*.5-.014); float prof=r*(.18+.62*pow(abs(y),.8));
  float gl=max(abs(length(q.xz)-prof*.95)-.0015,abs(q.y-h*.5)-h*.5+.014);
  float sand1=max(length(q.xz)-prof*.9,max(q.y-(h*.5-.014)*.35-.014,.014-q.y));          /* sand below */
  float sand2=max(length(q.xz)-prof*.9,max(q.y-h+.014,h*.5+(h*.5-.014)*.55-q.y));      /* a little left above */
  float posts=1e3; for(int i=0;i<3;i++){ vec2 o=rot(float(i)*2.094+.4)*vec2(r-.006,0.);
    posts=min(posts,max(length(q.xz-o)-.0045,abs(q.y-h*.5)-h*.5)); }
  return min(min(min(cap1,cap2),min(gl,posts)),min(sand1,sand2)); }
float timerT(vec3 q,float r,float h){
  if(q.y<.016||q.y>h-.016) return .45;
  float y=(q.y-h*.5)/(h*.5-.014); float prof=r*(.18+.62*pow(abs(y),.8));
  if(length(q.xz)<prof*.92) return .5;
  if(length(q.xz)<prof+.003) return .93;
  return .35; }

/* ---- paper boat (length L) along x ---- */
float boat(vec3 q,float L){
  float h=L*.34;
  float hull=max(max(abs(q.z)-(L*.12+q.y*.55),abs(q.x)-(L*.5-(h-q.y)*1.1)),max(-q.y,q.y-h));
  hull=max(hull,-max(max(abs(q.z)-(L*.12+q.y*.55)+.0025,abs(q.x)-(L*.5-(h-q.y)*1.1)+.0025),-q.y+.003));
  float sail=max(max(abs(q.z)-.0012,q.y-(h+L*.42-abs(q.x)*1.7)),max(h*.4-q.y,abs(q.x)-L*.3));
  return min(hull,sail)-.0006; }
float boatT(vec3 q,float L){ if(abs(q.z)<.0014&&q.y>L*.34*.4) return abs(q.x)<.002?.6:.9; return .88; }

/* ---- round standing mirror (radius R) facing -z, on a little foot ---- */
float mirror(vec3 q,float R){
  vec3 c=q-vec3(0.,R+.05,0.);
  float frame=length(vec2(length(c.xy)-R,c.z))-.009;
  float glass=max(length(c.xy)-R+.004,abs(c.z)-.003);
  float stem=sdCylY(q-vec3(0.,.03,0.),.008,.03);
  float foot=sdCylY(q-vec3(0.,.006,0.),R*.5,.006)-.002;
  float yoke=max(length(vec2(length(c.xy)-R-.014,c.z))-.004,c.y+.0);
  return min(min(frame,glass),min(min(stem,foot),yoke)); }
float mirrorT(vec3 q,float R){ vec3 c=q-vec3(0.,R+.05,0.);
  if(length(c.xy)<R-.006&&c.z<0.){ float s=c.x+c.y; return (abs(s-R*.3)<.006||abs(s-R*.45)<.003)?.98:.84; }
  return .45; }

/* ---- teapot (radius r), spout to +x ---- */
float teapot(vec3 q,float r){
  float body=sdEll(q-vec3(0.,r*.85,0.),vec3(r,r*.82,r));
  float foot=sdCylY(q-vec3(0.,.005,0.),r*.6,.005);
  float lid=sdEll(q-vec3(0.,r*1.62,0.),vec3(r*.5,r*.14,r*.5));
  float knob=length(q-vec3(0.,r*1.8,0.))-r*.13;
  float sp=sdCapsule(q,vec3(r*.8,r*.7,0.),vec3(r*1.5,r*1.35,0.),r*.1);
  vec3 t=q-vec3(-r*1.02,r*.95,0.); float hd=length(vec2(length(t.xy)-r*.38,t.z))-r*.07; hd=max(hd,t.x+r*.1);
  return min(min(min(body,foot),min(lid,knob)),min(sp,hd)); }
float teapotT(vec3 q,float r){ if(abs(q.y-r*1.45)<.003) return .35; return .6; }

/* ---- garden trowel lying flat along x (blade at +x) ---- */
float trowel(vec3 q){
  vec3 b=q-vec3(.07,.006,0.); float w=.035*(1.-clamp(b.x/.08,0.,1.)*.7)*smoothstep(-.06,-.04,b.x);
  float blade=max(max(abs(b.z)-w,abs(b.x)-.06),abs(b.y+b.z*b.z*4.)-.002);
  float neck=sdCapsule(q,vec3(-.005,.01,0.),vec3(.015,.006,0.),.004);
  float hd=sdCapsule(q,vec3(-.11,.013,0.),vec3(-.015,.012,0.),.012);
  return min(min(blade,neck),hd); }
float trowelT(vec3 q){ if(q.x<-.012) return .45+.1*grain(q,40.); return .7; }

/* ---- desk lamp: base at origin, shade over +x ---- */
float lampD(vec3 q,float s){
  float base=sdCylY(q-vec3(0.,.008*s,0.),.05*s,.008*s)-.002;
  vec3 a=vec3(0.,.016*s,0.), b=vec3(-.02*s,.17*s,0.), c=vec3(.11*s,.25*s,0.);
  float arms=min(sdCapsule(q,a,b,.005*s),sdCapsule(q,b,c,.005*s));
  float j=length(q-b)-.009*s;
  vec3 t=q-c; t.xy=rot(.7)*t.xy;
  float shade=max(abs(sdCone(t-vec3(0.,-.03*s,0.),.055*s,.02*s,.035*s))-.002,-t.y-.064*s);
  float bulb=length(q-c-vec3(.02*s,-.04*s,0.))-.016*s;
  return min(min(base,arms),min(min(j,shade),bulb)); }
float lampT(vec3 q){ return .42; }

/* ---- old key lying flat along x (bow at -x) ---- */
float key(vec3 q,float L){
  float bow=sdTorus(q-vec3(-L*.5,.005,0.),L*.13,.005);
  float sh=sdCylX(q-vec3(.02,.005,0.),.0045,L*.42);
  float bit=sdRBox(q-vec3(L*.4,.005,.012),vec3(.012,.004,.012),.001);
  bit=max(bit,-sdBox(q-vec3(L*.4,.005,.02),vec3(.003,.01,.006)));
  return min(min(bow,sh),bit); }

/* ---- small wooden crate (half sizes h) with slats, open top ---- */
float crate(vec3 q,vec3 h){
  float o=sdRBox(q-vec3(0.,h.y,0.),h,.003);
  float i=sdBox(q-vec3(0.,h.y+.008,0.),h-vec3(.008,0.,.008));
  float c=max(o,-i);
  float g=abs(q.y-h.y)-.003;                                   /* one gap between two slats */
  return max(c,-max(g,-(max(abs(q.x),abs(q.z))-min(h.x,h.z)+.02))); }
float crateT(vec3 q,vec3 h){ return .6+.1*grain(q.zyx,35.)-(abs(fract(q.y/(h.y*.5))-.5)>.46?.2:0.); }

/* ---- paintbrush lying along x (bristles at +x) ---- */
float brush(vec3 q,float L){
  float hd=sdCapsule(q,vec3(-L*.5,.006,0.),vec3(L*.25,.0065,0.),.0045);
  float fer=sdCylX(q-vec3(L*.3,.0065,0.),.0055,L*.06);
  vec3 b=q-vec3(L*.42,.0065,0.); float t=clamp(b.x/(L*.12),0.,1.);
  float br=max(length(b.yz*vec2(1.3,1.))-.0055*(1.-t*t*.8),abs(b.x-L*.06)-L*.06);
  return min(min(hd,fer),br); }
float brushT(vec3 q,float L){ if(q.x>L*.36) return .22; if(q.x>L*.24) return .75; return .4; }

/* ---- small lidded jar (radius r, height h) ---- */
float jar(vec3 q,float r,float h){
  float b=sdCylY(q-vec3(0.,h*.5,0.),r,h*.5)-.004;
  float lid=sdCylY(q-vec3(0.,h+.006,0.),r*.9,.007)-.002;
  return min(b,lid); }

/* ---- folded blanket (half sizes h) ---- */
float blanket(vec3 q,vec3 h){
  float d=1e3; for(int i=0;i<3;i++){ float y=h.y*(.33+float(i)*.66);
    d=min(d,sdRBox(q-vec3(float(i)*.004,y,0.),vec3(h.x,h.y*.3,h.z),h.y*.28)); }
  return d; }
float blanketT(vec3 q){ return (fract(q.x/.03)<.15||fract(q.z/.03)<.15)?.4:.66; }

/* ---- small picture frame standing, facing -z, easel leg behind ---- */
float pframe(vec3 q,vec2 hs){
  vec3 t=q; t.yz=rot(-.18)*t.yz; t-=vec3(0.,hs.y+.004,0.);
  float f=sdRBox(t,vec3(hs,.008),.003);
  f=max(f,-sdBox(t-vec3(0.,0.,-.007),vec3(hs-.018,.006)));
  float leg=sdCapsule(q,vec3(0.,hs.y*1.2,.01),vec3(0.,.002,hs.y*.9),.004);
  return min(f,leg); }
float pframeT(vec3 q,vec2 hs){ vec3 t=q; t.yz=rot(-.18)*t.yz; t-=vec3(0.,hs.y+.004,0.);
  if(abs(t.x)<hs.x-.018&&abs(t.y)<hs.y-.018){   /* a simple drawn hill and sun */
    float hill=t.y+hs.y*.35-.03*cos(t.x/hs.x*2.);
    if(abs(hill)<.0022) return .3; if(length(t.xy-vec2(hs.x*.4,hs.y*.35))-.012<0.) return .55; return .92; }
  return .38; }

/* ---- smooth stones stacked (base radius r) ---- */
float stones(vec3 q,float r){
  float a=sdEll(q-vec3(0.,r*.45,0.),vec3(r,r*.45,r*.8));
  float b=sdEll(q-vec3(.004,r*1.22,.0),vec3(r*.72,r*.34,r*.6));
  float c=sdEll(q-vec3(-.003,r*1.8,0.),vec3(r*.48,r*.26,r*.4));
  return min(a,min(b,c)); }
