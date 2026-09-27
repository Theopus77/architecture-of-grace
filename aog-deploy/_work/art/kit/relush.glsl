/* relush.glsl: shared still-life parts for the rel-u* and ush-u* pencil scenes.
   Every part is modelled in its own local frame, resting on y=0, centred on x=z=0.
   Use L(p,centre,turn) to move a world point into a part's frame. Sizes in metres. */
vec3 L(vec3 p,vec3 c,float ry){ vec3 q=p-c; q.xz=rot(ry)*q.xz; return q; }
float sdBox2(vec2 p,vec2 b){ vec2 d=abs(p)-b; return length(max(d,0.))+min(max(d.x,d.y),0.); }

/* a teardrop flame standing on its wick at the origin, height h */
float tear(vec3 q,float h,float r){
  float t=clamp((q.y+.12*h)/h,0.,1.); float rr=r*pow(sin(3.1416*pow(t,.62)),.8)*(1.-.15*t);
  float d=length(q.xz)-rr; d=max(d,max(-q.y-.12*h,q.y-.88*h)); return d*.7; }

/* ancient clay oil lamp: closed round body, filling hole, spout to +x, ring handle to -x */
float lampD(vec3 q,float s){ q/=s;
  float body=(length((q-vec3(0,.026,0))/vec3(.058,.03,.05))-1.)*.03;
  float spout=sdCapsule(q,vec3(.03,.035,0),vec3(.085,.045,0),.012);
  spout=max(spout,-sdCapsule(q,vec3(.06,.05,0),vec3(.09,.056,0),.006));
  float b2=smin(body,spout,.01); b2=max(b2,-(length(q-vec3(-.005,.064,0))-.012));
  float handle=sdTorus((q-vec3(-.06,.035,0)).xzy,.017,.004);
  float foot=sdCylY(q-vec3(0,.004,0),.03,.004);
  return min(min(b2,handle),foot)*s; }
float lampFlameD(vec3 q,float s){ q/=s; return tear(q-vec3(.088,.058,0.),.05,.0105)*s; }

/* open clay diya: a round dish drawn out to a pinched spout at +x; the wick sits in the spout */
float diyaShape(vec3 q,float k){
  float px=q.x>0.?q.x*(.62+.25*k):q.x; float pz=q.z*(1.+1.6*smoothstep(0.,.07,q.x));
  return length(vec3(px,(q.y-.036)*1.35,pz))-.05*k; }
float diyaD(vec3 q,float s){ q/=s;
  float d=diyaShape(q,1.)*.6; d=max(d,q.y-.03);
  d=max(d,-(diyaShape(q-vec3(0,.009,0),.86)*.6));
  d=max(d,-q.y);
  float foot=sdCylY(q-vec3(0,.003,0),.02,.003);
  float wick=sdCapsule(q,vec3(.045,.024,0),vec3(.066,.034,0),.0035);
  return min(min(d,foot),wick)*s; }
float diyaFlameD(vec3 q,float s){ q/=s; return tear(q-vec3(.068,.036,0.),.05,.011)*s; }

/* brass candlestick: round base, turned stem, drip cup; the cup top is at y=.10 */
float holderD(vec3 q){
  float base=sdCylY(q-vec3(0,.006,0),.042,.006)-.002;
  base=smin(base,sdCone(q-vec3(0,.02,0),.03,.01,.012),.006);
  float stem=sdCylY(q-vec3(0,.055,0),.0075,.035);
  float knop=length((q-vec3(0,.05,0))/vec3(1.,.7,1.))-.014;
  float cup=sdCylY(q-vec3(0,.094,0),.02,.006)-.002; cup=max(cup,-sdCylY(q-vec3(0,.1,0),.014,.004));
  float ring=sdTorus(q-vec3(0,.09,0),.024,.0025);
  return min(min(min(base,stem),knop*.8),min(cup,ring)); }
/* a candle of radius r from y0 up h, with a little melt at the top and a wick */
float candleD(vec3 q,float y0,float h,float r){
  vec3 c=q-vec3(0,y0+h*.5,0); float d=sdCylY(c,r,h*.5)-.001;
  d=max(d,-(sdCylY(q-vec3(0,y0+h,0),r*.7,.004)));
  float wick=sdCapsule(q,vec3(0,y0+h-.004,0),vec3(.0015,y0+h+.01,0),.0012);
  return min(d,wick); }

/* a closed hardback lying flat: half sizes b (x along the fore-edge side at +x, spine at -x) */
float bookD(vec3 q,vec3 b){
  float cover=sdRBox(q-vec3(0,b.y,0),b,.0025);
  float pages=sdBox(q-vec3(.004,b.y,0),vec3(b.x-.002,b.y-.0045,b.z-.004));
  float cut=sdBox(q-vec3(.004+b.x,b.y,0),vec3(.008,b.y-.0045,b.z-.004));
  float spine=sdCylZ(q-vec3(-b.x+.002,b.y,0),b.y,b.z-.001)-.0005;
  return min(max(cover,-cut),min(pages,spine)); }
