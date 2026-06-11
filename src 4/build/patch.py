#!/usr/bin/env python3
import sys

P_IN = "index.html"
P = "index_integrated.html"
with open(P_IN, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(haystack, old, new, label):
    n = haystack.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return haystack.replace(old, new, 1)

# ---------------------------------------------------------------------------
# A) CSS block before </head>
# ---------------------------------------------------------------------------
CSS = r"""<!-- ===== GRACE REGULATION ENGINE styles ===== -->
<style id="grace-engine-styles">
.triage-panel{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:640px;margin:0 auto 28px;}
@media(max-width:560px){.triage-panel{grid-template-columns:1fr;}}
.triage-btn{appearance:none;border:2px solid var(--rule);border-radius:var(--radius-lg);padding:18px 14px;font-family:var(--font-sans);font-weight:700;font-size:14px;letter-spacing:.04em;cursor:pointer;color:var(--navy);background:var(--paper);box-shadow:var(--shadow-sm);transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;min-height:64px;}
.triage-btn:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);}
.triage-btn:active{transform:translateY(0);}
.triage-btn.cant-calm{border-color:var(--red);background:var(--red-bg);color:var(--red);}
.triage-btn.shutting-down{border-color:var(--amber);background:var(--amber-bg);color:var(--amber);}
.triage-btn.needs-move{border-color:var(--green);background:var(--green-bg);color:var(--green);}
.triage-lead{text-align:center;font-family:var(--font-serif);font-size:18px;color:var(--ink-soft);margin:0 0 12px;}
:root[data-theme="dark"] .triage-btn{background:var(--navy-soft);color:var(--cream);}
.grace-practiced-banner{display:none;}
.grace-practiced-banner.visible-banner{display:block;text-align:center;margin:0 auto 20px;max-width:520px;padding:10px 16px;border-radius:999px;background:var(--green-bg);color:var(--green);font-size:14px;border:1px solid rgba(46,107,58,.25);}
.grace-practiced-banner strong{font-weight:700;}
.history-memory-card{max-width:520px;margin:0 auto 24px;background:var(--cream-deep);border:1px solid var(--rule);border-left:4px solid var(--gold);border-radius:var(--radius);padding:14px 18px;cursor:pointer;transition:box-shadow .15s ease,transform .15s ease;}
.history-memory-card:hover{box-shadow:var(--shadow-md);transform:translateY(-1px);}
.history-memory-card p{margin:0;font-size:14px;color:var(--ink-soft);line-height:1.5;}
.history-memory-card span{color:var(--gold);font-weight:700;}
.history-memory-card strong{color:var(--navy);text-transform:capitalize;}
:root[data-theme="dark"] .history-memory-card{background:var(--navy-soft);}
.emotion-wheel-svg{display:block;max-width:320px;margin:8px auto;}
.wheel-wedge .wedge-path{transition:transform .2s ease,opacity .2s ease;transform-origin:center;transform-box:fill-box;}
.wheel-wedge:hover .wedge-path{opacity:1;}
.feelwheel-readout{text-align:center;min-height:48px;font-size:15px;color:var(--ink-soft);margin-top:6px;line-height:1.5;}
.passport-modal-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(6,18,31,.55);backdrop-filter:blur(3px);animation:graceFade .25s ease;}
.passport-award-card{background:var(--paper);border-radius:var(--radius-lg);box-shadow:var(--shadow-xl);max-width:460px;width:100%;padding:28px 26px;text-align:center;border:1px solid var(--rule);}
.passport-award-card h3{font-family:var(--font-serif);color:var(--navy);font-size:24px;margin:0 0 8px;}
.passport-award-card p{color:var(--ink-soft);font-size:14px;line-height:1.55;margin:0 0 16px;}
.passport-award-card canvas{width:100%;max-width:400px;height:auto;border-radius:var(--radius);box-shadow:var(--shadow-sm);}
.passport-actions{display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap;}
.passport-actions button{font-family:var(--font-sans);font-weight:600;font-size:14px;padding:10px 18px;border-radius:var(--radius);cursor:pointer;border:1px solid var(--rule);}
#download-passport-btn{background:var(--gold);color:var(--navy);border-color:var(--gold);}
#close-passport-btn{background:transparent;color:var(--ink-soft);}
@keyframes graceFade{from{opacity:0;}to{opacity:1;}}
.pecs-strip-card.speaking-highlight{outline:3px solid var(--gold);outline-offset:2px;box-shadow:0 0 0 4px var(--gold-pale);transition:outline .1s ease,box-shadow .1s ease;}
#toolModal.crisis-priority-override .tool-modal{border-top:4px solid var(--red);}
.grace-universal-modal-overlay{position:fixed;inset:0;z-index:9998;display:none;align-items:flex-end;justify-content:center;background:rgba(6,18,31,.5);}
.grace-universal-modal-overlay.active-modal-viewport{display:flex;}
.grace-universal-modal-overlay .modal-surface-card{background:var(--paper);width:100%;max-width:560px;border-radius:var(--radius-lg) var(--radius-lg) 0 0;padding:14px 20px 24px;box-shadow:var(--shadow-xl);}
.mobile-swipe-handle{width:42px;height:5px;border-radius:999px;background:var(--rule);margin:4px auto 14px;}
.mobile-bottom-close-btn{display:block;width:100%;margin-top:16px;padding:12px;border-radius:var(--radius);border:1px solid var(--rule);background:var(--cream-deep);color:var(--navy);font-weight:600;cursor:pointer;}
.grace-universal-modal-overlay.crisis-priority-override .modal-surface-card{border-top:4px solid var(--red);}
</style>
<!-- ===== END GRACE REGULATION ENGINE styles ===== -->
</head>"""
s = replace_once(s, "</head>", CSS, "CSS before </head>")

# ---------------------------------------------------------------------------
# B) DOM anchors before the tools grid
# ---------------------------------------------------------------------------
ANCHORS = r"""    <!-- Grace Engine: crisis triage + progress -->
    <div id="grace-practiced-banner" class="grace-practiced-banner" aria-live="polite"></div>
    <div id="persistent-history-anchor"></div>
    <p class="triage-lead">In a hard moment right now? Start here.</p>
    <div id="aide-triage-wrapper"></div>
    <div class="tools-grid">"""
s = replace_once(s, '    <div class="tools-grid">', ANCHORS, "tools-grid anchors")

# ---------------------------------------------------------------------------
# C) Feelings Wheel tool card (after existing emotion card)
# ---------------------------------------------------------------------------
EMO = """      <div class="tool-card" onclick="toolOpen('emotion')"><span class="tool-icon">\U0001f7e1</span><div class="tool-title">Emotion Wheel</div><p class="tool-desc">Name it to tame it</p><button class="btn btn-secondary" style="width:100%">Open</button></div>"""
FEEL = EMO + """
      <div class="tool-card" onclick="toolOpen('feelwheel')"><span class="tool-icon">\U0001f3a1</span><div class="tool-title">Feelings Wheel</div><p class="tool-desc">Tap a feeling, hear it named</p><button class="btn btn-secondary" style="width:100%">Spin</button></div>"""
s = replace_once(s, EMO, FEEL, "feelwheel card")

# ---------------------------------------------------------------------------
# D) Upgrade pecsSpeakStrip (word highlighting + success chime)
# ---------------------------------------------------------------------------
OLD_SPEAK = """window.pecsSpeakStrip  = function() {
  if (!pecsStrip.length) return;
  var u = new SpeechSynthesisUtterance(pecsStrip.map(function(c){ return c.l; }).join('. '));
  u.rate=0.85; u.pitch=1.1; speechSynthesis.speak(u);
};"""
NEW_SPEAK = r"""window.pecsSpeakStrip  = function() {
  if (!pecsStrip.length || !('speechSynthesis' in window)) return;
  var cards = document.querySelectorAll('#pecsStrip .pecs-strip-card');
  var u = new SpeechSynthesisUtterance(pecsStrip.map(function(c){ return c.l; }).join('. '));
  u.rate=0.85; u.pitch=1.1;
  var wi = 0;
  u.onboundary = function(ev){
    if (ev.name && ev.name !== 'word') return;
    cards.forEach(function(c){ c.classList.remove('speaking-highlight'); });
    if (cards[wi]) cards[wi].classList.add('speaking-highlight');
    wi++;
  };
  u.onend = function(){
    cards.forEach(function(c){ c.classList.remove('speaking-highlight'); });
    if (window.GraceAudio) GraceAudio.playSuccess();
  };
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
};"""
s = replace_once(s, OLD_SPEAK, NEW_SPEAK, "pecsSpeakStrip upgrade")

# ---------------------------------------------------------------------------
# E) shakeJar -> calm jar tinkle
# ---------------------------------------------------------------------------
OLD_SHAKE = """window.shakeJar = function(el) {
  el.style.animation = 'jarShake 0.6s ease';"""
NEW_SHAKE = """window.shakeJar = function(el) {
  try { if (window.GraceAudio && typeof window.GraceAudio.playJarTinkle === 'function') window.GraceAudio.playJarTinkle(); } catch (e) {}
  el.style.animation = 'jarShake 0.6s ease';"""
s = replace_once(s, OLD_SHAKE, NEW_SHAKE, "shakeJar tinkle")

# ---------------------------------------------------------------------------
# F) Engine runtime before final </body>
# ---------------------------------------------------------------------------
with open("engine.js", "r", encoding="utf-8") as ef:
    ENGINE_JS = ef.read()
ENGINE = "<!-- ===== GRACE REGULATION ENGINE runtime ===== -->\n<script>\n" + ENGINE_JS + "\n</script>\n<!-- ===== END GRACE REGULATION ENGINE runtime ===== -->\n</body>"
idx = s.rfind("</body>")
if idx == -1:
    raise SystemExit("[FAIL] no </body>")
s = s[:idx] + ENGINE + s[idx + len("</body>"):]

with open(P, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] all patches applied")
