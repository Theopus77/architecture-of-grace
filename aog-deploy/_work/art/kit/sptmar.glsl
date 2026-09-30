/* AOG render kit — sptmar.glsl: objects for the Sports History (spt) and The Measured Step (mar)
   pencil still lifes. Objects only: equipment at rest, papers, books, rooms as models. No people,
   nothing mid-strike. Every object rests on y=0 in its own frame, front toward -z, sizes in metres.
   o_<name>(q,k) is the distance, t_<name>(q,k) the grey tone (0 dark .. 1 paper). k is a free
   parameter (a plan type, a mirror flag, a thickness). Scenes are written by pencil/sptmar_scenes.py. */
float eD(vec3 p,vec3 r){ float k0=length(p/r); float k1=length(p/(r*r)); return k0*(k0-1.)/k1; }
float rr2(vec2 p,vec2 b,float r){ vec2 d=abs(p)-b+r; return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }
float slab(vec3 q,vec2 hb,float h,float r){ /* rounded plate in xz, thickness 2h, bottom on y=0 */
  vec2 w=vec2(rr2(q.xz,hb,r),abs(q.y-h)-h); return min(max(w.x,w.y),0.)+length(max(w,0.)); }
float hint(vec2 u,float pitch,float fill){ return step(fract(u.y/pitch),fill); }
float gdig(vec2 u,int g,float sz){ return glyph(u/sz,g)*sz; }

/* ---------- balls ---------- */
float seamF(vec3 v){ float a=atan(v.z,v.x); return v.y-.42*cos(2.*a)*sqrt(max(1.-v.y*v.y,0.)); }
float o_baseball(vec3 q,float k){ return length(q-vec3(0.,.037,0.))-.037; }
float t_baseball(vec3 q,float k){ vec3 v=normalize(q-vec3(0.,.037,0.)); float f=seamF(v); float a=atan(v.z,v.x);
  if(abs(f)<.012) return .45;
  if(abs(f)<.06&&fract(a*20./3.14159)<.32) return .25;
  return .93; }
float o_tennisball(vec3 q,float k){ return length(q-vec3(0.,.033,0.))-.033; }
float t_tennisball(vec3 q,float k){ vec3 v=normalize(q-vec3(0.,.033,0.)); return abs(seamF(v))<.03?.35:.8+.06*fbm(q.xz*400.); }
float o_basketball(vec3 q,float k){ return length(q-vec3(0.,.12,0.))-.12; }
float t_basketball(vec3 q,float k){ vec3 v=normalize(q-vec3(0.,.12,0.));
  if(abs(v.x)<.022||abs(v.y)<.022) return .12;
  if(abs(v.z*v.z-.45+.55*v.y*v.y)<.03) return .12;
  return .5+.08*step(.5,vn(q.xz*900.+q.y*700.)); }
float o_playball(vec3 q,float k){ return length(q-vec3(0.,.1,0.))-.1; }
float t_playball(vec3 q,float k){ vec3 v=normalize(q-vec3(0.,.1,0.)); float b=abs(v.y*.6+v.x*.8);
  if(b<.2) return .9; if(b<.23) return .3; return .55+.06*vn(q.xz*600.); }
float o_football(vec3 q,float k){ vec3 c=q-vec3(0.,.085,0.); float t=clamp(c.x/.145,-1.,1.);
  float r=.085*sqrt(max(1.-t*t,0.))*(1.-.06*t*t); return max((length(c.yz)-r)*.8,abs(c.x)-.145); }
float t_football(vec3 q,float k){ vec3 c=q-vec3(0.,.085,0.);
  if(c.y>.06&&abs(c.z)<.004&&abs(c.x)<.06) return .92;
  if(c.y>.055&&abs(c.z)<.02&&abs(c.x)<.055&&fract(c.x/.013)<.35) return .95;
  if(abs(abs(c.z)-.028)<.0025&&c.y>0.) return .2;
  return .35+.05*vn(q.xz*500.); }
float o_soccer(vec3 q,float k){ return length(q-vec3(0.,.11,0.))-.11; }
float t_soccer(vec3 q,float k){ vec3 v=normalize(q-vec3(0.,.11,0.)); float g=1.618;
  vec3 a[6]; a[0]=vec3(0.,1.,g); a[1]=vec3(0.,1.,-g); a[2]=vec3(1.,g,0.); a[3]=vec3(-1.,g,0.); a[4]=vec3(g,0.,1.); a[5]=vec3(-g,0.,1.);
  float m=0.; for(int i=0;i<6;i++) m=max(m,abs(dot(v,normalize(a[i]))));
  if(m>.945) return .18; if(m>.93&&m<.936) return .5; return .9; }

/* ---------- baseball things ---------- */
float o_bat(vec3 q,float k){ float x=clamp(q.x,-.42,.42);
  float r=mix(.012,.032,smoothstep(-.18,.3,x)); r=mix(r,.03,smoothstep(.38,.42,x));
  float d=(length(vec2(q.y-r,q.z))-r)*.8; d=max(d,abs(q.x)-.42);
  float knob=sdCylX(q-vec3(-.425,.02,0.),.02,.006)-.002; return min(d,knob); }
float t_bat(vec3 q,float k){ if(q.x<-.26&&q.x>-.41) return fract(q.x/.012)<.2?.2:.38; return .72+.12*grain(q*vec3(1.,3.,3.),30.)*.5; }
float o_scorebook(vec3 q,float k){ float cover=sdRBox(q-vec3(0.,.003,0.),vec3(.215,.003,.15),.002);
  float x=abs(q.x); float lift=.012*sin(clamp(x/.2,0.,1.)*1.7);
  float pages=sdBox(vec3(x-.105,q.y-.006-lift*.5,q.z),vec3(.1,max(.004+lift*.5,.003),.14))-.001; return min(cover,pages); }
float t_scorebook(vec3 q,float k){ if(q.y<.0065) return .35; float x=abs(q.x); if(x<.006) return .55;
  vec2 u=vec2(x-.105,q.z); if(abs(u.x)>.09||abs(u.y)>.125) return .95;
  vec2 c=fract(u/.03+.5)-.5; if(abs(c.x)>.44||abs(c.y)>.44) return .35;
  if(abs(abs(c.x)+abs(c.y)-.28)<.035) return .6; return .95; }
