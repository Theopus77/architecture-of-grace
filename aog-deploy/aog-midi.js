/* AOG-MIDI-V1 (2026-10-11) — Jimmy: "Play it from a real keyboard everywhere." One small helper every music room loads, so a
   MIDI keyboard plays the Piano, the Band, the Guitar, the Bass and the Drum Machine the same way (it began as the piano's own
   code, AOG-PIANO-MIDI-V2).

     const midi=AOGMidi.attach({
       btn:"midiBtn", line:"midiLine",       the button (shown only where the browser has Web MIDI) and the one-line answer
       lang:()=>S.lang,                      "en" or "es"
       start:ctx,                            starts the sound inside the tap (an iPad will not start it later for a MIDI key)
       on:(note, vel)=>…,  off:(note)=>…,    a key pressed (vel 0..1) and let go
       sustain:(down)=>…,                    the sustain pedal (CC64), if the room has one
       bend:(semitones)=>…,                  the pitch wheel, ±2 semitones, if the room bends
       words:{…}                             a room's own words, to replace any of W below
     });
     midi.paint()   after the language changes

   AOG-MIDI-EXPR-V1 (2026-10-23) — Jimmy wants the Studio pro-grade everywhere: a keyboard's other controls reach the rooms
   too, as a small list of events a room listens to:
     midi.on("mod", (v)=>…)          the mod wheel, CC1                    v 0..1
     midi.on("breath", (v)=>…)       a breath controller, CC2              v 0..1
     midi.on("expression", (v)=>…)   an expression pedal, CC11             v 0..1
     midi.on("pedal", (v)=>…)        the sustain pedal as it moves, CC64   v 0..1 (a half-pedal is about 0.5; sustain()
                                     above still gets down or up at the middle)
     midi.on("pressure", (v)=>…)     channel aftertouch (0xD0)             v 0..1
     midi.on("cc", (n, v)=>…)        any other control change: its number, and v 0..1 (a room maps a knob or a fader)
     midi.on("note", (note, vel, ch)=>…)   every key pressed, with its channel 0..15 (General MIDI drums are channel 9)
   midi.on returns a function that stops listening (the same as midi.off(type, fn)); attach({… expr:(type, v)=>…}) hears
   the first five. A room the Studio keeps out of sight hears none of them, as with its notes. Nothing here asks for MIDI
   or shows anything: it only passes on what a keyboard already plugged in and allowed sends.

   Nothing asks the browser for MIDI until the button is pressed, so no permission box appears by surprise. Every keyboard
   plugged in is heard; when one is plugged in or taken out, the line says so; a keyboard taken out lets go of its notes. */
