/* AOG render kit — secparts_a.glsl: objects for the Secret Societies (sec) pencil still lifes, units 1-9.
   Objects only: signs, codes, tools, lamps, books. No people, no faces, no emblems, no readable text
   (hint-lines, ticks and the kit's A/B/C, 1/2/3 glyphs only). Include after sptmar.glsl (slab, eD, gdig).
   Every object rests on y=0 in its own frame, front toward -z, sizes in metres.
   o_<name>(q,k) is the distance, t_<name>(q,k) the grey tone (0 dark .. 1 paper). */
vec3 tX(vec3 p,float a){ float c=cos(a),s=sin(a); return vec3(p.x,c*p.y+s*p.z,-s*p.y+c*p.z); }  /* up axis leaned back by a */
vec3 tZ(vec3 p,float a){ float c=cos(a),s=sin(a); return vec3(c*p.x+s*p.y,-s*p.x+c*p.y,p.z); }  /* x axis raised by a */
float hbar(vec2 u,float y,float x0,float x1,float h){ return (u.x>x0&&u.x<x1&&abs(u.y-y)<h)?1.:0.; }

/* ---------- u1: club sign board on feet, tin box, skeleton key ---------- */
vec3 signQ(vec3 q){ vec3 b=tX(q-vec3(0.,.012,.0),.12); b.y-=.108; return b; }
float o_sign(vec3 q,float k){
  float ft=sdRBox(vec3(abs(q.x)-.12,q.y-.021,q.z-.01),vec3(.022,.021,.052),.005);
  vec3 b=signQ(q);
  float bd=sdRBox(b,vec3(.178,.105,.009),.004)+.0004*(vn(vec2(b.x*20.,b.y*400.))-.5);
  vec3 nq=vec3(abs(b.x)-.158,abs(b.y)-.086,b.z+.0095); float nl=sdCylZ(nq,.0045,.0015)-.0008;
  return min(min(ft,bd),nl); }
float t_sign(vec3 q,float k){ vec3 b=signQ(q);
  if(q.y<.043&&abs(b.x)>.096&&b.y<-.08&&b.z>-.0078) return .5+.1*grain(q.zyx,50.);
  if(b.z<-.0075){ vec2 u=b.xy;
    if(length(vec2(abs(u.x)-.158,abs(u.y)-.086))<.0055) return .25;
    if(abs(max(abs(u.x)-.145,abs(u.y)-.074))<.0028) return .32;
    float wob=.0025*sin(u.x*70.+1.3);
    float lt=fract(u.x/.017);
    if(abs(u.y-.042-wob)<.0065&&(u.x>-.118&&u.x<-.028||u.x>-.012&&u.x<.05||u.x>.066&&u.x<.118)) return .24;
    float r1=abs(u.y+.002-wob*.6)<.0036?1.:0., r2=abs(u.y+.04-wob*.6)<.0036?1.:0.;
    if(r1>.5&&(u.x>-.118&&u.x<-.06||u.x>-.048&&u.x<.02||u.x>.034&&u.x<.1)) return .34;
    if(r2>.5&&(u.x>-.118&&u.x<-.035||u.x>-.022&&u.x<.07)) return .34;
    return .74+.1*grain(vec3(b.y,b.z,b.x)*vec3(1.,1.,1.),40.)-.05; }
  return .58+.1*grain(q.zyx,40.); }
float o_tin(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.03,0.),vec3(.075,.03,.05),.008);
  float l=sdRBox(q-vec3(0.,.067,0.),vec3(.078,.011,.053),.009);
  float hi=sdCylX(q-vec3(0.,.058,.055),.004,.062);
  float hs=sdRBox(q-vec3(0.,.056,-.054),vec3(.013,.017,.0025),.002);
  return min(min(b,l),min(hi,hs)); }
float t_tin(vec3 q,float k){
  if(q.z<-.0515&&abs(q.x)<.014&&q.y>.038){ if(length(q.xy-vec2(0.,.058))<.0034||abs(q.x)<.0013&&q.y>.047&&q.y<.058) return .08; return .38; }
  if(abs(q.y-.0565)<.0018) return .2;
  if(q.y>.076){ float e=abs(max(abs(q.x)-.058,abs(q.z)-.034)); if(e<.0024) return .34; if(e<.006) return .7; return .6+.05*vn(q.xz*300.); }
  return .52+.06*vn(q.xy*400.+q.z*300.); }
float o_skey(vec3 q,float k){ float bw=sdTorus(q-vec3(-.042,.004,0.),.014,.0036);
  float sh=sdCapsule(q,vec3(-.028,.0036,0.),vec3(.052,.0036,0.),.0032);
  float co=sdCylX(q-vec3(-.02,.0045,0.),.0048,.0035)-.0005;
  float bt=sdBox(q-vec3(.043,.0036,.0095),vec3(.008,.0028,.0095)); bt=max(bt,-sdBox(q-vec3(.043,.0036,.015),vec3(.0024,.01,.0045)));
  return min(min(bw,sh),min(co,bt)); }