float o_basket(vec3 q,float k){ float d=sdCone(q-vec3(0.,.13,0.),.14,.17,.13); d=abs(d)-.004; d=max(d,q.y-.26);
  return min(d,min(sdTorus(q-vec3(0.,.25,0.),.171,.007),sdTorus(q-vec3(0.,.03,0.),.144,.006))); }
float t_basket(vec3 q,float k){ if(q.y>.242||q.y<.037&&length(q.xz)>.13) return .45; float a=atan(q.z,q.x);
  if(fract(a*18./3.14159)<.07) return .35; return .8-.1*grain(vec3(q.y,a,a),6.); }
float o_helmet(vec3 q,float k){ float d=eD(q-vec3(0.,.005,.0),vec3(.1,.12,.125)); d=max(abs(d)-.004,-q.y+.005);
  float fl=sdRBox(vec3(abs(q.x)-.098,q.y-.05,q.z+.01),vec3(.008,.045,.055),.007); return min(d,fl); }
float t_helmet(vec3 q,float k){ if(abs(q.x)<.004&&q.y>.02) return .15; if(abs(abs(q.x)-.045)<.003&&q.y>.06) return .25;
  if(q.y<.03) return .3; return .38+.06*vn(q.xy*300.); }

/* ---------- field, track, pool, court ---------- */
float o_cone(vec3 q,float k){ return min(sdCone(q-vec3(0.,.13,0.),.065,.012,.12),sdRBox(q-vec3(0.,.006,0.),vec3(.09,.006,.09),.01)); }
float t_cone(vec3 q,float k){ if(q.y<.013) return .32; if(q.y>.07&&q.y<.11) return .92; return .45; }
float o_whistle(vec3 q,float k){ float b=sdCylX(q-vec3(0.,.015,0.),.015,.012)-.002;
  float m=sdRBox(q-vec3(-.03,.012,0.),vec3(.022,.007,.009),.004);
  float ring=sdTorus((q-vec3(.02,.004,0.)),.009,.0022); return min(min(b,m),ring); }
float t_whistle(vec3 q,float k){ if(q.y>.024&&q.x>-.014&&q.x<-.004) return .15; return q.x<-.012?.35:.7+.2*step(.5,fract(q.y*80.)); }
float o_stopwatch(vec3 q,float k){ float c=sdCylY(q-vec3(0.,.008,0.),.034,.007)-.002;
  float st=sdCylZ(q-vec3(0.,.009,.04),.005,.008); float bt=sdCylZ(q-vec3(0.,.009,.05),.0065,.003)-.001;
  float ring=sdTorus((q-vec3(0.,.009,.06)).yxz,.01,.0022); return min(min(c,st),min(bt,ring)); }
float t_stopwatch(vec3 q,float k){ float r=length(q.xz); if(q.y<.016||r>.031) return .55; float a=atan(q.z,q.x);
  if(r>.024&&fract(a*30./3.14159)<.12) return .15; if(r>.02&&r<.021) return .5;
  if(sdSeg2(q.xz,vec2(0.),vec2(-.012,.018))<.0012) return .1; if(sdSeg2(q.xz,vec2(0.),vec2(.014,.004))<.0016) return .1; return .95; }
float o_hurdle(vec3 q,float k){ float d=1e3;
  for(int i=0;i<2;i++){ float x=i==0?-.2:.2; d=min(d,sdCapsule(q,vec3(x,.012,.0),vec3(x,.24,.0),.009));
    d=min(d,sdCapsule(q,vec3(x,.01,-.1),vec3(x,.01,.1),.01)); }
  return min(d,sdRBox(q-vec3(0.,.235,-.01),vec3(.215,.03,.007),.004)); }
float t_hurdle(vec3 q,float k){ if(q.y>.2&&q.z<.0) return fract(q.x/.1)<.5?.18:.92; return .5; }
float o_racket(vec3 q,float k){ vec2 h=(q.xz-vec2(.13,0.)); float e=(length(h/vec2(.13,.1))-1.)*.1;
  float ring=length(vec2(abs(e)-.007,max(abs(q.y-.011)-.009,0.)))-.001;
  float str=max(e,abs(q.y-.011)-.001);
  float thr=min(sdCapsule(q,vec3(-.06,.011,0.),vec3(.01,.011,.045),.007),sdCapsule(q,vec3(-.06,.011,0.),vec3(.01,.011,-.045),.007));
  float han=sdRBox(q-vec3(-.19,.014,0.),vec3(.13,.013,.015),.006); return min(min(ring,str),min(thr,han)); }
float t_racket(vec3 q,float k){ vec2 h=(q.xz-vec2(.13,0.)); float e=length(h/vec2(.13,.1))-1.;
  if(e<-.07&&abs(q.y-.011)<.0025) return (fract(q.x/.011)<.15||fract(q.z/.011)<.15)?.3:.93;
  if(q.x<-.2) return fract(q.x/.01+q.z*20.)<.3?.25:.45; return .68; }
float o_kickboard(vec3 q,float k){ float d=slab(q,vec2(.12,.2),.014,.07);
  float s=rr2(vec2(q.x,q.z-.13),vec2(.045,.012),.012); return max(d,-s); }
