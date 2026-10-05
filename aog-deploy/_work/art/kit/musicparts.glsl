/* AOG-MUSIC-PARTS-V1 (2026-10-04) — instruments for the music still lifes (kit/scenes/music-*-still.glsl):
   an acoustic guitar and an electric bass (each built in its own frame: x across, y along the length from the
   bottom of the body, z out of the top), the tubular stand they lean on, drum shells with hoops and lugs, cymbals,
   tripod stands, a studio microphone and headphones. Sizes in metres. Needs lib.glsl and studio.glsl first. */

float elli(vec2 p,vec2 ab){ return (length(p/ab)-1.)*min(ab.x,ab.y); }
/* a 2D shape given thickness 2h along z, its edges rounded by r */
float extrude(float d2,float z,float h,float r){ vec2 e=vec2(d2+r,abs(z)-h+r); return min(max(e.x,e.y),0.)+length(max(e,0.))-r; }
float segD(vec3 p,vec3 a,vec3 b){ vec3 pa=p-a,ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }

/* ================= the acoustic guitar (a dreadnought) =================
   body 0 … .51, lower bout .40 wide, waist .26, upper bout .29; 14 frets clear of the body, nut at .868,
   saddle at .223 (scale .645); headstock tipped back 14° from the nut. Top at z = +.05. */
#define AC_NUT .868
#define AC_SAD .223
float acBody2(vec2 v){
  float a=elli(v-vec2(0.,.17),vec2(.2,.17));
  float b=elli(v-vec2(0.,.38),vec2(.145,.13));
  return smin(a,b,.035); }
float acHalfW(float y){ return mix(.0275,.0225,clamp((y-.51)/(AC_NUT-.51),0.,1.)); }
vec3 acHead(vec3 q){ vec3 h=q-vec3(0.,AC_NUT,.05); h.yz=rot(-.245)*h.yz; return h; }   /* headstock frame: y up from the nut */
vec2 acoustic(vec3 q,float id0){
  vec2 r=vec2(1e3,0.);
  float bb=sdBox(q-vec3(0.,.56,0.),vec3(.25,.62,.09));
  if(bb>.3) return vec2(bb,id0);
  /* body: top plate (id0) on sides and back (id0+1) */
  float d2=acBody2(q.xy);
  float body=extrude(d2,q.z,.05,.012);
  float hole=length(q.xy-vec2(0.,.375))-.05;
  body=max(body,-max(hole,-(q.z-.02)));                                  /* the sound hole, into the dark inside */
  r=U(r,body,q.z>.043&&d2<-.004?id0:id0+1.);
  /* bridge and saddle */
  float br=sdRBox(q-vec3(0.,AC_SAD-.012,.055),vec3(.078,.013,.005),.004);
  br=min(br,sdRBox(q-vec3(0.,AC_SAD,.0615),vec3(.037,.0016,.0025),.001));
  r=U(r,br,id0+5.);
  /* neck: rounded back, fretboard on top, heel into the body */
  float y=q.y, hw=acHalfW(y);
  float nk=sdRBox(vec3(q.x,0.,q.z-.04),vec3(hw,1.,.013),.011);
  nk=max(nk,abs(y-(.5+AC_NUT)*.5)-(AC_NUT-.5)*.5);
  nk=smin(nk,sdRBox(q-vec3(0.,.50,.0),vec3(.028,.035,.045),.02),.02);  /* heel */
  float fb=sdRBox(vec3(q.x,q.y-(AC_NUT+.425)*.5,q.z-.0555),vec3(acHalfW(q.y)+.0005,(AC_NUT-.425)*.5,.0028),.0012);
  r=U(r,min(nk,fb),id0+2.);
  /* nut */
  r=U(r,sdRBox(q-vec3(0.,AC_NUT,.0585),vec3(.0235,.003,.003),.001),id0+5.);
  /* headstock: a plate .19 long, tuners three a side with buttons out sideways */
  vec3 h=acHead(q);
  float w=mix(.026,.042,smoothstep(0.,.05,h.y));
  float hp=sdRBox(vec3(h.x,h.y-.095,h.z+.008),vec3(w,.095,.008),.006);
  hp=smax(hp,length(vec2(h.x,h.y-.12))-.11,.01);
  r=U(r,hp,id0+3.);
  float hy=clamp(floor((h.y-.06)/.042+.5),0.,2.)*.042+.06;
  vec3 t=vec3(abs(h.x),h.y-hy,h.z);
  float tu=sdCylZ(t-vec3(.028,0.,.008),.0042,.009);                       /* post through the face */
  tu=min(tu,sdRBox(t-vec3(.038,0.,-.023),vec3(.009,.008,.007),.003));     /* gear housing behind */
  tu=min(tu,sdCylX(t-vec3(.056,0.,-.023),.0025,.012));                    /* shaft */
  tu=min(tu,sdRBox(t-vec3(.072,0.,-.023),vec3(.006,.011,.0035),.0035));   /* button */
  r=U(r,tu,id0+4.);
  return r; }
