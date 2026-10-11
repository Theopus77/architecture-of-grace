/* AOG render kit — sktparts_b.glsl: objects for the Skateboarding (skt) pencil still lifes, batch B
   (units 10-18). Objects only: boards, parts, tools and models at rest. No people, no logos, no text.
   Every object rests on y=0 in its own frame, front toward -z, sizes in metres. sb_<name>(q,..) is the
   distance, sbt_<name>(q,..) the grey tone (0 dark .. 1 paper). Include after lib.glsl and studio.glsl
   (and after sptmar.glsl when a scene also uses it); this file defines only sb_ / sbt_ names. */
float sb_r2(vec2 p,vec2 b,float r){ vec2 d=abs(p)-b+r; return length(max(d,0.))+min(max(d.x,d.y),0.)-r; }
float sb_ell(vec3 p,vec3 r){ float k0=length(p/r); float k1=length(p/(r*r)); return k0*(k0-1.)/max(k1,1e-5); }
float sb_ex(float d2,float z,float h){ vec2 w=vec2(d2,abs(z)-h); return min(max(w.x,w.y),0.)+length(max(w,0.)); }

/* ---------- deck: popsicle outline, kicks at both ends (nose kick scaled by kn), concave across ---------- */
float sb_deckH(vec2 u,float L,float W,float kn){ float k=max(abs(u.x)-(L-.13),0.); float s=u.x>0.?kn:1.;
  float c=clamp(u.y/W,-1.,1.); return k*k*2.6*s+.011*c*c; }
float sb_deckO(vec2 u,float L,float W){ return length(vec2(max(abs(u.x)-(L-W),0.),u.y))-W; }
float sb_deck(vec3 q,float L,float W,float kn){ /* bottom middle at the origin, length along x, width along z */
  float h=sb_deckH(q.xz,L,W,kn);
  return (sb_ex(sb_deckO(q.xz,L,W)+.002,q.y-h-.006,.004)-.002)*.72; }
/* the underside graphic: 0 plain maple, 1 abstract circle-wave-dots, 2 chevrons, 3 two-tone halves */
float sb_graphic(vec2 u,float g){
  if(g<.5) return .76+.1*(grain(vec3(u.x,0.,u.y),70.)-.5);
  if(g<1.5){ float c=length(u-vec2(-.14,.0))-.068; if(abs(c)<.0035) return .15; if(c<0.) return abs(c+.03)<.003?.2:.42;
    float w=u.y-.04*sin(u.x*20.+1.); if(abs(w)<.014&&u.x>-.06&&u.x<.3) return abs(w)>.010?.18:.3;
    if(u.x>.08&&u.x<.3&&u.y<-.02){ vec2 f=fract(u*36.)-.5; if(length(f)<.24) return .25; }
    if(u.x<-.24&&fract((u.x+u.y)*40.)<.4) return .4;
    return .86; }
  if(g<2.5){ float x=u.x-abs(u.y)*.9; if(abs(u.x)<.2){ float f=fract(x*14.); if(f<.35) return .28; } if(abs(abs(u.x)-.215)<.004) return .25; return .82; }
  return u.x>.02?.45:(u.x>-.005?.2:.85); }
float sbt_deck(vec3 q,float L,float W,float kn,float g){ float h=sb_deckH(q.xz,L,W,kn); float t=q.y-h;
  float o=sb_deckO(q.xz,L,W);
  if(t>.0095&&o<-.003) return .2+.07*vn(q.xz*1400.);                  /* grip tape */
  if(o>-.0035) return fract(t/.0017)<.32?.38:.8;                      /* the seven plies at the edge */
  if(t>.0095) return .22;
  vec2 bh=vec2(abs(abs(q.x)-.215)-.013,abs(q.z)-.02); if(length(bh)<.0048) return .05;      /* truck bolt holes */
  return sb_graphic(q.xz,g); }

