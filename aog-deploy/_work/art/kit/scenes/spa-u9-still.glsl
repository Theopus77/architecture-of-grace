/* Spanish Unit 9 "Greetings and Introductions" — pencil still life: a small round-topped mailbox
   with its flag up and its door open, a letter in an envelope leaning against it, and a
   postcard lying in front. */
#define CAM_POS vec3(-0.4236,0.2572,-0.7366)
#define CAM_TGT vec3(-0.1972,-0.0145,0.1056)
#define CAM_FOV 30.
#define SUN_DIR vec3(-.65,.85,-.3)
#define MAXT 8.
#define EXPOSURE 1.
#define STEPS 220
#define SHADOW_MAXSTEP .02
#include "lib.glsl"
#include "studio.glsl"
#include "spafcs.glsl"
#define MB vec3(.05,0.,.07)
vec3 mq(vec3 p){ vec3 q=p-MB; q.xz=rot(.55)*q.xz; return q; }    /* box runs along z, door at -z */
float box2(vec2 u,float w,float h){ return max(max(abs(u.x)-w,-u.y),(u.y>h?length(u-vec2(0.,h))-w:-1.)); }
float mailbox(vec3 q){
  vec2 u=vec2(q.x,q.y-.06); float s=box2(u,.055,.05);
  float shell=max(max(abs(s+.003)-.003,abs(q.z)-.1),0.)-.0;
  float back=max(s,abs(q.z-.098)-.003);
  float door=max(box2(vec2(q.x,q.y-.06),.056,.05),abs(q.z+.1)-.003);
  vec3 dq=q-vec3(0.,.06,-.1); dq.yz=rot(1.25)*dq.yz; float dopen=max(box2(dq.xy+vec2(0.,.0),.056,.05),abs(dq.z)-.003);
  float handle=sdRBox(dq-vec3(0.,.075,-.008),vec3(.012,.004,.005),.002);
  float post=sdRBox(q-vec3(0.,.03,0.),vec3(.02,.03,.02),.003);
  float base=sdRBox(q-vec3(0.,.006,0.),vec3(.05,.006,.05),.003);
  return min(min(min(shell,back),min(dopen,handle)),min(post,base)); }
float flag(vec3 q){ vec3 f=q-vec3(.06,.09,.04); float arm=sdRBox(f-vec3(.004,.04,0.),vec3(.003,.05,.005),.001);
  float pl=sdRBox(f-vec3(.004,.08,-.02),vec3(.002,.018,.024),.001); float piv=sdCylX(f,.007,.006); return min(min(arm,pl),piv); }
vec3 eq(vec3 p){ vec3 q=p-vec3(-.12,.0,-.0); q.xz=rot(.25)*q.xz; q.yz=rot(-.35)*q.yz; return q; }
float env(vec3 p){ vec3 q=eq(p); return sdRBox(q-vec3(0.,.055,0.),vec3(.085,.055,.0015),.001); }
float card(vec3 p){ vec3 q=p-vec3(.02,.002,-.14); q.xz=rot(-.2)*q.xz; return sdRBox(q,vec3(.07,.0015,.045),.001); }
vec2 map(vec3 p){
  vec2 r=vec2(p.y,1.);
  r=U(r,.9-p.z,2.);
  vec3 q=mq(p);
  r=U(r,mailbox(q),3.);
  r=U(r,flag(q),4.);
  r=U(r,env(p),5.);
  r=U(r,card(p),6.);
  return r; }
float toneAlb(float id,vec3 p,vec3 n){
  if(id==1.) return .75;
  if(id==2.) return .9;
  if(id==3.){ vec3 q=mq(p); if(q.y<.035) return .45; if(q.z>-.09&&q.z<.09&&length(n.xy)<.3&&q.z>0.) return .2; return .68; }
  if(id==4.) return .25;
  if(id==5.){ vec3 q=eq(p); vec2 u=vec2(q.x,q.y-.055); if(q.z<0.){
      if(abs(u.x-.06)<.013&&abs(u.y-.03)<.016) return abs(abs(u.x-.06)-.013)<.002||abs(abs(u.y-.03)-.016)<.002?.35:.6;  /* stamp */
      for(int i=0;i<3;i++){ float y=-.005-float(i)*.014; if(abs(u.y-y)<.0022&&u.x>-.03&&u.x<.04-float(i)*.012) return .4; } }
    else { if(abs(abs(u.x)*.6-(.055-u.y)*.9)<.0025&&u.y>-.0) return .5; }
    return .93; }
  if(id==6.){ vec3 q=p-vec3(.02,.002,-.14); q.xz=rot(-.2)*q.xz; if(q.y>0.){ if(abs(q.x)<.0012) return .5;
      if(q.x<0.&&abs(fract((q.z+.04)/.015)-.5)<.12&&q.z<.02) return .55; if(q.x>0.&&abs(q.z-.018)<.003&&q.x<.05) return .45; } return .93; }
  return .7; }