(function(){
  "use strict";
  const W={
    btn:{en:"Use a MIDI keyboard",es:"Usar un teclado MIDI"},
    ready:{en:"MIDI keyboard ready: {name}.",es:"Teclado MIDI listo: {name}."},
    none:{en:"No MIDI keyboard yet. Plug one in and it shows up here.",es:"Todavía no hay un teclado MIDI. Conéctalo y aparecerá aquí."},
    wait:{en:"Looking for your MIDI keyboard…",es:"Buscando tu teclado MIDI…"},
    no:{en:"This browser did not let this room use MIDI. On a computer, try Chrome or Edge.",es:"Este navegador no dejó usar MIDI aquí. En una computadora, prueba Chrome o Edge."},
    gone:{en:"{name} was unplugged. Plug it back in to keep playing.",es:"Se desconectó {name}. Vuelve a conectarlo para seguir tocando."}
  };
  const $=x=>typeof x==="string" ? document.getElementById(x) : x;
  function attach(o){
    const btn=$(o.btn), line=$(o.line), words=Object.assign({}, W, o.words||{});
    const say=(k, v)=>{ let s=(words[k]||{})[o.lang && o.lang()==="es" ? "es" : "en"]||""; if(v) Object.keys(v).forEach(x=>{ s=s.split("{"+x+"}").join(v[x]); }); return s; };
    const ctl={access:null, last:null, held:new Map(), names:[], supported:!!navigator.requestMIDIAccess,
      paint(){ if(btn) btn.textContent=say("btn"); if(line && ctl.last) line.textContent=say(ctl.last[0], ctl.last[1]); },
      /* for a test or a room: feed one message as if a keyboard sent it */
      message(data, from){ msg(data, from||"x"); },
      /* AOG-MIDI-EXPR-V1: a room listens for a control */
      on(type, fn){ (subs[type]=subs[type]||[]).push(fn); return ()=>ctl.off(type, fn); },
      off(type, fn){ const l=subs[type]; if(l){ const i=l.indexOf(fn); if(i>=0) l.splice(i,1); } }};
    const subs={};
    const emit=(type, a, b, c)=>{ (subs[type]||[]).slice().forEach(fn=>{ try{ fn(a, b, c); }catch(e){} }); };
    const EXPR={1:"mod", 2:"breath", 11:"expression"};
    const tell=(k, v)=>{ ctl.last=[k, v]; if(line) line.textContent=say(k, v); };
    /* a room the Studio keeps open out of sight (its frame hidden) does not play: only the room in view answers the
       keyboard. It still lets go of the keys it holds. */
    function away(){ try{ const f=window.frameElement; return !!f && (f.hidden || f.style.display==="none" || !f.getClientRects().length); }catch(e){ return false; } }
    /* the keys still down on each keyboard, so one taken out lets go of them */
    function msg(d, from){
      if(!d || d.length<1) return;
      const st=d[0], cmd=st&0xf0, a=d[1]|0, b=d[2]|0;
      let h=ctl.held.get(from); if(!h){ h=new Set(); ctl.held.set(from, h); }
      if(cmd===0x90 && b>0){ if(away()) return; h.add(a); emit("note", a, b/127, st&0x0f); if(o.on) o.on(a, b/127); }
      else if(cmd===0x80 || (cmd===0x90 && b===0)){ if(!h.has(a)) return; h.delete(a); if(o.off) o.off(a); }
      else if(cmd===0xb0){
        if(a===64){ if(o.sustain && !(b>=64 && away())) o.sustain(b>=64); if(!away()) emit("pedal", b/127); }
        else if(a===120 || a===123){ h.forEach(n=>{ if(o.off) o.off(n); }); h.clear(); if(a===123 && o.sustain) o.sustain(false); }   /* all sound off, all notes off */
        else if(!away()){ const k=EXPR[a]; if(k){ emit(k, b/127); if(o.expr) o.expr(k, b/127); } else emit("cc", a, b/127); }   /* AOG-MIDI-EXPR-V1 */
      }
      else if(cmd===0xd0){ if(!away()){ emit("pressure", a/127); if(o.expr) o.expr("pressure", a/127); } }   /* channel aftertouch: one value, d[1] */
      else if(cmd===0xe0 && o.bend && !away()){ const v=((b<<7)|a)-8192; o.bend(2*v/8192); }
    }
    function letGo(id){ const h=ctl.held.get(id); if(h){ h.forEach(n=>{ if(o.off) o.off(n); }); ctl.held.delete(id); } }
    function hook(){
      const acc=ctl.access, ins=[...acc.inputs.values()].filter(i=>i.state!=="disconnected"), ids=[];   /* a browser may keep a port it lost, marked so */
      ins.forEach((inp, i)=>{ const id=inp.id||inp.name||("in"+i); ids.push(id); inp.onmidimessage=(e)=>msg(e && e.data, id); });
      const was=ctl.names, now=ins.map(i=>i.name||"MIDI");
      /* a keyboard taken out: its notes stop, and the line says which one */
      [...ctl.held.keys()].forEach(id=>{ if(ids.indexOf(id)<0 && id!=="x") letGo(id); });
      const lost=was.filter(n=>now.indexOf(n)<0);
      ctl.names=now;
      if(lost.length && !now.some(n=>was.indexOf(n)<0)){ if(o.sustain) o.sustain(false); tell("gone", {name:lost.join(", ")}); }
      else tell(now.length ? "ready" : "none", now.length ? {name:now.join(", ")} : null);
    }
    async function use(){
      try{ if(o.start) o.start(); }catch(e){}
      tell("wait");
      try{
        ctl.access=ctl.access||await navigator.requestMIDIAccess();
        hook(); ctl.access.onstatechange=hook;
      }catch(e){ tell("no"); }
    }
    if(btn){
      if(ctl.supported){ btn.hidden=false; btn.onclick=use; } else btn.hidden=true;
    }
    ctl.use=use;
    ctl.paint();
    return ctl;
  }
  window.AOGMidi={attach:attach, WORDS:W};
})();
