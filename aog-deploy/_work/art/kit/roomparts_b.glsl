/* Parts for the practice-room pencil still lifes (rooms batch 2). Include after studio.glsl
   and medparts_a.glsl (it uses place() and sdEll()). Every part takes a local point q in metres. */
/* more glyphs: ? ! , . plus everything glyph() already knows */
float glyph2(vec2 p,int g){
  if(g==63){ float d=arc(p,vec2(0.,.2),.19,-PI*.5,PI*1.05); d=min(d,seg(p,vec2(0.,.01),vec2(0.,-.14))); return min(d,length(p-vec2(0.,-.36))-.045); } /* ? */
  if(g==33){ return min(seg(p,vec2(0.,.42),vec2(0.,-.14)),length(p-vec2(0.,-.36))-.045); }                                           /* ! */
  if(g==44){ return min(length(p-vec2(-.02,.12))-.1,arc(p,vec2(-.25,.1),.33,-1.2,0.)); }                                           /* , */
  if(g==46){ return length(p-vec2(0.,-.32))-.05; }                                                                                /* . */
  return glyph(p,g); }
/* a lying cylinder / disc helpers */
float ring3(vec3 q,float R,float r){ return sdTorus(q,R,r); }
/* a glass jar with a neck and a rim, base at y=0, hollow */
float jarD(vec3 q,float R,float H){
  float body=sdCylY(q-vec3(0.,H*.42,0.),R,H*.42)-.004;
  float sh=sdEll(q-vec3(0.,H*.84,0.),vec3(R,H*.12,R));
  float neck=sdCylY(q-vec3(0.,H*.93,0.),R*.72,H*.07);
  float d=min(smin(body,sh,.01),neck);
  d=min(d,sdTorus(q-vec3(0.,H,0.),R*.72,.004));
  return d; }
/* a simple ball */
float ballD(vec3 q,float r){ return length(q)-r; }
/* a coin lying flat, centre at q=0 */
float coinD(vec3 q,float R){ return sdCylY(q,R-.001,.0012)-.001; }
/* a book standing upright on its bottom edge, spine facing -z; s = half sizes (thick x, tall y, deep z) */
float standBook(vec3 q,vec3 s){
  float cov=sdRBox(q-vec3(0.,s.y,0.),s,.003);
  float cut=sdBox(q-vec3(0.,s.y+.004,.006),vec3(s.x-.004,s.y,s.z));
  float pages=sdBox(q-vec3(0.,s.y,.002),vec3(s.x-.005,s.y-.004,s.z-.004));
  return min(max(cov,-cut),pages); }
