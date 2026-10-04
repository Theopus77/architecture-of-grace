/* each pedal does something and stays sound; the panel's switches and knobs reach the live amp; a change survives a
   reload; Put this sound back; a browser without AudioWorklet still plays through the fallback */
const pw=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright");
const srv=require("../srv.js")(9963);
let pass=0, fail=0; const ok=(c,m)=>{ if(c){ pass++; console.log("PASS", m); } else { fail++; console.log("FAIL", m); } };
(async()=>{
  const b=await pw.chromium.launch();
  for(const inst of ["guitar","bass"]){
    const c=await b.newContext(); const p=await c.newPage(); const errs=[]; p.on("pageerror",e=>errs.push(e.message)); p.on("console",m=>{ if(m.type()==="error") errs.push(m.text()); });
    await p.route(/^https?:\/\/(?!localhost)/, r=>r.abort());
    await p.goto(`http://localhost:9963/music-${inst}.html`); await p.waitForTimeout(700);
    const r=await p.evaluate(async(G)=>{
      const base=G?"clean":"finger"; S.sound=base;
      async function render(st, noWorklet){
        const oc=new OfflineAudioContext(1, 44100*3, 44100);
        if(noWorklet) Object.defineProperty(oc, "audioWorklet", {value:null}); else await AOGAmp.load(oc);
        RIGS[base]=st; const ch=makeChain(oc); delete RIGS[base];
        ch.master.gain.value=volGain(0.8); setSendLevel(ch, base); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        const cc={off:0,q:"maj"}; let k=0;
        if(G) shapeFor(cc).forEach((f,s)=>{ if(f<0) return; const vc=makeVoice(oc,ch,base,TUNING[s]+f,0.74*(1-0.03*k),0.05+k*0.014,s); vc.stop(1.6, vc.tau); k++; });
        else { const m=bassRoot(cc), cl=cellFor(m); const vc=makeVoice(oc,ch,base,m,0.8,0.05,cl?cl.s:null); vc.stop(1.6, vc.tau); }
        const d=(await oc.startRendering()).getChannelData(0);
        let pk=0, nan=false, e=0; for(let i=0;i<d.length;i++){ if(d[i]!==d[i]) nan=true; pk=Math.max(pk,Math.abs(d[i])); e+=d[i]*d[i]; }
        /* a fingerprint: energy in 8 bands and 6 time slices, to tell two renders apart */
        const fp=[]; for(let t=0;t<6;t++){ let s=0; for(let i=Math.floor(t*0.5*44100); i<Math.floor((t+1)*0.5*44100); i++) s+=d[i]*d[i]; fp.push(10*Math.log10(s+1e-12)); }
        let z=0; for(let i=1;i<d.length;i++) if((d[i]>0)!==(d[i-1]>0)) z++;
        return {pk, nan, rms:Math.sqrt(e/d.length), fp, zc:z, worklet:ch.rig.worklet};
      }
      const st0=rigFor(base); Object.values(st0.fx).forEach(f=>f.on=false); const plain=await render(st0);
      const out={plain};
      for(const p of AOGAmp.PEDALS){ const st=JSON.parse(JSON.stringify(st0)); st.fx[p.id].on=true; if(p.id==="gate"){ st.fx.gate.thr=9; } out[p.id]=await render(st); }
      out.fallback=await render(rigFor(G?"metal":"metal"), true);
      /* the gate: one long note left to ring; with the gate set high it is cut off once the string falls quiet */
      async function ring(st){ const oc=new OfflineAudioContext(1, 44100*3, 44100); await AOGAmp.load(oc); RIGS[base]=st; const ch=makeChain(oc); delete RIGS[base];
        ch.master.gain.value=volGain(0.8); setSendLevel(ch, base); setEra(ch,0,0); ch.pre.disconnect(); ch.master.disconnect(); ch.pre.connect(oc.destination);
        const m=G?45:33, vc=makeVoice(oc,ch,base,m,0.7,0.05,1); vc.stop(2.9, vc.tau);
        const d=(await oc.startRendering()).getChannelData(0); let last=0; for(let i=0;i<d.length;i++) if(Math.abs(d[i])>1e-3) last=i; return last/44100; }
      const g0=JSON.parse(JSON.stringify(st0)), g1=JSON.parse(JSON.stringify(st0)); g1.fx.gate.on=true; g1.fx.gate.thr=9;
      out.ring=[await ring(g0), await ring(g1)];
      return out;
    }, inst==="guitar");
    const diff=(a,b)=>Math.max(...a.fp.map((v,i)=>Math.abs(v-b.fp[i])))+Math.abs(Math.log((a.zc+1)/(b.zc+1)))*10;
    ok(r.ring[1] < r.ring[0]-0.3, `${inst}: the noise gate cuts a ringing note short (heard until ${r.ring[1].toFixed(2)} s, ${r.ring[0].toFixed(2)} s without it)`);
    for(const [id,v] of Object.entries(r)){ if(id==="plain"||id==="fallback"||id==="ring"||id==="gate") continue;
      ok(!v.nan && v.pk>0.005 && v.pk<6 && v.worklet && diff(v, r.plain)>0.8, `${inst}: ${id.padEnd(8)} plays and changes the sound (difference ${diff(v,r.plain).toFixed(1)}, peak ${v.pk.toFixed(2)})`); }
    ok(!r.fallback.nan && r.fallback.pk>0.01 && !r.fallback.worklet, `${inst}: without AudioWorklet the fallback amp still plays (peak ${r.fallback.pk.toFixed(2)})`);
    /* the panel */
    const ui=await p.evaluate(async(G)=>{
      const out={}; const ss=document.getElementById("soundSel"); ss.value=G?"clean":"finger"; ss.dispatchEvent(new Event("change",{bubbles:true}));
      ctx(); for(let i=0;i<40 && !LIVE_CH.rig.worklet;i++) await new Promise(r=>setTimeout(r,50));
      document.querySelector('#ampBox button[data-fs="delay"]').click();
      out.knobsShown=!document.querySelector('#ampBox .aa-ped[data-p="delay"] .aa-pk').hidden;
      out.liveOn=LIVE_CH.rig.state.fx.delay.on;
      const kn=document.querySelector('#ampBox input[data-scope="amp"][data-k="gain"]'); kn.value="9"; kn.dispatchEvent(new Event("input",{bubbles:true}));
      out.liveGain=LIVE_CH.rig.state.k.gain;
      const sel=document.querySelector('#ampBox select[data-aa="model"]'); sel.value=sel.options[sel.options.length-1].value; sel.dispatchEvent(new Event("change",{bubbles:true}));
      out.model=LIVE_CH.rig.state.model; out.cab=LIVE_CH.rig.state.cab;
      const band=document.querySelector('#ampBox input[data-band="3"]'); band.value="6"; band.dispatchEvent(new Event("input",{bubbles:true}));
      out.eq=[LIVE_CH.rig.state.eq.on, LIVE_CH.rig.state.eq.db[3]];
      await new Promise(r=>setTimeout(r,500));
      out.saved=JSON.parse(localStorage.getItem("aog."+INST+".amp.v1"))[S.sound];
      out.sound=S.sound;
      return out; }, inst==="guitar");
    ok(ui.knobsShown && ui.liveOn, `${inst}: Delay's switch shows its knobs and turns it on in the live amp`);
    ok(ui.liveGain===9, `${inst}: the Gain knob reaches the live amp`);
    ok(ui.model && ui.cab, `${inst}: picking an amp picks its cabinet (${ui.model}, ${ui.cab})`);
    ok(ui.eq[0]===true && ui.eq[1]===6, `${inst}: moving an EQ fader turns the EQ on`);
    ok(ui.saved && ui.saved.fx.delay.on && ui.saved.k.gain===9, `${inst}: the change is kept for ${ui.sound}`);
    await p.reload(); await p.waitForTimeout(800);
    const after=await p.evaluate(()=>({pressed:document.querySelector('#ampBox button[data-fs="delay"]').getAttribute("aria-pressed"), gain:document.querySelector('#ampBox input[data-scope="amp"][data-k="gain"]').value}));
    ok(after.pressed==="true" && +after.gain===9, `${inst}: after a reload the panel shows the kept settings`);
    const back=await p.evaluate(async()=>{ document.querySelector('#ampBox button[data-aa="back"]').click(); await new Promise(r=>setTimeout(r,400));
      return {pressed:document.querySelector('#ampBox button[data-fs="delay"]').getAttribute("aria-pressed"), saved:(JSON.parse(localStorage.getItem("aog."+INST+".amp.v1")||"{}"))[S.sound]||null,
              note:document.querySelector("#ampBox .aa-note").textContent, focus:document.activeElement&&document.activeElement.dataset.aa}; });
    ok(back.pressed==="false" && !back.saved && /Back to how/.test(back.note) && back.focus==="back", `${inst}: Put this sound back restores the sound's own rig and says so`);
    ok(!errs.length, `${inst}: no page errors ${errs.slice(0,3).join(" | ")}`);
    await c.close();
  }
  console.log(fail?fail+" FAILED":"ALL PASS"); await b.close(); srv.close();
})().catch(e=>{ console.log("CRASH", e.message); process.exit(1); });