float t_skey(vec3 q,float k){ return .42+.08*vn(q.xz*500.); }

/* ---------- u2: slate with a code grid, chalk, a wax seal on a folded note ---------- */
vec3 slateQ(vec3 q){ vec3 b=tX(q-vec3(0.,.004,0.),.3); b.y-=.1; return b; }
float o_slate(vec3 q,float k){ vec3 b=slateQ(q);
  float fr=sdRBox(b,vec3(.14,.1,.008),.004); fr=max(fr,-sdBox(b-vec3(0.,0.,-.008),vec3(.121,.081,.0055)));
  float pl=sdBox(b-vec3(0.,0.,.0),vec3(.123,.083,.0042));
  float st=sdCapsule(q,vec3(0.,.15,.058),vec3(0.,.006,.16),.006);
  return min(min(fr,pl),st); }
float t_slate(vec3 q,float k){ vec3 b=slateQ(q); vec2 u=b.xy;
  if(b.z<-.003&&abs(u.x)<.122&&abs(u.y)<.082){
    float L=1e3; vec2 c1=vec2(-.052,.0), v=u-c1;
    if(abs(v.y)<.05) L=min(L,abs(abs(v.x)-.017)); if(abs(v.x)<.05) L=min(L,abs(abs(v.y)-.017));
    vec2 w=u-vec2(.062,0.); if(max(abs(w.x),abs(w.y))<.044) L=min(L,abs(abs(w.x)-abs(w.y))*.7071);
    float dt=min(min(length(v-vec2(-.034,.034)),length(v-vec2(.034,0.))),min(length(v-vec2(0.,-.034)),length(w-vec2(0.,.024))));
    dt=min(dt,length(w-vec2(.024,0.)));
    if(dt<.0045||L<.0023) return .93;
    float sm=fbm(u*38.+2.); if(sm>.7) return .34;
    return .27+.06*fbm(u*90.); }
  if(abs(b.x)<.13&&abs(b.y)<.09&&b.z>.0) return .6;
  if(q.z>.07&&abs(b.x)<.01) return .55;
  return .72+.12*grain(vec3(b.x,b.z,b.y)*vec3(1.,1.,1.)+b.yxz*step(.12,abs(b.x)),40.)-.06; }
float o_sealnote(vec3 q,float k){ float p=slab(q,vec2(.078,.052),.0009,.002);
  float fl=slab(q-vec3(0.,.0018,-.012),vec2(.074,.034),.0007,.002);
  vec3 s=q-vec3(.005,.0028,-.006); float a=atan(s.z,s.x);
  float w=sdCylY(s-vec3(0.,.003,0.),.019+.0018*vn(vec2(a*2.5,1.3)),.0028)-.0014;
  w=max(w,-sdTorus(s-vec3(0.,.0072,0.),.0125,.0012));
  return min(min(p,fl),w); }
float t_sealnote(vec3 q,float k){ vec3 s=q-vec3(.005,.0028,-.006); float r=length(s.xz);
  if(r<.023&&q.y>.003){ if(abs(r-.0125)<.0016) return .15; if(r<.003) return .15;
    float a=atan(s.z,s.x); if(r<.009&&r>.005&&fract(a*4./3.14159)<.25) return .2; return .3+.05*vn(s.xz*800.); }
  if(abs(q.z+.046)<.0009||abs(q.z-.022)<.0009) return .62;
  return .93-.04*vn(q.xz*120.); }

/* ---------- u3: dressed stone, mason's square, round mallet, chisel ---------- */
float o_stone(vec3 q,float k){ return sdRBox(q-vec3(0.,.07,0.),vec3(.13,.07,.085),.007)+.0014*(fbm3(q*70.)-.5); }
float t_stone(vec3 q,float k){ vec3 c=q-vec3(0.,.07,0.); vec3 h=vec3(.13,.07,.085); vec3 a=abs(c)/h;
  vec2 uv; vec2 hb;
  if(a.y>a.x&&a.y>a.z){ uv=c.xz; hb=h.xz; } else if(a.x>a.z){ uv=c.zy; hb=h.zy; } else { uv=c.xy; hb=h.xy; }
  float m=min(hb.x-abs(uv.x),hb.y-abs(uv.y));
  if(a.z>a.x&&a.z>a.y&&c.z<0.){ vec2 v=uv-vec2(.07,-.01);
    float mk=min(min(sdSeg2(v,vec2(-.02,-.018),vec2(.02,-.018)),sdSeg2(v,vec2(.02,-.018),vec2(0.,.02))),sdSeg2(v,vec2(0.,.02),vec2(-.02,-.018)));
    mk=min(mk,sdSeg2(v,vec2(0.,.02),vec2(0.,.034)));
    if(mk<.0022) return .25; }
  float sp=.06*(fbm3(q*160.)-.5);
  if(m<.013) return .8+sp;
  return (fract((uv.x*.8+uv.y)/.0055)<.28?.58:.72)+sp; }
