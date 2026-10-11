
/* =====================================================================
   DECLARATIVE CALM & REGULATION TOOLS ENGINE
   ===================================================================== */

var _toolTimer = null;
var _toolStepIdx = 0;

window.toolClose = function() {
  document.getElementById('toolModal').classList.remove('open');
  if (_toolTimer) { clearTimeout(_toolTimer); _toolTimer = null; }
};

var TOOLS = {
  breathing:  { builder: _buildBreathing,  init: _initBreathing },
  grounding:  { builder: _buildGrounding,  init: _initGrounding },
  pmr:        { builder: _buildPMR,        init: _initPMR },
  bilateral:  { builder: _buildBilateral,  init: _initBilateral },
  movement:   { builder: _buildMovement,   init: _initMovement },
  safeplace:  { builder: _buildSafePlace,  init: _initSafePlace },
  emotion:    { builder: _buildEmotion,    init: _initEmotion },
  coreg:      { builder: _buildCoreg,      init: _initCoreg },
  coldwater:  { builder: _buildColdwater,  init: _initColdwater },
  fidget:     { builder: _buildFidget,     init: _initFidget },
  rainbow:    { builder: _buildRainbowBreath, init: _initRainbowBreath },
  animalyoga: { builder: _buildAnimalYoga,    init: function() {} },
  calmjar:    { builder: _buildCalmJar,       init: function() {} }
  // Add new tools here ↓
};

window.toolOpen = function(type) {
  if (_toolTimer) { clearTimeout(_toolTimer); _toolTimer = null; }
  // The overlay lives inside <main>, whose stacking context traps it BELOW the
  // sticky topbar — so on mobile the bar covered the top of tall tools (e.g. the
  // weather self-reflection). Re-home it to <body> so its z-index covers the whole
  // screen, topbar included. Its own ✕ closes it.
  try {
    var _modalEl = document.getElementById('toolModal');
    if (_modalEl && _modalEl.parentNode !== document.body) { document.body.appendChild(_modalEl); }
  } catch (_aogRH) {}
  var tool = TOOLS[type];
  var body = document.getElementById('toolModalBody');
  if (tool && typeof tool.builder === 'function') {
    body.innerHTML = tool.builder();
    document.getElementById('toolModal').classList.add('open');
    if (typeof tool.init === 'function') setTimeout(tool.init, 80);
  } else {
    body.innerHTML = '<p style="text-align:center;padding:40px;">Tool coming soon.</p>';
    document.getElementById('toolModal').classList.add('open');
  }
  // The .tool-modal is the scroll container and it KEEPS its scroll position
  // across tools — so "Try another" (or reopening after a long tool) started
  // the next tool mid-scroll, with its title and options above the fold.
  try {
    var _scroller = document.querySelector('#toolModal .tool-modal');
    if (_scroller) _scroller.scrollTop = 0;
  } catch (_aogSR) {}
};

/* ---- Breathing 4-7-8 ---- */
function _buildBreathing() {
  return '<div class="tool-modal-icon">🫁</div>' +
    '<div class="tool-modal-title">4-7-8 Breathing</div>' +
    '<div class="tool-modal-sub">Inhale 4 · Hold 7 · Exhale 8. We\'ll do 3 rounds together.</div>' +
    '<div class="tool-orb-wrap">' +
      '<div class="tool-orb" id="toolOrb"></div>' +
      '<div class="tool-cue" id="toolCue" aria-live="polite">Get ready…</div>' +
      '<div class="tool-counter" id="toolCounter">Round 1 of 3</div>' +
    '</div>';
}
function _initBreathing() {
  var orb = document.getElementById('toolOrb');
  var cue = document.getElementById('toolCue');
  var counter = document.getElementById('toolCounter');
  var rounds = 0;
  var maxRounds = 3;
  function step(phase) {
    if (phase === 'in') {
      cue.textContent = 'Breathe in…';
      orb.style.transition = 'transform 4s ease-in-out';
      orb.style.transform = 'scale(1)';
      _toolTimer = setTimeout(function(){ step('hold'); }, 4000);
    } else if (phase === 'hold') {
      cue.textContent = 'Hold…';
      orb.style.transition = 'transform 0.1s';
      _toolTimer = setTimeout(function(){ step('out'); }, 7000);
    } else if (phase === 'out') {
      cue.textContent = 'Breathe out…';
      orb.style.transition = 'transform 8s ease-in-out';
      orb.style.transform = 'scale(.55)';
      _toolTimer = setTimeout(function(){
        rounds++;
        if (rounds < maxRounds) {
          counter.textContent = 'Round ' + (rounds+1) + ' of ' + maxRounds;
          step('in');
        } else {
          cue.textContent = 'Nice. That counts. 💛';
          counter.textContent = 'Complete';
        }
      }, 8000);
    }
  }
  counter.textContent = 'Round 1 of 3';
  orb.style.transform = 'scale(.55)';
  _toolTimer = setTimeout(function(){ step('in'); }, 800);
}

