/* Shared helpers for the Spanish (spa) and Family & Consumer Science (fcs) pencil stills.
   Include after studio.glsl. Extra glyphs: E I O U N, Ñ (209), 4 5 (52 53), $ (36), ? (63), ¿ (191), ✓ (10003). */
float glyphX(vec2 p,int g){
  if(g==191){ p=-p; g=63; }                                                                             /* ¿ */
  if(g==69){ float d=seg(p,vec2(-.22,-.4),vec2(-.22,.4)); d=min(d,seg(p,vec2(-.22,.4),vec2(.24,.4)));
    d=min(d,seg(p,vec2(-.22,0.),vec2(.14,0.))); return min(d,seg(p,vec2(-.22,-.4),vec2(.24,-.4))); }             /* E */
  if(g==73){ float d=seg(p,vec2(0.,-.4),vec2(0.,.4)); d=min(d,seg(p,vec2(-.14,.4),vec2(.14,.4))); return min(d,seg(p,vec2(-.14,-.4),vec2(.14,-.4))); } /* I */
  if(g==79){ return abs(length(p/vec2(.3,.4))-1.)*.3; }                                                                /* O */
  if(g==85){ float d=seg(p,vec2(-.26,.4),vec2(-.26,-.12)); d=min(d,seg(p,vec2(.26,.4),vec2(.26,-.12)));
    return min(d,arc(p,vec2(0.,-.12),.26,PI,2.*PI)); }                                                                  /* U */
  if(g==78||g==209){ float d=seg(p,vec2(-.24,-.4),vec2(-.24,.3)); d=min(d,seg(p,vec2(-.24,.3),vec2(.24,-.4)));
    d=min(d,seg(p,vec2(.24,-.4),vec2(.24,.3)));
    if(g==209){ d=min(d,arc(p,vec2(-.1,.36),.1,.3,2.8)); d=min(d,arc(p,vec2(.1,.46),.1,PI+.3,PI+2.8)); }
    return d; }                                                                                                            /* N, Ñ */
  if(g==52){ float d=seg(p,vec2(.12,-.4),vec2(.12,.4)); d=min(d,seg(p,vec2(.12,.4),vec2(-.24,-.12))); return min(d,seg(p,vec2(-.24,-.12),vec2(.26,-.12))); } /* 4 */
  if(g==53){ float d=seg(p,vec2(.22,.4),vec2(-.16,.4)); d=min(d,seg(p,vec2(-.16,.4),vec2(-.19,.04)));
    return min(d,arc(p,vec2(0.,-.16),.23,-PI*.85,PI*.7)); }                                                             /* 5 */
  if(g==36){ float d=arc(p,vec2(0.,.15),.17,PI*.1,PI*1.5); d=min(d,arc(p,vec2(0.,-.15),.17,-PI*.5,PI*.9)*1.); d=min(d,seg(p,vec2(0.,-.46),vec2(0.,.46)));
    return d; }                                                                                                            /* $ */
  if(g==63){ float d=arc(p,vec2(0.,.18),.2,-PI*.5,PI*.95); d=min(d,seg(p,vec2(0.,-.02),vec2(0.,-.14))); return min(d,length(p-vec2(0.,-.36))); } /* ? */
  if(g==10003){ return min(seg(p,vec2(-.3,0.),vec2(-.08,-.3)),seg(p,vec2(-.08,-.3),vec2(.34,.36))); }                  /* check mark */
  return glyph(p,g); }
float carveX(float d3,vec2 uv,int g,float sz,float w,float z,float dep){
  float gd=glyphX(uv/sz,g)*sz-w; return max(d3,-max(gd,abs(z)-dep)); }
/* a wooden letter block carved on the front and right faces */
float lblock(vec3 p,vec3 c,float ry,float h,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float d=sdRBox(q,vec3(h),h*.11); if(d>.02) return d;
  d=carveX(d,q.xy,g,h*1.44,h*.115,q.z+h,h*.08);
  d=carveX(d,vec2(-q.z,q.y),g2,h*1.36,h*.105,q.x-h,h*.08);
  return d; }
float lblockInk(vec3 p,vec3 c,float ry,float h,int g,int g2){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  if(q.z<-h+h*.15&&glyphX(q.xy/(h*1.44),g)*h*1.44<h*.16) return .18;
  if(q.x>h-h*.15&&glyphX(vec2(-q.z,q.y)/(h*1.36),g2)*h*1.36<h*.15) return .18;
  vec2 f=q.z<-h+.003?q.xy:q.x>h-.003?vec2(q.z,q.y):q.xz;
  if(abs(max(abs(f.x),abs(f.y))-h*.86)<h*.04) return .45;
  return .76; }