float o_msq(vec3 q,float k){ if(k>.5) q=tX(q-vec3(0.,.012,0.),-1.47); float a=sdRBox(q-vec3(0.,.0016,0.),vec3(.105,.0016,.011),.0006);
  float b=sdRBox(q-vec3(-.094,.0016,.068),vec3(.011,.0016,.075),.0006); return min(a,b); }
float t_msq(vec3 q,float k){ if(k>.5) q=tX(q-vec3(0.,.012,0.),-1.47); if(q.z<-.005&&q.x>-.08&&fract(q.x/.01)<.14) return .2;
  if(q.x<-.1&&q.z>.0&&fract(q.z/.01)<.14) return .2; return .52+.05*vn(q.xz*300.); }
float o_mallet(vec3 q,float k){ vec3 h=q-vec3(0.,.044,0.); float x=clamp(h.x,-.05,.05)/.05;
  float r=.041-.004*x*x-.004*max(x,0.);
  vec2 w=vec2(length(h.yz)-r,abs(h.x)-.05); float hd=min(max(w.x,w.y),0.)+length(max(w,0.))-.003;
  float hn=sdCapsule(q,vec3(.05,.044,0.),vec3(.23,.013,0.),.011);
  float en=length(q-vec3(.235,.013,0.))-.0125;
  return min(min(hd,hn),en); }
float t_mallet(vec3 q,float k){ vec3 h=q-vec3(0.,.044,0.);
  if(abs(h.x)>.051&&length(h.yz)<.04) return fract(length(h.yz)/.006)<.28?.4:.6;
  if(abs(h.x)<.054) return .5+.14*grain(vec3(h.x,h.y,h.z).zyx,30.);
  return .7+.08*grain(q,40.); }
float o_chisel(vec3 q,float k){ vec3 c=q-vec3(0.,.009,0.);
  vec2 a=abs(c.yz); float oc=max(max(a.x,a.y),(a.x+a.y)*.7071)-.008;
  float bd=max(oc,abs(c.x+.01)-.075);
  float hd=sdCylX(c-vec3(-.09,0.,0.),.0098,.007)-.0012;
  float t=clamp((c.x-.065)/.035,0.,1.);
  float bl=max(max(abs(c.y)-.008*(1.-.85*t),abs(c.z)-.0115),abs(c.x-.082)-.018);
  return min(min(bd,hd),bl); }
float t_chisel(vec3 q,float k){ if(q.x<-.082) return .28; if(q.x>.09) return .75; if(q.x>.065) return .55; return .4+.05*vn(q.xz*600.); }

/* ---------- u4: clay oil lamp, sheaf of wheat, small clay jar ---------- */
float o_lamp(vec3 q,float k){ float b=eD(q-vec3(0.,.026,0.),vec3(.055,.024,.05));
  float nz=sdCapsule(q,vec3(.03,.024,0.),vec3(.088,.027,0.),.016);
  float bo=smin(b,nz,.012);
  bo=max(bo,-sdCylY(q-vec3(0.,.053,0.),.027,.0055));
  bo=max(bo,-sdCylY(q-vec3(.085,.04,0.),.0055,.02));
  bo=max(bo,-sdCylY(q-vec3(0.,.04,0.),.0045,.02));
  float rim=sdTorus(q-vec3(0.,.0475,0.),.0305,.0035);
  vec3 h=q-vec3(-.058,.034,0.); float hd=length(vec2(length(h.xy)-.016,h.z))-.0048; hd=max(hd,h.x-.004);
  float ft=sdCylY(q-vec3(0.,.003,0.),.028,.003);
  return min(min(bo,rim),min(hd,ft)); }
float t_lamp(vec3 q,float k){ float r=length(q.xz);
  if(length(q.xz-vec2(.085,0.))<.007&&q.y>.03) return .08;
  if(r<.0055&&q.y>.03) return .12;
  if(r<.028&&q.y>.041){ if(abs(r-.019)<.0016) return .33; float a=atan(q.z,q.x); if(r>.008&&r<.017&&fract(a*8./3.14159)<.14) return .4; return .6; }
  if(q.x>.07&&q.y>.03) return .38;
  return .55+.07*vn(q.xz*300.+q.y*200.); }
vec4 wheatEar(vec3 q){ float best=1e3; vec3 be=vec3(0.);
  for(int i=0;i<7;i++){ float a=(float(i)-3.)*.24; vec2 dir=vec2(cos(a),sin(a));
    vec3 c=vec3(.05,.014+.01*abs(sin(float(i)*1.9)),0.)+vec3(dir.x,0.,dir.y)*.062;
    vec3 e=q-c; e.xz=rot(a)*e.xz; float d=eD(e,vec3(.036,.0095,.0095));
    if(d<best){ best=d; be=e; } }
  return vec4(best,be); }