/* ---- 5-4-3-2-1 Grounding ---- */
var _groundSteps = [
  { n:'5', sense:'SEE', q:'Name 5 things you can see right now.', ex:'A door, a window, a pencil, the floor, a chair.' },
  { n:'4', sense:'TOUCH', q:'Name 4 things you can physically feel.', ex:'Your feet on the floor. The chair beneath you. Your clothes. The air on your face.' },
  { n:'3', sense:'HEAR', q:'Name 3 things you can hear right now.', ex:'Breathing. A clock. A sound outside the room.' },
  { n:'2', sense:'SMELL', q:'Name 2 things you can smell — or like the smell of.', ex:'Fresh air. Something from lunch. Something clean.' },
  { n:'1', sense:'TASTE', q:'Name 1 thing you can taste or that you like the taste of.', ex:'Water. A favorite food. Something sweet.' },
  { n:'✓', sense:'DONE', q:'Good. You just told your nervous system: I am safe right now.', ex:'' }
];
function _buildGrounding() {
  var dots = _groundSteps.map(function(s,i){ return '<div class="tool-step-dot' + (i===0?' done':'') + '" id="gdot'+i+'"></div>'; }).join('');
  var steps = _groundSteps.map(function(s,i){
    return '<div class="tool-step-item' + (i===0?' active':'') + '" id="gstep'+i+'">' +
      '<div class="tool-step-num">' + s.n + ' — ' + s.sense + '</div>' +
      '<div class="tool-step-text">' + s.q + (s.ex ? '<br><span style="font-size:13px;color:var(--ink-faint);font-style:italic;">' + s.ex + '</span>' : '') + '</div>' +
    '</div>';
  }).join('');
  return '<div class="tool-modal-icon">🌿</div>' +
    '<div class="tool-modal-title">5-4-3-2-1 Grounding</div>' +
    '<div class="tool-modal-sub">Bring your attention back to your senses, one at a time.</div>' +
    '<div class="tool-step-progress">' + dots + '</div>' +
    '<div class="tool-steps" id="gSteps">' + steps + '</div>' +
    '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">' +
      '<button class="btn btn-secondary" id="gPrev" onclick="groundNav(-1)" style="display:none">← Back</button>' +
      '<button class="btn" id="gNext" onclick="groundNav(1)" style="background:var(--gold);color:var(--navy);">Next →</button>' +
    '</div>';
}
window.groundNav = function(dir) {
  var prev = document.getElementById('gstep' + _toolStepIdx);
  var pdot = document.getElementById('gdot' + _toolStepIdx);
  _toolStepIdx = Math.max(0, Math.min(_groundSteps.length - 1, _toolStepIdx + dir));
  var curr = document.getElementById('gstep' + _toolStepIdx);
  var cdot = document.getElementById('gdot' + _toolStepIdx);
  if (prev) prev.classList.remove('active');
  if (curr) curr.classList.add('active');
  if (pdot && dir > 0) pdot.classList.add('done');
  if (cdot) cdot.classList.add('done');
  document.getElementById('gPrev').style.display = _toolStepIdx > 0 ? '' : 'none';
  var nextBtn = document.getElementById('gNext');
  if (_toolStepIdx >= _groundSteps.length - 1) {
    nextBtn.textContent = 'Done ✓';
    nextBtn.onclick = function(){ toolClose(); _toolStepIdx = 0; };
  } else {
    nextBtn.textContent = 'Next →';
  }
};
function _initGrounding() { _toolStepIdx = 0; }

