/* ══ AOG-VINYL-ENGINE-V1 (2026-09-22) ══════════════════════════════════════════
   The turntable DSP. Jimmy: "When I try to scratch the records nothing really
   works. I don't hear it like I would if it were real vinyl."

   What a real deck does, and what this does about it:

   · A record is never played by a rate switch — it is played by a PLATTER WITH
     MASS. The hand does not set the playhead, it sets an ANGULAR VELOCITY, and
     the playhead integrates that velocity one sample at a time. That is the
     whole difference: the old engine froze the playhead while the hand moved
     and jumped it once per pointer event (~60 a second), which is a stutter,
     not a scratch.
   · A stopped needle makes NO sound. Groove velocity is the signal, so this
     gates to silence as the record stops and comes back the instant it moves.
   · Let go and the platter does not snap: the motor pulls it back up to speed,
     the slipmat lets it slide, and a released throw keeps its spin. Hit stop
     and it coasts down — the power-down every DJ knows.
   · Backwards is not a special case. Negative velocity, same math.
   · Reading a sample between two samples is a cubic (Catmull-Rom) curve, not a
     straight line, and fast passages get a one-pole lowpass so the aliasing
     that made the old scratch sound like gravel never gets made.
   · Surface noise and the odd crackle ride the groove velocity, so they slow
     down with the record like they do on a real one.

   This one file is BOTH the AudioWorklet processor and, loaded as an ordinary
   script, the same core for the ScriptProcessor fallback on a browser with no
   AudioWorklet. One set of math, two hosts. ══════════════════════════════ */
