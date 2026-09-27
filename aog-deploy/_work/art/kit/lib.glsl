/* AOG render kit — shared GLSL library (lib.glsl).
   Concatenated as: header + lib.glsl + scenes/<id>.glsl + main.glsl by render.js.

   A scene file must define, BEFORE anything that uses them, these macros:
     CAM_POS, CAM_TGT (vec3), CAM_FOV (vertical degrees), SUN_DIR (vec3, normalised by lib),
     MAXT (far distance), EXPOSURE
   optional macros (defaults below): TAU_R, TAU_M, SUN_E, FOG_DENS, FOG_H, STEPS, CLOUDS,
     CLOUD_COVER, GRADE_WARM, GRAIN, VIGNETTE, BLOOM, AMB_SCALE
   and these functions (see scenes/_template.glsl):
     vec2 map(vec3 p)                                  -> (distance, material id)
     Mat  material(float id, vec3 p, inout vec3 n)     -> albedo / roughness / etc (may bump n)
     vec3 shade(vec3 p, vec3 n, vec3 rd, Mat m, float t)   (usually: return shadeOutdoor(...))
     vec3 background(vec3 ro, vec3 rd)                 (usually: return skyFull(ro, rd))
     vec3 atmosphere(vec3 col, vec3 ro, vec3 rd, float t)  (usually: return aerial(col, ro, rd, t))
     vec3 post(vec3 col, vec3 ro, vec3 rd, float t)    (HDR additions after fog: rainbows, god rays)

   Units: metres, y up. Radiance is HDR (sun ~ 20); EXPOSURE brings it to display. */

#define PI 3.14159265359
#ifndef TAU_R
#define TAU_R vec3(0.036, 0.097, 0.24)   /* Rayleigh optical depth at zenith, R/G/B */
#endif
#ifndef TAU_M
#define TAU_M 0.12                       /* haze (Mie) optical depth at zenith */
#endif
#ifndef SUN_E
#define SUN_E 20.0
#endif
#ifndef FOG_DENS
#define FOG_DENS 0.0015
#endif
#ifndef FOG_H
#define FOG_H 60.0
#endif
#ifndef STEPS
#define STEPS 220
#endif
#ifndef SKY_GAIN
#define SKY_GAIN 1.0      /* scales sky radiance: raise for a high midday sun */
#endif
#ifndef SHADOW_MAXSTEP
#define SHADOW_MAXSTEP 1e3   /* interiors: keep shadow steps short to avoid penumbra banding */
#endif
#ifndef AMB_SCALE
#define AMB_SCALE 1.0
#endif

uniform vec2 R;          /* render-target size (supersampled) */
/* world size of one render pixel at distance t: use it to fade texture octaves (no shimmer) */
float footprint(float t){ return t*2.*tan(radians(CAM_FOV)*.5)/R.y; }
float distTo(vec3 p){ return length(p-CAM_POS); }
struct Mat { vec3 alb; float rough; float metal; vec3 emit; float refl; float sss; float spec; };
Mat mat(vec3 a, float r){ return Mat(a, r, 0., vec3(0), 0., 0., .04); }

/* ---------------- hashing and noise ---------------- */
float h1(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float h13(vec3 p){ p=fract(p*vec3(.1031,.1030,.0973)); p+=dot(p,p.yxz+33.33); return fract((p.x+p.y)*p.z); }
vec2 h22(vec2 p){ vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); q+=dot(q,q.yzx+33.33); return fract((q.xx+q.yz)*q.zy); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y); }
float vn3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<5;i++){ s+=a*vn(p); p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2); a*=.5; } return s; }
float fbm3(vec3 p){ float s=0.,a=.5; for(int i=0;i<4;i++){ s+=a*vn3(p); p=p*2.02+vec3(1.7,9.2,3.1); a*=.5; } return s; }
float fbmN(vec2 p,int n){ float s=0.,a=.5; for(int i=0;i<8;i++){ if(i>=n)break; s+=a*vn(p); p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2); a*=.5; } return s; }
/* band-limited fbm: octaves finer than ~2 pixels fade out to their mean */
float fbmL(vec2 p,float fp,int n){ float s=0.,a=.5,f=1.; for(int i=0;i<8;i++){ if(i>=n)break;
  float k=1.-smoothstep(.25,.6,fp*f); s+=a*mix(.5,vn(p),k); p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2); f*=2.; a*=.5; } return s; }
float fbm3L(vec3 p,float fp,int n){ float s=0.,a=.5,f=1.; for(int i=0;i<6;i++){ if(i>=n)break;
  float k=1.-smoothstep(.25,.6,fp*f); s+=a*mix(.5,vn3(p),k); p=p*2.02+vec3(1.7,9.2,3.1); f*=2.02; a*=.5; } return s; }