float t_kickboard(vec3 q,float k){ return .88-.08*vn(q.xz*200.); }
float o_plan(vec3 q,float k){ return slab(q,vec2(.2,.14),.0012,.006); }
float t_plan(vec3 q,float k){ vec2 u=q.xz; if(q.y<.002) return .9; float L=1.; float w=.0022;
  if(k<.5){ vec2 r=rot(.785)*(u+vec2(0.,.07)); float sq=abs(max(abs(r.x),abs(r.y))-.06);
    float arc=abs(length(u+vec2(0.,.07))-.16); if(u.y+.07<.0||abs(u.x)>u.y+.07) arc=1.; L=min(sq,arc); }
  else if(k<1.5){ vec2 a=abs(u); L=min(abs(max(a.x-.17,a.y-.11)),abs(u.x)); L=min(L,abs(length(u)-.035)); L=min(L,abs(max(a.x-.17,a.y-.04))+step(a.x,.13)); }
  else if(k<2.5){ for(int i=0;i<3;i++){ float o=.02*float(i); vec2 v=u; v.x=max(abs(v.x)-.08,0.); L=min(L,abs(length(v)-(.05+o))); } }
  else if(k<3.5){ L=abs(length(u)-.09); float a=atan(u.y,u.x); if(abs(length(u)-.105)<.006&&fract(a*6./3.14159)<.2) L=0.; }
  else if(k<4.5){ vec2 a=abs(u); if(a.x<.16&&a.y<.11){ vec2 c=u+vec2(.16,.11); float cx=fract(c.x/.08), cy=fract(c.y/.04);
      float row=floor(c.y/.04); float cx2=fract(c.x/.08+.5*mod(row,2.)); L=min(cy*.04,(1.-cy)*.04); L=min(L,min(cx2,1.-cx2)*.08); }
    L=min(L,abs(max(a.x-.16,a.y-.11))); }
  else { float n=fbm(u*14.+3.); L=abs(n-.55)*.05; if(n>.55&&fract((u.x+u.y)/.006)<.3) return .6;
    if(abs(u.y+.3*u.x-.02)<.003&&fract(u.x/.02)<.5) return .3; }
  if(L<w) return .25; if(k>4.5) return .93; return .95; }
float o_chalk(vec3 q,float k){ return sdCylX(q-vec3(0.,.007,0.),.007,.035)-.001; }
float t_chalk(vec3 q,float k){ return .97; }
float o_suitcase(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.12,0.),vec3(.2,.12,.065),.02);
  vec3 h=q-vec3(0.,.245,0.); float hd=length(vec2(length(h.xy)-.035,h.z))-.008; hd=max(hd,-h.y); return min(b,hd); }
float t_suitcase(vec3 q,float k){ if(q.y>.242) return .3; if(abs(abs(q.x)-.12)<.016) return .28;
  if(abs(q.x)>.18&&(q.y>.21||q.y<.03)) return .3; if(abs(q.y-.125)<.004) return .4; return .6+.05*vn(q.xy*400.); }

/* ---------- books and papers ---------- */
float o_book(vec3 q,float k){ float t=k>0.?k:.02; return sdRBox(q-vec3(0.,t,0.),vec3(.12,t,.165),.004); }
float t_book(vec3 q,float k){ float t=k>0.?k:.02; if(q.y>2.*t-.002){ vec2 u=q.xz;
    if(abs(u.x)<.07&&abs(u.y-.06)<.03) return abs(u.y-.06)<.02&&abs(u.x)<.055&&fract(u.y/.01)<.3?.5:.86;
    if(abs(max(abs(u.x)-.108,abs(u.y)-.153))<.002) return .55; return .38; }
  if(q.x<-.114) return .28; if(q.y>.003&&q.y<2.*t-.003) return fract(q.y/.0015)<.3?.75:.92; return .38; }
float o_newspaper(vec3 q,float k){ float b=.004*sin(q.x*9.); return slab(q-vec3(0.,b,0.),vec2(.17,.23),.004,.004); }
float t_newspaper(vec3 q,float k){ vec2 u=q.xz; if(q.y<.006) return .9; if(abs(u.x)>.155||abs(u.y)>.215) return .95;
  if(u.y>.16) return (abs(u.x)<.14&&u.y<.2)?.2:.95; if(abs(u.y-.15)<.002) return .4;
  if(u.x<-.01&&u.y>.03&&u.y<.14) return fract((u.x-u.y)/.006)<.4?.4:.7;
  float col=fract((u.x+.155)/.1033); if(col<.06||col>.94) return .95; return fract(u.y/.008)<.35?.55:.95; }
float o_ticket(vec3 q,float k){ return slab(q,vec2(.06,.028),.0008,.002); }
float t_ticket(vec3 q,float k){ vec2 u=q.xz; if(abs(u.x+.035)<.002&&fract(u.y/.006)<.5) return .3;
  if(abs(max(abs(u.x)-.056,abs(u.y)-.024))<.0012) return .45;
  if(u.x>-.02){ vec2 v=u-vec2(.022,0.); float g=min(gdig(v+vec2(.02,0.),49,.022),min(gdig(v,50,.022),gdig(v-vec2(.02,0.),51,.022))); if(g<.0016) return .15; }
  if(u.x<-.035) return .82; return .9; }
float o_sheet(vec3 q,float k){ float c=sdCylX(q-vec3(0.,.009,.145),.009,.1); c=max(abs(c)-.0008,-q.z+.14); return min(slab(q,vec2(.1,.145),.0008,.002),c); }
float t_sheet(vec3 q,float k){ vec2 u=q.xz; if(q.z>.14) return .8; if(abs(max(abs(u.x)-.088,abs(u.y)-.13))<.0016) return .45;
  if(k>.5){ if(abs(length(u-vec2(.05,-.09))-.018)<.003) return .25; if(length(u-vec2(.05,-.09))<.012) return .4;
    if(abs(max(abs(u.x)-.082,abs(u.y)-.124))<.001) return .55; }
  else { if(u.y<-.08&&u.y>-.11&&abs(u.y+.095-.008*sin(u.x*160.))<.0015&&u.x>-.01&&u.x<.07) return .2;
    if(abs(u.y+.105)<.0008&&u.x>-.02&&u.x<.075) return .4; }
  if(u.y>-.06&&u.y<.11&&abs(u.x)<.07&&fract(u.y/.009)<.3) return .6; if(u.y>.112&&u.y<.12&&abs(u.x)<.04) return .35; return .95; }
float o_clipboard(vec3 q,float k){ float b=slab(q,vec2(.11,.155),.003,.01); float p=slab(q-vec3(0.,.006,-.008),vec2(.1,.135),.0008,.002);
  float c=sdRBox(q-vec3(0.,.012,.14),vec3(.04,.006,.013),.004); float w=sdTorus((q-vec3(0.,.016,.125)),.018,.0022); w=max(w,q.z-.125); return min(min(b,p),min(c,w)); }