/* ---- PMR Body Scan ---- */
var _pmrSteps = [
  { part:'Feet & Toes', cue:'Curl your toes tightly for 5 seconds… now release. Feel the warmth.' },
  { part:'Calves & Shins', cue:'Flex your feet upward, tensing your calves… hold… and release.' },
  { part:'Thighs', cue:'Squeeze your thighs together tightly… hold 5 seconds… let go.' },
  { part:'Belly', cue:'Pull your stomach in tight, like you\'re bracing for something… hold… and release completely.' },
  { part:'Hands & Forearms', cue:'Make two tight fists… squeeze… hold… and open your hands wide.' },
  { part:'Shoulders', cue:'Raise your shoulders up to your ears… hold them there… now drop them down.' },
  { part:'Face & Jaw', cue:'Scrunch your whole face tight — eyes, jaw, forehead… hold… and release.' },
  { part:'Whole Body', cue:'Notice the difference. Your body just learned: I can choose to let go. Take one slow breath.' }
];
function _buildPMR() {
  var dots = _pmrSteps.map(function(s,i){ return '<div class="tool-step-dot' + (i===0?' done':'') + '" id="pmrdot'+i+'"></div>'; }).join('');
  var steps = _pmrSteps.map(function(s,i){
    return '<div class="tool-step-item' + (i===0?' active':'') + '" id="pmrstep'+i+'">' +
      '<div class="tool-step-num">' + (i+1) + ' of ' + _pmrSteps.length + ' — ' + s.part.toUpperCase() + '</div>' +
      '<div class="tool-step-text">' + s.cue + '</div>' +
    '</div>';
  }).join('');
  return '<div class="tool-modal-icon">🧘</div>' +
    '<div class="tool-modal-title">Body Scan / PMR</div>' +
    '<div class="tool-modal-sub">Tense each area for 5 seconds, then release. Work from feet to face.</div>' +
    '<div class="tool-step-progress">' + dots + '</div>' +
    '<div class="tool-steps" id="pmrSteps">' + steps + '</div>' +
    '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">' +
      '<button class="btn btn-secondary" id="pmrPrev" onclick="pmrNav(-1)" style="display:none">← Back</button>' +
      '<button class="btn" id="pmrNext" onclick="pmrNav(1)" style="background:var(--gold);color:var(--navy);">Next →</button>' +
    '</div>';
}
window.pmrNav = function(dir) {
  var prev = document.getElementById('pmrstep' + _toolStepIdx);
  var pdot = document.getElementById('pmrdot' + _toolStepIdx);
  _toolStepIdx = Math.max(0, Math.min(_pmrSteps.length - 1, _toolStepIdx + dir));
  var curr = document.getElementById('pmrstep' + _toolStepIdx);
  var cdot = document.getElementById('pmrdot' + _toolStepIdx);
  if (prev) prev.classList.remove('active');
  if (curr) curr.classList.add('active');
  if (pdot && dir > 0) pdot.classList.add('done');
  if (cdot) cdot.classList.add('done');
  document.getElementById('pmrPrev').style.display = _toolStepIdx > 0 ? '' : 'none';
  var nextBtn = document.getElementById('pmrNext');
  if (_toolStepIdx >= _pmrSteps.length - 1) {
    nextBtn.textContent = 'Done ✓';
    nextBtn.onclick = function(){ toolClose(); _toolStepIdx = 0; };
  } else { nextBtn.textContent = 'Next →'; }
};
function _initPMR() { _toolStepIdx = 0; }