float o_wheat(vec3 q,float k){ vec3 s=q-vec3(-.05,.012,0.); float r=.0105+.004*smoothstep(-.02,.1,s.x);
  float bu=max(length(s.yz)-r,abs(s.x)-.1)-.0012;
  float ti=sdCylX(q-vec3(-.03,.012,0.),.0135,.006);
  float st=1e3; for(int i=0;i<7;i++){ float a=(float(i)-3.)*.24; vec2 dir=vec2(cos(a),sin(a));
    vec3 c=vec3(.05,.014+.01*abs(sin(float(i)*1.9)),0.)+vec3(dir.x,0.,dir.y)*.062;
    st=min(st,sdCapsule(q,vec3(.046,.012,0.)+vec3(dir.x,0.,dir.y)*.003,c-vec3(dir.x,0.,dir.y)*.032,.0022)); }
  return min(min(bu,ti),min(st,wheatEar(q).x)); }
float t_wheat(vec3 q,float k){ vec4 e=wheatEar(q);
  if(e.x<.002){ vec3 v=e.yzw; if(fract(v.x/.0068+step(0.,v.z)*.5)<.38) return .42; return .7; }
  if(abs(q.x+.03)<.0063) return .3;
  vec3 s=q-vec3(-.05,.012,0.);
  if(s.x<-.098) return fract(length(s.yz)/.004)<.4?.4:.62;
  if(q.x>.05) return .62;
  return fract(atan(s.z,s.y)*9./3.14159)<.3?.52:.76; }
float o_jar(vec3 q,float k){ float b=eD(q-vec3(0.,.088,0.),vec3(.074,.076,.074));
  float ft=sdCylY(q-vec3(0.,.008,0.),.036,.008)-.002; b=smin(b,ft,.012);
  float nk=sdCylY(q-vec3(0.,.172,0.),.02,.022); b=smin(b,nk,.014);
  float lp=sdTorus(q-vec3(0.,.193,0.),.024,.0052); b=min(b,lp);
  b=max(b,-sdCylY(q-vec3(0.,.2,0.),.0145,.02));
  vec3 h=vec3(abs(q.x)-.034,q.y-.152,q.z); float hd=length(vec2(length(h.xy)-.017,h.z))-.0048; hd=max(hd,-h.x-.002);
  return min(b,hd); }
float t_jar(vec3 q,float k){ if(length(q.xz)<.015&&q.y>.185) return .1;
  float a=atan(q.z,q.x);
  if(abs(q.y-.128)<.0035) return .24; if(abs(q.y-.117)<.0016) return .32;
  if(abs(q.y-.056-.007*sin(a*10.))<.0022) return .26;
  if(abs(q.y-.036)<.0018) return .32;
  if(q.y>.06&&q.y<.11&&abs(fract(a*6./3.14159)-.5)<.03) return .4;
  return .5+.07*vn(vec2(a*20.,q.y*300.)); }

/* ---------- u5: folded plain mantle, sheathed sword, sealed parchment roll ---------- */
float o_mantle(vec3 q,float k){ float d=sdRBox(q-vec3(0.,.024,0.),vec3(.13,.024,.1),.018);
  float f1=exp(-pow((q.x-.05+.12*q.z)/.016,2.)), f2=exp(-pow((q.x+.075-.08*q.z)/.02,2.));
  d-=(.0035*f1+.0025*f2)*smoothstep(.025,.046,q.y);
  float tl=sdRBox(q-vec3(.165,.0035,.01),vec3(.055,.0035,.075),.003); tl+=.0012*sin(q.z*70.);
  return smin(d,tl,.02); }
float t_mantle(vec3 q,float k){ if(q.z<-.09&&q.x<.125&&q.y>.004&&fract(q.y/.0125)<.12) return .76;
  if(q.x>.13&&fract(q.z/.03)<.08) return .8;
  return .92-.03*vn(q.xz*200.); }
vec3 swQ(vec3 q){ return tZ(q-vec3(0.,.057,0.),-.09); }
float o_sword(vec3 q,float k){ vec3 s=swQ(q);
  float gr=sdCapsule(s,vec3(-.1,0.,0.),vec3(-.012,0.,0.),.0105);
  float pm=sdCylY(s-vec3(-.118,0.,0.),.019,.0065)-.0022;
  float gd=sdRBox(s,vec3(.0075,.0085,.078),.004);
  vec3 c=s-vec3(.258,0.,0.); float w=mix(.021,.014,clamp((s.x-.01)/.49,0.,1.));
  float sc=max((length(vec2(c.z,c.y*w/.0095))-w)*.55,abs(c.x)-.248)-.0006;
  float lk=max(sc-.0015,abs(s.x-.032)-.014); float ch=max(sc-.0015,abs(s.x-.49)-.018);
  return min(min(min(gr,pm),gd),min(sc,min(lk,ch))); }