/* tone for bookD: dark cloth cover, light page edges with fine lines, a band on the spine */
float bookT(vec3 q,vec3 b,float cov){
  bool pg=(q.x>b.x-.003&&abs(q.y-b.y)<b.y-.004)||(abs(q.z)>b.z-.005&&abs(q.y-b.y)<b.y-.004&&q.x>-b.x+.006);
  if(pg) return fract(q.y/.0022)<.35?.72:.93;
  if(q.x<-b.x+.004&&abs(abs(q.z)-b.z*.6)<.004) return cov-.18;
  if(q.y>2.*b.y-.001&&abs(sdBox2(q.xz,vec2(b.x,b.z)-.012))<.0014) return cov+.15;
  return cov; }

/* a double scroll lying along x: two rolls on wooden rods with turned handles */
float scrollD(vec3 q,float s){ q/=s;
  float d=1e5;
  for(int i=0;i<2;i++){ float sg=i==0?-1.:1.; vec3 c=q-vec3(0.,.024,sg*.03);
    d=min(d,sdCylX(c,.022,.085)-.001);
    d=min(d,sdCylX(c,.005,.125));
    d=min(d,sdCylX(c-vec3(.1,0,0),.017,.003)-.001); d=min(d,sdCylX(c+vec3(.1,0,0),.017,.003)-.001);
    d=min(d,length(c-vec3(.13,0,0))-.008); d=min(d,length(c+vec3(.13,0,0))-.008); }
  d=min(d,sdBox(q-vec3(0.,.0015,0.),vec3(.085,.0012,.03)));
  return d*s; }
float scrollT(vec3 q,float s){ q/=s; if(abs(q.x)>.087) return .35; if(q.y<.004&&fract(q.x/.01)<.3&&abs(q.x)<.07) return .6; return .88; }

/* a single rolled sheet with a tied cord, lying along x, radius r, half length h */
float rollD(vec3 q,float r,float h){
  vec3 c=q-vec3(0,r,0); float d=sdCylX(c,r,h)-.0008;
  float a=atan(c.z,-c.y); float lip=max(abs(length(c.yz)-r-.0015)-.0012,abs(c.x)-h); /* loose outer edge */
  d=min(d,max(lip,-a*.01));
  float cord=sdTorus(c.yxz,r+.001,.0022); return min(d,cord); }
float rollT(vec3 q,float r,float h){ vec3 c=q-vec3(0,r,0); if(abs(c.x)<.004&&length(c.yz)>r-.0005) return .3;
  if(abs(c.x)>h-.0015) return fract(length(c.yz)/.002)<.4?.55:.85; return .86; }

/* a round bowl, open at the top, outer radius R, height h */
float bowlD(vec3 q,float R,float h){
  vec3 c=q-vec3(0,R,0); float sh=abs(length(c)-R+.003)-.003; sh=max(sh,q.y-h);
  float foot=sdCylY(q-vec3(0,.004,0),R*.45,.004);
  float lip=sdTorus(q-vec3(0,h,0),sqrt(max(R*R-(R-h)*(R-h),0.))-.001,.0035);
  return min(min(sh,foot),lip); }

/* a stemmed cup, height about .13 */
float gobletD(vec3 q){
  float base=sdCone(q-vec3(0,.006,0),.034,.02,.006)-.001;
  float stem=sdCylY(q-vec3(0,.04,0),.006,.03);
  float knop=length((q-vec3(0,.045,0))/vec3(1.,.7,1.))-.011;
  vec3 c=q-vec3(0,.1,0); float cupO=length(c*vec3(1.,.85,1.))-.038; cupO=max(cupO,c.y-.028);
  float cup=max(cupO,-(length((c-vec3(0,.004,0))*vec3(1.,.85,1.))-.034));
  cup=min(cup,sdTorus(c-vec3(0,.028,0),.0335,.002));
  return min(min(base,stem),min(knop,cup)); }

/* a metal hanging lantern with glass sides: base, four posts, pierced cap, ring; height ~.24*s */
float lanternD(vec3 q,float s){ q/=s;
  float base=sdRBox(q-vec3(0,.012,0),vec3(.045,.012,.045),.003);
  float foot=sdRBox(q-vec3(0,.003,0),vec3(.05,.003,.05),.001);
  vec2 a=abs(q.xz); float posts=max(length(a-vec2(.04))-.004,abs(q.y-.085)-.065);
  float glass=max(sdBox(q-vec3(0,.085,0),vec3(.038,.06,.038)),-sdBox(q-vec3(0,.085,0),vec3(.036,.07,.036)));
  float band=sdRBox(q-vec3(0,.153,0),vec3(.047,.006,.047),.002);
  vec3 c=q-vec3(0,.16,0); float cap=max(max(a.x,a.y)*.9+c.y*.9-.042,-c.y); cap=max(cap,c.y-.05);
  float chim=sdCylY(q-vec3(0,.21,0),.012,.008)-.002;
  float ring=sdTorus((q-vec3(0,.235,0)).xzy,.016,.0035);
  return min(min(min(base,foot),min(posts,glass)),min(min(band,cap),min(chim,ring)))*s; }