/* ---------- truck, mounted way up: axle along z through the origin, baseplate top at y=.052, kingpin toward -x ---------- */
float sb_truck(vec3 q){
  float bp=sdRBox(q-vec3(.004,.047,0.),vec3(.033,.005,.029),.003);
  float bolt=1e3; for(int i=0;i<4;i++){ vec2 o=vec2(i<2?-.02:.026,mod(float(i),2.)<.5?-.016:.016); bolt=min(bolt,sdCylY(q-vec3(.004+o.x,.0425,o.y),.0035,.0025)); }
  float boss=sdRBox(q-vec3(-.012,.039,0.),vec3(.013,.007,.014),.004);
  float kp=sdCylY(q-vec3(-.016,.012,0.),.0032,.03);
  float bu=sdCylY(q-vec3(-.016,.028,0.),.0105,.0045)-.0015;
  float bl=sdCylY(q-vec3(-.016,-.007,0.),.009,.0035)-.0015;
  float wa=sdCylY(q-vec3(-.016,-.0125,0.),.0095,.0008);
  float nut=sdCylY(q-vec3(-.016,-.017,0.),.0058,.003);
  float hous=sdCapsule(q,vec3(0.,0.,-.078),vec3(0.,0.,.078),.0085);
  float body=sdRBox(q-vec3(-.006,.009,0.),vec3(.016,.011,.03),.008);
  float hg=smin(hous,body,.014);
  float pv=sdCapsule(q,vec3(.006,.012,0.),vec3(.02,.037,0.),.0055);
  float ax=sdCylZ(q,.004,.108);
  float nt=sdCylZ(vec3(q.x,q.y,abs(q.z)-.104),.0058,.0028);
  return min(min(min(bp,bolt),min(boss,kp)),min(min(min(bu,bl),min(wa,nut)),min(min(hg,pv),min(ax,nt)))); }
float sbt_truck(vec3 q){ if(q.y>.0415) return abs(q.y-.0415)<.0012?.3:.55;
  if(abs(q.x+.016)<.013&&(abs(q.y-.028)<.0062||abs(q.y+.007)<.005)) return .3;   /* urethane bushings */
  if(abs(q.z)>.1) return .35;
  if(q.y<-.011) return .4;
  return .7+.12*step(.75,fract(q.y*45.+q.x*20.)); }

/* ---------- wheel: axis along z, centre at the origin ---------- */
float sb_wheel(vec3 q,float R,float hw){
  float w=sdCylZ(q,R-.006,hw-.006)-.006; float r=length(q.xy);
  w=max(w,-max(r-.0115,-(abs(q.z)-hw+.004)));
  float br=sdCylZ(q,.011,hw-.005); return min(w,br); }
float sbt_wheel(vec3 q,float R,float hw){ float r=length(q.xy);
  if(r<.0118){ if(r<.0045) return .2; if(abs(r-.0085)<.0007) return .3; return .52; }
  if(abs(q.z)<hw-.005&&r>R-.004) return .9;
  if(abs(r-.0195)<.0008) return .55; return .84; }

/* ---------- a complete board on its wheels: returns (distance, part: 0 deck, 1 trucks, 2 wheels) ---------- */
vec2 sb_board(vec3 q,float L,float W,float kn,float wb,float R,float hw){
  vec3 t=vec3(abs(q.x)-wb,q.y-R,q.z);
  float tr=sb_truck(t); float wh=sb_wheel(vec3(t.x,t.y,abs(q.z)-.088),R,hw);
  float dk=sb_deck(q-vec3(0.,R+.052,0.),L,W,kn);
  vec2 r=vec2(dk,0.); if(tr<r.x) r=vec2(tr,1.); if(wh<r.x) r=vec2(wh,2.); return r; }
float sbt_board(vec3 q,float part,float L,float W,float kn,float wb,float R,float hw,float g){
  if(part<.5) return sbt_deck(q-vec3(0.,R+.052,0.),L,W,kn,g);
  vec3 t=vec3(abs(q.x)-wb,q.y-R,q.z);
  if(part<1.5) return sbt_truck(t);
  return sbt_wheel(vec3(t.x,t.y,abs(q.z)-.088),R,hw); }

/* ---------- camcorder (a shoulder-less home video camera), lens toward -x ---------- */
float sb_camcorder(vec3 q){
  float b=sdRBox(q-vec3(.01,.065,0.),vec3(.095,.06,.045),.016);
  float ln=sdCylX(q-vec3(-.11,.07,0.),.03,.026)-.002;
  float hood=sdCylX(q-vec3(-.143,.07,0.),.035,.009)-.002; hood=max(hood,-sdCylX(q-vec3(-.156,.07,0.),.029,.02));
  float gl=sdCylX(q-vec3(-.146,.07,0.),.029,.001);
  float vf=sdCapsule(q,vec3(-.005,.137,-.03),vec3(.1,.137,-.03),.015);
  float ec=sdCylX(q-vec3(.113,.137,-.03),.019,.011)-.003;
  float hd=sdCapsule(q,vec3(-.065,.17,.014),vec3(.05,.17,.014),.0085);
  float p1=sdCapsule(q,vec3(-.065,.12,.014),vec3(-.065,.17,.014),.0075), p2=sdCapsule(q,vec3(.05,.12,.014),vec3(.05,.17,.014),.0075);
  float mic=sdCylX(q-vec3(-.07,.135,.024),.0095,.024)-.002;
  float bt=sdRBox(q-vec3(.106,.055,-.016),vec3(.006,.01,.009),.003);
  float st=sdRBox(q-vec3(.0,.065,.047),vec3(.06,.03,.006),.005);    /* hand strap */
  return min(min(min(b,ln),min(hood,gl)),min(min(min(vf,ec),min(hd,min(p1,p2))),min(min(mic,bt),st))); }