float t_clipboard(vec3 q,float k){ vec2 u=q.xz; if(q.y>.011) return .6; if(q.y<.0062) return .5;
  vec2 c=vec2(u.x+.07,fract((u.y+.12)/.028)); if(u.y<.1&&u.y>-.12){ if(abs(max(abs(u.x+.07)-.006,abs(c.y*.028-.012)-.006))<.0012) return .3;
    if(u.x>-.055&&u.x<.07&&abs(c.y*.028-.012)<.0012) return .6; } return .95; }
float o_pen(vec3 q,float k){ float b=sdCapsule(q,vec3(-.07,.006,0.),vec3(.05,.006,0.),.006); float n=sdCone((q-vec3(.063,.006,0.)).yxz,.005,.0008,.013); return min(b,n); }
float t_pen(vec3 q,float k){ if(q.x>.052) return .6; if(q.x<-.005) return .2; if(abs(q.x+.01)<.003) return .8; return .3; }
float o_pencil(vec3 q,float k){ vec3 c=q-vec3(0.,.0066,0.); float R=.0066; vec2 h=abs(c.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(c.x+.005)-.09); float t=clamp((c.x-.085)/.026,0.,1.); float cone=max(length(c.yz)-R*(1.-t)*.95-.0003,max(.085-c.x,c.x-.111));
  float fer=max(length(c.yz)-R*.98,abs(c.x+.093)-.008); return min(min(body,cone),fer); }
float t_pencil(vec3 q,float k){ if(q.x>.085) return q.x>.1?.12:.88; if(q.x<-.1) return .5; if(q.x<-.085) return fract(q.x/.003)<.35?.3:.7; return .62; }
float o_ruler(vec3 q,float k){ return slab(q,vec2(.16,.02),.0022,.002); }
float t_ruler(vec3 q,float k){ vec2 u=q.xz; if(q.y<.004) return .7; float f=fract(u.x/.01);
  if(u.y>.008&&f<.12) return .2; if(u.y>.0&&fract(u.x/.05)<.03) return .2;
  vec2 v=vec2(fract((u.x+.025)/.05)-.5,0.)*.05; v.y=u.y+.004; int g=int(mod(floor((u.x+.025)/.05),3.))+49; if(gdig(v,g,.012)<.0012) return .2; return .8; }
float o_certificate(vec3 q,float k){ return o_sheet(q,1.); }
float t_certificate(vec3 q,float k){ return t_sheet(q,1.); }
float o_contract(vec3 q,float k){ return o_sheet(q,0.); }
float t_contract(vec3 q,float k){ return t_sheet(q,0.); }

/* ---------- prizes, money, law ---------- */
float o_trophy(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.022,0.),vec3(.05,.022,.05),.004);
  float st=sdCylY(q-vec3(0.,.075,0.),.009,.032); float kn=length(q-vec3(0.,.075,0.))-.016;
  float cup=sdCone(q-vec3(0.,.155,0.),.02,.062,.05); cup=abs(cup)-.003; cup=max(cup,q.y-.203);
  vec3 hq=vec3(abs(q.x)-.065,q.y-.16,q.z); float hd=length(vec2(length(hq.xy)-.022,hq.z))-.005; hd=max(hd,-hq.x);
  return min(min(b,st),min(min(kn,cup),hd)); }
float t_trophy(vec3 q,float k){ if(q.y<.045){ if(q.z<-.04&&abs(q.x)<.03&&abs(q.y-.022)<.01) return .85; return .3; }
  return .55+.35*step(.6,fract(atan(q.z,q.x)*1.1+q.y*6.)); }
float o_medal(vec3 q,float k){ float m=sdCylY(q-vec3(0.,.004,0.),.035,.003)-.001;
  float r1=sdRBox(q-vec3(-.03,.0015,.1),vec3(.013,.0012,.08),.001); vec3 a=q-vec3(-.03,0.,.1); a.xz=rot(.25)*a.xz; r1=sdRBox(a-vec3(0.,.0015,0.),vec3(.013,.0012,.085),.001);
  vec3 b=q-vec3(.03,0.,.1); b.xz=rot(-.25)*b.xz; float r2=sdRBox(b-vec3(0.,.0015,0.),vec3(.013,.0012,.085),.001); return min(m,min(r1,r2)); }
float t_medal(vec3 q,float k){ if(length(q.xz)<.037){ float r=length(q.xz); if(abs(r-.028)<.0015) return .35; if(r<.015) return .55; return .8; }
  vec3 a=q-vec3(-.03,0.,.1); a.xz=rot(.25)*a.xz; vec3 b=q-vec3(.03,0.,.1); b.xz=rot(-.25)*b.xz; float x=abs(a.x)<.014?a.x:b.x;
  return abs(x)<.004?.25:.85; }
float o_coins(vec3 q,float k){ float n=k>0.?k:6.; float h=n*.0009; float d=sdCylY(q-vec3(0.,h,0.),.013,h)-.0004;
  float d2=sdCylY(q-vec3(.03,.0009,.012),.013,.0009)-.0004; return min(d,d2); }
float t_coins(vec3 q,float k){ if(length(q.xz)<.014||length(q.xz-vec2(.03,.012))<.014){ if(abs(q.y-(k>0.?k:6.)*.0018)<.0005||q.y>.0016&&length(q.xz)>.014) return .72;
    return fract(q.y/.0018)<.25?.35:.7; } return .7; }
float o_gavel(vec3 q,float k){ float h=sdCylX(q-vec3(0.,.026,0.),.024,.045)-.003; float g=sdCylX(q-vec3(0.,.026,0.),.027,.006);
  float hd=sdCapsule(q,vec3(0.,.012,-.02),vec3(-.06,.01,-.24),.009); float bl=sdCylY(q-vec3(.12,.012,.08),.06,.012)-.003; return min(min(h,g),min(hd,bl)); }