float t_sword(vec3 q,float k){ vec3 s=swQ(q);
  if(s.x<-.108) return abs(length(s.xz-vec2(-.118,0.))-.009)<.0018?.3:.55;
  if(s.x<-.01) return fract(s.x/.0065+atan(s.z,s.y)/6.2832)<.5?.26:.46;
  if(s.x<.009) return .48;
  if(abs(s.x-.032)<.014||abs(s.x-.49)<.018) return .62;
  if(abs(s.z)<.0012) return .2;
  return .33+.06*vn(s.xz*400.); }
float o_proll(vec3 q,float k){ vec3 w=k>.5?vec3(q.y-.087,q.x+.02,q.z):q;
  float r=sdCylX(w-vec3(0.,.02,0.),.02,.085)-.0012;
  float rb=sdCylX(w-vec3(-.01,.02,0.),.0218,.006)-.0005;
  vec3 A=k>.5?vec3(.0,.075,-.02):vec3(-.01,.006,-.019), B=k>.5?vec3(.03,.004,-.052):vec3(.0,.003,-.046);
  float cd=sdCapsule(q,A,B,.0018);
  vec3 s=q-(k>.5?vec3(.036,0.,-.07):vec3(.004,0.,-.066)); float a=atan(s.z,s.x);
  float se=sdCylY(s-vec3(0.,.004,0.),.02+.0015*vn(vec2(a*2.5,4.)),.003)-.0012;
  se=max(se,-sdTorus(s-vec3(0.,.0082,0.),.012,.0012));
  return min(min(r,rb),min(cd,se)); }
float t_proll(vec3 q,float k){ vec3 s=q-(k>.5?vec3(.036,0.,-.07):vec3(.004,0.,-.066)); float rs=length(s.xz);
  if(rs<.023&&q.y<.011){ if(abs(rs-.012)<.0016||rs<.003) return .15; return .3; }
  vec3 w=k>.5?vec3(q.y-.087,q.x+.02,q.z):q;
  if(length(vec2(w.y-.02,w.z))>.0235) return .35;
  if(abs(w.x+.01)<.0068) return .34;
  if(abs(w.x)>.084){ vec2 e=w.yz-vec2(.02,0.); float r=length(e); if(fract(r/.0042+atan(e.y,e.x)/6.2832)<.3) return .45; return .86; }
  return .86-.06*vn(w.xz*300.); }

/* ---------- u6: open ledger, inkwell with a quill, small gavel ---------- */
float o_ledger(vec3 q,float k){ float x=abs(q.x);
  float lift=.011*sin(clamp(x/.125,0.,1.)*1.9)-.007*exp(-x*60.)+.004;
  float pg=sdBox(vec3(x-.066,q.y-.008-lift*.5,q.z),vec3(.062,max(.004+lift*.5,.003),.088))-.001;
  float cv=sdRBox(vec3(x-.069,q.y-.003,q.z),vec3(.07,.003,.093),.0015);
  return min(pg,cv); }
float t_ledger(vec3 q,float k){ float x=abs(q.x);
  if(q.y<.0055||x>.128||abs(q.z)>.089){ if(x>.12&&abs(q.z)>.08) return .22; return .34+.05*vn(q.xz*300.); }
  vec2 u=vec2(x-.066,q.z); float side=step(0.,q.x);
  if(x<.006) return .55;
  if(abs(u.y-.07)<.0012||abs(u.y-.066)<.0009) return .42;
  if(abs(u.x-.028)<.0009||abs(u.x-.044)<.0009||abs(u.x+.038)<.0009) return .5;
  float rw=u.y/.0085; float n=floor(rw), f=fract(rw);
  if(u.y<.06&&u.y>-.08){
    float hh=h1(vec2(n,side*7.+1.)); float len=.025+.04*hh;
    if(abs(f-.5)<.16&&u.x>-.034&&u.x<-.034+len&&hh>.18) return .38;
    if(abs(f-.5)<.16&&u.x>.03&&u.x<.03+.011*h1(vec2(n,side+3.))&&hh>.18) return .4;
    if(abs(u.x+.047)<.006&&abs(f-.5)<.16&&hh>.18) return .45;
    if(f<.1) return .74; }
  return .94; }
vec3 quillD(){ return normalize(vec3(.9,1.,.35)); }
float o_inkwell(vec3 q,float k){ float b=sdCylY(q-vec3(0.,.016,0.),.034,.016)-.003;
  float sh=eD(q-vec3(0.,.033,0.),vec3(.037,.013,.037)); b=smin(b,sh,.006);
  float nk=sdCylY(q-vec3(0.,.049,0.),.013,.007); b=smin(b,nk,.005);
  b=min(b,sdTorus(q-vec3(0.,.056,0.),.0125,.0032));
  b=max(b,-sdCylY(q-vec3(0.,.06,0.),.0085,.012));
  vec3 D=quillD(); vec3 p2=q-vec3(0.,.035,0.); float t=dot(p2,D);
  float sf=sdCapsule(p2,vec3(0.),D*.2,.0022);
  vec3 sv=normalize(cross(D,vec3(0.,0.,1.))); vec3 nv=cross(D,sv);
  float tt=clamp((t-.06)/.14,0.,1.); float w=.019*pow(sin(3.14159*pow(tt,.8)),.7);
  float a=dot(p2,sv)+.018*tt*tt, c=dot(p2,nv)+.004*sin(tt*3.);
  float vn_=max(max(abs(c)-.0009,max(a-w,-w*.55-a)),max(.06-t,t-.2));
  return min(b,min(sf,vn_*.8)); }