float sbt_camcorder(vec3 q){ vec2 lr=q.yz-vec2(.07,0.); float r=length(lr);
  if(q.x<-.082&&r<.04){ if(q.x<-.145&&r<.03){ if(length(lr-vec2(.01,-.01))<.006) return .9; if(abs(r-.021)<.0015) return .4; return .07; }
    if(q.x<-.133) return .3; return fract(q.x/.007)<.3?.15:.32; }
  if(q.y>.122&&q.z<-.012) return q.x>.1?.14:(fract(q.x/.012)<.15?.15:.28);
  if(q.y>.155) return .3;
  if(q.z>.04&&abs(q.y-.065)<.036&&abs(q.x)<.066) return fract(q.x/.006)<.3?.25:.4;
  if(q.z<-.043){ vec2 u=q.xy-vec2(.02,.062); float c=sb_r2(u,vec2(.056,.034),.008);
    if(abs(c)<.0015) return .15; if(c<0.&&abs(u.y-.012)<.0012&&abs(u.x)<.035) return .55;
    if(u.x>.068&&abs(u.y)<.03&&fract(u.y/.006)<.35) return .18; }
  if(q.x>.104&&abs(q.y-.055)<.012&&abs(q.z+.016)<.01) return .2;
  return .44+.05*vn(q.xy*400.); }

/* ---------- VHS cassette; sl>.5: in its cardboard sleeve ---------- */
float sb_vhs(vec3 q,float sl){ vec3 h=sl>.5?vec3(.0965,.0145,.053):vec3(.0935,.0125,.0515);
  float d=sdRBox(q-vec3(0.,h.y,0.),h,.0018);
  if(sl<.5) d=max(d,-sdRBox(q-vec3(0.,2.*h.y,-.006),vec3(.032,.0016,.018),.002));
  return d; }
float sbt_vhs(vec3 q,float sl){ vec2 u=q.xz;
  if(sl>.5){ if(q.y>.0275){ if(abs(sb_r2(u,vec2(.084,.041),.004))<.0013) return .3; if(length(u-vec2(-.045,.008))<.016) return abs(length(u-vec2(-.045,.008))-.011)<.002?.85:.4;
      if(u.x>-.02&&u.x<.07&&u.y<.03&&u.y>-.03&&fract(u.y/.009)<.28) return .5; return .88; }
    if(q.z<-.051){ if(abs(q.y-.0145)<.0012&&q.x>-.06&&q.x<.04) return .3; if(abs(q.x-.07)<.008&&abs(q.y-.0145)<.006) return .3; } return .8; }
  if(q.y>.023){ if(abs(u.x)<.034&&abs(u.y+.006)<.02){ float r1=length(u-vec2(-.017,-.006)),r2=length(u-vec2(.017,-.006)); float m=min(r1,r2);
      if(m<.013) return m<.004?.6:(fract(m/.0022)<.4?.18:.34); return .6; }
    if(u.y>.02&&abs(u.x)<.075) return (fract(u.y/.006)<.25&&abs(u.x)<.055)?.5:.9; return .2; }
  if(q.z<-.0495&&abs(q.y-.0125)<.0075&&abs(q.x)<.08) return (abs(q.y-.0125)<.001&&abs(q.x)<.05)?.4:.9;
  return .2+.05*vn(q.xy*500.); }

/* ---------- grind rail: round bar along x at height H, square legs, foot bars, braces ---------- */
float sb_rail(vec3 q,float L,float H){
  float bar=sdCapsule(q,vec3(-L,H,0.),vec3(L,H,0.),.022);
  vec3 a=vec3(abs(q.x)-(L-.1),q.y,q.z); vec3 b=vec3(a.x,a.y,abs(a.z));
  float leg=sdRBox(a-vec3(0.,H*.5,0.),vec3(.015,H*.5,.015),.004);
  float ft=sdRBox(a-vec3(0.,.005,0.),vec3(.022,.005,.13),.002);
  float br=sdCapsule(b,vec3(0.,.012,.11),vec3(0.,.11,.016),.0055);
  float bo=sdCylY(b-vec3(0.,.011,.115),.0045,.002);
  float sd=sdCylY(a-vec3(0.,H-.026,0.),.02,.004)-.001;          /* weld collar under the bar */
  return min(min(bar,leg),min(min(ft,br),min(bo,sd))); }