float t_gavel(vec3 q,float k){ if(length(q.xz-vec2(.12,.08))<.066) return .5+.08*grain(q*vec3(1.,1.,1.),40.); if(abs(q.x)<.006&&q.y>.02) return .3; return .45+.2*grain(q.zyx,60.); }
float o_padlock(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.035,0.),vec3(.032,.035,.013),.007);
  vec3 s=q-vec3(0.,.07,0.); float sh=length(vec2(length(s.xy)-.021,s.z))-.0055; sh=max(sh,-s.y);
  float lg=min(sdCapsule(q,vec3(-.021,.06,0.),vec3(-.021,.07,0.),.0055),sdCapsule(q,vec3(.021,.06,0.),vec3(.021,.07,0.),.0055)); return min(b,min(sh,lg)); }
float t_padlock(vec3 q,float k){ if(q.y>.069) return .75; if(q.z<-.011&&length(q.xy-vec2(0.,.03))<.006||q.z<-.011&&abs(q.x)<.002&&q.y<.03&&q.y>.018) return .1;
  return .45+.1*step(.5,fract(q.y*60.)); }
float o_key(vec3 q,float k){ float s=sdCapsule(q,vec3(-.005,.004,0.),vec3(.07,.004,0.),.0035); float r=sdTorus(q-vec3(-.02,.004,0.),.015,.004);
  float t=sdRBox(q-vec3(.058,.004,.008),vec3(.012,.003,.008),.001); return min(min(s,r),t); }
float t_key(vec3 q,float k){ return .68; }

/* ---------- media ---------- */
float o_radio(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.1,0.),vec3(.17,.1,.08),.025);
  float arch=max(eD(q-vec3(0.,.12,0.),vec3(.17,.14,.08)),-q.y+.12); b=min(b,arch);
  float kn=min(sdCylZ(q-vec3(-.1,.05,-.082),.014,.008),sdCylZ(q-vec3(.1,.05,-.082),.014,.008)); return min(b,kn-.001); }
float t_radio(vec3 q,float k){ if(q.z<-.075){ if(q.y<.068&&length(q.xy-vec2(0.,.045))<.03) return abs(length(q.xy-vec2(0.,.045))-.022)<.002?.2:.8;
    if(q.y>.08&&q.y<.2&&abs(q.x)<.1) return fract(q.x/.012)<.4?.2:.5; if(abs(q.x)>.09&&q.y<.07) return .85; }
  return .45+.15*grain(q.zyx,30.); }
float o_mic(vec3 q,float k){ float b=sdCylY(q-vec3(0.,.008,0.),.05,.006)-.002; float r=sdCapsule(q,vec3(0.,.01,0.),vec3(0.,.2,0.),.006);
  float y=sdTorus((q-vec3(0.,.24,0.)).xzy,.04,.004); y=max(y,q.y-.24);
  float h=sdRBox(q-vec3(0.,.25,0.),vec3(.028,.045,.02),.018); return min(min(b,r),min(y,h)); }
float t_mic(vec3 q,float k){ if(q.y>.21&&abs(q.x)<.03) return fract(q.y/.006)<.45?.25:.7; if(q.y<.016) return .35; return .6; }
float o_tv(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.14,0.),vec3(.17,.11,.13),.03);
  b=max(b,-sdRBox(q-vec3(-.03,.14,-.14),vec3(.105,.08,.02),.025)); float sc=eD(q-vec3(-.03,.14,-.02),vec3(.11,.085,.1)); sc=max(sc,q.z+.1);
  float kn=min(sdCylZ(q-vec3(.12,.18,-.13),.012,.008),sdCylZ(q-vec3(.12,.12,-.13),.012,.008));
  float lg=1e3; for(int i=0;i<4;i++){ float x=i<2?-.13:.13; float z=mod(float(i),2.)<.5?-.09:.09; lg=min(lg,sdCapsule(q,vec3(x,.0,z),vec3(x,.04,z),.007)); }
  float an=min(sdCapsule(q,vec3(0.,.25,0.),vec3(-.1,.4,.03),.003),sdCapsule(q,vec3(0.,.25,0.),vec3(.09,.41,.04),.003));
  return min(min(b,sc),min(min(kn,lg),min(an,length(q-vec3(0.,.252,0.))-.018))); }
float t_tv(vec3 q,float k){ if(q.z<-.1&&abs(q.x+.03)<.11&&abs(q.y-.14)<.085) return length(q.xy-vec2(-.07,.18))<.02?.8:.28;
  if(q.x>.1&&q.z<-.12) return .8; if(q.y>.26) return .5; return .5+.12*grain(q.zyx,40.); }
float o_camera(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.065,0.),vec3(.085,.065,.05),.01);
  float l=sdCylZ(q-vec3(-.03,.07,-.07),.022,.022)-.002; float l2=sdCylZ(q-vec3(-.03,.07,-.097),.026,.005);
  float r1=sdCylZ(q-vec3(-.045,.19,0.),.055,.008); float r2=sdCylZ(q-vec3(.055,.18,0.),.045,.008);
  float ar=sdRBox(q-vec3(.005,.14,0.),vec3(.012,.01,.006),.002); return min(min(b,min(l,l2)),min(min(r1,r2),ar)); }
float t_camera(vec3 q,float k){ if(q.y>.125){ vec2 c=q.xy-(q.x<.005?vec2(-.045,.19):vec2(.055,.18)); float r=length(c); float a=atan(c.y,c.x);
    if(r<.01) return .3; if(r>.02&&r<.042&&fract(a*5./6.2832)<.35) return .15; return .7; }
  if(q.z<-.05) return length(q.xy-vec2(-.03,.07))<.014?.1:.35; return .32+.06*vn(q.xy*300.); }
float o_filmreel(vec3 q,float k){ float d=sdCylY(q-vec3(0.,.005,0.),.09,.004)-.001; float a=atan(q.z,q.x); float s=6.2832/5.;
  float ar=mod(a+s*.5,s)-s*.5; vec2 rp=length(q.xz)*vec2(cos(ar),sin(ar)); d=max(d,-(length(rp-vec2(.055,0.))-.02));
  float w=sdCylY(q-vec3(0.,.008,0.),.07,.004); w=max(w,-(length(q.xz)-.03)); float hub=sdCylY(q-vec3(0.,.008,0.),.015,.006);
  float st=slab(q-vec3(.14,0.,.05),vec2(.07,.012),.0006,.001); return min(min(d,w),min(hub,st)); }