float t_inkwell(vec3 q,float k){ vec3 D=quillD(); vec3 p2=q-vec3(0.,.035,0.); float t=dot(p2,D);
  vec3 sv=normalize(cross(D,vec3(0.,0.,1.))); float a=dot(p2,sv)+.018*pow(clamp((t-.06)/.14,0.,1.),2.);
  if(length(p2-D*t)<.0028&&t>.02) return .7;
  if(t>.058&&q.y>.06){ if(fract((t-abs(a)*.9)/.0042)<.3) return .6; return .86; }
  if(length(q.xz)<.0086&&q.y>.05) return .05;
  if(q.y>.052) return .3;
  return .28+.1*step(.8,vn(q.xy*300.+q.z*200.)); }
float o_gavel2(vec3 q,float k){ vec3 h=q-vec3(0.,.021,0.); float hd=sdCylX(h,.0205,.042)-.0012;
  hd=max(hd,-(sdTorus(vec3(abs(h.x)-.028,h.y,h.z).yxz,.0215,.0014)));
  float hn=sdCapsule(q,vec3(0.,.02,-.018),vec3(0.,.0085,-.17),.0068);
  float en=length(q-vec3(0.,.009,-.175))-.009;
  return min(hd,min(hn,en)); }
float t_gavel2(vec3 q,float k){ vec3 h=q-vec3(0.,.021,0.);
  if(abs(q.z)<.023&&abs(h.x)>.041) return fract(length(h.yz)/.005)<.3?.3:.5;
  if(abs(q.z)<.023){ if(abs(abs(h.x)-.028)<.0022) return .2; return .42+.14*grain(h.zyx,40.); }
  return .5+.1*grain(q.zyx,40.); }

/* ---------- u7: cipher disk on a stand, old bound manuscript ---------- */
vec3 diskQ(vec3 q){ vec3 b=tX(q-vec3(0.,.016,0.),.2); b.y-=.092; return b; }
float o_cdisk(vec3 q,float k){ float st=sdRBox(q-vec3(0.,.012,.0),vec3(.062,.012,.034),.004);
  vec3 b=diskQ(q);
  float od=sdCylZ(b,.094,.0045)-.0015;
  float id=sdCylZ(b-vec3(0.,0.,-.0068),.066,.0026)-.001;
  float pn=sdCylZ(b-vec3(0.,0.,-.011),.0065,.0035)-.001;
  return min(st,min(min(od,id),pn)); }
float t_cdisk(vec3 q,float k){ vec3 b=diskQ(q); float r=length(b.xy); float a=atan(b.y,b.x);
  float sa=a/6.28318*26.; float i=floor(sa); float im=mod(i,26.); float am=(i+.5)*6.28318/26.;
  vec2 v=vec2(-(a-am)*r,0.);
  if(b.z<-.009&&r<.0075) return .3;
  if(b.z<-.0075&&r<.0665){
    if(r>.042){ if(fract(sa)<.06) return .3; if(abs(r-.0435)<.0012) return .3;
      v.y=r-.054; int g=0; if(im==5.) g=51; if(im==6.) g=50; if(im==7.) g=49;
      if(g>0){ if(gdig(v,g,.013)<.0012) return .12; } else if(length(v)<.0019) return .3; }
    return .84; }
  if(b.z<-.005&&r<.096){
    if(r>.068){ if(fract(sa)<.05) return .25; if(abs(r-.0925)<.0012) return .3;
      v.y=r-.081; int g=0; if(im==5.) g=67; if(im==6.) g=66; if(im==7.) g=65;
      if(g>0){ if(gdig(v,g,.015)<.0013) return .1; } else if(length(v)<.0021) return .28; }
    return .66+.05*vn(b.xy*300.); }
  if(q.y<.025) return .45+.12*grain(q.zyx,50.);
  return .5; }
float o_manu(vec3 q,float k){ vec3 c=q-vec3(0.,.028,0.);
  float cv=sdRBox(c,vec3(.13,.028,.17),.005);
  cv=max(cv,-sdBox(c-vec3(.01,0.,0.),vec3(.126,.021,.167)));
  float pg=sdBox(c-vec3(.004,0.,0.),vec3(.121,.021,.162))-.001;
  float bd=1e3; for(int i=0;i<4;i++){ float z=-.105+.07*float(i); bd=min(bd,sdRBox(c-vec3(-.13,0.,z),vec3(.006,.031,.0055),.003)); }
  float cl=1e3; for(int i=0;i<2;i++){ float z=i==0?-.085:.085;
    cl=min(cl,sdRBox(c-vec3(.132,0.,z),vec3(.004,.031,.012),.002));
    cl=min(cl,sdRBox(c-vec3(.112,.029,z),vec3(.022,.0022,.011),.0012)); }
  return min(min(cv,pg),min(bd,cl)); }