/* lathe helper: distance in (radius, height) space to a thin wall following a polyline */
float lathe4(vec3 p,vec2 a,vec2 b,vec2 c,vec2 d,float th){
  vec2 q=vec2(length(p.xz),p.y);
  return min(min(sdSeg2(q,a,b),sdSeg2(q,b,c)),sdSeg2(q,c,d))-th; }
/* a closed book lying flat: centre c, half sizes s (x,y,z), yaw ry; returns (distance, 0 cover / 1 page block) */
vec2 flatBook(vec3 p,vec3 c,vec3 s,float ry){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float cov=sdRBox(q,s,.003);
  float cut=sdBox(q-vec3(.006,0.,0.),vec3(s.x,s.y-.004,s.z-.006));
  float pages=sdBox(q-vec3(.004,0.,0.),vec3(s.x-.004,s.y-.0045,s.z-.008));
  cov=max(cov,-cut);
  return pages<cov?vec2(pages,1.):vec2(cov,0.); }
/* a hexagonal pencil along x from x0 to x0+len (point at +x) */
float pencilX(vec3 q,float R,float len){
  vec2 h=abs(q.yz); float hex=max(h.x*.866+h.y*.5,h.y)-R*.87;
  float body=max(hex,abs(q.x-len*.4)-len*.4);
  float t=clamp((q.x-len*.8)/(len*.2),0.,1.); float cone=max(length(q.yz)-R*(1.-t)*.95-.0003,max(len*.8-q.x,q.x-len));
  float fer=max(length(q.yz)-R*.98,abs(q.x+.008)-.008);
  float era=max(length(q.yz)-R*.93,abs(q.x+.022)-.007)-.0006;
  return min(min(body,cone),min(fer,era)); }
float pencilTone(vec3 q,float len){
  if(q.x>len*.8) return q.x>len*.93?.12:.88;
  if(q.x<-.016) return .5;
  if(q.x<0.) return fract(q.x/.003)<.35?.3:.7;
  return .6; }
/* an apple of radius r sitting on the table at c (bottom at c.y); returns (distance, 0 fruit / 1 stem+leaf) */
vec2 appleD(vec3 p,vec3 c,float r,float ry){
  vec3 q=p-c-vec3(0.,r*.92,0.); q.xz=rot(ry)*q.xz;
  float rr=length(q.xz); float d=length(q*vec3(1.,1.08,1.))-r;
  d+= r*.28*exp(-rr*rr/(r*r*.06))*smoothstep(-.2*r,.6*r,q.y);          /* dimple at the top */
  d+= r*.15*exp(-rr*rr/(r*r*.08))*smoothstep(.2*r,-.8*r,q.y);          /* small dimple under */
  d*=.8;
  float stem=sdCapsule(q,vec3(0.,r*.55,0.),vec3(r*.1,r*1.12,0.),r*.055);
  vec3 l=q-vec3(r*.28,r*.95,0.); l.xy=rot(-.5)*l.xy; float leaf=(length(l/vec3(r*.3,r*.03,r*.13))-1.)*r*.03;
  float sl=min(stem,leaf);
  return sl<d?vec2(sl,1.):vec2(d,0.); }
/* a mug: centre of its base at c, radius r, height h, handle to +x after yaw ry */
float mugD(vec3 p,vec3 c,float r,float h,float ry){
  vec3 q=p-c; q.xz=rot(ry)*q.xz;
  float outer=sdCylY(q-vec3(0.,h*.5,0.),r,h*.5)-.003;
  float inner=sdCylY(q-vec3(0.,h*.5+.006,0.),r-.006,h*.5);
  vec3 hq=q-vec3(r+.002,h*.52,0.); float handle=sdTorus(hq.xzy,h*.26,.0065); handle=max(handle,-hq.x);
  return min(max(outer,-inner),handle); }
/* a folded paper tent card standing on the table: centre c, half width w, height h, yaw ry */
float tentD(vec3 p,vec3 c,float w,float h,float ry){
  vec3 q=p-c; q.xz=rot(ry)*q.xz; float a=.32;
  vec3 f=q; f.z=abs(f.z); vec2 u=vec2(f.z,f.y); vec2 dir=vec2(sin(a),-cos(a)); /* from top edge outward-down */
  float t=clamp(dot(u-vec2(0.,h),dir),0.,h/cos(a)); float d2=length(u-vec2(0.,h)-dir*t)-.0012;
  return max(d2,abs(q.x)-w); }