/* ---- Bilateral Tapping ---- */
var _bilateralSteps = [
  { cue:'Cross your arms over your chest — right hand on left shoulder, left hand on right shoulder.' },
  { cue:'Now tap your right shoulder gently with your right hand. Then your left shoulder with your left hand.' },
  { cue:'Keep alternating slowly. Right… left… right… left. Find a gentle rhythm.' },
  { cue:'As you tap, breathe slowly. Right… left… right… left. Let your shoulders drop.' },
  { cue:'10 more taps. Right… left… right… left… right… left… right… left… right… left.' },
  { cue:'Rest your hands. Notice how your body feels right now. Calmer, even a little? That\'s your nervous system resetting. 💛' }
];
function _buildBilateral() {
  var steps = _bilateralSteps.map(function(s,i){
    return '<div class="tool-step-item' + (i===0?' active':'') + '" id="bilstep'+i+'">' +
      '<div class="tool-step-num">Step ' + (i+1) + '</div>' +
      '<div class="tool-step-text">' + s.cue + '</div></div>';
  }).join('');
  var dots = _bilateralSteps.map(function(s,i){ return '<div class="tool-step-dot' + (i===0?' done':'') + '" id="bildot'+i+'"></div>'; }).join('');
  return '<div class="tool-modal-icon">🦋</div>' +
    '<div class="tool-modal-title">Bilateral Tapping</div>' +
    '<div class="tool-modal-sub">The Butterfly Hug. Alternating taps help calm the nervous system.</div>' +
    '<div class="tool-step-progress">' + dots + '</div>' +
    '<div class="tool-steps" id="bilSteps">' + steps + '</div>' +
    '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">' +
      '<button class="btn btn-secondary" id="bilPrev" onclick="bilNav(-1)" style="display:none">← Back</button>' +
      '<button class="btn" id="bilNext" onclick="bilNav(1)" style="background:var(--gold);color:var(--navy);">Next →</button>' +
    '</div>';
}
window.bilNav = function(dir) {
  var prev = document.getElementById('bilstep' + _toolStepIdx);
  var pdot = document.getElementById('bildot' + _toolStepIdx);
  _toolStepIdx = Math.max(0, Math.min(_bilateralSteps.length - 1, _toolStepIdx + dir));
  var curr = document.getElementById('bilstep' + _toolStepIdx);
  var cdot = document.getElementById('bildot' + _toolStepIdx);
  if (prev) prev.classList.remove('active');
  if (curr) curr.classList.add('active');
  if (pdot && dir > 0) pdot.classList.add('done');
  if (cdot) cdot.classList.add('done');
  document.getElementById('bilPrev').style.display = _toolStepIdx > 0 ? '' : 'none';
  var nb = document.getElementById('bilNext');
  if (_toolStepIdx >= _bilateralSteps.length - 1) { nb.textContent = 'Done ✓'; nb.onclick = function(){ toolClose(); _toolStepIdx=0; }; }
  else { nb.textContent = 'Next →'; }
};
function _initBilateral() { _toolStepIdx = 0; }

/* ---- Movement Break (timed) ---- */
var _moveSteps = [
  { dur:10, label:'Shake your hands', icon:'🙌', desc:'Let them flop loose, shake from the wrist.' },
  { dur:10, label:'Roll your shoulders', icon:'🔄', desc:'Backward, slowly, 5 times each direction.' },
  { dur:15, label:'Jump in place', icon:'⬆️', desc:'Gentle bounces — just enough to move the energy.' },
  { dur:10, label:'Neck rolls', icon:'💫', desc:'Chin to chest, slowly roll side to side.' },
  { dur:10, label:'Shake it all out', icon:'🌊', desc:'Arms, legs, whole body. Let everything go loose.' },
  { dur:0,  label:'Done', icon:'✅', desc:'Notice how your body feels now. That stored energy had somewhere to go. 💛' }
];
function _buildMovement() {
  return '<div class="tool-modal-icon" id="mvIcon">' + _moveSteps[0].icon + '</div>' +
    '<div class="tool-modal-title" id="mvLabel">' + _moveSteps[0].label + '</div>' +
    '<div class="tool-modal-sub" id="mvDesc">' + _moveSteps[0].desc + '</div>' +
    '<div class="timer-ring-wrap">' +
      '<svg class="timer-ring-svg" width="100" height="100" viewBox="0 0 100 100">' +
        '<circle class="timer-ring-bg" cx="50" cy="50" r="44"/>' +
        '<circle class="timer-ring-prog" id="mvRing" cx="50" cy="50" r="44" stroke-dasharray="276.46" stroke-dashoffset="0"/>' +
      '</svg>' +
      '<div class="timer-ring-num" id="mvSec">' + _moveSteps[0].dur + '</div>' +
    '</div>' +
    '<div style="margin-top:16px;">' +
      '<button class="btn" id="mvBtn" onclick="mvStart()" style="background:var(--gold);color:var(--navy);">Begin</button>' +
    '</div>';
}
window.mvStart = function() {
  document.getElementById('mvBtn').style.display = 'none';
  _toolStepIdx = 0;
  mvRunStep();
};
window.mvRunStep = function() {
  var s = _moveSteps[_toolStepIdx];
  document.getElementById('mvIcon').textContent = s.icon;
  document.getElementById('mvLabel').textContent = s.label;
  document.getElementById('mvDesc').textContent = s.desc;
  if (s.dur === 0) {
    document.getElementById('mvSec').textContent = '✓';
    document.getElementById('mvRing').style.strokeDashoffset = '0';
    return;
  }
  var total = s.dur;
  var circ = 276.46;
  var remaining = total;
  document.getElementById('mvSec').textContent = remaining;
  document.getElementById('mvRing').style.strokeDashoffset = '0';
  var tick = setInterval(function() {
    remaining--;
    document.getElementById('mvSec').textContent = remaining;
    document.getElementById('mvRing').style.strokeDashoffset = circ * (1 - remaining/total);
    if (remaining <= 0) {
      clearInterval(tick);
      _toolStepIdx++;
      if (_toolStepIdx < _moveSteps.length) { mvRunStep(); }
    }
  }, 1000);
  _toolTimer = tick;
};
function _initMovement() { _toolStepIdx = 0; }