float sbt_rail(vec3 q,float L,float H){
  if(q.y>H-.024&&abs(q.x)<L+.03){ float top=q.y-H; if(top>.015){ float s=fbm(vec2(q.x*30.,q.z*80.)); if(s>.62) return .42; if(fract(q.z*700.+q.x*3.)<.25) return .55; }
    return .72; }
  if(q.y<.011) return abs(q.y-.0105)<.0012?.25:.42;
  return .5+.06*vn(q.xy*300.); }

/* ---------- a block of skate wax with one worn corner ---------- */
float sb_wax(vec3 q){ float d=sdRBox(q-vec3(0.,.016,0.),vec3(.036,.016,.025),.008);
  d=smax(d,dot(q-vec3(.026,.03,0.),normalize(vec3(.7,.75,.1))),.005); return d+.0012*(fbm(q.xz*140.+q.y*60.)-.5); }
float sbt_wax(vec3 q){ if(dot(q-vec3(.026,.03,0.),normalize(vec3(.7,.75,.1)))>-.003) return fract(q.z/.004+q.x*40.)<.3?.48:.62;
  return .87-.07*fbm(q.xy*220.); }

/* ---------- spinning top, steel tip at the origin, axis up ---------- */
float sb_top(vec3 q){
  float tip=sdCone(q-vec3(0.,.0075,0.),.0006,.0045,.0075);
  float lo=sdCone(q-vec3(0.,.042,0.),.004,.06,.03);
  float sh=sb_ell(q-vec3(0.,.073,0.),vec3(.066,.022,.066));
  float bd=smin(lo,sh,.008);
  float col=sdCylY(q-vec3(0.,.094,0.),.02,.004)-.002;
  float st=sdCylY(q-vec3(0.,.108,0.),.0085,.018)-.002; float kn=length(q-vec3(0.,.132,0.))-.0125;
  return min(min(tip,bd),min(col,min(st,kn))); }
float sbt_top(vec3 q){ float y=q.y; if(y<.013) return .3;
  if(y>.09) return y>.12?.55:(y<.1?.42:.72);
  if(abs(y-.073)<.0035) return .2;
  float a=atan(q.z,q.x); if(y>.077&&fract(a*8./6.2832)<.14) return .32;
  if(abs(y-.052)<.0035||abs(y-.034)<.0028) return .3;
  return .8+.08*(grain(vec3(y*6.,0.,length(q.xz)),50.)-.5); }
/* a coiled top string lying on the table */
float sb_cord(vec3 q){ float d=1e3; for(int i=0;i<3;i++){ float f=float(i); vec3 c=q-vec3(.004*f,.003+.0035*f,-.003*f);
    d=min(d,sdTorus(c,.034-.004*f,.0028)); }
  d=min(d,sdCapsule(q,vec3(.03,.003,-.015),vec3(.1,.003,-.05),.0028)); return d; }
float sbt_cord(vec3 q){ return fract((q.x+q.z)*260.+q.y*400.)<.35?.35:.6; }

/* ---------- a model park bench with metal skate stoppers on the seat edge ---------- */
float sb_bench(vec3 q){ float L=.28; float d=1e3;
  for(int i=0;i<4;i++){ float z=-.046+float(i)*.03; d=min(d,sdRBox(q-vec3(0.,.104,z),vec3(L,.0055,.0125),.003)); }
  for(int i=0;i<3;i++){ float y=.148+float(i)*.033; vec3 b=q-vec3(0.,y,.074+y*.146); b.yz=rot(-.145)*b.yz; d=min(d,sdRBox(b,vec3(L,.012,.0045),.003)); }
  vec3 s=vec3(abs(q.x)-(L-.04),q.y,q.z);
  float fr=sdRBox(s-vec3(0.,.048,-.05),vec3(.007,.048,.008),.003);
  float bl=sdCapsule(s,vec3(0.,.004,.06),vec3(0.,.25,.096),.0075);
  float rl=sdRBox(s-vec3(0.,.094,.005),vec3(.0065,.006,.066),.002);
  float ft=sdRBox(s-vec3(0.,.004,.005),vec3(.011,.004,.07),.002);
  float ar=sdCapsule(s,vec3(0.,.15,-.055),vec3(0.,.15,.078),.0065);
  float ap=sdCapsule(s,vec3(0.,.1,-.05),vec3(0.,.15,-.052),.0062);
  return min(d,min(min(fr,bl),min(min(rl,ft),min(ar,ap)))); }