/* tone of each part: k = id - id0, q in the guitar's frame */
float acTone(float k,vec3 q){
  if(k==0.){
    float hole=length(q.xy-vec2(0.,.375));
    if(hole<.05) return .05;
    if(abs(hole-.062)<.0022||abs(hole-.069)<.0012) return .35;           /* rosette */
    /* the strings over the top */
    float s=(q.y-AC_SAD)/(AC_NUT-AC_SAD);
    if(q.y>AC_SAD&&q.y<.43){ float sp=mix(.0105,.0085,s); float gx=q.x/sp+2.5; if(abs(gx-floor(gx+.5))<.07&&abs(q.x)<sp*2.7) return .3; }
    /* pickguard (teardrop under the hole, treble side) */
    if(elli(q.xy-vec2(.055,.315),vec2(.05,.07))<0.&&hole>.072) return .5;
    if(acBody2(q.xy)>-.008) return .45;                                 /* binding */
    return .84+.05*grain(vec3(q.x*.2,q.y*6.,0.),40.); }
  if(k==1.) return .42+.08*grain(vec3(q.x,q.y*.3,q.z)*2.,30.);
  if(k==2.){
    if(q.z>.054&&q.y>.425&&q.y<AC_NUT){
      float f=log2(max(1e-4,(AC_NUT-AC_SAD)/max(1e-4,q.y-AC_SAD)))*12.;    /* fret number at this point */
      if(abs(f-floor(f+.5))*(AC_NUT-AC_SAD)*.0578/(1.+f*.06)<.0007&&f>.5) return .7;
      float sp=mix(.0105,.0085,(q.y-AC_SAD)/(AC_NUT-AC_SAD)); float gx=q.x/sp+2.5;
      if(abs(gx-floor(gx+.5))<.07&&abs(q.x)<sp*2.7) return .55;
      float m=floor(f+.5); if((m==3.||m==5.||m==7.||m==9.)&&length(vec2(q.x,q.y-(AC_SAD+(AC_NUT-AC_SAD)*exp2(-(m-.5)/12.))))<.004) return .8;
      return .36; }
    return .5; }
  if(k==3.) return .25;
  if(k==4.) return .72;
  if(k==5.) return .18;
  return .6; }

/* ================= the electric bass (a P-style bass) =================
   body 0 … .55 with a long upper horn on the bass side (−x) and a short one on the treble side; scale .864,
   bridge at .09, nut at .954; a flat headstock with four tuners on the bass side. Top at z = +.022. */
#define BS_NUT .954
#define BS_SAD .09
float bsBody2(vec2 v){
  float a=elli(v-vec2(.0,.15),vec2(.175,.15));
  float b=elli(v-vec2(.0,.31),vec2(.135,.11));
  float d=smin(a,b,.03);
  d=smin(d,length(v-vec2(-.075,.34)-vec2(-.012,.17)*clamp(dot(v-vec2(-.075,.34),vec2(-.012,.17))/.029,0.,1.))-.045,.04);
  d=smin(d,length(v-vec2(.075,.33)-vec2(.006,.10)*clamp(dot(v-vec2(.075,.33),vec2(.006,.10))/.01,0.,1.))-.04,.04);
  d=smax(d,-(length(v-vec2(0.,.505))-.058),.025);                          /* the cutaway between the horns */
  d=smax(d,-(length(v-vec2(-.215,.255))-.055),.03);                        /* the offset waist */
  d=smax(d,-(length(v-vec2(.215,.24))-.06),.03);
  return d; }