/* ---- Safe Place Visualization ---- */
var _safeSteps = [
  { cue:'Close your eyes, or soften your gaze downward. Take one slow breath to arrive here.' },
  { cue:'Picture a place where you feel completely safe. It can be real or imagined. Anywhere.' },
  { cue:'What do you see there? Notice the colors, the light, the shapes around you.' },
  { cue:'What do you hear? Maybe quiet. Maybe water, wind, music, or voices you trust.' },
  { cue:'How does the air feel on your skin? Is it warm, cool, still, or breezy?' },
  { cue:'Feel your feet on the ground — or wherever you are sitting. You are here. You are safe.' },
  { cue:'Take one more slow breath from that place. Carry a little of it with you. 💛' }
];
function _buildSafePlace() {
  var steps = _safeSteps.map(function(s,i){
    return '<div class="tool-step-item' + (i===0?' active':'') + '" id="spstep'+i+'">' +
      '<div class="tool-step-text" style="font-family:var(--font-serif);font-style:italic;font-size:17px;line-height:1.7;">' + s.cue + '</div></div>';
  }).join('');
  var dots = _safeSteps.map(function(s,i){ return '<div class="tool-step-dot' + (i===0?' done':'') + '" id="spdot'+i+'"></div>'; }).join('');
  return '<div class="tool-modal-icon">🌱</div>' +
    '<div class="tool-modal-title">Safe Place</div>' +
    '<div class="tool-modal-sub">A 60-second guided visualization. Move through at your own pace.</div>' +
    '<div class="tool-step-progress">' + dots + '</div>' +
    '<div class="tool-steps" id="spSteps">' + steps + '</div>' +
    '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">' +
      '<button class="btn btn-secondary" id="spPrev" onclick="spNav(-1)" style="display:none">← Back</button>' +
      '<button class="btn" id="spNext" onclick="spNav(1)" style="background:var(--gold);color:var(--navy);">Next →</button>' +
    '</div>';
}
window.spNav = function(dir) {
  var prev = document.getElementById('spstep' + _toolStepIdx);
  var pdot = document.getElementById('spdot' + _toolStepIdx);
  _toolStepIdx = Math.max(0, Math.min(_safeSteps.length-1, _toolStepIdx+dir));
  var curr = document.getElementById('spstep' + _toolStepIdx);
  var cdot = document.getElementById('spdot' + _toolStepIdx);
  if (prev) prev.classList.remove('active');
  if (curr) curr.classList.add('active');
  if (pdot && dir>0) pdot.classList.add('done');
  if (cdot) cdot.classList.add('done');
  document.getElementById('spPrev').style.display = _toolStepIdx > 0 ? '' : 'none';
  var nb = document.getElementById('spNext');
  if (_toolStepIdx >= _safeSteps.length-1) { nb.textContent = 'Done ✓'; nb.onclick = function(){ toolClose(); _toolStepIdx=0; }; }
  else { nb.textContent = 'Next →'; }
};
function _initSafePlace() { _toolStepIdx = 0; }

