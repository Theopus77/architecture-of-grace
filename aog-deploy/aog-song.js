/* AOG-SONG-V1 (2026-10-11) — one tempo and one key for the whole song. Jimmy: "Do the fixes first, then 1, 2, 3"
   (2: "One tempo and key for the song. Set them once in the Studio, and every room opens there. Takes then line up
   without being stretched.")

   The song keeps its tempo (beats a minute) and its key (a home note, major or minor) on this device, in localStorage
   "aog.song.v1". Every music room follows it: when it opens, when it comes back into sight, and the moment the song
   changes in another room or tab. A change made in a room (its tempo or key controls) changes the song, so there is
   only ever one tempo and one key. Nothing here leaves the device.

   Until the song has a tempo, each room keeps its own, as before. The song gets one the first time you set it (the
   Studio's Song button, or a tempo or key control in a room), or from the first take you record, or from the Mixing
   Desk's first recording.

   A room joins with
     AOGSong.room({ bpm:{get, set, min, max}, key:{get, set} (optional), watch:{bpm:[ids], key:[ids]} });
   key.get() returns {key:0-11, minor:bool}; key.set({key, minor}). The ids are the room's own controls: after the room
   has handled a change to one of them, the song takes the room's new value. A recorder asks AOGSong.seed(bpm, key)
   when a take is made: it sets the song only if the song has none yet.
     AOGSong.get()   {bpm, key, minor, hasBpm, hasKey} or null
     AOGSong.set(p)  change it ({bpm} and/or {key, minor})
     AOGSong.on(fn)  told whenever it changes (here or anywhere else on this device)
     AOGSong.name(lang)  "92 · C major" */