float bsHalfW(float y){ return mix(.032,.0215,clamp((y-.42)/(BS_NUT-.42),0.,1.)); }
vec2 bassGtr(vec3 q,float id0){
  vec2 r=vec2(1e3,0.);
  float bb=sdBox(q-vec3(0.,.6,0.),vec3(.25,.66,.06));
  if(bb>.3) return vec2(bb,id0);
  float d2=bsBody2(q.xy);
  float body=extrude(d2,q.z,.022,.009);
  r=U(r,body,q.z>.017&&d2<-.004?id0:id0+1.);
  /* pickups (split), bridge plate, saddles, two knobs and the jack */
  vec3 pu=q-vec3(-.016,.30,.024); pu.xy=rot(.1)*pu.xy;
  float hw=sdRBox(pu,vec3(.022,.0085,.006),.004);
  pu=q-vec3(.016,.27,.024); pu.xy=rot(.1)*pu.xy; hw=min(hw,sdRBox(pu,vec3(.022,.0085,.006),.004));
  hw=min(hw,sdRBox(q-vec3(0.,BS_SAD,.0235),vec3(.034,.034,.0025),.0015));
  float sx=clamp(floor(q.x/.019+2.),0.,3.); hw=min(hw,sdRBox(q-vec3((sx-1.5)*.019,BS_SAD+.004,.03),vec3(.0065,.012,.004),.002));
  vec2 kc=q.xy-vec2(.105,.13); float kn=clamp(floor(-kc.y/.05+.5),0.,1.);
  hw=min(hw,sdCylZ(q-vec3(.105,.13-kn*.05,.032),.0105,.01)-.002);
  r=U(r,hw,id0+4.);
  /* neck and fretboard (a flat board, dots), the heel bolted into the pocket */
  float y=q.y, w=bsHalfW(y);
  float nk=sdRBox(vec3(q.x,0.,q.z-.024),vec3(w,1.,.011),.009);
  nk=max(nk,abs(y-(.40+BS_NUT)*.5)-(BS_NUT-.40)*.5);
  float fb=sdRBox(vec3(q.x,q.y-(BS_NUT+.43)*.5,q.z-.0365),vec3(bsHalfW(q.y)+.0005,(BS_NUT-.43)*.5,.0028),.0012);
  r=U(r,min(nk,fb),id0+2.);
  r=U(r,sdRBox(q-vec3(0.,BS_NUT,.0395),vec3(.0215,.003,.003),.001),id0+4.);
  /* headstock: flat, widening to the bass side, four big clover keys out to −x */
  vec3 h=q-vec3(0.,BS_NUT,.026);
  float hp=sdRBox(vec3(h.x+.012,h.y-.1,h.z),vec3(.036,.1,.0075),.006);
  hp=smax(hp,length(vec2(h.x+.012,h.y-.115))-.105,.01);
  hp=smin(hp,sdRBox(vec3(h.x,h.y-.01,h.z),vec3(.021,.012,.0075),.004),.02);
  r=U(r,hp,id0+3.);
  float ty=clamp(floor((h.y-.035)/.045+.5),0.,3.)*.045+.035;
  vec3 t=vec3(h.x,h.y-ty,h.z);
  float tu=sdCylZ(t-vec3(-.018,0.,.012),.0055,.007);
  tu=min(tu,sdRBox(t-vec3(-.03,0.,-.017),vec3(.012,.011,.008),.003));
  tu=min(tu,sdCylX(t-vec3(-.05,0.,-.017),.003,.012));
  tu=min(tu,sdRBox(t-vec3(-.072,0.,-.017),vec3(.01,.016,.004),.004));
  r=U(r,tu,id0+4.);
  return r; }
float bsTone(float k,vec3 q){
  if(k==0.){
    float s=(q.y-BS_SAD)/(BS_NUT-BS_SAD);
    if(q.y>BS_SAD+.02&&q.y<.43){ float sp=mix(.019,.0115,s); float gx=q.x/sp+1.5; if(abs(gx-floor(gx+.5))<.09&&abs(q.x)<sp*1.8) return .25; }
    /* the pickguard: a shape inside the body around the neck and pickups */
    float pg=smax(bsBody2(q.xy)+.03,-(q.y-.20),.02);
    pg=smin(pg,elli(q.xy-vec2(.10,.15),vec2(.05,.075)),.03);
    if(abs(pg)<.0018) return .3;
    if(pg<0.) return .8;
    return .35+.1*grain(vec3(q.x,q.y,0.)*3.,30.); }
  if(k==1.) return .3;
  if(k==2.){
    if(q.z>.035&&q.y>.43&&q.y<BS_NUT){
      float f=log2(max(1e-4,(BS_NUT-BS_SAD)/max(1e-4,q.y-BS_SAD)))*12.;
      if(abs(f-floor(f+.5))*(BS_NUT-BS_SAD)*.0578/(1.+f*.06)<.0008&&f>.5) return .75;
      float sp=mix(.019,.0115,(q.y-BS_SAD)/(BS_NUT-BS_SAD)); float gx=q.x/sp+1.5;
      if(abs(gx-floor(gx+.5))<.09&&abs(q.x)<sp*1.8) return .6;
      float m=floor(f+.5); if((m==3.||m==5.||m==7.||m==9.||m==12.)&&length(vec2(q.x,q.y-(BS_SAD+(BS_NUT-BS_SAD)*exp2(-(m-.5)/12.))))<.0045) return .85;
      return .38; }
    return .62; }
  if(k==3.) return .6;
  if(k==4.) return .75;
  return .6; }

