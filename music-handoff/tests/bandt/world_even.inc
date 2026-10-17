/* AOG-BAND-WORLD-V1: how even a player's notes are. Every half step of its reach, held 2 s through the page's own voice
   (makeVoice, the sound's gain and PLAYER), K-weighted, loudest 400 ms (measure.inc, as bandt/level.js). A smooth curve
   (a least-squares parabola over the reach) is laid through them; a note more than 1.5 dB off the curve, or a step from
   one half step to the next that jumps more than 1.5 dB more than the curve does, is uneven.
   Used by bandt/world.js; after page load and measure.inc: await __even(soundId, inst) -> {notes:[[m,db]], worst, jump} */
window.__even=async function(id, inst){ S.sound=id; await loadSound(id);
  const r=rangeOf(inst), rows=[];
  for(let m=r[0]; m<=r[1]; m++){
    const oc=new OfflineAudioContext(2, 44100*2.6, 44100), ch=makeChain(oc); ch.master.gain.value=volGain(0.8); setSendLevel(ch,id); setEra(ch,0,0);
    ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
    const vc=makeVoice(oc,ch,inst,m,0.74,0.05,"sus"); if(!vc) continue; vc.stop(2.05, vc.tau);
    rows.push([m, __kw(await oc.startRendering())]); }
  /* the parabola: y = a + b x + c x^2, x centred */
  const n=rows.length, mx=rows.reduce((s,q)=>s+q[0],0)/n, X=rows.map(q=>q[0]-mx), Y=rows.map(q=>q[1]);
  const S_=k=>X.reduce((s,x)=>s+Math.pow(x,k),0), T_=k=>X.reduce((s,x,i)=>s+Math.pow(x,k)*Y[i],0);
  const M=[[n,S_(1),S_(2)],[S_(1),S_(2),S_(3)],[S_(2),S_(3),S_(4)]], V=[T_(0),T_(1),T_(2)];
  const det=A=>A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])-A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])+A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0]);
  const D=det(M), co=[0,1,2].map(k=>det(M.map((row,i)=>row.map((v,j)=>j===k?V[i]:v)))/D);
  const fit=x=>co[0]+co[1]*x+co[2]*x*x, res=rows.map((q,i)=>q[1]-fit(X[i]));
  let worst=0, jump=0;
  res.forEach((e,i)=>{ worst=Math.max(worst, Math.abs(e)); if(i) jump=Math.max(jump, Math.abs(e-res[i-1])); });
  return {notes:rows.map((q,i)=>[q[0], +q[1].toFixed(2), +res[i].toFixed(2)]), worst:+worst.toFixed(2), jump:+jump.toFixed(2)}; };