float lanternT(vec3 q,float s){ q/=s; if(q.y>.025&&q.y<.145&&max(abs(q.x),abs(q.z))<.0385) return .88;
  vec3 c=q-vec3(0,.16,0); if(c.y>0.&&c.y<.04&&fract(atan(q.x,q.z)*1.3+c.y*20.)<.25) return .2; return .38; }
/* candle inside the lantern */
float lanternCandle(vec3 q,float s){ q/=s; return min(sdCylY(q-vec3(0,.05,0),.012,.026),tear(q-vec3(0,.08,0),.035,.008))*s; }

/* a hand bell with a turned handle, height ~.17*s */
float bellD(vec3 q,float s){ q/=s;
  float y=q.y; float r=.018+.042*pow(clamp(1.-y/.1,0.,1.),1.6);
  float sh=length(q.xz)-r; sh=max(sh,max(-y,y-.1)); sh=max(sh,-max(length(q.xz)-r+.004,-y-.1+.003))*.8;
  float top=length((q-vec3(0,.1,0))*vec3(1.,1.4,1.))-.02;
  float lip=sdTorus(q-vec3(0,.004,0),.058,.004);
  float handle=sdCone(q-vec3(0,.132,0),.008,.011,.02)-.001;
  float knob=length((q-vec3(0,.16,0))*vec3(1.,.85,1.))-.014;
  float col=sdTorus(q-vec3(0,.112,0),.012,.004);
  return min(min(sh,top),min(min(lip,handle),min(knob,col)))*s; }

/* a quill standing in an inkwell */
float inkwellD(vec3 q){
  float b=sdRBox(q-vec3(0,.025,0),vec3(.035,.025,.035),.008);
  float neck=sdCylY(q-vec3(0,.055,0),.015,.008)-.002;
  float mouth=sdCylY(q-vec3(0,.064,0),.01,.004);
  return max(min(b,neck),-mouth); }
float quillD(vec3 q){
  /* shaft from inside the well, leaning to +x; the vane is a flattened curved blade */
  vec3 a=vec3(0,.045,0), b=vec3(.07,.26,.02); vec3 ab=b-a;
  float t=clamp(dot(q-a,ab)/dot(ab,ab),0.,1.); vec3 c=q-(a+ab*t);
  float shaft=length(c)-.0022;
  vec3 dir=normalize(ab); vec3 side=normalize(cross(dir,vec3(0,0,1)));
  float w=.018*sin(3.1416*clamp((t-.3)/.72,0.,1.))*(1.+.2*(t-.6));
  float lat=dot(c,side); float nrm=length(c-side*lat);
  float vane=max(abs(lat+.004*sin(t*9.))-w,nrm-.0012+.0*lat)-.0005;
  vane=max(vane,.3-t);
  return min(shaft,vane*.8); }
float quillT(vec3 q){ vec3 a=vec3(0,.045,0), b=vec3(.07,.26,.02); vec3 ab=b-a; float t=clamp(dot(q-a,ab)/dot(ab,ab),0.,1.);
  vec3 c=q-(a+ab*t); vec3 dir=normalize(ab); vec3 side=normalize(cross(dir,vec3(0,0,1))); float lat=dot(c,side);
  if(abs(lat)<.0025) return .9; return fract(abs(lat)*180.-t*25.)<.3?.45:.8; }

/* a round magnifying glass lying on its side on the table, handle to +x */
float magD(vec3 q,float s){ q/=s;
  vec3 c=q-vec3(0,.006,0);
  float rim=sdTorus(c,.05,.006); float lens=sdCylY(c,.049,.0025);
  float neck=sdCylX(c-vec3(.062,0,0),.006,.01);
  float handle=sdCapsule(c,vec3(.07,0,0),vec3(.16,0,0),.008);
  return min(min(rim,lens),min(neck,handle))*s; }

/* a pair of round reading glasses, folded and lying down */
float glassesD(vec3 q){
  vec3 c=q-vec3(0,.012,0);
  float l=sdTorus((c-vec3(-.03,0,0)).xzy,.024,.0022), r=sdTorus((c-vec3(.03,0,0)).xzy,.024,.0022);
  float lens=min(sdCylZ(c-vec3(-.03,0,0),.023,.0008),sdCylZ(c-vec3(.03,0,0),.023,.0008));
  float br=sdCapsule(c,vec3(-.008,.008,0),vec3(.008,.008,0),.002);
  float arm1=sdCapsule(q,vec3(-.054,.012,0),vec3(-.05,.004,.1),.0018);
  float arm2=sdCapsule(q,vec3(.054,.012,0),vec3(.05,.004,.1),.0018);
  return min(min(min(l,r),lens),min(br,min(arm1,arm2))); }

/* a stack of n coins, radius r; returns distance */
float coinsD(vec3 q,float r,float n,float lean){
  float h=.0028; float i=clamp(floor(q.y/h),0.,n-1.); float d=1e5;
  for(int k=-1;k<=1;k++){ float j=clamp(i+float(k),0.,n-1.); vec3 c=q-vec3(sin(j*2.3)*lean,j*h+h*.5,cos(j*1.7)*lean);
    d=min(d,sdCylY(c,r,h*.42)-.0004); }
  return d; }