float sb_stoppers(vec3 q){ float d=1e3; for(int i=0;i<3;i++){ float x=-.16+float(i)*.16; vec3 c=q-vec3(x,.11,-.054);
    float k=sdRBox(c-vec3(0.,-.004,-.002),vec3(.013,.011,.012),.004); float hu=sb_ell(c-vec3(0.,.006,.002),vec3(.012,.013,.014));
    d=min(d,min(k,hu)); } return d; }
float sbt_bench(vec3 q){ if(q.y>.095&&q.y<.112&&abs(q.x)<.27) return fract(q.x/.07)<.02?.4:.72+.12*(grain(vec3(q.x,0.,q.z),90.)-.5);
  if(q.y>.13&&abs(q.x)<.27&&q.z>.07) return .7+.12*(grain(vec3(q.x,0.,q.y),90.)-.5);
  return .32+.05*vn(q.xy*300.); }
float sbt_stoppers(vec3 q){ return q.y>.124?.7:.3; }

/* ---------- a rolled map tied with a band, along x ---------- */
float sb_roll(vec3 q,float L){ float d=sdCylX(q-vec3(0.,.021,0.),.021,L)-.001; float b=sdCylX(q-vec3(L*.3,.021,0.),.0225,.005); return min(d,b); }
float sbt_roll(vec3 q,float L){ if(abs(q.x-L*.3)<.006) return .3; vec2 e=q.yz-vec2(.021,0.);
  if(abs(q.x)>L-.0005){ float r=length(e); return fract(r/.0028+atan(e.y,e.x)/6.2832)<.3?.35:.88; } return .88-.05*fbm(q.xz*60.); }

/* ---------- maple veneer strips, a little fanned (seven plies), pivot near -x ---------- */
vec3 sb_plyQ(vec3 q,float i){ vec3 c=q-vec3(-.1,.0036*i,0.); c.xz=rot((i-3.)*.075)*c.xz; return c-vec3(.1,0.,0.); }
float sb_plies(vec3 q){ float d=1e3; for(int i=0;i<7;i++){ vec3 c=sb_plyQ(q,float(i)); d=min(d,sdRBox(c-vec3(0.,.0018,0.),vec3(.13,.0018,.034),.0008)); } return d; }
float sbt_plies(vec3 q){ float best=1e3, bi=0.; for(int i=0;i<7;i++){ vec3 c=sb_plyQ(q,float(i)); float d=sdRBox(c-vec3(0.,.0018,0.),vec3(.13,.0018,.034),.0008); if(d<best){ best=d; bi=float(i); } }
  vec3 c=sb_plyQ(q,bi);
  if(c.y<.0028) return mod(bi,2.)<.5?.55:.7;                           /* the cut edge of each ply */
  float base=bi==3.?.5:.86;
  float g=mod(bi,2.)<.5?grain(vec3(c.x,0.,c.z),120.):grain(vec3(c.z,0.,c.x),120.);
  if(g>.86) return base-.3; return base-.04*g; }

/* ---------- loose bearing lying flat ---------- */
float sb_bearing(vec3 q){ float d=sdCylY(q-vec3(0.,.0035,0.),.011,.0035)-.0005; return max(d,-(length(q.xz)-.0042)); }
float sbt_bearing(vec3 q){ float r=length(q.xz); if(q.y>.0065){ if(r>.0095) return .5; if(r<.0058) return .45; return abs(r-.0077)<.0006?.25:.8; } return .5; }

/* ---------- durometer: a round dial gauge lying face up, presser foot toward +x ---------- */
float sb_duro(vec3 q){ float b=sdCylY(q-vec3(0.,.011,0.),.03,.009)-.002; float bz=sdTorus(q-vec3(0.,.0215,0.),.0295,.0026);
  float ft=sdRBox(q-vec3(.044,.0085,0.),vec3(.017,.0085,.012),.003); float pin=sdCylX(q-vec3(.064,.0085,0.),.0018,.006); return min(min(b,bz),min(ft,pin)); }