/* ---- Emotion Wheel ---- */
var _emotions = [
  { label:'😡 Mad',     response:'Anger means something important to you was threatened. Take a breath before you act. What do you actually need right now?' },
  { label:'😢 Sad',     response:'Sadness is a signal of loss or longing. You don\'t have to push it away. Is there one person you could tell how you\'re feeling?' },
  { label:'😨 Scared',  response:'Fear is your body trying to protect you. Slow your breath — in through the nose, out through the mouth. What is one thing that is safe right now?' },
  { label:'😕 Confused',response:'Confusion is often information overload. It\'s okay to say "I need a minute." What\'s one small thing you know for certain right now?' },
  { label:'😩 Overwhelmed', response:'Too much at once. Put one thing down — just one. What\'s the smallest next step?' },
  { label:'😐 Shut Down', response:'Shutdown is a protection. Your body is saying: this is too much. That\'s okay. You don\'t have to perform okay right now.' },
  { label:'😴 Tired',   response:'Real rest matters. If you can\'t rest now, what\'s one thing you can skip today to protect your energy?' },
  { label:'😊 Okay',    response:'Even "okay" is worth noticing. What\'s one small thing that helped you feel this way? Keep doing that.' },
  { label:'😤 Frustrated', response:'Frustration often means you care but feel stuck. What would "unstuck" look like, even a little bit?' }
];
function _buildEmotion() {
  var btns = _emotions.map(function(e,i){
    return '<button class="emotion-btn" onclick="emotionPick(' + i + ')">' + e.label + '</button>';
  }).join('');
  return '<div class="tool-modal-icon">🟡</div>' +
    '<div class="tool-modal-title">Emotion Wheel</div>' +
    '<div class="tool-modal-sub">Name it to tame it. Pick what feels closest right now.</div>' +
    '<div class="emotion-grid">' + btns + '</div>' +
    '<div class="emotion-response" id="emotionResp"></div>' +
    '<button class="btn btn-secondary" id="emotionReset" onclick="emotionReset()" style="display:none;margin-top:8px;">Choose again</button>';
}
window.emotionPick = function(i) {
  document.querySelectorAll('.emotion-btn').forEach(function(b){ b.classList.remove('selected'); });
  document.querySelectorAll('.emotion-btn')[i].classList.add('selected');
  var r = document.getElementById('emotionResp');
  r.textContent = _emotions[i].response;
  r.classList.add('visible');
  document.getElementById('emotionReset').style.display = '';
};
window.emotionReset = function() {
  document.querySelectorAll('.emotion-btn').forEach(function(b){ b.classList.remove('selected'); });
  var r = document.getElementById('emotionResp');
  r.textContent = '';
  r.classList.remove('visible');
  document.getElementById('emotionReset').style.display = 'none';
};
function _initEmotion() {}

/* ---- Co-Regulation Reminder ---- */
function _buildCoreg() {
  return '<div class="tool-modal-icon">🧡</div>' +
    '<div class="tool-modal-title">Co-Regulation Reminder</div>' +
    '<div class="tool-modal-sub" style="font-size:15px;line-height:1.7;text-align:left;margin-top:16px;">' +
      '<p style="font-family:var(--font-serif);font-style:italic;font-size:18px;margin-bottom:16px;">Before you regulate the student, regulate yourself.</p>' +
      '<p><strong>1. Check your breath.</strong> Take one slow breath right now, before you say anything.</p>' +
      '<p><strong>2. Relax your jaw.</strong> Most people don\'t notice they\'ve been clenching. Drop it.</p>' +
      '<p><strong>3. Lower your shoulders.</strong> They\'ve crept up. Let them fall.</p>' +
      '<p><strong>4. Soften your voice.</strong> One full tone quieter than you think you need.</p>' +
      '<p><strong>5. Check your face.</strong> A calm, warm face, even for a moment, helps an upset student feel safe.</p>' +
      '<p style="font-family:var(--font-serif);font-style:italic;font-size:16px;margin-top:20px;color:var(--gold-deep,#9a6f24);">Your calm is the intervention. Everything else is secondary.</p>' +
    '</div>';
}
function _initCoreg() {}

