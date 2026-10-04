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
   AudioWorklet. One set of math, two hosts.

   ══ AOG-DJ-ENGINE-V1 (2026-10-04) — the deck learns to play in time ══════════
   Jimmy's DJs: a house DJ who blended for ten minutes at a time, a sampling DJ
   who chopped records into pads, a techno DJ who runs three decks at once.
   · EVERY JUMP IS A CROSSFADE. A loop coming round, a hot cue, a slip return, a
     seek while the record turns: the old place fades out while the new place
     fades in over 4 ms. Two different waveforms meeting at one sample is a click;
     two that overlap for 4 ms is not.
   · A QUANTIZED JUMP waits for the beat. The page says "go to this chop on the
     next beat"; the jump happens here, on the audio thread, the moment the
     needle crosses the grid line — to the sample, whatever the screen is doing.
     A press that lands just after a beat counts as on it (the phase is kept).
   · SLIP: while a chop, a loop, a scratch or a reverse plays, a shadow needle
     keeps the song going underneath. Let go and the record drops back onto the
     shadow — in time, because the shadow never stopped.
   · A START OR A JUMP CAN BE BOOKED FOR A FRAME of the audio clock, so a deck
     synced to another can start exactly on that deck's next beat.
   · THE MIXER'S EFFECTS (aog-djfx below): echo, reverb and flanger, timed in
     beats of the record's own tempo. ═══════════════════════════════════════ */
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
    /* AOG-DJ-ENGINE-V1 */
    this.frame = 0;            /* the audio clock: output frame of the next sample */
    this.xfLen = Math.max(64, Math.round(this.sr * 0.004));
    this.xf = 0; this.xfPos = 0;
    this.div = false;          /* the needle has left the shadow (slip) */
    this.pend = null;          /* a quantized jump waiting for its grid line */
    this.ret = null;           /* a slip return waiting for its grid line */
    this.sched = [];           /* messages booked for a frame */
    this.bend = 1;             /* a held-in-time correction from SYNC */
    this.jumps = 0; this.wraps = 0; this.lastJump = null;
  }

  VinylCore.prototype.setBuffer = function (L, R, bufSampleRate) {
    this.L = L; this.R = R || L; this.len = L ? L.length : 0;
    this.srRatio = (bufSampleRate || this.sr) / this.sr;
    this.pos = 0; this.rate = 0; this.ended = false;
    this.xf = 0; this.pend = null; this.ret = null; this.div = false; this.sched = [];
    this.loopOn = false; this.slipPos = 0;
  };
  /* the motor's own speed, in buffer samples per output sample */
  VinylCore.prototype.runRate = function () {
    return this.motorOn ? this.pitch * this.rpm * this.srRatio * this.bend : 0;
  };
  VinylCore.prototype.aim = function () {
    var run = this.runRate();                                         /* the platter's own speed */
    var motorRate = run * (this.rev ? -1 : 1);
    this._run = run;
    this._target = this.handOn ? this.handRate * this.srRatio : motorRate;
    /* the hand grips hard (6 ms). Off the hand, the slipmat lets the record snap
       back to a platter already turning (100 ms), while a deck starting from a
       dead stop has to spin the platter itself up (300 ms) — and a stopped deck
       coasts down (340 ms). That difference is most of what a deck feels like. */
    var tau = this.handOn ? 0.006
            : (this.motorOn ? (Math.abs(this.rate) < 0.25 ? 0.30 : 0.10) : 0.34);
    this._k = 1 - Math.exp(-1 / (tau * this.sr));
  };
  /* every jump goes through here: the old place keeps sounding for 4 ms while
     the new place fades in, so nothing ever clicks */
  VinylCore.prototype.jumpTo = function (p) {
    var last = this.len - 3;
    if (!(p >= 1)) p = 1;
    if (p > last) p = last;
    if (Math.abs(this.rate) > 1e-4 || this.handOn) { this.xfPos = this.pos; this.xf = this.xfLen; }
    this.pos = p; this.ended = false; this.jumps++;
  };
  /* drop back onto the shadow needle */
  VinylCore.prototype.back = function () {
    this.ret = null;
    if (this.slip && this.div) { this.div = false; this.jumpTo(this.slipPos); }
    this.div = false;
  };
  /* the needle leaves the shadow: the shadow starts here and keeps the song going */
  VinylCore.prototype.leave = function () {
    if (this.slip && !this.div) { this.div = true; this.slipPos = this.pos; }
  };
  VinylCore.prototype.msg = function (m) {
    var k, into;
    switch (m.t) {
      case "buf":   this.setBuffer(m.L, m.R, m.sr); break;
      case "hand":
        if (m.on && !this.handOn) { this.leave(); this.pend = null; }      /* the record it WOULD have been playing */
        if (!m.on && this.handOn && this.slip) this.back();
        this.handOn = !!m.on; this.handRate = m.rate || 0;
        break;
      case "motor":
        this.motorOn = !!m.on; if (m.on) this.ended = false;
        if (m.on && m.instant) { this.rate = this.runRate() * (this.rev ? -1 : 1); this.gate = 1; }
        if (!m.on) { this.pend = null; }
        break;
      case "pitch": this.pitch = m.v; break;
      case "rpm":   this.rpm = m.v; break;
      case "bend":  this.bend = m.v > 0.5 && m.v < 1.5 ? m.v : 1; break;
      case "noise": this.noiseAmt = m.v; break;
      /* a seek on a turning record is a jump (it keeps its speed); on a still one
         it simply moves the needle */
      case "seek":
        if (!this.L) break;
        this.pend = null; this.ret = null;
        if (this.motorOn && !m.park) { this.jumpTo(m.v); }
        else { this.pos = Math.max(1, Math.min(this.len - 3, m.v)); this.rate = 0; this.xf = 0; }
        this.ended = false; this.div = false; this.slipPos = this.pos;
        break;
      case "jump":                     /* SYNC's phase correction: the shadow moves with it */
        if (!this.L) break;
        if (this.div) this.slipPos += m.v - this.pos;
        this.jumpTo(m.v);
        break;
      /* a booked start: needle on P, motor at full speed, on this very sample */
      case "start":
        if (!this.L) break;
        this.pos = Math.max(1, Math.min(this.len - 3, m.pos)); this.xf = 0;
        this.motorOn = true; this.ended = false; this.pend = null; this.ret = null;
        this.rate = this.runRate() * (this.rev ? -1 : 1); this.gate = 1;
        this.div = false; this.slipPos = this.pos;
        break;
      case "sched":
        this.sched.push({ frame: m.frame, m: m.m });
        this.sched.sort(function (a, b) { return a.frame - b.frame; });
        break;
      case "unsched": this.sched = []; break;
      /* AOG-VINYL-LOOP-V1 — a loop is two marks and a wrap, taken on the audio
         thread so the seam lands on the exact sample and never on a frame. */
      /* a slip loop and a slip reverse both end the same way: the record was
         turning the whole time under your hand, and you drop back onto it. */
      case "loop":
        if (m.on && !this.loopOn) this.leave();
        if (!m.on && this.loopOn && this.slip && !m.keep) this.back();
        this.loopOn = !!m.on; this.loopA = m.a || 0; this.loopB = m.b || 0;
        if (!this.loopOn) this.loopA = this.loopB = 0;
        break;
      /* a loop in beats, measured HERE from where the needle really is: it starts
         on the beat the needle is in (or the bar, with align 4) */
      case "bloop":
        if (!this.L || !(m.len > 0)) break;
        var a0 = this.loopOn && m.keepA ? this.loopA : 0;
        if (!a0) {
          var unit = m.len * (m.align || 1);
          a0 = m.b0 + Math.floor((this.pos - m.b0) / unit + 1e-7) * unit;
          if (a0 < 1) a0 = 1;
        }
        if (!this.loopOn) this.leave();
        this.loopOn = true; this.loopA = a0; this.loopB = Math.min(this.len - 3, a0 + m.n * m.len);
        break;
      case "key":   this.kl = !!m.on; break;
      case "slip":
        this.slip = !!m.on; this.div = false; this.ret = null; this.slipPos = this.pos;
        break;
      case "rev":
        if (m.on && !this.rev) this.leave();
        if (!m.on && this.rev && this.slip) this.back();
        this.rev = !!m.on;
        break;
      /* AOG-DJ-ENGINE-V1 — the quantized jump. b0 is the grid's first line and len
         its step, in buffer samples; len 0 means "now". A press up to `late`
         samples after a line counts as on it, and the phase is kept. With ret
         set (a slip tap), the record drops back onto the shadow one step later. */
      case "qjump":
        if (!this.L) break;
        if (this.loopOn) { this.loopOn = false; this.loopA = this.loopB = 0; }
        if (!this.motorOn || !(m.len > 0)) {
          /* a still record just moves (the page starts it); a turning one leaves the shadow */
          if (this.motorOn) this.leave(); else this.div = false;
          this.jumpTo(m.to); this.pend = null;
          if (!this.motorOn) this.slipPos = this.pos;
          this.lastJump = { at: this.pos, to: m.to, frame: this.frame, q: false };
          break;
        }
        k = Math.floor((this.pos - m.b0) / m.len + 1e-9);
        into = this.pos - (m.b0 + k * m.len);
        if (into <= (m.late || 0)) {
          this.leave();
          var at = m.b0 + k * m.len;
          this.jumpTo(m.to + into);
          this.lastJump = { at: at, to: m.to, over: into, frame: this.frame, q: true, late: true };
          if (m.ret) this.ret = { at: this.slipPos - into + m.len };
          this.pend = null;
        } else {
          this.pend = { at: m.b0 + (k + 1) * m.len, to: m.to, len: m.len, ret: !!m.ret };
        }
        break;
      /* let go of a pad with SLIP on: back onto the shadow at the next grid line
         (or one step after the chop starts, if it has not started yet) */
      case "qret":
        if (!this.slip) { this.pend = null; break; }
        if (this.pend) { this.pend.ret = true; break; }
        if (!this.div) break;
        if (!(m.len > 0)) { this.back(); break; }
        k = Math.ceil((this.slipPos - m.b0) / m.len - 1e-9);
        this.ret = { at: m.b0 + k * m.len };
        break;
      case "cancel": this.pend = null; this.ret = null; break;
      case "clear":
        this.L = this.R = null; this.len = 0; this.pos = 0; this.rate = 0;
        this.xf = 0; this.pend = null; this.ret = null; this.div = false; this.sched = [];
        this.loopOn = false; this.motorOn = false; this.bend = 1;
        break;
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
    var L = this.L, R = this.R, sr = this.sr, f0 = this.frame;
    if (!L || this.len < 4) {
      for (var z = 0; z < n; z++) { outL[z] = 0; outR[z] = 0; }
      while (this.sched.length && this.sched[0].frame < f0 + n) this.sched.shift();
      this.level = 0; this.frame = f0 + n; return;
    }
    /* how fast the platter is being asked to turn, in buffer samples per output sample */
    this.aim();
    var runRate = this._run, target = this._target, k = this._k;
    var peak = 0, last = this.len - 3;

    for (var i = 0; i < n; i++) {
      if (this.sched.length && f0 + i >= this.sched[0].frame) {       /* booked for this sample */
        while (this.sched.length && f0 + i >= this.sched[0].frame) this.msg(this.sched.shift().m);
        this.aim(); runRate = this._run; target = this._target; k = this._k;
        L = this.L; R = this.R;
        if (!L) { for (var zz = i; zz < n; zz++) { outL[zz] = 0; outR[zz] = 0; } break; }
        last = this.len - 3;
      }
      this.rate += (target - this.rate) * k;
      var p = this.pos;

      if (p < 1) { p = this.pos = 1; if (this.rate < 0) this.rate = 0; }
      if (p > last) {
        this.pos = last;
        if (this.rate > 0) { this.rate = 0; this.motorOn = false; this.ended = true; target = 0; this.pend = null; }
        p = last;
      }

      var i1 = p | 0, f = p - i1;
      var sL = hermite(L, i1, f), sR = hermite(R, i1, f);
      if (this.xf > 0) {                     /* the old place, fading out under the new one */
        var gp = this.xfPos; if (gp < 1) gp = 1; if (gp > last) gp = last;
        var gi = gp | 0, gf = gp - gi;
        var s = 0.5 - 0.5 * Math.cos(Math.PI * this.xf / this.xfLen);
        sL += (hermite(L, gi, gf) - sL) * s;
        sR += (hermite(R, gi, gf) - sR) * s;
        this.xfPos += this.rate; this.xf--;
      }

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
      if (this.slip && this.div) {
        this.slipPos += runRate;          /* ⚠ the shadow always runs FORWARD */
        if (this.slipPos > last) this.slipPos = last;
        if (this.slipPos < 1) this.slipPos = 1;
      } else this.slipPos = this.pos;
      /* a quantized jump whose grid line the needle has just crossed */
      if (this.pend !== null && this.rate > 0 && this.pos >= this.pend.at) {
        var pd = this.pend; this.pend = null;
        var over = this.pos - pd.at;
        this.leave();
        this.jumpTo(pd.to + over);
        this.lastJump = { at: pd.at, to: pd.to, over: over, frame: f0 + i + 1, q: true };
        if (pd.ret) this.ret = { at: this.slipPos - over + pd.len };
      }
      if (this.loopOn && this.loopB > this.loopA + 32) {
        var span = this.loopB - this.loopA;
        if (this.rate >= 0 && this.pos >= this.loopB) { this.jumpTo(this.loopA + ((this.pos - this.loopB) % span)); this.wraps++; }
        else if (this.rate < 0 && this.pos < this.loopA) { this.jumpTo(this.loopB - ((this.loopA - this.pos) % span)); this.wraps++; }
      }
      if (this.ret !== null && this.slipPos >= this.ret.at) this.back();
    }
    this.level = peak;
    this.frame = f0 + n;
  };

  /* ══ AOG-DJ-FX-V1 (2026-10-04) — THE MIXER'S EFFECTS, IN BEATS ═══════════════
     One of these sits on each channel, after the fader, so an echo keeps ringing
     after the fader comes down (the "echo out" every house DJ uses to leave a
     record). Three effects, each timed by the record's own tempo:
     · ECHO — repeats ¼ to 2 beats apart. The repeats lose their lows and their
       sparkle as they fade, the way a tape echo does, so they never muddy the mix.
     · REVERB — eight delay lines feeding each other (a feedback delay network).
       The beats set how long the room rings: 1 beat is a small room, 8 a hall.
       The bass is kept out of it, so the kick stays tight.
     · FLANGER — the record against a copy of itself a few milliseconds late,
       the gap sweeping slowly: one full sweep every 4 to 32 beats. It runs here
       on the audio thread because the browser's own delay cannot sweep that
       short inside a feedback loop.
     The amount turns each one up; switching from one to another lets the old
     tail ring out instead of cutting it. ═════════════════════════════════════ */
  var FX = ["echo", "reverb", "flanger"];
  function DJFxCore(sampleRate) {
    var sr = this.sr = sampleRate || 44100;
    this.type = "echo"; this.amt = 0; this.beatSec = 0.5;
    this.beats = { echo: 0.75, reverb: 2, flanger: 16 };
    this.send = { echo: 0, reverb: 0, flanger: 0 };
    this.idle = { echo: sr, reverb: sr, flanger: sr };   /* samples since the effect last made sound */
    this.ks = 1 - Math.exp(-1 / (0.015 * sr));          /* 15 ms for every amount change */
    /* echo */
    var eN = 1; while (eN < sr * 4.2) eN <<= 1;
    this.eN = eN; this.eMask = eN - 1; this.eL = new Float32Array(eN); this.eR = new Float32Array(eN); this.eW = 0;
    this.eD = sr * 0.375; this.eDs = this.eD; this.kd = 1 - Math.exp(-1 / (0.06 * sr));
    this.eLo1 = 0; this.eLo2 = 0; this.eHi1 = 0; this.eHi2 = 0;
    this.cHp = 1 - Math.exp(-2 * Math.PI * 170 / sr); this.cLp = 1 - Math.exp(-2 * Math.PI * 6200 / sr);
    /* reverb: input high-pass, pre-delay, four diffusers, eight lines */
    this.rHp = 0; this.cRhp = 1 - Math.exp(-2 * Math.PI * 220 / sr);
    this.pdN = Math.round(sr * 0.018); this.pd = new Float32Array(this.pdN + 1); this.pdW = 0;
    var ap = [4.77, 3.59, 12.73, 9.31];
    this.ap = ap.map(function (ms) { var n = Math.max(2, Math.round(ms * sr / 1000)); return { b: new Float32Array(n), n: n, w: 0 }; });
    var ln = [29.7, 37.1, 41.1, 43.7, 53.3, 59.3, 67.1, 73.7];
    this.ln = ln.map(function (ms) { var n = Math.max(8, Math.round(ms * sr / 1000)); return { b: new Float32Array(n), n: n, w: 0, lp: 0, g: 0.5 }; });
    this.cDamp = 1 - Math.exp(-2 * Math.PI * 5200 / sr);
    this.rt = 1;
    /* flanger */
    this.fN = 2048; this.fMask = this.fN - 1; this.fL = new Float32Array(this.fN); this.fR = new Float32Array(this.fN); this.fW = 0;
    this.lfo = 0; this.fHpL = 0; this.fHpR = 0; this.cFhp = 1 - Math.exp(-2 * Math.PI * 90 / sr);
    this.retune();
  }
  DJFxCore.prototype.retune = function () {
    var sr = this.sr, bs = this.beatSec > 0.1 && this.beatSec < 3 ? this.beatSec : 0.5;
    this.eD = Math.min(this.eN - 8, Math.max(32, this.beats.echo * bs * sr));
    /* a silent echo has nothing to glide: it takes the new time at once */
    if (!(this.send.echo > 1e-4) && this.idle.echo >= this.eDs + sr * 0.25) this.eDs = this.eD;
    this.rt = Math.max(0.3, Math.min(9, this.beats.reverb * bs));
    for (var i = 0; i < this.ln.length; i++) this.ln[i].g = Math.pow(10, -3 * this.ln[i].n / (this.rt * sr));
    this.fPeriod = Math.max(0.5, this.beats.flanger * bs) * sr;
  };
  DJFxCore.prototype.msg = function (m) {
    if (m.t !== "fx") return;
    if (m.type && FX.indexOf(m.type) >= 0) {
      if (m.type !== this.type && m.type === "flanger") this.lfo = 0;
      this.type = m.type;
    }
    if (m.amt != null) {
      var a = Math.max(0, Math.min(1, +m.amt));
      if (this.amt === 0 && a > 0 && this.type === "flanger") this.lfo = 0;   /* each sweep starts at the top */
      this.amt = a;
    }
    if (m.beats) for (var k in m.beats) if (FX.indexOf(k) >= 0 && m.beats[k] > 0) this.beats[k] = +m.beats[k];
    if (m.beatSec > 0) this.beatSec = +m.beatSec;
    this.retune();
  };
  DJFxCore.prototype.state = function () {
    return { t: "fxst", type: this.type, amt: this.amt, beatSec: this.beatSec, beats: this.beats,
             echoDelay: this.eD, echoDelayNow: this.eDs, rt60: this.rt, flangerPeriod: this.fPeriod,
             idle: this.idle, sr: this.sr };
  };
  function cub(b, mask, p) {                 /* a cubic read between samples of a ring buffer */
    var i = Math.floor(p), f = p - i;
    var y0 = b[(i - 1) & mask], y1 = b[i & mask], y2 = b[(i + 1) & mask], y3 = b[(i + 2) & mask];
    return y1 + 0.5 * f * (y2 - y0 + f * (2 * y0 - 5 * y1 + 4 * y2 - y3 + f * (3 * (y1 - y2) + y3 - y0)));
  }
  DJFxCore.prototype.process = function (inL, inR, outL, outR, n) {
    var sr = this.sr, ks = this.ks, live = 0;
    var tE = this.type === "echo" ? this.amt : 0, tR = this.type === "reverb" ? this.amt : 0, tF = this.type === "flanger" ? this.amt : 0;
    var S = this.send, I = this.idle;
    var runE = tE > 0 || S.echo > 1e-4 || I.echo < this.eD + sr * 0.25;
    var runR = tR > 0 || S.reverb > 1e-4 || I.reverb < sr * 2;
    var runF = tF > 0 || S.flanger > 1e-4;
    if (!runE && !runR && !runF) {
      for (var z = 0; z < n; z++) { outL[z] = inL[z]; outR[z] = inR[z]; }
      return;
    }
    var eL = this.eL, eR = this.eR, eMask = this.eMask, ln = this.ln, nl = ln.length;
    var fb = 0.25 + 0.45 * Math.max(this.amt * (this.type === "echo" ? 1 : 0), S.echo);
    var dw = 1 / Math.max(1, this.fPeriod), dmin = 0.00035 * sr, dmax = 0.0055 * sr;
    for (var i = 0; i < n; i++) {
      var xL = inL[i], xR = inR[i];
      var yL = xL, yR = xR;
      S.echo += (tE - S.echo) * ks; S.reverb += (tR - S.reverb) * ks; S.flanger += (tF - S.flanger) * ks;
      if (runF) {                                         /* FLANGER (an insert: dry and wet share the level) */
        this.lfo += dw; if (this.lfo >= 1) this.lfo -= 1;
        var tri = 1 - Math.abs(2 * this.lfo - 1);          /* 0 → 1 → 0 over one sweep */
        var tri2 = 1 - Math.abs(2 * ((this.lfo + 0.08) % 1) - 1);
        var dL = dmin * Math.pow(dmax / dmin, 1 - tri), dR = dmin * Math.pow(dmax / dmin, 1 - tri2);
        var wL = cub(this.fL, this.fMask, this.fW - dL), wR = cub(this.fR, this.fMask, this.fW - dR);
        this.fHpL += this.cFhp * (wL - this.fHpL); this.fHpR += this.cFhp * (wR - this.fHpR);
        var ffb = 0.5 + 0.3 * S.flanger;
        this.fL[this.fW] = xL + (wL - this.fHpL) * ffb; this.fR[this.fW] = xR + (wR - this.fHpR) * ffb;
        this.fW = (this.fW + 1) & this.fMask;
        var m = S.flanger * 0.5;
        yL = xL * (1 - m) + wL * m; yR = xR * (1 - m) + wR * m;
      }
      if (runE) {                                         /* ECHO */
        this.eDs += (this.eD - this.eDs) * this.kd;
        var rp = this.eW - this.eDs;
        var oL = cub(eL, eMask, rp), oR = cub(eR, eMask, rp);
        /* the repeats lose their lows and their top as they go round */
        this.eLo1 += this.cHp * (oL - this.eLo1); this.eLo2 += this.cHp * (oR - this.eLo2);
        var hL = oL - this.eLo1, hR = oR - this.eLo2;
        this.eHi1 += this.cLp * (hL - this.eHi1); this.eHi2 += this.cLp * (hR - this.eHi2);
        eL[this.eW] = xL * S.echo + this.eHi1 * fb; eR[this.eW] = xR * S.echo + this.eHi2 * fb;
        this.eW = (this.eW + 1) & eMask;
        yL += oL * 0.8; yR += oR * 0.8;
        if (oL > 1e-5 || oL < -1e-5) I.echo = 0; else I.echo++;
      }
      if (runR) {                                         /* REVERB */
        var xin = (xL + xR) * 0.5 * S.reverb;
        this.rHp += this.cRhp * (xin - this.rHp); xin -= this.rHp;
        var pdr = this.pdW + 1; if (pdr > this.pdN) pdr = 0;
        var pre = this.pd[pdr]; this.pd[this.pdW] = xin; this.pdW = pdr;
        for (var a = 0; a < 4; a++) {                      /* diffusion: four allpasses */
          var A = this.ap[a], bo = A.b[A.w], vin = pre + 0.6 * bo;
          A.b[A.w] = vin; A.w++; if (A.w >= A.n) A.w = 0;
          pre = bo - 0.6 * vin;
        }
        var sum = 0, o0, o1, o2, o3, o4, o5, o6, o7;
        var outs = this._o || (this._o = new Float32Array(8));
        for (var j = 0; j < nl; j++) {
          var Lj = ln[j], dv = Lj.b[Lj.w];
          Lj.lp += this.cDamp * (dv - Lj.lp);
          outs[j] = Lj.lp; sum += Lj.lp;
        }
        sum *= 2 / nl;                                      /* Householder: every line hears every other */
        for (var q = 0; q < nl; q++) {
          var Lq = ln[q];
          Lq.b[Lq.w] = (outs[q] - sum) * Lq.g + pre * 0.35;
          Lq.w++; if (Lq.w >= Lq.n) Lq.w = 0;
        }
        o0 = outs[0]; o1 = outs[1]; o2 = outs[2]; o3 = outs[3]; o4 = outs[4]; o5 = outs[5]; o6 = outs[6]; o7 = outs[7];
        var rl = (o0 - o2 + o4 - o6) * 0.55, rr = (o1 - o3 + o5 - o7) * 0.55;
        yL += rl; yR += rr;
        if (rl > 1e-5 || rl < -1e-5) I.reverb = 0; else I.reverb++;
      }
      outL[i] = yL; outR[i] = yR;
    }
  };

  /* ══ AOG-DJ-LIMIT-V1 (2026-10-04) — THE LAST WORD ON LEVEL ═══════════════════
     Three decks, every EQ band up, and the mix must still never clip. The browser's
     own compressor does the shaping; this is the wall behind it. It hears each
     sample 1.3 ms before it lets it out, so it can turn the gain down smoothly
     BEFORE a peak arrives and have it all the way down AT the peak: no sample
     leaves above the ceiling (-1 dBFS), and nothing is clipped or squared off. The
     gain comes back over 60 ms, too slow to wobble the bass. */
  function DJLimitCore(sampleRate, ceiling) {
    var sr = this.sr = sampleRate || 44100;
    this.ceil = ceiling || 0.891;
    var L = this.L = Math.max(16, Math.round(sr * 0.0013));
    this.dl = new Float32Array(L); this.dr = new Float32Array(L); this.dw = 0;           /* the look-ahead: exactly L samples */
        this.dqI = new Float64Array(L + 2); this.dqV = new Float64Array(L + 2); this.dh = 0; this.dt = 0; this.n = 0;
    this.avg = new Float64Array(L); this.aw = 0; this.sum = L;                          /* the running mean */
    for (var i = 0; i < L; i++) this.avg[i] = 1;
    this.g = 1; this.rel = 1 - Math.exp(-1 / (0.06 * sr));
    this.minGain = 1;
  }
  DJLimitCore.prototype.process = function (inL, inR, outL, outR, n) {
    var L = this.L, ceil = this.ceil, dqI = this.dqI, dqV = this.dqV, cap = L + 2;
    for (var i = 0; i < n; i++) {
      var xl = inL[i], xr = inR[i], pk = Math.max(xl < 0 ? -xl : xl, xr < 0 ? -xr : xr);
      var r = pk > ceil ? ceil / pk : 1, idx = this.n++;
      /* the smallest gain asked for in the last L+1 samples (a sliding minimum) */
      while (this.dt !== this.dh && dqV[(this.dt - 1 + cap) % cap] >= r) this.dt = (this.dt - 1 + cap) % cap;
      dqI[this.dt] = idx; dqV[this.dt] = r; this.dt = (this.dt + 1) % cap;
      while (dqI[this.dh] < idx - L) this.dh = (this.dh + 1) % cap;
      var h = dqV[this.dh];
      /* … averaged over L samples, so the gain bends down ahead of the peak */
      this.sum += h - this.avg[this.aw]; this.avg[this.aw] = h; this.aw = (this.aw + 1) % L;
      var a = this.sum / L; if (a > 1) a = 1;
      var g = this.g + this.rel * (1 - this.g); if (g > a) g = a;
      this.g = g; if (g < this.minGain) this.minGain = g;
      /* out goes the sample from L ago, at that gain */
      var ow = this.dw, ol = this.dl[ow], or = this.dr[ow];
      this.dl[ow] = xl; this.dr[ow] = xr; this.dw = (ow + 1) % L;
      var yl = ol * g, yr = or * g;
      if (yl > ceil) yl = ceil; else if (yl < -ceil) yl = -ceil;   /* never reached: a guard against rounding */
      if (yr > ceil) yr = ceil; else if (yr < -ceil) yr = -ceil;
      outL[i] = yl; outR[i] = yr;
    }
  };

  root.AOGVinylCore = VinylCore;
  root.AOGDJFxCore = DJFxCore;
  root.AOGDJLimitCore = DJLimitCore;

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
        this.core.frame = currentFrame;
        this.core.process(out[0], out[1] || out[0], n);
        if (++this.tick % 6 === 0) {
          const c = this.core;
          this.port.postMessage({
            t: "st", pos: c.pos, level: c.level,
            rate: c.rate / (c.srRatio || 1), rr: c.rate, frame: currentFrame + n,
            motor: c.motorOn, ended: c.ended, slip: c.slipPos, div: c.div, pend: !!c.pend,
            loopOn: c.loopOn, loopA: c.loopA, loopB: c.loopB,
            jumps: c.jumps, wraps: c.wraps, lastJump: c.lastJump
          });
        }
        return true;
      }
    }
    registerProcessor("aog-vinyl", VinylDeck);

    class DJFx extends AudioWorkletProcessor {
      constructor() {
        super();
        this.core = new DJFxCore(sampleRate);
        this.port.onmessage = (e) => {
          if (e.data && e.data.t === "ask") this.port.postMessage(this.core.state());
          else this.core.msg(e.data);
        };
      }
      process(inputs, outputs) {
        const inp = inputs[0], out = outputs[0], n = out[0].length;
        const l = inp && inp[0] ? inp[0] : (this.z || (this.z = new Float32Array(n)));
        const r = inp && inp[1] ? inp[1] : l;
        this.core.process(l, r, out[0], out[1] || out[0], n);
        return true;
      }
    }
    registerProcessor("aog-djfx", DJFx);

    class DJLimit extends AudioWorkletProcessor {
      constructor() {
        super();
        this.core = new DJLimitCore(sampleRate);
        this.port.onmessage = (e) => { if (e.data && e.data.t === "ask") this.port.postMessage({ t: "limst", minGain: this.core.minGain, ceil: this.core.ceil, look: this.core.L }); };
      }
      process(inputs, outputs) {
        const inp = inputs[0], out = outputs[0], n = out[0].length;
        const l = inp && inp[0] ? inp[0] : (this.z || (this.z = new Float32Array(n)));
        const r = inp && inp[1] ? inp[1] : l;
        this.core.process(l, r, out[0], out[1] || out[0], n);
        return true;
      }
    }
    registerProcessor("aog-djlimit", DJLimit);

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
  if (typeof module === "object" && module && module.exports) module.exports = { VinylCore: VinylCore, DJFxCore: DJFxCore, DJLimitCore: DJLimitCore };
})(typeof globalThis !== "undefined" ? globalThis
   : (typeof self !== "undefined" ? self : this));
/* ⚠ globalThis, not self: an AudioWorkletGlobalScope has NO self and no window,
   and a module's top-level `this` is undefined — the whole file threw there,
   which is why every deck quietly fell back to the old ScriptProcessor. */