float sbt_duro(vec3 q){ float r=length(q.xz); if(q.y>.0195&&r<.0272){ float a=atan(q.z,q.x);
    if(r>.021&&fract(a*40./6.2832+.5)<.14) return .22; if(r>.0175&&fract(a*8./6.2832+.5)<.05) return .1;
    if(sdSeg2(q.xz,vec2(0.),.019*vec2(cos(2.3),sin(2.3)))<.0011) return .06; if(r<.0028) return .2; return .95; }
  if(r>.027&&r<.033&&q.y>.019) return .6; if(q.x>.028) return .52; return .36; }

/* ---------- spiral notebook lying open, spine along z ---------- */
float sb_notebook(vec3 q){ float x=abs(q.x);
  float pg=sdRBox(vec3(x-.079,q.y-.0045-.002*smoothstep(.0,.03,x),q.z),vec3(.072,.004,.105),.0018);
  float cv=sdRBox(q-vec3(0.,.0012,0.),vec3(.157,.0012,.11),.0008);
  vec3 r=vec3(q.x,q.y-.008,mod(q.z+.1,.0125)-.00625); float sp=length(vec2(length(r.xy)-.0075,r.z))-.0011; sp=max(sp,abs(q.z)-.1);
  return min(min(pg,cv),sp); }
float sbt_notebook(vec3 q){ if(q.y<.0026) return .4; if(length(vec2(q.x,q.y-.008))>.0055&&abs(q.x)<.009) return .3;
  float x=abs(q.x); if(abs(q.x)<.009) return .3; vec2 u=vec2(x-.079,q.z);
  if(q.x<0.){ float row=floor((u.y+.09)/.022); vec2 c=vec2(u.x+.05,fract((u.y+.09)/.022)*.022-.011);
    if(u.y>-.09&&u.y<.09){ if(abs(max(abs(c.x),abs(c.y))-.005)<.0011) return .25;
      if(mod(row,3.)<1.5&&(sdSeg2(c,vec2(-.004,.0),vec2(-.001,-.004))<.0011||sdSeg2(c,vec2(-.001,-.004),vec2(.006,.006))<.0011)) return .15;
      if(u.x>-.038&&u.x<.055-.02*mod(row,2.)&&abs(c.y)<.0011) return .55; } }
  else { vec2 v=u-vec2(.0,.0);
    if(abs(sb_r2(v-vec2(0.,-.01),vec2(.045,.0035),.0035))<.0011) return .2;
    if(abs(length(v-vec2(-.028,-.02))-.005)<.001||abs(length(v-vec2(.028,-.02))-.005)<.001) return .2;
    float ar=length(v-vec2(0.,-.01))-.05; float an=atan(v.y+.01,v.x); if(v.y>-.0&&abs(ar)<.0011&&fract(an*9./3.14159)<.55) return .3;
    if(u.y<-.05&&u.y>-.09&&abs(u.x)<.055&&fract(u.y/.01)<.13) return .55; }
  return .95; }

/* ---------- skate helmet resting on its rim, front -z, vents on top, strap loop in front ---------- */
float sb_helmetV(vec3 q){ float v=1e3; for(int i=0;i<4;i++){ float x=-.042+float(i)*.028; float y=.125*sqrt(1.-x*x/.01);
    v=min(v,sdCapsule(q,vec3(x,y,-.03),vec3(x,y,.05),.0085)); }
  return v; }
float sb_helmet(vec3 q){ float d=sb_ell(q,vec3(.1,.125,.115)); d=max(abs(d)-.006,-q.y);
  d=max(d,-sb_helmetV(q));
  float rim=sdTorus(vec3(q.x,q.y-.005,q.z*.87),.1,.006);
  float st=sdTorus(vec3(q.x,q.y-.0025,(q.z+.13)),.055,.0024); st=max(st,q.z+.11);
  float bk=sdCapsule(q,vec3(-.025,.003,-.185),vec3(.025,.003,-.185),.004);
  return min(min(d,rim),min(st,bk)); }
float sbt_helmet(vec3 q){ if(q.z<-.112&&q.y<.008) return .3; if(q.y<.012) return .25;
  if(sb_helmetV(q)<.0015) return .1;
  return .55+.05*vn(q.xy*300.); }

/* ---------- wrist guard lying along x: soft sleeve, splint plate, two straps ---------- */
float sb_guard(vec3 q){ float s=sb_ell(q-vec3(0.,.018,0.),vec3(.085,.019,.047));
  float sp=sdRBox(q-vec3(.005,.039,0.),vec3(.066,.0035,.016),.003);
  float th=sb_ell(q-vec3(-.06,.016,-.038),vec3(.024,.012,.014));
  float sa=sb_ell(q-vec3(-.03,.018,0.),vec3(.01,.022,.05)); float sb=sb_ell(q-vec3(.04,.018,0.),vec3(.01,.021,.049));
  return min(min(s,sp),min(th,min(sa,sb))); }