/* ---- Cold Water ---- */
function _buildColdwater() {
  return '<div class="tool-modal-icon">💧</div>' +
    '<div class="tool-modal-title">Cold Water Reset</div>' +
    '<div class="tool-modal-sub" style="text-align:left;line-height:1.7;font-size:15px;">' +
      '<p>Cold water on the wrists or face activates the vagus nerve — the body\'s own calm-down signal.</p>' +
      '<p><strong>Option 1 — Wrists:</strong> Run cold water over both wrists for 30 seconds. Focus on the sensation.</p>' +
      '<p><strong>Option 2 — Face:</strong> Splash cold water on your face 3 times. Each splash, exhale slowly.</p>' +
      '<p><strong>Option 3 — At desk:</strong> Hold a cold water bottle against the back of your neck or wrists for 20 seconds.</p>' +
      '<p style="font-family:var(--font-serif);font-style:italic;margin-top:16px;">This is biology, not willpower. The body knows how to calm itself — it just needs a signal.</p>' +
    '</div>';
}
function _initColdwater() {}

/* ---- Visual Fidget ---- */
function _buildFidget() {
  return '<div class="tool-modal-icon">🌀</div>' +
    '<div class="tool-modal-title">Visual Fidget</div>' +
    '<div class="tool-modal-sub">Follow the shape with your eyes only. Let your breath slow to match it.</div>' +
    '<div style="display:flex;align-items:center;justify-content:center;margin:16px 0;">' +
      '<svg id="fidgetSvg" viewBox="0 0 200 200" width="180" height="180" style="overflow:visible;">' +
        '<defs><radialGradient id="fg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#F2C964"/><stop offset="100%" stop-color="#D9A33B"/></radialGradient></defs>' +
        '<circle id="fidgetOrb" cx="100" cy="100" r="18" fill="url(#fg)" opacity=".9"/>' +
        '<circle cx="100" cy="100" r="80" fill="none" stroke="rgba(217,163,59,.18)" stroke-width="1.5"/>' +
      '</svg>' +
    '</div>';
}
function _initFidget() {
  var orb = document.getElementById('fidgetOrb');
  if (!orb) return;
  var cx = 100, cy = 100, r = 80, angle = 0;
  function tick() {
    angle += 0.012;
    var x = cx + r * Math.cos(angle);
    var y = cy + r * Math.sin(angle);
    orb.setAttribute('cx', x.toFixed(2));
    orb.setAttribute('cy', y.toFixed(2));
    _toolTimer = requestAnimationFrame(tick);
  }
  _toolTimer = requestAnimationFrame(tick);
}

/* ====================== NEW KID-FRIENDLY TOOLS ====================== */

function _buildRainbowBreath() {
  return '<div class="tool-modal-icon">🌈</div>' +
    '<div class="tool-modal-title">Rainbow Breathing</div>' +
    '<div class="tool-modal-sub">Breathe in a new color each time!</div>' +
    '<div id="rainbowOrb" style="width:200px;height:200px;margin:30px auto;border-radius:50%;background:linear-gradient(45deg,#ff0000,#ff9900,#ffff00,#00ff00,#0099ff,#4b0082);box-shadow:0 0 50px rgba(255,180,0,.7);transition:transform 3s ease;"></div>' +
    '<div id="rainbowCue" style="font-size:24px;font-family:var(--font-serif);min-height:80px;color:var(--ink);text-align:center;"></div>';
}
function _initRainbowBreath() {
  var colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];
  var i = 0;
  var cue = document.getElementById('rainbowCue');
  var orb = document.getElementById('rainbowOrb');
  if (!cue || !orb) return;
  function cycle() {
    cue.textContent = 'Breathe in ' + colors[i] + '...';
    orb.style.transform = 'scale(1.25)';
    _toolTimer = setTimeout(function() {
      cue.textContent = 'Breathe out ' + colors[i] + '...';
      orb.style.transform = 'scale(0.75)';
      i = (i + 1) % colors.length;
      if (i !== 0) { _toolTimer = setTimeout(cycle, 3000); }
      else { cue.textContent = 'What a beautiful rainbow! 🌈 You did great!'; }
    }, 3200);
  }
  cycle();
}

