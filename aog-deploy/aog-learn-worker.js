/* AOG-LEARN-V1 — the listening worker. It runs aog-learn.js's listening (the beat, the key, the chords, the bass line and
   the melody) away from the page, so the page stays calm while a song is heard. It gets the song's samples (22050 Hz,
   mono, a Float32Array) from AOGLearn.analyze and sends back how far it is and then the lesson. Nothing leaves the device. */
self.importScripts("aog-learn.js" + (self.location.search || ""));
self.onmessage = function (e) {
  var d = e.data || {};
  if (d.type !== "analyze") return;
  self.AOGLearn._analyzePCM(d.pcm, { name: d.name || "", onProgress: function (p, key) { self.postMessage({ type: "progress", p: p, key: key }); } })
    .then(function (lesson) { self.postMessage({ type: "done", lesson: lesson }); })
    .catch(function (err) { self.postMessage({ type: "error", message: String((err && err.message) || err) }); });
};
self.postMessage({ type: "ready" });