float t_filmreel(vec3 q,float k){ if(q.x>.07&&abs(q.z-.05)<.013){ float f=fract(q.x/.008); if(abs(abs(q.z-.05)-.009)<.002&&f<.5) return .9; return .25; }
  float r=length(q.xz); if(q.y>.0105&&r<.07&&r>.03) return fract(r/.002)<.3?.18:.28; if(r<.016) return .5; return .7; }

/* ---------- track, disability sport ---------- */
float o_wheel(vec3 q,float k){ float rim=sdTorus(q-vec3(0.,.012,0.),.16,.011); float pr=sdTorus(q-vec3(0.,.03,0.),.14,.005);
  float hub=sdCylY(q-vec3(0.,.02,0.),.02,.012)-.002; float a=atan(q.z,q.x); float s=6.2832/14.; float ar=mod(a+s*.5,s)-s*.5;
  vec2 rp=length(q.xz)*vec2(cos(ar),sin(ar)); float sp=length(vec2(rp.y,q.y-.016))-.0018; sp=max(sp,max(.02-rp.x,rp.x-.155));
  float po=length(vec2(rp.y,rp.x-.14))-.003; po=max(po,max(.012-q.y,q.y-.03)); if(mod(floor((a+s*.5)/s),2.)<.5) po=1e3;
  return min(min(rim,pr),min(min(hub,sp),po)); }
float t_wheel(vec3 q,float k){ float r=length(q.xz); if(r>.155&&q.y<.02||r>.165) return .22; if(r>.15) return .7; if(r<.024) return .45; return .65; }
float o_torch(vec3 q,float k){ float x=q.x; float r=mix(.013,.03,smoothstep(-.15,.12,x));
  float h=max((length(vec2(q.y-.03,q.z))-r)*.85,abs(x)-.15); float c=sdCylX(q-vec3(.165,.03,0.),.038,.02)-.003; c=max(c,-sdCylX(q-vec3(.18,.03,0.),.032,.02));
  return min(h,c); }
float t_torch(vec3 q,float k){ if(q.x>.14) return .6+.2*step(.5,fract(atan(q.z,q.y-.03)*3.)); if(fract(q.x/.03)<.15) return .3; return .66+.15*step(.7,fract(atan(q.z,q.y-.03)*1.6)); }
float o_scale(vec3 q,float k){ float p=sdRBox(q-vec3(0.,.02,0.),vec3(.13,.02,.15),.006);
  float c=sdCapsule(q,vec3(0.,.03,.14),vec3(0.,.34,.14),.011); float bm=sdRBox(q-vec3(.07,.34,.14),vec3(.16,.012,.007),.003);
  float w1=sdRBox(q-vec3(-.02,.34,.14),vec3(.012,.018,.012),.003); float w2=sdRBox(q-vec3(.13,.34,.14),vec3(.008,.014,.01),.002);
  float tip=sdRBox(q-vec3(.235,.34,.14),vec3(.012,.02,.012),.004); return min(min(p,c),min(min(bm,tip),min(w1,w2))); }
float t_scale(vec3 q,float k){ if(q.y<.041){ if(q.y>.038) return fract(q.x/.012)<.3?.2:.4; return .5; }
  if(q.y>.325&&abs(q.z-.14)<.008&&q.x>-.09&&q.x<.23) return fract(q.x/.01)<.15?.2:.85; return .6; }
float o_tape(vec3 q,float k){ float c=sdRBox(q-vec3(0.,.034,0.),vec3(.034,.034,.019),.013); float b=slab(q-vec3(.1,0.,-.005),vec2(.07,.009),.0005,.0006);
  float lip=sdRBox(q-vec3(.17,.004,-.005),vec3(.0015,.004,.01),.0005); return min(min(c,b),lip); }
float t_tape(vec3 q,float k){ if(q.x>.03&&q.y<.003){ float f=fract(q.x/.004); if(f<.15&&q.z<-.005) return .2; if(fract(q.x/.02)<.05) return .2; return .85; }
  if(q.z<-.017&&abs(length(q.xy-vec2(0.,.034))-.02)<.002) return .85; return .3; }
float o_magnifier(vec3 q,float k){ float rim=sdTorus(q-vec3(0.,.012,0.),.05,.006); float lens=sdCylY(q-vec3(0.,.012,0.),.05,.002);
  float h=sdCapsule(q,vec3(.055,.01,-.01),vec3(.17,.01,-.05),.009); return min(min(rim,lens),h); }
float t_magnifier(vec3 q,float k){ float r=length(q.xz); if(r<.047) return .9-.25*step(.8,fract((q.x-q.z)*30.)); if(r<.058) return .45; return .35; }

/* ---------- The Measured Step: rooms, cloth, instruments ---------- */
float o_tatami(vec3 q,float k){ return sdRBox(q-vec3(0.,.03,0.),vec3(.3,.03,.16),.006); }
float t_tatami(vec3 q,float k){ if(abs(q.z)>.135) return .3; if(q.y<.055) return fract(q.y/.004)<.4?.55:.7; return fract(q.z*140.)<.28?.6:.8; }
float o_gi(vec3 q,float k){ float b=.004*sin(q.x*30.)*sin(q.z*25.); return sdRBox(q-vec3(0.,.035+b,0.),vec3(.15,.035,.11),.02); }
float t_gi(vec3 q,float k){ if(q.y>.05){ float d=q.x+q.z*.9-.02; if(abs(d)<.022) return abs(abs(d)-.018)<.0025?.55:(fract((q.x-q.z)/.006)<.25?.72:.9);
    if(fract((q.x+q.z)/.009)<.12||fract((q.x-q.z)/.009)<.12) return .8; return .94; }
  if(abs(q.y-.035)<.003) return .6; return .88; }