float sbt_guard(vec3 q){ if(abs(q.x+.03)<.013||abs(q.x-.04)<.013) return abs(abs(q.x+.03)-.011)<.0015||abs(abs(q.x-.04)-.011)<.0015?.15:.3;
  if(q.y>.0365&&abs(q.z)<.02) return .8; return .5+.1*step(.5,fract((q.x+q.z)*200.)); }

/* ---------- quarter-pipe ramp model: transition faces -z, width along x ---------- */
#define SB_RR .15
#define SB_RH .13
#define SB_RZT .1487
#define SB_RDK .075
#define SB_RW .15
float sb_ramp(vec3 q){ vec2 u=vec2(q.z,q.y);
  float bx=sb_r2(u-vec2((SB_RZT+SB_RDK)*.5,SB_RH*.5),vec2((SB_RZT+SB_RDK)*.5,SB_RH*.5),.0015);
  float cv=SB_RR-length(u-vec2(0.,SB_RR));
  float d=sb_ex(max(bx,cv),q.x,SB_RW);
  float cp=sdCylX(q-vec3(0.,SB_RH-.001,SB_RZT-.002),.0055,SB_RW+.004);
  vec3 b=vec3(abs(q.x)-SB_RW+.012,q.y,q.z);
  float po=sdCapsule(b,vec3(0.,SB_RH,SB_RZT+SB_RDK-.01),vec3(0.,SB_RH+.06,SB_RZT+SB_RDK-.01),.0035);
  float rl=sdCapsule(q,vec3(-SB_RW+.012,SB_RH+.06,SB_RZT+SB_RDK-.01),vec3(SB_RW-.012,SB_RH+.06,SB_RZT+SB_RDK-.01),.0035);
  return min(min(d,cp),min(po,rl)); }
float sbt_ramp(vec3 q){ vec2 u=vec2(q.z,q.y);
  if(q.y>SB_RH+.004&&q.z>SB_RZT+SB_RDK-.02) return .45;               /* back rail */
  if(length(vec2(q.z-SB_RZT+.002,q.y-SB_RH+.001))<.0065) return .62;  /* steel coping */
  if(abs(q.x)>SB_RW-.0008){ float c=length(u-vec2(0.,SB_RR))-SB_RR; if(c<.004&&c>0.&&fract(atan(u.y-SB_RR,u.x)*30./3.14159)<.18) return .3;
    if(fract(q.y/.012)<.06) return .62; return .78; }
  if(q.y>SB_RH-.0008) return fract(q.z/.018)<.08?.45:.82;
  float a=atan(SB_RR-q.y,q.z); if(fract(a*7./1.5708)<.025) return .4;
  if(fract(a*7./1.5708+.5)<.04&&fract(q.x/.03)<.12) return .35;
  return .85-.04*fbm(q.xz*40.); }
/* a hand-drawn skatepark plan, paper coordinates u (metres) */
float sb_parkplan(vec2 u){ float L=1e3;
  vec2 b=u-vec2(-.03,.04); float kd=min(length(b)-.035,length(b-vec2(.04,-.012))-.026); L=min(L,abs(kd)); L=min(L,abs(kd+.008)+step(.0,kd+.008)*0.);
  L=min(L,abs(sb_r2(u-vec2(.045,-.05),vec2(.03,.008),.001)));
  L=min(L,sdSeg2(u,vec2(-.075,-.04),vec2(-.02,-.07))); L=min(L,length(u-vec2(-.075,-.04))-.0015); L=min(L,length(u-vec2(-.02,-.07))-.0015);
  vec2 s=u-vec2(-.06,-.1); if(abs(s.x)<.02&&abs(s.y)<.012&&fract(s.x/.008)<.15) L=0.; L=min(L,abs(sb_r2(s,vec2(.02,.012),.0005)));
  float qa=abs(length(u-vec2(.06,.075))-.025); if(u.y>.075) qa=1e3; L=min(L,qa); L=min(L,sdSeg2(u,vec2(.035,.075),vec2(.085,.075)));
  L=min(L,abs(sb_r2(u,vec2(.088,.122),.002)));
  if(abs(u.y+.115)<.0008&&abs(u.x)<.05) L=0.;
  return L; }