float t_manu(vec3 q,float k){ vec3 c=q-vec3(0.,.028,0.);
  if(c.x>.09&&abs(abs(c.z)-.085)<.012&&(c.y>.028||c.x>.127)) return .6;
  if(c.y>.0275){ vec2 u=c.xz; float e1=abs(max(abs(u.x)-.112,abs(u.y)-.152)), e2=abs(max(abs(u.x)-.1,abs(u.y)-.14));
    if(max(abs(u.x)-.1,abs(u.y)-.14)>.0&&abs(u.x)>.095&&abs(u.y)>.135) return .58;
    if(e1<.0018) return .2; if(e2<.0014) return .28;
    if(abs(abs(u.x)/.05+abs(u.y)/.075-1.)<.035) return .22;
    if(length(u)<.012) return .24;
    return .36+.08*fbm(u*60.); }
  if(abs(c.y)<.02&&(c.x>.12||abs(c.z)>.16)) return fract(c.y/.0016)<.3?.7:.88;
  if(c.x<-.124) return .3;
  return .36; }

/* ---------- u8: drafting plan of an arch, dividers, set square ---------- */
float o_aplan(vec3 q,float k){ float s=slab(q,vec2(.215,.15),.0008,.003);
  float c=sdCylX(q-vec3(0.,.011,.15),.011,.215); c=max(abs(c)-.0008,-(q.z-.148));
  return min(s,c); }
float t_aplan(vec3 q,float k){ vec2 u=q.xz; if(q.z>.148) return .82;
  if(abs(u.x)>.212||abs(u.y)>.147) return .9;
  float L=1e3, D=1e3;
  L=min(L,abs(max(abs(u.x)-.198,abs(u.y)-.136)));
  vec2 c=u-vec2(-.03,-.035); float r=length(c);
  if(c.y>0.){ L=min(L,abs(r-.068)); L=min(L,abs(r-.098));
    float a=atan(c.y,c.x); float sa=a/3.14159*9.; float fa=abs(fract(sa+.5)-.5)*3.14159/9.*r; if(r>.068&&r<.098) L=min(L,fa);
    D=min(D,abs(r-.083)); }
  if(c.y<0.&&c.y>-.075){ L=min(L,min(abs(abs(c.x)-.068),abs(abs(c.x)-.098))); if(abs(c.x)<.098&&abs(c.x)>.068&&abs(fract(c.y/.02)-.5)>.46) L=min(L,0.); }
  if(abs(c.x)<.14) L=min(L,abs(c.y+.075));
  if(abs(c.x)<.14&&c.y<-.075&&c.y>-.09&&fract((c.x-c.y)/.008)<.18) L=0.;
  if(abs(c.x)<.098) L=min(L,abs(c.y-.118)); if(abs(c.y-.118)<.007) L=min(L,abs(abs(c.x)-.098));
  if(c.y>-.08&&c.y<.12) D=min(D,abs(c.x));
  vec2 tb=u-vec2(.15,-.105); if(abs(tb.x)<.04&&abs(tb.y)<.022){ L=min(L,abs(max(abs(tb.x)-.04,abs(tb.y)-.022))); L=min(L,abs(tb.y));
    if(abs(tb.y-.011)<.0016&&tb.x>-.034&&tb.x<.02) return .45; if(abs(tb.y+.011)<.0016&&tb.x>-.034&&tb.x<.0) return .45; }
  if(L<.0012) return .22;
  if(D<.0009&&fract((u.x+u.y)/.008)<.55) return .5;
  return .94; }
float o_divid(vec3 q,float k){ vec2 H=vec2(0.,.15); float d=1e3;
  for(int i=0;i<2;i++){ vec2 P=vec2(i==0?-.056:.056,.0015); vec2 dir=normalize(P-H);
    vec3 a=vec3(H+dir*.006,0.), b=vec3(P-dir*.022,0.), c=vec3(P,0.);
    vec3 pa=q-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); float rr=mix(.0048,.0032,h);
    d=min(d,length(pa-ba*h)-rr);
    d=min(d,sdCapsule(q,b,c,.0011)); }
  float hg=sdCylZ(q-vec3(0.,.15,0.),.0115,.0048)-.001;
  float hn=sdCapsule(q,vec3(0.,.16,0.),vec3(0.,.19,0.),.0036);
  return min(d,min(hg,hn)); }
float t_divid(vec3 q,float k){ if(q.y>.162) return fract(q.y/.003)<.4?.28:.55;
  if(length(q.xy-vec2(0.,.15))<.013){ if(length(q.xy-vec2(0.,.15))<.003) return .15; return .42; }
  return .56+.1*step(.5,fract(q.y*40.)); }