float o_belt(vec3 q,float k){ float t=sdRBox(q-vec3(0.,.074,0.),vec3(.17,.004,.021),.002);
  float kn=sdRBox(q-vec3(0.,.08,-.02),vec3(.025,.008,.03),.006);
  float a=sdRBox(q-vec3(-.03,.04,-.112),vec3(.02,.038,.0035),.002); float b=sdRBox(q-vec3(.03,.035,-.114),vec3(.02,.033,.0035),.002);
  return min(min(t,kn),min(a,b)); }
float t_belt(vec3 q,float k){ float f=q.y>.07?q.z:q.x; if(fract(q.y>.07?q.z/.008:q.x/.008)<.18) return .12; return k>.5?.8:.24; }
float o_beltcoil(vec3 q,float k){ float c=sdCylY(q-vec3(0.,.02,0.),.05,.02)-.002; float t=slab(q-vec3(.1,0.,-.035),vec2(.07,.02),.002,.002); return min(c,t); }
float t_beltcoil(vec3 q,float k){ float r=length(q.xz); if(q.x>.05&&r>.052) return fract(q.z/.008)<.2?.12:.25;
  if(q.y>.038) return fract(r/.005+atan(q.z,q.x)/6.2832)<.22?.6:.2; return fract(q.y/.008)<.2?.1:.25; }
float o_zori(vec3 q,float k){ float s=slab(q,vec2(.045,.115),.007,.04);
  float st=min(sdCapsule(q,vec3(0.,.012,.06),vec3(-.04,.018,-.005),.004),sdCapsule(q,vec3(0.,.012,.06),vec3(.04,.018,-.005),.004));
  return min(s,st); }
float t_zori(vec3 q,float k){ if(q.y>.0145) return .25; if(q.y>.012) return fract(q.z/.005)<.3?.55:.78; return .45; }
float o_hourglass(vec3 q,float k){ float t=sdCylY(q-vec3(0.,.006,0.),.045,.006)-.002; float t2=sdCylY(q-vec3(0.,.186,0.),.045,.006)-.002;
  float g=smin(eD(q-vec3(0.,.06,0.),vec3(.032,.05,.032)),eD(q-vec3(0.,.132,0.),vec3(.032,.05,.032)),.01);
  float p=1e3; for(int i=0;i<3;i++){ float a=float(i)*2.094+.5; p=min(p,sdCapsule(q,vec3(.038*cos(a),.01,.038*sin(a)),vec3(.038*cos(a),.18,.038*sin(a)),.004)); }
  return min(min(t,t2),min(g,p)); }
float t_hourglass(vec3 q,float k){ if(q.y<.013||q.y>.179) return .45; if(length(q.xz)>.034) return .5;
  if(q.y<.05) return .4+.05*vn(q.xz*800.); if(q.y>.14&&q.y<.16) return .45; return .92; }
float o_rolledmat(vec3 q,float k){ return sdCylX(q-vec3(0.,.07,0.),.07,.2)-.004; }
float t_rolledmat(vec3 q,float k){ if(abs(q.x)>.198){ float r=length(q.yz-vec2(.07,0.)); return fract(r/.009+atan(q.z,q.y-.07)/6.2832)<.3?.25:.6; }
  if(abs(q.x)>.17) return .3; return .52+.06*vn(q.xz*300.); }
float o_nafuda(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.008,0.),vec3(.18,.008,.075),.003); float t=1e3;
  for(int i=0;i<6;i++){ float x=-.15+float(i)*.06; t=min(t,sdRBox(q-vec3(x,.02,0.),vec3(.021,.004,.06),.002)); } return min(b,t); }
float t_nafuda(vec3 q,float k){ if(q.y>.022){ float x=fract((q.x+.18)/.06)*.06-.03; if(abs(x)<.003&&abs(q.z)<.045&&fract(q.z/.012)<.6) return .3; return .88; }
  return .5+.12*grain(q,50.); }
float o_globe(vec3 q,float k){ float s=length(q-vec3(0.,.16,0.))-.1; float b=sdCylY(q-vec3(0.,.008,0.),.055,.006)-.002;
  float st=sdCapsule(q,vec3(0.,.01,0.),vec3(0.,.05,0.),.008); vec3 m=q-vec3(0.,.16,0.); m.xy=rot(.4)*m.xy;
  float mer=length(vec2(length(m.xy)-.108,m.z))-.004; mer=max(mer,m.x-.02); return min(min(s,b),min(st,mer)); }
float t_globe(vec3 q,float k){ vec3 v=q-vec3(0.,.16,0.); if(length(v)>.103) return .45; vec3 u=normalize(v);
  float n=fbm(vec2(atan(u.z,u.x)*1.6,u.y*3.)+2.); if(abs(u.y)<.01||fract(atan(u.z,u.x)*6./6.2832)<.02) return .5; return n>.55?.45:.9; }
float o_berimbau(vec3 q,float k){ vec2 c=q.xz-vec2(0.,.66); float d2=abs(length(c)-.7); d2=max(d2,abs(q.x)-.3);
  float bow=length(vec2(d2,q.y-.012))-.009; float str=sdCapsule(q,vec3(-.3,.012,.028),vec3(.3,.012,.028),.0015);
  float g=length(q-vec3(-.19,.06,.07))-.06; g=max(abs(g)-.004,q.y-.1); return min(min(bow,str),g); }
float t_berimbau(vec3 q,float k){ if(length(q-vec3(-.19,.06,.07))<.068) return q.y>.095?.2:.5+.1*vn(q.xz*200.); if(abs(q.z-.028)<.003&&q.y<.016) return .2; return .6+.15*grain(q,80.); }
float o_pandeiro(vec3 q,float k){ float ring=max(abs(length(q.xz)-.1)-.006,abs(q.y-.024)-.024); float head=sdCylY(q-vec3(0.,.048,0.),.103,.0012);
  float a=atan(q.z,q.x); float s=6.2832/5.; float ar=mod(a+s*.5,s)-s*.5; vec2 rp=length(q.xz)*vec2(cos(ar),sin(ar));
  ring=max(ring,-max(abs(rp.y)-.02,abs(q.y-.024)-.016)); float j=min(sdCylX(vec3(rp.x-.097,q.y-.024,rp.y),.016,.0012),sdCylX(vec3(rp.x-.103,q.y-.024,rp.y),.016,.0012));
  return min(min(ring,head),j); }
