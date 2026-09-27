/* Parts for the practice-room pencil still lifes (rooms batch 4b). Include after studio.glsl
   (self-contained: works beside medparts_a.glsl or spafcs.glsl). Every part takes a local point q, metres. */
float ellD(vec3 p,vec3 r){ float k0=length(p/r),k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
vec3 plc(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }
/* extrude a 2D distance d2 to half-thickness h */
float extrude(float d2,float z,float h){ vec2 w=vec2(d2,abs(z)-h); return min(max(w.x,w.y),0.)+length(max(w,0.)); }
/* a lace-up ankle boot standing on y=0, toe along +x */
float bootD(vec3 q){
  vec3 sq=q-vec3(-.03,.105,0.); sq.xz*=1.+.12*(sq.y/.1); float shaft=sdRBox(sq,vec3(.04,.1,.037),.034);
  float foot=sdRBox(q-vec3(.02,.034,0.),vec3(.085,.032,.042),.03);
  float toe=ellD(q-vec3(.085,.03,0.),vec3(.05,.034,.043));
  float d=smin(smin(shaft,foot,.035),toe,.02);
  d=max(d,-(ellD(q-vec3(-.03,.21,0.),vec3(.034,.02,.031))));   /* the opening */
  d=max(d,.012-q.y);
  float tab=sdTorus((q-vec3(-.071,.2,0.)).yxz,.009,.0025);          /* pull loop at the back */
  return min(d,tab); }
float bootSole(vec3 q){
  float fp=min(sdBox2(q.xz-vec2(-.01,0.),vec2(.07,.04))-.006,(length((q.xz-vec2(.085,0.))/vec2(.055,.047))-1.)*.047);
  float s=extrude(fp,q.y-.006,.006)-.001;
  s=min(s,sdRBox(q-vec3(-.05,.012,0.),vec3(.03,.012,.044),.004));   /* heel */
  return max(s,-q.y); }
float bootTone(vec3 q,vec3 n){
  if(q.y<.02) return .25;
  /* laces up the front: two rows of eyelets and criss-crossing lace */
  float fx=q.x-.0; vec2 f=vec2(q.z,q.y);
  if(q.x>-.005&&q.y>.05){ float row=fract((q.y-.05)/.024);
    if(abs(abs(q.z)-.014)<.003&&abs(row-.5)<.16) return .05;
    float lz=abs(q.z); float t=(row-.5)*2.;
    if(lz<.014&&abs(abs(q.z)-abs(t)*.014)<.0032) return .08; }
  if(abs(q.y-.075+.03*smoothstep(-.02,.12,q.x))<.0016) return .3;       /* a stitched seam */
  return .55; }
/* a cupcake in a ridged paper cup with a swirl of frosting and a cherry; base at y=0 */
float cupcakeCup(vec3 q){ float a=atan(q.z,q.x); float r=length(q.xz);
  float R=mix(.03,.039,clamp(q.y/.04,0.,1.))+.0012*cos(a*20.);
  return max(max(r-R,-q.y),q.y-.04)-.0005; }
float cupcakeTop(vec3 q){
  float d=ellD(q-vec3(0.,.043,0.),vec3(.043,.014,.043));
  d=smin(d,sdTorus(q-vec3(0.,.056,0.),.026,.011),.008);
  d=smin(d,sdTorus(q-vec3(0.,.072,0.),.015,.009),.006);
  d=smin(d,ellD(q-vec3(0.,.085,0.),vec3(.011,.012,.011)),.005);
  return d; }
float cherry(vec3 q){ return min(length(q-vec3(0.,.103,0.))-.011,sdCapsule(q,vec3(0.,.11,0.),vec3(.012,.135,.004),.0015)); }
/* a flat plate with a raised rim, base at y=0 */
float plateD(vec3 q,float R){ float r=length(q.xz);
  float d=max(abs(q.y-.004)-.004,r-R);
  float rim=length(vec2(r-R*.86,q.y-.004-.006*smoothstep(R*.6,R,r)))-.003;
  d=max(d,-(max(r-R*.62,.004-q.y+.003)));
  return min(d,max(sdTorus(q-vec3(0.,.008,0.),R*.9,.004),0.)); }
/* a small table lamp: round foot, a turned stem and a cone shade; base at y=0 */
float lampFoot(vec3 q){ float d=sdCylY(q-vec3(0.,.008,0.),.042,.008)-.003;
  d=min(d,sdCylY(q-vec3(0.,.02,0.),.022,.006)-.002);
  d=min(d,sdCapsule(q,vec3(0.,.02,0.),vec3(0.,.15,0.),.006));
  return d; }
float lampShade(vec3 q){ vec2 r=vec2(length(q.xz),q.y);
  float d=sdSeg2(r,vec2(.078,.115),vec2(.046,.205))-.002;
  return d; }
/* a round cereal bowl on a foot ring, base at y=0, radius R */
float bowlE(vec3 q,float R){ vec2 r=vec2(length(q.xz),q.y);
  float w=min(min(sdSeg2(r,vec2(0.,.004),vec2(R*.45,.004)),sdSeg2(r,vec2(R*.45,.004),vec2(R*.85,R*.38))),sdSeg2(r,vec2(R*.85,R*.38),vec2(R,R*.62)))-.0035;
  float foot=max(abs(r.x-R*.4)-.004,abs(r.y-.003)-.003);
  return min(w,foot); }
/* a spoon: bowl at q=0, handle along +x rising by lift */
float spoonE(vec3 q,float lift){
  float b=ellD(q,vec3(.02,.006,.013)); b=max(b,-ellD(q-vec3(0.,.004,0.),vec3(.018,.005,.011)));
  float h=sdCapsule(q,vec3(.018,.002,0.),vec3(.12,.002+lift,0.),.0028);
  return min(b,h); }
/* 2D jigsaw piece, square of half size s centred at 0; knobs (+1) or holes (-1) on +x,-x,+z,-z */
float jig2(vec2 u,float s,vec4 k){ float d=sdBox2(u,vec2(s))-.004; float r=s*.34;
  vec2 c[4]; c[0]=vec2(s+r*.55,0.); c[1]=vec2(-s-r*.55,0.); c[2]=vec2(0.,s+r*.55); c[3]=vec2(0.,-s-r*.55);
  for(int i=0;i<4;i++){ float kk=k[i]; if(kk>.5) d=min(d,length(u-c[i])-r);
    if(kk<-.5) d=max(d,-(length(u-c[i]+(c[i]/length(c[i]))*r*1.1)-r-.002)); }
  return d; }
/* a hand bell: flared brass bell, mouth down at y=0, with a turned wooden handle */
float bellE(vec3 q){ vec2 r=vec2(length(q.xz),q.y);
  float w=min(min(sdSeg2(r,vec2(.05,.004),vec2(.043,.02)),sdSeg2(r,vec2(.043,.02),vec2(.032,.06))),sdSeg2(r,vec2(.032,.06),vec2(.0,.078)))-.0035;
  float lip=length(r-vec2(.05,.005))-.0055;
  return min(w,lip); }
float bellHandle(vec3 q){ vec2 r=vec2(length(q.xz),q.y);
  float d=sdCapsule(q,vec3(0.,.075,0.),vec3(0.,.14,0.),.009);
  d=smin(d,length(q-vec3(0.,.145,0.))-.016,.01);
  d=min(d,sdCylY(q-vec3(0.,.082,0.),.013,.005)-.002);
  return d; }
/* a star with n long points in 2D (radius R, inner radius ri) */
float star2(vec2 u,float n,float R,float ri){ float a=atan(u.y,u.x); float s=PI/n; float m=mod(a+s*.0,2.*s)-s;
  vec2 v=length(u)*vec2(cos(m),abs(sin(m)));
  vec2 A=vec2(R,0.), B=vec2(ri*cos(s),ri*sin(s)); vec2 e=B-A; vec2 w=v-A;
  float h=clamp(dot(w,e)/dot(e,e),0.,1.); float d=length(w-e*h);
  return (e.x*w.y-e.y*w.x)>0.?-d:d; }
/* a toy house: floor at y=0, half width w (x), half depth dd (z), wall height h, roof rise k */
float houseE(vec3 q,float w,float dd,float h,float k){
  float walls=sdRBox(q-vec3(0.,h*.5,0.),vec3(w,h*.5,dd),.003);
  vec2 r=vec2(abs(q.x),q.y-h); float roof2=max(dot(r,normalize(vec2(k,w+.012)))-k*(w+.012)/length(vec2(k,w+.012)),-r.y);
  float roof=max(roof2,abs(q.z)-dd-.01);
  float chim=sdRBox(q-vec3(w*.45,h+k*.7,dd*.3),vec3(.008,k*.4,.008),.002);
  return min(min(walls,roof-.002),chim); }
/* an old shop cash register, front is -z, base at y=0 */
float registerBody(vec3 q){
  float b=sdRBox(q-vec3(0.,.035,0.),vec3(.085,.035,.065),.006);
  float drawer=sdRBox(q-vec3(0.,.02,-.066),vec3(.078,.016,.006),.003);
  vec3 k=q-vec3(0.,.07,-.005); float top=sdRBox(k,vec3(.083,.02,.058),.006);
  top=max(top,dot(k-vec3(0.,.0,-.0),normalize(vec3(0.,1.,-.55)))-.004);
  float disp=sdRBox(q-vec3(0.,.105,.045),vec3(.05,.022,.014),.005);
  return min(min(b,drawer),min(top,disp)); }
float registerKeys(vec3 q){ vec3 k=q-vec3(0.,.07,-.005); k.yz=rot(-.5)*k.yz; float d=1e5;
  for(int i=0;i<4;i++) for(int j=0;j<3;j++){ vec3 c=k-vec3(-.054+.036*float(i),.009,-.03+.026*float(j));
    d=min(d,sdCylY(c,.0085,.006)-.0015); }
  return d; }
float registerCrank(vec3 q){ vec3 c=q-vec3(.09,.05,0.);
  float hub=sdCylX(c,.012,.006);
  float arm=sdCapsule(c,vec3(.006,0.,0.),vec3(.012,.035,-.02),.004);
  float knob=sdCapsule(c,vec3(.012,.035,-.02),vec3(.03,.035,-.02),.006);
  return min(hub,min(arm,knob)); }
/* a coin lying flat, base at y=0 */
float coinE(vec3 q,float R,float H){ return min(sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.0006,sdTorus(q-vec3(0.,H,0.),R-.0015,.0008)); }
float coinStackE(vec3 q,float R,float H,int n){ float d=1e5;
  for(int i=0;i<12;i++){ if(i>=n) break; float fi=float(i);
    d=min(d,coinE(q-vec3(.0015*sin(fi*2.3),fi*H,.0015*cos(fi*1.7)),R,H*.92)); }
  return d; }
/* a round woven basket, base at y=0 */
float basketE(vec3 q,float R,float H){ vec2 r=vec2(length(q.xz),q.y);
  float w=sdSeg2(r,vec2(R*.75,.004),vec2(R,H))-.004; w=min(w,sdSeg2(r,vec2(0.,.004),vec2(R*.75,.004))-.004);
  float rim=length(r-vec2(R,H))-.0065;
  return min(w,rim); }
float basketTone(vec3 q,float R,float H){ float a=atan(q.z,q.x); float row=floor(q.y/.009);
  if(abs(length(q.xz)-R)<.012&&abs(q.y-H)<.008) return .4;
  return fract(a*R/.012+row*.5)<.5?.35:.62; }
/* a small table easel holding a board; board centre at q=(0,by,0), leaning back by ang */
float easelE(vec3 q,float by,float ang){
  float d=1e5; vec3 a=q; 
  d=min(d,sdCapsule(q,vec3(-.07,0.,-.02),vec3(-.045,by+.09,.015),.005));
  d=min(d,sdCapsule(q,vec3(.07,0.,-.02),vec3(.045,by+.09,.015),.005));
  d=min(d,sdCapsule(q,vec3(0.,0.,.1),vec3(0.,by+.08,.02),.005));
  d=min(d,sdRBox(q-vec3(0.,by-.078,-.035),vec3(.09,.004,.014),.002));       /* ledge */
  d=min(d,sdCapsule(q,vec3(-.06,by-.078,-.03),vec3(-.06,by-.078,.0),.003)); d=min(d,sdCapsule(q,vec3(.06,by-.078,-.03),vec3(.06,by-.078,.0),.003));
  return d; }
/* a glass jar with a screw lid, base at y=0 */
float jarGlass(vec3 q,float R,float H){ float o=sdCylY(q-vec3(0.,H*.5,0.),R,H*.5)-.004; float i=sdCylY(q-vec3(0.,H*.5+.004,0.),R-.003,H*.5);
  return max(o,-i); }
float jarLid(vec3 q,float R,float H){ return sdCylY(q-vec3(0.,H+.008,0.),R-.002,.008)-.002; }
/* a price tag: flat card with a punched hole, lying on the table, with a string */
float tagE(vec3 q){ vec2 u=q.xz; float d2=max(sdBox2(u,vec2(.035,.02))-.003,dot(u,normalize(vec2(1.,1.)))-.035);
  d2=max(d2,dot(u,normalize(vec2(1.,-1.)))-.035); d2=max(d2,-(length(u-vec2(.022,0.))-.004));
  return extrude(d2,q.y-.001,.001)-.0004; }
/* an old typewriter, front (keys) toward -z, base at y=0 */
float twBody(vec3 q){
  float base=sdRBox(q-vec3(0.,.012,0.),vec3(.1,.012,.075),.006);
  vec3 k=q-vec3(0.,.03,-.01); float deck=sdRBox(k,vec3(.095,.025,.06),.012);
  deck=smax(deck,dot(k,normalize(vec3(0.,1.,-.7)))-.012,.01);
  float back=sdRBox(q-vec3(0.,.055,.05),vec3(.1,.02,.025),.012);
  return min(base,min(deck,back)); }
float twPlaten(vec3 q){ float d=sdCylX(q-vec3(0.,.085,.055),.016,.105);
  d=min(d,sdCylX(q-vec3(0.,.085,.055),.009,.125));
  d=min(d,length(q-vec3(-.13,.085,.055))-.011);
  d=min(d,length(q-vec3(.13,.085,.055))-.011);
  d=min(d,sdCapsule(q,vec3(-.1,.1,.05),vec3(-.13,.12,.035),.003));     /* return lever */
  return d; }
float twKeys(vec3 q){ float d=1e5;
  for(int j=0;j<3;j++){ float fj=float(j); float z=-.058+.02*fj; float y=.022+.014*fj;
    for(int i=0;i<8;i++){ float x=-.07+.02*float(i)+.006*fj;
      vec3 c=q-vec3(x,y+.012,z); d=min(d,sdCylY(c,.0065,.002)-.001);
      d=min(d,sdCapsule(q,vec3(x,y,z+.004),vec3(x,y+.012,z),.0012)); } }
  float space=sdCapsule(q,vec3(-.05,.018,-.075),vec3(.05,.018,-.075),.004);
  return min(d,space); }
float twPaper(vec3 q){ vec3 s=q-vec3(0.,.12,.07); s.yz=rot(.25)*s.yz; return sdBox(s,vec3(.06,.04,.0006)); }
/* a light bulb lying on its side: glass centre at q=0, base along +x */
float bulbGlass(vec3 q){ float g=length(q)-.03; float neck=sdCone(vec3(q.y,q.x-.03,q.z),.028,.012,.02);
  return smin(g,neck,.012); }
float bulbBase(vec3 q){ vec3 b=q-vec3(.058,0.,0.); float r=length(b.yz); float d=max(r-.0125-.0012*sin(b.x*2.*PI/.005),abs(b.x)-.011);
  d=min(d,max(length(b.yz)-.006,abs(b.x-.013)-.003)-.001); return d; }
/* a railway hand lantern, base at y=0: glass globe in a wire cage, cap and a bail handle */
float lanternFrame(vec3 q){
  float base=sdCylY(q-vec3(0.,.01,0.),.038,.01)-.002;
  float cap=sdCylY(q-vec3(0.,.1,0.),.034,.006)-.002; cap=min(cap,sdCone(q-vec3(0.,.118,0.),.032,.012,.012));
  float d=min(base,cap);
  for(int i=0;i<4;i++){ float a=float(i)*PI*.5+.4; vec2 c=.034*vec2(cos(a),sin(a));
    d=min(d,sdCapsule(q,vec3(c.x,.02,c.y),vec3(c.x,.095,c.y),.002)); }
  d=min(d,sdTorus(q-vec3(0.,.058,0.),.035,.002));
  vec3 h=q-vec3(0.,.13,0.); float bail=max(sdTorus(h.xzy,.036,.0025),-h.y);
  d=min(d,bail);
  return d; }
float lanternGlobe(vec3 q){ return ellD(q-vec3(0.,.058,0.),vec3(.03,.04,.03)); }
/* a wooden thread spool standing on end, base at y=0: flanges and wound thread */
float spoolWood(vec3 q,float R,float H){
  float f1=sdCylY(q-vec3(0.,.005,0.),R,.005)-.0015; float f2=sdCylY(q-vec3(0.,H-.005,0.),R,.005)-.0015;
  float core=sdCylY(q-vec3(0.,H*.5,0.),R*.45,H*.5);
  return max(min(min(f1,f2),core),-sdCylY(q-vec3(0.,H*.5,0.),R*.15,H)); }
float spoolThread(vec3 q,float R,float H){ return sdCylY(q-vec3(0.,H*.5,0.),R*.82,H*.5-.009)-.001; }
/* a pocket watch lying face up, centre at q=0 on the table, crown toward +x */
float watchCase(vec3 q){ float d=sdCylY(q-vec3(0.,.005,0.),.033,.003)-.002;
  d=min(d,sdTorus(q-vec3(0.,.0105,0.),.0315,.0032));
  d=min(d,sdCylX(q-vec3(.04,.007,0.),.005,.004)-.001);
  d=min(d,sdTorus((q-vec3(.051,.007,0.)).yxz,.007,.0018));
  return d; }
float watchFace(vec3 q){ return sdCylY(q-vec3(0.,.0095,0.),.03,.0012); }
float watchHands(vec3 q){ vec3 h=q-vec3(0.,.0112,0.);
  return min(sdCapsule(h,vec3(0.),vec3(-.006,0.,.018),.0012),sdCapsule(h,vec3(0.),vec3(.015,0.,.01),.0012))-.0002; }
float watchChain(vec3 q){ float d=1e5;
  for(int i=0;i<6;i++){ float fi=float(i); vec3 c=q-vec3(.062+.011*fi,.0015,-.006*fi-.0012*fi*fi);
    vec3 cc=c; if(i%2==1) cc=cc.xzy; d=min(d,sdTorus(cc,.004,.0012)); }
  return d; }