float triSd(vec2 u,float s){ return max(max(-u.x,-u.y),(u.x+u.y-s)*.7071); }
float o_setsq(vec3 q,float k){ vec2 u=q.xz+vec2(.05,.05);
  float o=triSd(u,.16), i=triSd(u-vec2(.026),.16-.026*3.414); float f=max(o,-i);
  return max(f,abs(q.y-.0016)-.0016)-.0004; }
float t_setsq(vec3 q,float k){ vec2 u=q.xz+vec2(.05,.05);
  if(u.y<.007&&u.x>.008&&u.x<.14&&fract(u.x/.005)<.2) return .35;
  if(u.y<.012&&u.x>.008&&fract(u.x/.025)<.05) return .3;
  return .8; }

/* ---------- u9: carved stool with raffia fringe, gourd, strip-woven cloth ---------- */
float o_stool(vec3 q,float k){ float ba=sdRBox(q-vec3(0.,.012,0.),vec3(.12,.012,.056),.005);
  float yc=.168+1.6*q.x*q.x; float se=sdRBox(vec3(q.x,q.y-yc,q.z),vec3(.152,.012,.062),.008)*.8;
  float rc=.025+.0045*cos((q.y-.1)*70.); float co=sdCylY(q-vec3(0.,.1,0.),rc,.078)*.8;
  vec3 c=vec3(abs(q.x)-.086,q.y-.095,abs(q.z)-.036); float po=sdCylY(c,.0095,.075);
  float yt=.168+1.6*.0225-.012;
  vec3 f=vec3(abs(q.x)-.146-(yt-q.y)*.28,q.y,q.z); float cid=floor(f.z/.0062+.5); float fz=(fract(f.z/.0062+.5)-.5)*.0062;
  float len=.055+.022*h1(vec2(cid,sign(q.x)+3.));
  float fr=length(vec2(f.x+.0018*sin(q.y*110.+cid*1.7),fz))-.0023; fr=max(fr,max(q.y-yt,yt-len-q.y)); fr=max(fr,abs(q.z)-.058); fr*=.75;
  float bn=sdRBox(vec3(abs(q.x)-.143,q.y-yt-.004,q.z),vec3(.007,.007,.064),.003);
  return min(min(min(ba,se),min(co,po)),min(fr,bn)); }
float t_stool(vec3 q,float k){ float yt=.168+1.6*.0225-.012;
  if(abs(q.x)>.136&&q.y<yt+.012&&q.y>yt-.09&&abs(q.x)<.2){ if(abs(q.y-yt-.004)<.007&&abs(q.x)<.152) return .28; return fract(q.z/.0062)<.3?.55:.78; }
  if(q.y<.025){ if(q.z<-.05&&abs(q.y-.012-.006*(abs(fract(q.x/.02)*2.-1.)-.5))<.0017) return .2; return .42+.1*grain(q,50.); }
  if(q.y>.15) return .46+.12*grain(q.zyx*vec3(1.,1.,1.),30.);
  if(length(q.xz)<.035&&cos((q.y-.1)*70.)<-.55) return .25;
  return .44+.1*grain(q,40.); }
float o_gourd(vec3 q,float k){ float d=smin(eD(q-vec3(0.,.068,0.),vec3(.074,.068,.074)),length(q-vec3(0.,.15,0.))-.04,.035);
  d=max(d,q.y-.178); d=min(d,sdTorus(q-vec3(0.,.178,0.),.022,.0035));
  d=max(d,-sdCylY(q-vec3(0.,.19,0.),.018,.02));
  return d; }
float t_gourd(vec3 q,float k){ if(length(q.xz)<.019&&q.y>.17) return .12; if(q.y>.174) return .4; float a=atan(q.z,q.x);
  float zz=abs(fract(a*6./3.14159)*2.-1.);
  if(abs(q.y-.075-.018*(zz-.5))<.0024) return .22;
  if(abs(q.y-.05)<.0016||abs(q.y-.1)<.0016) return .3;
  if(q.y>.108&&q.y<.122&&length(vec2(fract(a*12./3.14159)-.5,(q.y-.115)*90.))<.25) return .3;
  return .64+.06*vn(vec2(a*30.,q.y*200.)); }
float o_kcloth(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.021,0.),vec3(.1,.021,.07),.012);
  float tl=slab(q-vec3(.145,0.,.004),vec2(.07,.068),.0018,.0018)+.0008*sin(q.x*80.);
  return smin(b,tl,.014); }
float t_kcloth(vec3 q,float k){
  if(q.z<-.066&&q.y>.005&&q.x<.1){ if(fract(q.y/.0105)<.16) return .35; }
  float sid=floor(q.z/.028), fz=fract(q.z/.028);
  if(fz<.05||fz>.95) return .28;
  float bid=floor(q.x/.032);
  if(mod(sid+bid,2.)<.5) return fract(q.x/.0052)<.5?.28:.74;
  if(abs(fz-.5)<.07) return .32;
  return .6; }