float t_pandeiro(vec3 q,float k){ float r=length(q.xz); if(q.y>.046&&r<.098) return .88-.1*fbm(q.xz*30.); if(r>.094&&r<.106&&q.y<.046) return .5+.12*grain(q.yxz,40.); return .78; }
float o_ringbell(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.012,0.),vec3(.1,.012,.1),.01); float d=length(q-vec3(0.,.024,0.))-.075; d=max(abs(d)-.004,.024-q.y);
  float kn=length(q-vec3(0.,.105,0.))-.012; float lv=sdCapsule(q,vec3(.07,.03,-.05),vec3(.12,.03,-.12),.006); return min(min(b,d),min(kn,lv)); }
float t_ringbell(vec3 q,float k){ if(q.y<.025) return .45+.15*grain(q,40.); return .62+.3*step(.7,fract(atan(q.z,q.x)*.8+q.y*8.)); }
float o_lantern(vec3 q,float k){ float b=eD(q-vec3(0.,.12,0.),vec3(.07,.095,.07)); float c1=sdCylY(q-vec3(0.,.018,0.),.04,.012)-.002; float c2=sdCylY(q-vec3(0.,.222,0.),.035,.01)-.002;
  vec3 h=q-vec3(0.,.235,0.); float hd=length(vec2(length(h.xy)-.03,h.z))-.003; hd=max(hd,-h.y); return min(min(b,c1),min(c2,hd)); }
float t_lantern(vec3 q,float k){ if(q.y<.032||q.y>.21) return .3; return fract(q.y/.013)<.15?.45:.9; }
float o_scroll(vec3 q,float k){ float r=sdCylX(q-vec3(0.,.025,0.),.025,.14); float e=sdCylX(q-vec3(0.,.025,0.),.011,.165)-.001;
  float c=sdTorus((q-vec3(-.02,.025,0.)).yxz,.026,.0025); return min(min(r,e),c); }
float t_scroll(vec3 q,float k){ if(abs(q.x)>.142) return .3; if(abs(q.x+.02)<.004) return .25; return .88-.06*fbm(q.xz*40.); }
float o_teabowl(vec3 q,float k){ float s=length(q-vec3(0.,.078,0.))-.075; s=max(abs(s)-.004,q.y-.072); float f=sdCylY(q-vec3(0.,.006,0.),.032,.006); f=max(f,-sdCylY(q-vec3(0.,.006,0.),.026,.01));
  return min(s,f); }
float t_teabowl(vec3 q,float k){ if(q.y<.013) return .7; float d=fbm(vec2(atan(q.z,q.x)*4.,q.y*40.)); return q.y>.05&&d>.55?.3:.5; }
float o_shopfront(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.1,0.),vec3(.14,.1,.07),.004);
  b=max(b,-sdBox(q-vec3(-.04,.075,-.075),vec3(.07,.05,.012))); b=max(b,-sdBox(q-vec3(.085,.065,-.075),vec3(.028,.065,.012)));
  float gl=sdBox(q-vec3(-.04,.075,-.064),vec3(.07,.05,.002)); float sg=sdRBox(q-vec3(0.,.17,-.074),vec3(.12,.018,.006),.002);
  vec3 a=q-vec3(-.02,.14,-.1); a.yz=rot(-.5)*a.yz; float aw=sdRBox(a,vec3(.12,.003,.035),.002); return min(min(b,gl),min(sg,aw)); }
float t_shopfront(vec3 q,float k){ if(q.y>.13&&q.z<-.075&&q.y<.16) return fract(q.x/.03)<.5?.3:.85;
  if(q.z<-.066&&q.z>-.07&&abs(q.x+.04)<.07) return abs(q.x+.04)<.003||abs(q.y-.075)<.003?.8:.25; if(q.z<-.069&&q.y>.153&&q.y<.19) return .85;
  if(abs(q.x-.085)<.028&&q.y<.13&&q.z>-.066) return .35; if(q.y<.2) return fract(q.y/.012)<.14?.4:(fract(q.x/.025+.5*step(.5,fract(q.y/.024)))<.08?.45:.66); return .4; }
float o_stamp(vec3 q,float k){ float b=sdCylY(q-vec3(0.,.014,0.),.022,.014)-.002; float n=sdCapsule(q,vec3(0.,.03,0.),vec3(0.,.075,0.),.011); float t=length(q-vec3(0.,.085,0.))-.018;
  return min(b,smin(n,t,.01)); }
float t_stamp(vec3 q,float k){ if(q.y<.006) return .2; if(q.y<.03) return .35; return .55+.15*grain(q.xzy,50.); }
float o_balance(vec3 q,float k){ float b=sdRBox(q-vec3(0.,.012,0.),vec3(.08,.012,.05),.004); float p=sdCapsule(q,vec3(0.,.02,0.),vec3(0.,.26,0.),.007);
  float bm=sdCapsule(q,vec3(-.16,.26,0.),vec3(.16,.26,0.),.005); float d=length(q-vec3(0.,.27,0.))-.012; float pans=1e3, ch=1e3;
  for(int i=0;i<2;i++){ float x=i==0?-.16:.16; vec3 c=q-vec3(x,.12,0.); float pan=length(c-vec3(0.,.06,0.))-.07; pan=max(abs(pan)-.002,c.y-.012); pans=min(pans,pan);
    ch=min(ch,min(sdCapsule(q,vec3(x,.26,0.),vec3(x-.055,.13,0.),.0015),sdCapsule(q,vec3(x,.26,0.),vec3(x+.055,.13,0.),.0015))); }
  return min(min(min(b,p),min(bm,d)),min(pans,ch)); }
float t_balance(vec3 q,float k){ if(q.y<.025) return .4; return .6+.3*step(.75,fract(q.y*20.+q.x*6.)); }