(function (root) {
  "use strict";

  function VinylCore(sampleRate) {
    this.sr = sampleRate || 44100;
    this.L = null; this.R = null; this.len = 0;
    this.srRatio = 1;          /* buffer sample rate ÷ context sample rate */
    this.pos = 0;              /* playhead, in buffer samples */
    this.rate = 0;             /* current speed, buffer samples per output sample */
    this.handOn = false;
    this.handRate = 0;         /* what the hand is doing, in nominal speeds */
    this.motorOn = false;
    this.pitch = 1;            /* pitch slider */
    this.rpm = 1;              /* 1 = 33⅓, 1.35 = 45 */
    this.noiseAmt = 0.5;       /* 0..1 */
    this.cue = 0;
    this.level = 0;
    this.ended = false;
    /* filter state */
    this.lpL = 0; this.lpR = 0;
    this.dcXL = 0; this.dcYL = 0; this.dcXR = 0; this.dcYR = 0;
    this.nz = 0; this.pop = 0; this.popDecay = 0;
    this.gate = 0;
    this.loopOn = false; this.loopA = 0; this.loopB = 0;
    /* ── AOG-VINYL-KEYLOCK-V1 · slip · reverse ──────────────────────────────
       Keylock is a grain mill: instead of reading the groove faster or slower
       (which moves the pitch with it), it takes SHORT PIECES at the record's own
       speed and lays them down closer together or further apart, each new piece
       slid to where it best agrees with the tail of the last one (that search is
       what WSOLA means, and it is the difference between a voice and a warble).
       It stands aside the moment a hand touches the platter — a scratch is
       SUPPOSED to change pitch. ─────────────────────────────────────────────── */
    this.kl = false; this.klMix = 0;
    this.N = 2048; this.H = 1024; this.SEEK = 420;
    this.win = new Float32Array(this.N);
    for (var w = 0; w < this.N; w++) this.win[w] = 0.5 - 0.5 * Math.cos(2 * Math.PI * w / this.N);
    this.RM = 8192; this.RMask = this.RM - 1;
    this.rL = new Float32Array(this.RM); this.rR = new Float32Array(this.RM);
    this.rRead = 0; this.rWrite = 0; this.rFill = 0; this.grainStart = 0; this.primed = false;
    this.slip = false; this.slipPos = 0; this.rev = false;
  }

  VinylCore.prototype.setBuffer = function (L, R, bufSampleRate) {
    this.L = L; this.R = R || L; this.len = L ? L.length : 0;
    this.srRatio = (bufSampleRate || this.sr) / this.sr;
    this.pos = 0; this.rate = 0; this.ended = false;
  };
  VinylCore.prototype.msg = function (m) {
    switch (m.t) {
      case "buf":   this.setBuffer(m.L, m.R, m.sr); break;
      case "hand":
        if (m.on && !this.handOn) this.slipPos = this.pos;      /* the record it WOULD have been playing */
        if (!m.on && this.handOn && this.slip) this.pos = this.slipPos;
        this.handOn = !!m.on; this.handRate = m.rate || 0;
        break;
      case "motor": this.motorOn = !!m.on; if (m.on) this.ended = false; break;
      case "pitch": this.pitch = m.v; break;
      case "rpm":   this.rpm = m.v; break;
      case "noise": this.noiseAmt = m.v; break;
      case "seek":  this.pos = Math.max(0, Math.min(this.len - 3, m.v)); this.rate = 0; this.ended = false; break;
      /* AOG-VINYL-LOOP-V1 — a loop is two marks and a wrap, taken on the audio
         thread so the seam lands on the exact sample and never on a frame. */
      /* a slip loop and a slip reverse both end the same way: the record was
         turning the whole time under your hand, and you drop back onto it. */
      case "loop":
        if (m.on && !this.loopOn) this.slipPos = this.pos;
        if (!m.on && this.loopOn && this.slip) this.pos = this.slipPos;
        this.loopOn = !!m.on; this.loopA = m.a || 0; this.loopB = m.b || 0;
        break;
      case "key":   this.kl = !!m.on; break;
      case "slip":  this.slip = !!m.on; this.slipPos = this.pos; break;
      case "rev":
        if (m.on && !this.rev) this.slipPos = this.pos;
        if (!m.on && this.rev && this.slip) this.pos = this.slipPos;
        this.rev = !!m.on;
        break;
      case "clear": this.L = this.R = null; this.len = 0; this.pos = 0; this.rate = 0; break;
    }
  };

  /* one sample, cubic between neighbors */
  function hermite(ch, i, f) {
    var y0 = ch[i - 1] || 0, y1 = ch[i] || 0, y2 = ch[i + 1] || 0, y3 = ch[i + 2] || 0;
    var c0 = y1;
    var c1 = 0.5 * (y2 - y0);
    var c2 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
    var c3 = 0.5 * (y3 - y0) + 1.5 * (y1 - y2);
    return ((c3 * f + c2) * f + c1) * f + c0;
  }

  /* one grain: N samples read at the record's own speed, windowed, overlapped
     onto the tail of the last one at the place the two agree best. */
  VinylCore.prototype.grain = function () {
    var L = this.L, R = this.R, N = this.N, H = this.H, win = this.win;
    var base = this.pos;
    var best = base, bestScore = -1e9;
    if (this.primed) {
      /* compare the first half of a candidate grain with what is already written
         in the overlap region — 1/4-sample stride is plenty and keeps it cheap */
      var lo = base - this.SEEK, hi = base + this.SEEK;
      if (lo < 1) lo = 1;
      if (hi > this.len - N - 2) hi = this.len - N - 2;
      for (var c = lo; c <= hi; c += 8) {
        var score = 0, norm = 1e-9;
        for (var k = 0; k < 256; k += 4) {
          var a = L[(c + k * this.srRatio) | 0] || 0;
          var b = this.rL[(this.rWrite + k) & this.RMask];
          score += a * b; norm += a * a;
        }
        score /= Math.sqrt(norm);
        if (score > bestScore) { bestScore = score; best = c; }
      }
    } else { best = base; this.primed = true; }
    if (best < 1) best = 1;
    if (best > this.len - N * this.srRatio - 3) best = Math.max(1, this.len - N * this.srRatio - 3);
    for (var i = 0; i < N; i++) {
      var p = best + i * this.srRatio;
      var i1 = p | 0, f = p - i1;
      var w = win[i];
      var idx = (this.rWrite + i) & this.RMask;
      if (i < H) {                                   /* overlap: add onto the tail */
        this.rL[idx] += hermite(L, i1, f) * w;
        this.rR[idx] += hermite(R, i1, f) * w;
      } else {                                       /* new ground: write it clean */
        this.rL[idx] = hermite(L, i1, f) * w;
        this.rR[idx] = hermite(R, i1, f) * w;
      }
    }
    this.rWrite = (this.rWrite + H) & this.RMask;
    this.rFill += H;
  };
  VinylCore.prototype.process = function (outL, outR, n) {
    var L = this.L, R = this.R, sr = this.sr;
    if (!L || this.len < 4) {
      for (var z = 0; z < n; z++) { outL[z] = 0; outR[z] = 0; }
      this.level = 0; return;
    }
    /* how fast the platter is being asked to turn, in buffer samples per output sample */
    var runRate = this.motorOn ? this.pitch * this.rpm * this.srRatio : 0;   /* the platter's own speed */
    var motorRate = runRate * (this.rev ? -1 : 1);
    var target = this.handOn ? this.handRate * this.srRatio : motorRate;

    /* the hand grips hard (6 ms). Off the hand, the slipmat lets the record snap
       back to a platter already turning (100 ms), while a deck starting from a
       dead stop has to spin the platter itself up (300 ms) — and a stopped deck
       coasts down (340 ms). That difference is most of what a deck feels like. */
    var tau = this.handOn ? 0.006
            : (this.motorOn ? (Math.abs(this.rate) < 0.25 ? 0.30 : 0.10) : 0.34);
    var k = 1 - Math.exp(-1 / (tau * sr));
    var peak = 0, last = this.len - 3;

    for (var i = 0; i < n; i++) {
      this.rate += (target - this.rate) * k;
      var p = this.pos;

      if (p < 1) { p = this.pos = 1; if (this.rate < 0) this.rate = 0; }
      if (p > last) {
        this.pos = last;
        if (this.rate > 0) { this.rate = 0; this.motorOn = false; this.ended = true; target = 0; }
        p = last;
      }

      var i1 = p | 0, f = p - i1;
      var sL = hermite(L, i1, f), sR = hermite(R, i1, f);

      /* keylock rides alongside and is faded in only where it belongs */
      var vAbs = Math.abs(this.rate) / (this.srRatio || 1);
      /* ⚠ at normal speed there is nothing to correct, so the mill stays off and
         the record plays straight through. Grain machinery you cannot hear is
         still grain machinery you can hear. */
      var klWant = (this.kl && !this.handOn && this.rate > 0 &&
                    vAbs > 0.35 && vAbs < 2.2 && Math.abs(vAbs - 1) > 0.012) ? 1 : 0;
      this.klMix += (klWant - this.klMix) * 0.0015;          /* ~10 ms, click-free */
      if (this.klMix > 0.001) {
        if (this.rFill < 2) this.grain();
        var kL = this.rL[this.rRead], kR = this.rR[this.rRead];
        this.rL[this.rRead] = 0; this.rR[this.rRead] = 0;     /* clear as we leave */
        this.rRead = (this.rRead + 1) & this.RMask; this.rFill--;
        sL = sL * (1 - this.klMix) + kL * this.klMix;
        sR = sR * (1 - this.klMix) + kR * this.klMix;
      } else if (this.primed && this.klMix <= 0.001) {
        this.primed = false; this.rFill = 0; this.rRead = this.rWrite = 0;
      }

      /* the cartridge hears groove VELOCITY: still record, no sound */
      var v = Math.abs(this.rate) / (this.srRatio || 1);
      var want = v < 0.015 ? 0 : Math.min(1, Math.pow(Math.min(v, 1), 0.22));
      this.gate += (want - this.gate) * 0.02;          /* ~1 ms, click-free */
      var g = this.gate;

      /* fast passes get filtered, so speed never turns into gravel */
      var fc = 0.45 * sr / Math.max(1, v);
      var a = 1 - Math.exp(-6.2831853 * Math.min(fc, 0.45 * sr) / sr);
      this.lpL += a * (sL - this.lpL);
      this.lpR += a * (sR - this.lpR);
      var yL = this.lpL * g, yR = this.lpR * g;

      /* surface noise and crackle ride the groove speed */
      if (this.noiseAmt > 0 && v > 0.02) {
        this.nz += 0.22 * ((Math.random() * 2 - 1) - this.nz);
        var hiss = this.nz * 0.02 * this.noiseAmt * Math.min(1, v);
        if (this.popDecay > 0) { this.popDecay *= 0.86; } else if (Math.random() < 0.00008 * Math.min(2, v)) {
          this.pop = (Math.random() * 2 - 1) * 0.28 * this.noiseAmt; this.popDecay = 1;
        }
        var crack = this.pop * this.popDecay;
        yL += hiss + crack; yR += hiss - crack;
      }

      /* DC blocker — a held record must not leave a step on the output */
      this.dcYL = yL - this.dcXL + 0.9975 * this.dcYL; this.dcXL = yL;
      this.dcYR = yR - this.dcXR + 0.9975 * this.dcYR; this.dcXR = yR;
      outL[i] = this.dcYL; outR[i] = this.dcYR;
      if (this.dcYL > peak) peak = this.dcYL; else if (-this.dcYL > peak) peak = -this.dcYL;

      this.pos += this.rate;
      if (this.slip) {
        this.slipPos += runRate;          /* ⚠ the shadow always runs FORWARD */
        if (this.slipPos > last) this.slipPos = last;
        if (this.slipPos < 1) this.slipPos = 1;
      } else this.slipPos = this.pos;
      if (this.loopOn && this.loopB > this.loopA + 32) {
        var span = this.loopB - this.loopA;
        if (this.rate >= 0 && this.pos >= this.loopB) this.pos -= span;
        else if (this.rate < 0 && this.pos < this.loopA) this.pos += span;
      }
    }
    this.level = peak;
  };

  root.AOGVinylCore = VinylCore;

  if (typeof registerProcessor === "function" && typeof AudioWorkletProcessor === "function") {
    /* eslint-disable no-undef */
    class VinylDeck extends AudioWorkletProcessor {
      constructor() {
        super();
        this.core = new VinylCore(sampleRate);
        this.tick = 0;
        this.port.onmessage = (e) => { this.core.msg(e.data); };
      }
      process(inputs, outputs) {
        const out = outputs[0];
        const n = out[0].length;
        this.core.process(out[0], out[1] || out[0], n);
        if (++this.tick % 6 === 0) {
          this.port.postMessage({
            t: "st", pos: this.core.pos, level: this.core.level,
            rate: this.core.rate / (this.core.srRatio || 1),
            motor: this.core.motorOn, ended: this.core.ended
          });
        }
        return true;
      }
    }
    registerProcessor("aog-vinyl", VinylDeck);

    /* ── THE TAPE ─────────────────────────────────────────────────────────────
       A pass-through that copies what the mix is doing out to the page while the
       DJ is recording. It records THE DECKS — never a microphone: nothing is
       listened to, and the take never leaves this computer. */
    class Tape extends AudioWorkletProcessor {
      constructor() {
        super();
        this.on = false; this.n = 0;
        this.L = new Float32Array(8192); this.R = new Float32Array(8192);
        this.port.onmessage = (e) => {
          if (e.data && e.data.t === "arm") { this.flush(); this.on = !!e.data.on; this.flush(); }
        };
      }
      flush() {
        if (!this.n) return;
        const L = this.L.slice(0, this.n), R = this.R.slice(0, this.n);
        this.n = 0;
        this.port.postMessage({ t: "chunk", L: L, R: R }, [L.buffer, R.buffer]);
      }
      process(inputs, outputs) {
        const inp = inputs[0], out = outputs[0];
        if (inp && inp.length) {
          const l = inp[0], r = inp[1] || inp[0];
          if (out && out.length) {
            out[0].set(l);
            if (out[1]) out[1].set(r);
          }
          if (this.on) {
            for (let i = 0; i < l.length; i++) {
              if (this.n >= this.L.length) this.flush();
              this.L[this.n] = l[i]; this.R[this.n] = r[i]; this.n++;
            }
          }
        }
        return true;
      }
    }
    registerProcessor("aog-tape", Tape);
  }
})(typeof globalThis !== "undefined" ? globalThis
   : (typeof self !== "undefined" ? self : this));
/* ⚠ globalThis, not self: an AudioWorkletGlobalScope has NO self and no window,
   and a module's top-level `this` is undefined — the whole file threw there,
   which is why every deck quietly fell back to the old ScriptProcessor. */