/* ---------- a folded zine (booklet) lying flat, spine along -x ---------- */
float sb_zine(vec3 q){ float b=.0015*sin((q.x+.07)*20.); return sdRBox(q-vec3(0.,.0025+b,0.),vec3(.072,.0025,.1),.0012); }
float sbt_zine(vec3 q,float k){ vec2 u=q.xz; if(q.y<.0035+.0015*sin((q.x+.07)*20.)) return .85;
  if(abs(u.x+.071)<.002&&(abs(u.y-.05)<.006||abs(u.y+.05)<.006)) return .2;
  if(k<.5){ float s=length(u-vec2(.01,.02)); float a=atan(u.y-.02,u.x-.01); if(s<.045&&fract(a*12./6.2832)<.5) return s<.015?.2:.4; }
  else if(k<1.5){ vec2 v=rot(.5)*u; if(abs(v.x)<.05&&fract(v.y/.02)<.45&&abs(v.y)<.07) return .3; }
  else { if(abs(sb_r2(u-vec2(0.,.02),vec2(.045,.045),.01))<.003) return .25; if(length(u-vec2(0.,.02))<.018) return .4; }
  if(u.y<-.06&&u.y>-.088&&abs(u.x)<.05&&fract(u.y/.009)<.28) return .45; return .92; }
/* ---------- a glass jar of paint brushes ---------- */
float sb_jar(vec3 q){ float j=sdCylY(q-vec3(0.,.05,0.),.04,.05)-.002; j=max(abs(j)-.0025,-(q.y-.006)+0.*q.y); j=max(j,q.y-.1);
  float base=sdCylY(q-vec3(0.,.004,0.),.04,.004); float rim=sdTorus(q-vec3(0.,.1,0.),.041,.003); return min(min(j,base),rim); }
float sbt_jar(vec3 q){ if(q.y>.096) return .55; if(abs(q.y-.065)<.0012) return .4; float a=atan(q.z,q.x); if(fract(a*3./6.2832+.2)<.05) return .98; return q.y<.065?.8:.9; }
vec3 sb_brushQ(vec3 q,float i){ vec3 c=q-vec3(.01*(i-1.),.01,.006*(1.-i)); float a=(i-1.)*.3; c.xy=rot(a)*c.xy; c.yz=rot(.08*(i-1.)+.05)*c.yz; return c; }
float sb_brush(vec3 c,float len){ float h=sdCapsule(c,vec3(0.),vec3(0.,len,0.),.0045); float f=sdCylY(c-vec3(0.,len+.012,0.),.0052,.012)-.0006;
  float br=sdCone(c-vec3(0.,len+.036,0.),.005,.0012,.012)-.0008; return min(min(h,f),br); }
float sb_brushes(vec3 q){ float d=1e3; for(int i=0;i<3;i++){ float fi=float(i); d=min(d,sb_brush(sb_brushQ(q,fi),.16+.03*mod(fi*2.,3.))); } return d; }
float sbt_brushes(vec3 q){ float best=1e3,bi=0.; for(int i=0;i<3;i++){ float fi=float(i); float d=sb_brush(sb_brushQ(q,fi),.16+.03*mod(fi*2.,3.)); if(d<best){best=d;bi=fi;} }
  vec3 c=sb_brushQ(q,bi); float len=.16+.03*mod(bi*2.,3.);
  if(c.y>len+.024) return fract(atan(c.z,c.x)*4.)<.4?.2:.32; if(c.y>len) return .78+.15*step(.6,fract(atan(c.z,c.x)*.6)); return bi==1.?.62:.3; }
/* ---------- a medal lying flat with its ribbon in a loose loop (plain stripes, no flag, no rings) ---------- */
float sb_medal(vec3 q){ float m=sdCylY(q-vec3(0.,.0045,0.),.04,.0035)-.001;
  float rim=sdTorus(q-vec3(0.,.009,0.),.036,.0022);
  float lp=sdCylY(q-vec3(0.,.007,.044),.008,.002)-.0015;
  vec2 u=(q.xz-vec2(0.,.13))/vec2(.055,.085); float e=abs(length(u)-1.)*.055-.015;
  float rb=sb_ex(e,q.y-.0025,.0012); return min(min(m,rim),min(lp,rb)); }
float sbt_medal(vec3 q){ float r=length(q.xz);
  if(r<.042&&q.z<.041){ if(abs(r-.03)<.0015) return .3; if(r<.012) return abs(r-.008)<.0013?.3:.6; if(q.y>.0085) return .88; return .7; }
  if(length(q.xz-vec2(0.,.044))<.012) return .5;
  vec2 u=(q.xz-vec2(0.,.13))/vec2(.055,.085); float e=(length(u)-1.)*.055;
  if(abs(e)>.0115) return .3; if(abs(e)<.004) return .35; return .85; }