/* ================= a tubular guitar stand =================
   in the stand's frame (origin on the floor under the guitar, the guitar leaning back toward +z):
   three legs from a hub, a backbone up behind the neck with a padded yoke, two padded arms the body sits on.
   G0 is where the bottom of the guitar sits, TILT how far it leans back, and the neck rests on the yoke at length LY. */
#define TILT .30
vec3 gU(){ return vec3(0.,cos(TILT),sin(TILT)); }
vec3 gF(){ return vec3(0.,sin(TILT),-cos(TILT)); }
vec3 toGuitar(vec3 s,vec3 g0){ vec3 g=s-g0; return vec3(g.x,dot(g,gU()),dot(g,gF())); }
vec2 gStand(vec3 s,vec3 g0,float ly,float nz,float id0){
  vec2 r=vec2(1e3,0.);
  vec3 nb=g0+gU()*ly+gF()*nz;                       /* the back of the neck where it rests */
  vec3 H=vec3(0.,.25,g0.z+.21);
  float bb=sdBox(s-vec3(0.,nb.y*.5+.03,.12),vec3(.32,nb.y*.5+.08,.4));
  if(bb>.3) return vec2(bb,id0);
  vec3 F1=vec3(-.2,.012,g0.z-.10), F2=vec3(.2,.012,g0.z-.10), F3=vec3(0.,.012,H.z+.2);   /* two feet in front, one behind */
  float d=segD(s,H,F1)-.0085;
  d=min(d,segD(s,H,F2)-.0085);
  d=min(d,segD(s,H,F3)-.0085);
  vec3 C=nb+gF()*.014, Y=C+vec3(0.,-.012,.042);
  d=min(d,segD(s,H,Y)-.0095);                                   /* backbone */
  d=min(d,sdCylY(s-H,.017,.03)-.003);                            /* hub */
  /* arms: from the hub forward under the body, then turned up */
  vec3 sx=vec3(abs(s.x),s.yz);
  vec3 A1=H+vec3(.05,-.03,-.06), A2=vec3(.10,g0.y+.005,g0.z+.07), A3=vec3(.10,g0.y+.005,g0.z-.065);
  d=min(d,segD(sx,A1,A2)-.008); d=min(d,segD(sx,A2,A3)-.008);
  d=min(d,segD(sx,H,A1)-.008);
  r=U(r,d,id0);
  /* rubber: on the arms, their upturned tips, the yoke and the feet */
  float rb=segD(sx,A2+vec3(0.,0.,-.01),A3)-.013;
  rb=min(rb,segD(sx,A3,A3+vec3(0.,.055,-.02))-.012);
  vec3 yy=s-C; float yk=sdTorus(yy,.034,.009);                    /* the yoke: a padded U round the back of the neck */
  yk=max(yk,-(yy.z+.004));
  yk=min(yk,segD(yy,vec3(0.,0.,.043),Y-C)-.009);
  rb=min(rb,yk);
  rb=min(rb,length(s-F1-vec3(0.,.002,0.))-.018);
  rb=min(rb,length(s-F2-vec3(0.,.002,0.))-.018);
  rb=min(rb,length(s-F3-vec3(0.,.002,0.))-.018);
  r=U(r,rb,id0+1.);
  return r; }

/* ================= drums =================
   a drum in its own frame: axis along y, centre at 0, radius R, half depth h. Hoops at both heads (the batter head
   at +y), n lugs round the shell with tension rods up to each hoop. Shell id0, heads id0+1, hardware id0+2. */