(function () {
  "use strict";
  var KEY = "aog.song.v1", MIN = 40, MAX = 240, subs = [], room = null, applying = false, bc = null;
  var NOTES = { en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"], es: ["Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "La♭", "La", "Si♭", "Si"] };
  function clampB(v, lo, hi) { v = Math.round(+v); return Math.max(lo, Math.min(hi, v)); }
  function hund(v, lo, hi) { v = Math.round(+v * 100) / 100; return Math.max(lo, Math.min(hi, v)); }   /* the song: to a hundredth (a desk speed); a room rounds it */
  function read() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (!s || typeof s !== "object") return null;
      var hasBpm = s.bpm >= MIN && s.bpm <= MAX, hasKey = s.key >= 0 && s.key <= 11;
      if (!hasBpm && !hasKey) return null;
      return { bpm: hasBpm ? Math.round(s.bpm * 100) / 100 : 0, key: hasKey ? (s.key | 0) : 0, minor: !!s.minor, hasBpm: hasBpm, hasKey: hasKey, at: +s.at || 0 };
    } catch (e) { return null; }
  }
  function fire() { var s = read(); subs.forEach(function (f) { try { f(s); } catch (e) {} }); }
  function write(s) {
    var o = { at: Date.now() };
    if (s.hasBpm) o.bpm = s.bpm;
    if (s.hasKey) { o.key = s.key; o.minor = !!s.minor; }
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
    try { (bc || (bc = new BroadcastChannel("aog-music"))).postMessage({ t: "song" }); } catch (e) {}
    apply(); fire();
  }
  function set(p) {
    var s = read() || { bpm: 0, key: 0, minor: false, hasBpm: false, hasKey: false }, ch = false;
    if (p && p.bpm != null && +p.bpm > 0) { var b = hund(p.bpm, MIN, MAX); if (!s.hasBpm || b !== s.bpm) { s.bpm = b; s.hasBpm = true; ch = true; } }
    if (p && p.key != null && +p.key >= 0) { var k = ((p.key | 0) % 12 + 12) % 12, m = !!p.minor; if (!s.hasKey || k !== s.key || m !== s.minor) { s.key = k; s.minor = m; s.hasKey = true; ch = true; } }
    if (ch) write(s);
    return read();
  }
  /* the first take, or the desk's first recording: the song's tempo (and key) only when it has none yet */
  function seed(bpm, key) {
    var s = read(), p = {};
    if ((!s || !s.hasBpm) && bpm > 0) p.bpm = bpm;
    if ((!s || !s.hasKey) && key && key.key != null) { p.key = key.key; p.minor = key.minor; }
    if (p.bpm != null || p.key != null) set(p);
  }
  /* a room's own tempo and key, the first time a take is made there (aog-recorder.js) */
  function seedFromRoom() {
    if (!room) return;
    try { seed(room.bpm ? +room.bpm.get() : 0, room.key ? room.key.get() : null); } catch (e) {}
  }
  /* a song already on the Mixing Desk keeps its tempo: the first time, the song takes the desk's (its first recording's) */
  function fromDesk() {
    if (read()) return;
    try {
      var sg = JSON.parse(localStorage.getItem("aog.studio.v1") || "null"), T = sg && sg.tracks || [];
      for (var i = 0; i < T.length; i++) { var c = T[i] && T[i].clip; if (c && c.bpm > 0) { set({ bpm: c.bpm * (c.speed > 0 ? c.speed : 1) }); return; } }
    } catch (e) {}
  }
  /* the room follows the song */
  function apply() {
    if (!room) return;
    var s = read(); if (!s) return;
    applying = true;
    try {
      if (s.hasBpm && room.bpm) {
        var want = clampB(s.bpm, room.bpm.min || MIN, room.bpm.max || MAX);
        if (Math.round(+room.bpm.get()) !== want) room.bpm.set(want);
      }
      if (s.hasKey && room.key) {
        var k = room.key.get() || {};
        if ((k.key | 0) !== s.key || !!k.minor !== s.minor) room.key.set({ key: s.key, minor: s.minor });
      }
    } catch (e) {}
    applying = false;
  }
  /* a change made in the room changes the song */
  function fromRoom(what) {
    if (applying || !room) return;
    try {
      if (what === "bpm" && room.bpm) { var s0 = read(), v = +room.bpm.get(); if (!s0 || !s0.hasBpm || Math.round(s0.bpm) !== Math.round(v)) set({ bpm: v }); }   /* a room's whole number is not a change to a song at 97.3 */
      if (what === "key" && room.key) { var k = room.key.get(); if (k) set({ key: k.key, minor: k.minor }); }
    } catch (e) {}
  }
  /* the room's own controls: listened for on the whole page, so a control the room draws again is still heard */
  var WATCH = {};
  function watch(ids, what) { (ids || []).forEach(function (id) { WATCH[id] = what; }); }
  ["change", "click", "input"].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var el = e.target && e.target.closest ? e.target.closest("[id]") : null, what = el && WATCH[el.id];
      if (!what || (type === "input" && !(el.tagName === "INPUT" && el.type === "range"))) return;
      setTimeout(function () { fromRoom(what); }, 0);   /* after the room has handled it */
    });
  });
  function join(o) {
    room = o || null; if (!room) return;
    var w = room.watch || {}; watch(w.bpm, "bpm"); watch(w.key, "key");
    apply();
    window.addEventListener("focus", apply);   /* the Studio shows a kept room again with a "focus" (AOG-STUDIO-KEEP-V1) */
  }
  window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === null) { apply(); fire(); } });
  try { new BroadcastChannel("aog-music").onmessage = function (e) { if (e.data && e.data.t === "song") { apply(); fire(); } }; } catch (e) {}
  function name(lang) {
    var s = read(); if (!s) return "";
    var es = lang === "es", parts = [];
    if (s.hasBpm) parts.push(String(Math.round(s.bpm)));
    if (s.hasKey) parts.push(NOTES[es ? "es" : "en"][s.key] + " " + (es ? (s.minor ? "menor" : "mayor") : (s.minor ? "minor" : "major")));
    return parts.join(" · ");
  }
  /* the piano, the guitar, the bass and the band share one way of setting tempo and key: their own controls, pressed as a
     hand would (a range #bpm, a menu #keySel, Major/Minor buttons), so each room does exactly what it always does */
  function keysRoom(o) {
    var $ = function (id) { return document.getElementById(id); };
    var go = function () { join({
      bpm: { get: function () { return o.get().bpm; }, min: o.min || 50, max: o.max || 180,
        set: function (v) { var el = $("bpm"); if (!el) return; el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); } },
      key: { get: function () { var g = o.get(); return { key: g.key, minor: !!g.minor }; },
        set: function (k) { var g = o.get(), el = $("keySel");
          if (el && g.key !== k.key) { el.value = k.key; el.dispatchEvent(new Event("change", { bubbles: true })); }
          if (!!g.minor !== !!k.minor) { var b = $(k.minor ? "minBtn" : "majBtn"); if (b) b.click(); } } },
      watch: { bpm: ["bpm"], key: ["keySel", "keySel2", "majBtn", "minBtn", "majBtn2", "minBtn2"] } }); };
    if (document.readyState === "complete") go(); else window.addEventListener("load", go);
  }
  fromDesk();
  window.AOGSong = { get: read, set: set, seed: seed, seedFromRoom: seedFromRoom, on: function (f) { subs.push(f); }, room: join, keysRoom: keysRoom, name: name, NOTES: NOTES, MIN: MIN, MAX: MAX };
})();
