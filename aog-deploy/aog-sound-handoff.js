/* AOG-SOUND-HANDOFF-V1 (2026-09-26) — Jimmy: "record a sound from this and upload
   to the drum machine as a sample or to the turntables." One small shelf in this
   browser (IndexedDB "aog-handoff") carries one recorded sound from a bench to
   another. Nothing leaves the computer. */
(function(){
  function db(){ return new Promise(function(ok,no){ var r=indexedDB.open("aog-handoff",1);
    r.onupgradeneeded=function(){ r.result.createObjectStore("s"); }; r.onsuccess=function(){ ok(r.result); }; r.onerror=function(){ no(r.error); }; }); }
  window.aogHandoffPut=function(v){ return db().then(function(d){ return new Promise(function(ok){ var t=d.transaction("s","readwrite"); t.objectStore("s").put(v,"sound"); t.oncomplete=function(){ d.close(); ok(); }; }); }); };
  window.aogHandoffTake=function(){ return db().then(function(d){ return new Promise(function(ok){ var t=d.transaction("s","readwrite"), st=t.objectStore("s"), q=st.get("sound");
    q.onsuccess=function(){ var v=q.result||null; st.delete("sound"); t.oncomplete=function(){ d.close(); ok(v); }; }; q.onerror=function(){ d.close(); ok(null); }; }); }).catch(function(){ return null; }); };
  /* 16-bit mono WAV from an AudioBuffer */
  window.aogWav=function(buf){
    var ch=buf.getChannelData(0), n=ch.length, sr=buf.sampleRate, b=new ArrayBuffer(44+n*2), v=new DataView(b);
    function w(o,s){ for(var i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i)); }
    w(0,"RIFF"); v.setUint32(4,36+n*2,true); w(8,"WAVE"); w(12,"fmt "); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
    v.setUint32(24,sr,true); v.setUint32(28,sr*2,true); v.setUint16(32,2,true); v.setUint16(34,16,true); w(36,"data"); v.setUint32(40,n*2,true);
    for(var i=0;i<n;i++){ var x=Math.max(-1,Math.min(1,ch[i])); v.setInt16(44+i*2,x<0?x*0x8000:x*0x7FFF,true); }
    return new Blob([b],{type:"audio/wav"});
  };
})();