function _buildAnimalYoga() {
  var poses = [
    { e:'🦁', n:'Lion',      d:'Make a big roar then relax your face!' },
    { e:'🦋', n:'Butterfly', d:'Sit with feet together and flap your knees like wings!' },
    { e:'🐶', n:'Dog',       d:'Hands and feet on floor, hips up high — Downward Dog!' },
    { e:'🐱', n:'Cat',       d:'Arch and round your back slowly — Cat-Cow stretch!' }
  ];
  var cards = poses.map(function(p) {
    return '<div onclick="this.querySelector(\'.ay-desc\').style.display=this.querySelector(\'.ay-desc\').style.display===\'\'?\'none\':\'\'" style="background:white;border:2px solid var(--gold);padding:16px;border-radius:12px;text-align:center;cursor:pointer;">' +
      '<div style="font-size:36px;margin-bottom:6px;">' + p.e + '</div>' +
      '<div style="font-weight:600;font-size:14px;color:var(--navy);">' + p.n + '</div>' +
      '<div class="ay-desc" style="display:none;font-size:12px;color:var(--ink-soft);margin-top:8px;line-height:1.4;">' + p.d + '</div>' +
    '</div>';
  }).join('');
  return '<div class="tool-modal-icon">🦁</div>' +
    '<div class="tool-modal-title">Animal Yoga</div>' +
    '<div class="tool-modal-sub">Tap a pose to see how to do it!</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;margin-top:20px;">' + cards + '</div>';
}

function _buildCalmJar() {
  return '<div class="tool-modal-icon">🫙</div>' +
    '<div class="tool-modal-title">Calm Down Jar</div>' +
    '<div class="tool-modal-sub">Shake it and watch the glitter settle while you breathe.</div>' +
    '<div id="calmJar" onclick="shakeJar(this)" style="width:140px;height:200px;margin:24px auto;background:linear-gradient(180deg,#81d4fa,#e1f5fe);border:10px solid #26334a;border-radius:24px;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.2);">' +
      '<div id="glitterLayer" style="position:absolute;inset:0;"></div>' +
    '</div>' +
    '<p style="text-align:center;color:var(--ink-soft);font-size:14px;">Tap the jar — then breathe slowly while the glitter settles.</p>';
}
window.shakeJar = function(el) {
  try { if (window.GraceAudio && typeof window.GraceAudio.playJarTinkle === 'function') window.GraceAudio.playJarTinkle(); } catch (e) {}
  el.style.animation = 'jarShake 0.6s ease';
  var g = document.getElementById('glitterLayer');
  if (g) {
    var dots = '';
    for (var i = 0; i < 30; i++) {
      var x = Math.random()*100, y = Math.random()*100;
      var c = ['#ffd700','#ff69b4','#87ceeb','#98fb98','#dda0dd'][Math.floor(Math.random()*5)];
      dots += '<div style="position:absolute;width:5px;height:5px;border-radius:50%;background:' + c + ';left:' + x + '%;top:' + y + '%;opacity:0.85;transition:top ' + (2+Math.random()*3).toFixed(1) + 's ease;"></div>';
    }
    g.innerHTML = dots;
    setTimeout(function() {
      g.querySelectorAll('div').forEach(function(d) { d.style.top = (80 + Math.random()*15) + '%'; });
    }, 100);
  }
  setTimeout(function() { el.style.animation = ''; }, 800);
};

/* ---- Print reference ---- */
window.printTeacherTools = function() {
  var win = window.open('');
  win.document.write('<html><body style="font-family:sans-serif;padding:24px;"><h1 style="color:#0A1E33">Calm &amp; Regulation Tools</h1><p style="color:#666;margin-bottom:16px;">Architecture of Grace · Classroom Aide Reference Sheet</p><ul style="line-height:2.2;font-size:15px;"><li>4-7-8 Breathing (animated orb)</li><li>5-4-3-2-1 Grounding (step-through)</li><li>Body Scan / Progressive Muscle Relaxation</li><li>Bilateral Tapping — Butterfly Hug</li><li>Movement Break (timed)</li><li>Safe Place Visualization</li><li>Emotion Wheel — Name It to Tame It</li><li>Co-Regulation Reminder</li><li>Cold Water Reset</li><li>Visual Fidget</li><li>PECS Cards</li></ul></body></html>');
  win.document.close(); win.print();
};