/* voronoi: x = distance to nearest cell point, y = edge distance, z = cell id */
vec3 voro(vec2 p){ vec2 i=floor(p),f=fract(p); float d1=8.,d2=8.; float id=0.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){ vec2 g=vec2(x,y), o=h22(i+g); float d=length(g+o-f);
    if(d<d1){ d2=d1; d1=d; id=h1(i+g); } else if(d<d2) d2=d; }
  return vec3(d1,d2-d1,id); }
mat2 rot(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

/* ---------------- SDF primitives and operators ---------------- */
float sdSphere(vec3 p,float r){ return length(p)-r; }
float sdBox(vec3 p,vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
float sdRBox(vec3 p,vec3 b,float r){ return sdBox(p,b-r)-r; }
float sdCapsule(vec3 p,vec3 a,vec3 b,float r){ vec3 pa=p-a,ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }
float sdCylY(vec3 p,float r,float h){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h); return min(max(d.x,d.y),0.)+length(max(d,0.)); }
float sdCylX(vec3 p,float r,float h){ return sdCylY(p.yxz,r,h); }
float sdCylZ(vec3 p,float r,float h){ return sdCylY(p.xzy,r,h); }
float sdTorus(vec3 p,float R,float r){ return length(vec2(length(p.xz)-R,p.y))-r; }
float sdCone(vec3 p,float r1,float r2,float h){ /* capped cone along y, bottom r1 at -h, top r2 at +h */
  vec2 q=vec2(length(p.xz),p.y); vec2 k1=vec2(r2,h), k2=vec2(r2-r1,2.*h);
  vec2 ca=vec2(q.x-min(q.x,(q.y<0.)?r1:r2),abs(q.y)-h); vec2 cb=q-k1+k2*clamp(dot(k1-q,k2)/dot(k2,k2),0.,1.);
  float s=(cb.x<0.&&ca.y<0.)?-1.:1.; return s*sqrt(min(dot(ca,ca),dot(cb,cb))); }
float sdSeg2(vec2 p,vec2 a,vec2 b){ vec2 pa=p-a,ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
float smin(float a,float b,float k){ float h=clamp(.5+.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }
float smax(float a,float b,float k){ return -smin(-a,-b,k); }
vec2 U(vec2 a,vec2 b){ return a.x<b.x?a:b; }             /* union carrying material id */
vec2 U(vec2 a,float d,float id){ return d<a.x?vec2(d,id):a; }

/* ---------------- atmosphere: sky, sun, haze ---------------- */
vec3 SUN(){ return normalize(SUN_DIR); }
float airmass(float cz){ float z=degrees(acos(clamp(cz,-1.,1.))); z=min(z,93.); return 1./(max(cz,-.05)+.50572*pow(96.07995-z,-1.6364)); }
vec3 tauTot(){ return TAU_R+vec3(TAU_M); }
/* sunlight arriving at the ground (transmitted) */
vec3 sunColor(){ return SUN_E*exp(-tauTot()*airmass(SUN().y)); }
float phaseR(float mu){ return .0597*(1.+mu*mu)*PI; }            /* normalised so ~1 */
float phaseM(float mu,float g){ float g2=g*g; return (1.-g2)/pow(1.+g2-2.*g*mu,1.5)*.25; }
/* clear-sky radiance in direction rd (single scattering, air-mass model) */
vec3 skyClear(vec3 rd){
  vec3 s=SUN(); float mu=dot(rd,s);
  float y=max(rd.y,.0);
  vec3 tv=tauTot()*airmass(y);
  vec3 mS=tauTot()*airmass(s.y);
  vec3 attR=exp(-mS*.28), attM=exp(-mS*.6);         /* Rayleigh scatters high, haze scatters low */
  vec3 sca=TAU_R*phaseR(mu)*attR+vec3(TAU_M)*(phaseM(mu,.76)*1.6+.05)*attM;
  vec3 L=SUN_E*.22*SKY_GAIN*sca/tauTot()*(1.-exp(-tv));
  /* multiple-scatter / twilight fill */
  L+=SUN_E*.008*vec3(.35,.55,1.)*smoothstep(-.3,.4,s.y)*(1.-y*.5);
  return L;
}
vec3 sunDisc(vec3 rd){ float mu=dot(rd,SUN()); float r=.00465*1.6; /* slightly enlarged for legibility */
  float d=smoothstep(cos(r*1.02),cos(r*.98),mu); return d>0.? sunColor()*1800.*d*(.6+.4*sqrt(max(0.,1.-(1.-mu)/(1.-cos(r))))) : vec3(0); }
#ifndef CLOUD_COVER
#define CLOUD_COVER .45
#endif
/* a thin cloud deck at 1500 m: returns (radiance, alpha) */
vec4 clouds(vec3 ro,vec3 rd){
  if(rd.y<.01) return vec4(0);
  float t=(1500.-ro.y)/rd.y; vec2 q=(ro.xz+rd.xz*t)*.00042;
  float n=fbmN(q+vec2(3.1,1.7),6); float n2=fbmN(q*3.1+n*.8,4);
  float dens=smoothstep(1.-CLOUD_COVER,1.-CLOUD_COVER+.28,n*.75+n2*.35);
  if(dens<=0.) return vec4(0);
  vec3 s=SUN(); float mu=dot(rd,s);
  float thick=dens*(.5+.5*n2);
  vec3 lit=sunColor()*(.10+phaseM(mu,.6)*.35)*(1.-.55*thick)+skyClear(vec3(0,1,0))*.9;
  lit+=sunColor()*phaseM(mu,.85)*.8*(1.-thick);          /* silver lining */
  float fade=smoothstep(.01,.18,rd.y);
  return vec4(lit,dens*fade*.92);
}
vec3 skyFull(vec3 ro,vec3 rd){
  vec3 c=skyClear(rd)+sunDisc(rd);
#ifdef CLOUDS
  vec4 cl=clouds(ro,rd); c=mix(c,cl.rgb,cl.a);
#endif
  return c;
}
/* aerial perspective: exponential height fog lit by the sky and the sun */
vec3 aerial(vec3 col,vec3 ro,vec3 rd,float t){
  float k=FOG_DENS*exp(-max(ro.y,0.)/FOG_H);
  float b=max(abs(rd.y),1e-4)/FOG_H;
  float od=k*(1.-exp(-t*rd.y/FOG_H))/(rd.y/FOG_H + (rd.y>=0.?1e-5:-1e-5));
  od=max(od,0.);
  vec3 tr=exp(-od*vec3(.75,.9,1.15));
  vec3 inCol=skyClear(normalize(vec3(rd.x,max(rd.y,.04),rd.z)));
  inCol+=sunColor()*phaseM(dot(rd,SUN()),.7)*.08;
  return col*tr+inCol*(1.-tr);
}

/* ---------------- ray marching and lighting helpers ---------------- */
vec2 map(vec3 p);
vec2 march(vec3 ro,vec3 rd,float tmax,int steps){
  float t=.01; float id=-1.;
  for(int i=0;i<STEPS;i++){ if(i>=steps) break;
    vec2 h=map(ro+rd*t);
    if(abs(h.x)<.0004*t+.0004){ id=h.y; break; }
    t+=h.x*.85; if(t>tmax) break; }
  return vec2(t, t>tmax?-1.:id);
}
vec3 calcNormal(vec3 p,float t){ float e=.0005*max(t,1.);
  vec2 k=vec2(1,-1); return normalize(k.xyy*map(p+k.xyy*e).x+k.yyx*map(p+k.yyx*e).x+k.yxy*map(p+k.yxy*e).x+k.xxx*map(p+k.xxx*e).x); }
float softShadow(vec3 ro,vec3 rd,float mint,float maxt,float k){
  float res=1.,t=mint,ph=1e10;
  for(int i=0;i<160;i++){ float h=map(ro+rd*t).x; if(h<.0002){ res=0.; break; }
    res=min(res,k*h/t);
    t+=clamp(h,.002+t*.002,min(t*.25+.2,SHADOW_MAXSTEP)); if(res<.002||t>maxt) break; }
  res=clamp(res,0.,1.); return res*res*(3.-2.*res);
}
float calcAO(vec3 p,vec3 n,float scale){ float o=0.,w=1.;
  for(int i=1;i<=5;i++){ float h=scale*.03*float(i*i); o+=w*(h-map(p+n*h).x); w*=.7; }
  return clamp(1.-o*1.6/scale,0.,1.); }

/* GGX specular with Schlick fresnel */
vec3 ggx(vec3 n,vec3 v,vec3 l,float rough,vec3 F0){
  vec3 h=normalize(v+l); float a=rough*rough, a2=a*a;
  float nh=max(dot(n,h),0.), nl=max(dot(n,l),0.), nv=max(dot(n,v),1e-3);
  float D=a2/(PI*pow(nh*nh*(a2-1.)+1.,2.));
  float k=a*.5; float G=nl/(nl*(1.-k)+k)*nv/(nv*(1.-k)+k);
  vec3 F=F0+(1.-F0)*pow(1.-max(dot(h,v),0.),5.);
  return D*G*F/(4.*nv*max(nl,1e-3))*nl;
}
vec3 skyAmbient(vec3 n){
  vec3 up=skyClear(vec3(0,1,0)), hz=skyClear(normalize(vec3(SUN().x,.08,SUN().z)))*.5+skyClear(normalize(vec3(-SUN().x,.08,-SUN().z)))*.5;
  return mix(hz,up,clamp(n.y*.5+.5,0.,1.))*PI*.55*AMB_SCALE;
}
/* full outdoor shading: sun (soft shadowed), sky dome, ground bounce, spec, translucency */
vec3 shadeOutdoor(vec3 p,vec3 n,vec3 rd,Mat m,float t,float shK,float aoS,vec3 groundAlb){
  vec3 l=SUN(), v=-rd;
  float nl=max(dot(n,l),0.);
  float sh= nl>0.||m.sss>0. ? softShadow(p+n*.002*max(t,1.),l,.01,60.,shK) : 0.;
  float ao=calcAO(p,n,aoS);
  vec3 F0=mix(vec3(m.spec),m.alb,m.metal);
  vec3 dif=m.alb*(1.-m.metal);
  vec3 c=dif*sunColor()*nl*sh/PI*PI;
  c+=sunColor()*ggx(n,v,l,max(m.rough,.05),F0)*sh;
  c+=dif*skyAmbient(n)*ao/PI;
  c+=dif*groundAlb*sunColor()*max(SUN().y,0.)*(.5-.5*n.y)*ao*.35/PI;
  if(m.sss>0.) c+=m.alb*m.sss*sunColor()*max(dot(-n,l),0.)*.6*sh*ao+m.alb*m.sss*sunColor()*.05*ao;
  c+=m.emit;
  return c;
}
/* a point light with inverse-square falloff and soft shadow; power in radiance-units at 1 m */
vec3 pointLight(vec3 p,vec3 n,vec3 rd,Mat m,vec3 lp,vec3 lc,float shK){
  vec3 L=lp-p; float d=length(L); vec3 l=L/d;
  float nl=max(dot(n,l),0.);
  float sh=nl>0.?softShadow(p+n*.002,l,.01,d-.05,shK):0.;
  vec3 F0=mix(vec3(m.spec),m.alb,m.metal);
  vec3 c=m.alb*(1.-m.metal)*lc*nl/(d*d)*sh;
  c+=lc/(d*d)*ggx(n,-rd,l,max(m.rough,.08),F0)*sh;
  return c;
}

/* ---------------- materials ---------------- */
/* planks along x (grain direction), p in metres */
vec3 woodAlb(vec3 p,vec3 base){ float r=length(p.yz*vec2(9.,9.))+fbm(p.xz*vec2(.8,6.))*1.4;
  float rings=.5+.5*sin(r*18.+fbm(p.xy*vec2(1.,12.))*6.);
  float fib=fbm(vec2(p.x*2.,p.y*90.+p.z*90.));
  return base*(.72+.22*rings+.18*fib); }
vec3 stoneAlb(vec2 q,vec3 base){ vec3 v=voro(q*3.); float n=fbm(q*9.);
  return base*(.78+.3*n+.12*v.z)*mix(.82,1.,smoothstep(0.,.05,v.y)); }
vec3 paperAlb(vec2 q,vec3 base){ float f=fbm(q*140.)*.08+fbm(q*9.)*.12; return base*(.9+f); }
vec3 clothAlb(vec2 q,vec3 base){ float w=.5+.25*sin(q.x*900.)+.25*sin(q.y*900.); return base*(.82+.12*w+.12*fbm(q*30.)); }
vec3 foliageAlb(vec3 p,vec3 base){ float n=fbm3(p*6.); float m=vn3(p*28.); return base*(.55+.6*n)*(.75+.5*m); }
/* meadow grass: dry/lush patches (metres), clumps, blades; fp = footprint(t) */
vec3 grassAlb(vec2 q,vec3 base,float fp){
  float n=fbm(q*.08), c=fbmL(q*.7,fp*.7,4), b=fbmL(q*9.,fp*9.,3);
  vec3 g=base*mix(vec3(.85,1.05,.8),vec3(1.35,1.15,.62),smoothstep(.35,.75,n));
  g*=.6+.55*c; g*=.8+.4*b;
  return g; }
/* grass height for BUMP: clumps + blade streaks */
float grassHt(vec2 q,float fp){ return fbmL(q*.7,fp*.7,4)*.6+fbmL(q*9.,fp*9.,3)*.25; }
/* bump helper: perturb n by the gradient of a height function sampled with finite differences */
#define BUMP(n,p,F,s) { float _e=.002; float _h=F(p); vec3 _g=vec3(F(p+vec3(_e,0,0))-_h,F(p+vec3(0,_e,0))-_h,F(p+vec3(0,0,_e))-_h)/_e; n=normalize(n-(s)*(_g-dot(_g,n)*n)); }