vec2 drumD(vec3 q,float R,float h,float n,float id0){
  float bb=sdCylY(q,R+.03,h+.02);
  if(bb>.3) return vec2(bb,id0);
  vec2 r=vec2(1e3,0.);
  float sh=sdCylY(q,R,h-.004)-.002;
  r=U(r,sh,abs(q.y)>h-.004?id0+1.:id0);
  float hoop=sdTorus(vec3(q.x,abs(q.y)-h+.004,q.z),R+.002,.0055);
  hoop=min(hoop,max(abs(length(q.xz)-R-.002)-.004,abs(abs(q.y)-h-.002)-.009));
  float an=atan(q.z,q.x), s=6.2831853/n, k=floor(an/s+.5), a2=k*s;
  vec2 dir=vec2(cos(a2),sin(a2));
  vec3 l=vec3(dot(q.xz,dir)-R,q.y,dot(q.xz,vec2(-dir.y,dir.x)));
  float lug=sdRBox(vec3(l.x-.011,abs(l.y)-min(h*.45,.05),l.z),vec3(.008,min(h*.3,.03),.0065),.006);
  if(h>.12) lug=sdRBox(vec3(l.x-.011,abs(l.y)-h+.05,l.z),vec3(.008,.022,.0065),.006);
  float rod=sdCylY(vec3(l.x-.013,abs(l.y)-h+.02,l.z),.0022,.022);
  float claw=sdRBox(vec3(l.x-.012,abs(l.y)-h+.003,l.z),vec3(.006,.006,.006),.002);
  r=U(r,min(hoop,min(lug,min(rod,claw))),id0+2.);
  return r; }
/* a cymbal in its frame: a bell in the middle, the bow, thin; with the nut on top */
float cymbalD(vec3 q,float R){
  float rr=length(q.xz);
  float bb=max(rr-R-.01,abs(q.y-.01)-.05);
  if(bb>.3) return bb;
  float prof=.026*(1.-smoothstep(0.,R,rr))+.022*(1.-smoothstep(.035,.06,rr));
  float d=max(abs(q.y-prof)-.0018,rr-R)*.6;
  d=min(d,sdCylY(q-vec3(0.,.05,0.),.009,.008));   /* felt and nut */
  d=min(d,sdCylY(q-vec3(0.,.04,0.),.004,.03));
  return d; }
/* a tripod stand: three legs from a collar at height hc down to radius rl, the tube up to `top` */
float tripod(vec3 s,float hc,float rl,vec3 top){
  float bb=max(length(s.xz)-rl-.03,s.y-max(top.y,hc)-.03);
  if(bb>.3) return bb;
  float d=1e3;
  for(int i=0;i<3;i++){ float a=float(i)*2.0944+.4; vec3 f=vec3(cos(a)*rl,.01,sin(a)*rl);
    d=min(d,segD(s,vec3(0.,hc,0.),f)-.008);
    d=min(d,length(s-f)-.013);
    d=min(d,segD(s,vec3(0.,hc*.55,0.),mix(vec3(0.,hc,0.),f,.55))-.005); }
  d=min(d,segD(s,vec3(0.,0.12,0.),top)-.011);
  d=min(d,sdCylY(s-vec3(0.,hc,0.),.017,.02)-.002);
  return d; }

/* ================= a studio microphone =================
   a large-diaphragm condenser in a ring shock mount, on its own frame: the capsule axis along y, centre at 0. */
float micD(vec3 q){
  float body=sdCylY(q-vec3(0.,-.04,0.),.026,.07)-.004;
  float head=length(vec3(q.x,max(abs(q.y-.05)-.03,0.),q.z))-.032;
  float d=min(body,head);
  d=min(d,sdTorus(vec3(q.x,q.y+.02,q.z),.055,.0045));       /* the shock mount ring */
  float an=atan(q.z,q.x); float k=floor(an/1.5708+.5)*1.5708; vec2 dd=vec2(cos(k),sin(k));
  d=min(d,segD(q,vec3(dd.x*.031,-.02,dd.y*.031),vec3(dd.x*.055,-.02,dd.y*.055))-.0025);  /* elastic */
  return d; }
float micTone(vec3 q){
  if(q.y>.02){ float g=sin(q.y*900.)*sin(atan(q.z,q.x)*60.); return g>.3?.35:.62; }   /* the grille */
  if(abs(q.y+.005)<.004) return .25;
  return .32; }
