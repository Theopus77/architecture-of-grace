/* ══ AOG-DRUM-REAL-V1 (2026-10-04) — RECORDED DRUM KITS FOR THE DRUM MACHINE ═══════════════════════════════════
   Jimmy: "I would love an authentic Drum kit as well." Five kits, P to T, made from one real kit: Big Rusty Drums by
   Karoryfer Samples (CC0), a big early-1980s Szpaderski kit from Poland (24" kick, 14x8 snare, 14", 15", 18" and 22"
   toms, Sabian hats and cymbals), recorded with close and overhead microphones. Each kit is the same recordings mixed
   and processed another way (microphones, EQ, compression, a room, tuning, how long each sound rings), ahead of time,
   into audio/drums/<kit>/ (mono MP3, 96 kbps, as the piano's). Credits: audio/drums/CREDITS.txt.
   The five follow the drummers Jimmy named, and are called by their style, never by the player: P a polished studio
   session kit (dry, a snare for ghost notes), Q a huge room (the open kick, a ringing snare, the far microphones),
   R big-band swing (a small kick tuned up, a crisp snare, the hi-hat foot, a dark ride and a sizzle), S prog rock
   (three toms tuned a fourth apart on pads 5 to 7), T groove metal (a clicky kick for double-kick runs, a big snare).

   · A kit downloads only when it is picked (0.4 to 0.7 MB), with one calm line while it gets ready.
   · Every pad has three ways to be hit (soft, normal, accent), each its own recording, and a second take of the
     sounds a beat uses most, so a pad played twice in a row does not sound copied. On kits P, Q and T an accent on
     the ride plays its bell; on Q, R, S and T an accent on the snare is a rimshot.
   · The machine treats a recorded kit as a built-in kit, like A to I: it never uses the ten seconds of sample memory.
     Pads 1 and 2 leave raw and pads 3 to 8 pass the machine's filter, as a sample does. The era dial plays it as the
     twelve-bit 26,040 Hz machine heard it (1987) or as recorded (2026).
   · The page keeps all its own logic; it asks this file five things: is this a recorded kit (has), get it ready
     (load), send its hits to an engine (post), which recording does this hit play (route), and what to show (label,
     padNames, lineHtml, decorate, creditHtml). ════════════════════════════════════════════════════════════════════

   ══ AOG-DRUM-REAL-V2 (2026-10-04) — EVERY KIT THAT IMITATES REAL DRUMS IS NOW REAL DRUMS ═══════════════════════════
   Jimmy wants every instrument sound to be a real recording. Two changes, built by music-handoff/tools/drumkits/:
   · Kits D, E, G to K and M to O used to be made on the page and imitated real drums and percussion. They are now
     recordings, with the same letter, name and character, each pad as loud as its page-made sound was. Where no
     recording of a sound passes the licence rules, the nearest real instrument plays and the pad says what it is:
     D's finger snap and G's snap are a hand clap, H's maraca is a shaker, N's talking drum is a djembe.
   · Five new kits after the drummers Jimmy named, on screen by style only: U jazz club (Buddy Rich), V brush ballad,
     W studio funk (Jeff Porcaro), X 1970s vintage (John Bonham), Y hip-hop break; each with a beat to start from.
   Kits A, B, C, F and L imitate electronic drum machines (synth voices, electro, the 808, the 909), whose sound is
   made electronically on the real machines too; they stay made on the page. So does kit M's synth tom: a pad marked
   made:1 is drawn by the page (the page's maker) inside an otherwise recorded kit.
   The libraries, all CC0 (public domain): Big Rusty Drums, Swirly Drums and Gogodze Phu Vol II (Karoryfer Samples),
   Virtuosity Drums (Versilian Studios and Karoryfer), the Versilian Community Sample Library and VS Chamber
   Orchestra 2 Community Edition (Versilian Studios), jRhodes GM (Jeff Learman) and the "a" of Hadzi-Fia (Karoryfer).
   Credits: audio/drums/CREDITS.txt. ══════════════════════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";
  var BASE = "/audio/drums/", VER = "1";
  var HI = 44100, LO = 26040;
  /* A pad: the name it shows, the file it plays (name-s / name-m / name-h, numbered when there are two or more takes),
     and how many takes each layer has: [soft, normal, hard]. hat:1 = it shuts the open hat, as a foot does.
     made:1 = the page draws this pad itself (an electronic sound inside a recorded kit). */
  function P(name, n, extra) { var o = { name: name, n: n || [0, 0, 0] }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  /* the recorded kits. P to T and U to Y follow the drummers Jimmy named; on screen they go by style, never by player */
  var KITS = {
    /* AOG-DRUM-REAL-V2: the kits that used to be made on the page, now recorded (same letter, name and character) */
    D: { dir: "dusty", en: "Kit D · dusty breaks", es: "Kit D · breaks polvorientos",
      pads: { kick: P("THUMP", [1, 2, 2]), snare: P("CRACK", [1, 2, 2]), ch: P("SHAKER", [1, 2, 1]), oh: P("TAMB", [1, 1, 1]),
              clap: P("CLAP", [1, 1, 1]), tom: P("TIMBAL", [1, 2, 1]), rim: P("BLOCK", [1, 2, 1]), bell: P("TRIANG", [1, 1, 1]) } },
    E: { dir: "boombap", en: "Kit E · boom bap", es: "Kit E · boom bap",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("CLAP", [1, 2, 1]), tom: P("LOWTOM", [1, 1, 1]), rim: P("STICK", [1, 1, 1]), bell: P("SCRTCH", [1, 2, 1]) } },
    G: { dir: "lofi", en: "Kit G · lo-fi", es: "Kit G · lo-fi",
      pads: { kick: P("SOFT", [1, 2, 1]), snare: P("BRUSH", [1, 2, 1]), ch: P("TICK", [1, 2, 1]), oh: P("SIZZLE", [1, 1, 1]),
              clap: P("CLAP", [1, 1, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIM", [1, 1, 1]), bell: P("KEYS", [1, 1, 1]) } },
    H: { dir: "latin", en: "Kit H · Latin percussion", es: "Kit H · percusión latina",
      pads: { kick: P("BOMBO", [1, 2, 1]), snare: P("TIMBAL", [1, 2, 1]), ch: P("GUIRO", [1, 1, 1]), oh: P("SHAKER", [1, 1, 1]),
              clap: P("CLAVE", [1, 2, 1]), tom: P("CONGA", [1, 2, 1]), rim: P("BONGO", [1, 2, 1]), bell: P("AGOGO", [1, 1, 1]) } },
    I: { dir: "live", en: "Kit I · live drums", es: "Kit I · batería en vivo",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 2, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    J: { dir: "arena", en: "Kit J · rock arena", es: "Kit J · rock de estadio",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("CLAPS", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("STOMP", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    K: { dir: "jazzbrush", en: "Kit K · jazz brushes", es: "Kit K · jazz con escobillas",
      pads: { kick: P("KICK", [1, 2, 1]), snare: P("BRUSH", [1, 2, 1]), ch: P("CHICK", [1, 2, 1]), oh: P("SWISH", [1, 2, 1]),
              clap: P("SLAP", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("BASS", [1, 2, 1]) } },
    M: { dir: "reggae", en: "Kit M · reggae and dub", es: "Kit M · reggae y dub",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 1]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("SYNTOM", null, { made: 1 }), tom: P("TOM", [1, 1, 1]), rim: P("XSTICK", [1, 2, 1]), bell: P("SKANK", [1, 2, 1]) } },
    N: { dir: "afrobeat", en: "Kit N · afrobeat", es: "Kit N · afrobeat",
      pads: { kick: P("KICK", [1, 2, 1]), snare: P("SNARE", [1, 2, 1]), ch: P("SHAKER", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("DJEMBE", [1, 2, 1]), tom: P("CONGA", [1, 2, 1]), rim: P("STICKS", [1, 1, 1]), bell: P("BELL", [1, 1, 1]) } },
    O: { dir: "marching", en: "Kit O · marching band", es: "Kit O · banda de marcha",
      pads: { kick: P("BASS", [1, 2, 1]), snare: P("SNARE", [1, 2, 1]), ch: P("CLICK", [1, 1, 1]), oh: P("CYMBAL", [1, 1, 1]),
              clap: P("ROLL", [1, 2, 1]), tom: P("TENOR", [1, 2, 1]), rim: P("RIM", [1, 1, 1]), bell: P("BELLS", [1, 1, 1]) } },
    P: { dir: "studio", en: "Kit P · studio session, dry", es: "Kit P · sesión de estudio, seca",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 1, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    Q: { dir: "bigroom", en: "Kit Q · big room rock", es: "Kit Q · rock en sala grande",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("HITOM", [1, 1, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    R: { dir: "bigband", en: "Kit R · big-band swing", es: "Kit R · swing de big band",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("PEDAL", [1, 2, 1], { hat: 1 }), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("SIZZLE", [1, 1, 1]) } },
    S: { dir: "prog", en: "Kit S · prog rock, many toms", es: "Kit S · rock progresivo, muchos toms",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("HITOM", [1, 1, 1]), tom: P("MIDTOM", [1, 1, 1]), rim: P("FLOOR", [1, 1, 1]), bell: P("CRASH", [1, 1, 1]) } },
    T: { dir: "groovemetal", en: "Kit T · groove metal", es: "Kit T · groove metal",
      pads: { kick: P("KICK", [1, 4, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("CHINA", [1, 1, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    /* AOG-DRUM-REAL-V2: five more kits after Jimmy's drummers (U Buddy Rich, W Jeff Porcaro, X John Bonham) */
    U: { dir: "jazzclub", en: "Kit U · jazz club", es: "Kit U · club de jazz",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("PEDAL", [1, 2, 1], { hat: 1 }), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    V: { dir: "brushes", en: "Kit V · brush ballad", es: "Kit V · balada con escobillas",
      pads: { kick: P("KICK", [1, 2, 1]), snare: P("SNARE", [1, 2, 1]), ch: P("CHICK", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("STIR", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("FLUTTR", [1, 1, 1]) } },
    W: { dir: "funk", en: "Kit W · studio funk", es: "Kit W · funk de estudio",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    X: { dir: "vintage70", en: "Kit X · 1970s vintage", es: "Kit X · vintage de los años 70",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("TOM", [1, 1, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("PEDAL", [1, 2, 1], { hat: 1 }), bell: P("CRASH", [1, 1, 1]) } },
    Y: { dir: "break", en: "Kit Y · hip-hop break", es: "Kit Y · break de hip-hop",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("FLOOR", [1, 1, 1]), bell: P("CRASH", [1, 1, 1]) } }
  };
  var IDS = ["D", "E", "G", "H", "I", "J", "K", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"];
  var LAYERS = ["s", "m", "h"];
  function made(b, id) { var k = KITS[b], p = k && k.pads[id]; return !!(p && p.made); }

  /* Beats to start from, one per kit, in the same shape as the machine's own (1 = a hit, 2 = an accent, 3 = soft).
     The prog beat has a second part, a bar of 7 (14 steps): it goes in the next part, and the two play in turn. */
  var STARTERS = [
    { id: "halfshuffle", en: "Half-time shuffle", es: "Shuffle a medio tiempo", kit: "P", bpm: 86, swing: 0.67,
      map: { kick: [2,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0], snare: [0,3,0,0,0,3,0,0,2,3,0,0,0,3,0,0], ch: [2,0,1,0,2,0,1,0,2,0,1,0,2,0,1,0] } },
    { id: "bigroom", en: "Big heavy room groove", es: "Groove pesado de sala grande", kit: "Q", bpm: 72, swing: 0.54,
      map: { kick: [2,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0], oh: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0] } },
    { id: "bigband", en: "Big-band swing", es: "Swing de big band", kit: "R", bpm: 160, swing: 0.67,
      map: { rim: [1,0,0,0,2,0,1,0,1,0,0,0,2,0,1,0], clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], kick: [3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0], snare: [0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0] } },
    { id: "groovemetal", en: "Groove metal, double kick", es: "Groove metal con doble bombo", kit: "T", bpm: 120, swing: 0.50,
      map: { kick: [1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], rim: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0] } },
    { id: "prog47", en: "Prog rock in two parts (4, then 7)", es: "Rock progresivo en dos partes (4 y luego 7)", kit: "S", bpm: 132, swing: 0.50,
      map: { kick: [2,0,0,0,0,0,1,0,2,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] },
      parts: [{ len: 14, map: { kick: [2,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0],
        clap: [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0], tom: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0], rim: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0], bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } }] },
    /* AOG-DRUM-REAL-V2: a beat for each new kit. U fast swing: the ride's "ding, ding-a ding", the hi-hat foot on 2 and 4,
       the kick feathered on every beat, two soft snare comps. V a brush ballad: a long stir on 1 and 3, the brush on 2 and 4.
       W funk: sixteenths on the hat, ghost notes on the snare. X 1970s rock with a fill on the toms in its second part.
       Y a break as it sounds sampled from an old record. */
    { id: "bebop", en: "Fast swing (bebop)", es: "Swing rápido (bebop)", kit: "U", bpm: 200, swing: 0.67,
      map: { rim: [1,0,0,0,2,0,1,0,1,0,0,0,2,0,1,0], clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], kick: [3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0], snare: [0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0] } },
    { id: "brushballad", en: "Brush ballad", es: "Balada con escobillas", kit: "V", bpm: 66, swing: 0.67,
      map: { clap: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], kick: [3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0] } },
    { id: "funkghost", en: "Funk with ghost notes", es: "Funk con notas fantasma", kit: "W", bpm: 98, swing: 0.54,
      map: { ch: [1,3,1,3,1,3,1,3,1,3,1,3,1,3,0,3], oh: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], kick: [2,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0], snare: [0,0,3,0,2,0,0,3,0,0,3,0,2,0,0,3] } },
    { id: "rock70s", en: "1970s rock with a tom fill", es: "Rock de los 70 con redoble en los toms", kit: "X", bpm: 92, swing: 0.50,
      map: { kick: [2,0,0,1,0,0,1,0,2,0,0,0,0,0,1,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
      parts: [{ len: 16, map: { kick: [2,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,2,0,1,0,0,0,0,0], ch: [1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0],
        clap: [0,0,0,0,0,0,0,0,0,0,0,0,2,1,0,0], tom: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1] } }] },
    { id: "break70s", en: "Break from an old record", es: "Break de un disco viejo", kit: "Y", bpm: 92, swing: 0.58,
      map: { kick: [2,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,3,2,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0], oh: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0] } }
  ];
  /* a beat in parts: part 2 goes in the next part of the song, and the track plays them in turn. Put my beat back
     returns that part and the track as they were; a one-part beat picked afterwards stops the track again. */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function parts(p, api) {
    var S = api.S;
    if (!p || !p.parts) {
      if (S.__realParts) { if (S.undo) S.undo.realTrack = { list: S.track.slice(), on: S.trackOn }; S.trackOn = false; S.__realParts = false; }
      return;
    }
    var base = S.seg, next = base + 1 < api.SEGS ? base + 1 : base - 1, sg = S.segs[next];
    var keep = { seg: next, grid: clone(sg.grid), off: clone(sg.off || api.emptyOff()), len: sg.len || 16, bpm: sg.bpm, swing: sg.swing };
    var track = { list: S.track.slice(), on: !!S.trackOn };
    if (!S.undo && (api.hitsIn(sg.grid) > 0 || S.track.length))
      S.undo = { seg: base, grid: api.emptyGrid(), off: api.emptyOff(), len: 16, bpm: S.bpm, swing: S.swing, bank: S.bank };
    if (S.undo) { S.undo.realParts = [keep]; S.undo.realTrack = track; }
    var q = p.parts[0], g = api.emptyGrid();
    Object.keys(q.map).forEach(function (k) { if (g[k]) g[k] = q.map[k].slice(); });
    S.segs[next] = { grid: g, off: api.emptyOff(), len: q.len || 16, bpm: q.bpm || p.bpm || S.bpm, swing: api.snapSwing(q.swing != null ? q.swing : (p.swing != null ? p.swing : S.swing)) };
    S.track = [base, next]; S.trackOn = true; S.trkI = 0; S.__realParts = true;
  }
  function unparts(u, S) {
    if (!u) return;
    if (u.realParts) u.realParts.forEach(function (k) { S.segs[k.seg] = { grid: k.grid, off: k.off, len: k.len, bpm: k.bpm, swing: k.swing }; });
    if (u.realTrack) { S.track = u.realTrack.list; S.trackOn = u.realTrack.on; }
    S.__realParts = false;
  }

  var WORDS = {
    group:   { en: "Recorded drums", es: "Batería grabada" },
    loading: { en: "Getting the recorded drums ready…", es: "Preparando la batería grabada…" },
    failed:  { en: "The recorded drums did not load. Check the internet, then pick the kit again.",
               es: "La batería grabada no se cargó. Revisa el internet y vuelve a elegir el kit." },
    credit:  { en: "The recorded kits are real drums and percussion, free for everyone (CC0), from Karoryfer Samples, Versilian Studios and Jeff Learman.",
               es: "Los kits grabados son batería y percusión de verdad, libres para todos (CC0), de Karoryfer Samples, Versilian Studios y Jeff Learman." },
    credits: { en: "Full credits", es: "Créditos completos" }
  };
  function w(k, lang) { var o = WORDS[k]; return o ? (lang === "es" ? o.es : o.en) : k; }

  function has(b) { return Object.prototype.hasOwnProperty.call(KITS, b); }
  function label(b) { var k = KITS[b]; return k ? [k.en, k.es] : ["", ""]; }
  function padNames(b) { var k = KITS[b], o = {}; if (!k) return o; for (var id in k.pads) o[id] = k.pads[id].name; return o; }
  function files(b, id) {
    var k = KITS[b], p = k && k.pads[id], out = {};
    if (!p) return out;
    var base = p.name.toLowerCase();
    LAYERS.forEach(function (lay, i) {
      var n = p.n[i], list = [];
      for (var j = 1; j <= n; j++) list.push(base + "-" + lay + (n > 1 ? j : ""));
      out[lay] = list;
    });
    return out;
  }

  /* ── getting a kit ready ─────────────────────────────────────────────────── */
  var STATE = {};     /* bank → {state: "loading" | "ready" | "failed", got, total} */
  var DATA = {};      /* bank → pad → layer → [{lo: 26,040 Hz twelve-bit, hi: 44,100 Hz}] */
  var JOBS = {};
  var ORDER = [];     /* banks asked for, the latest last: two stay ready, so a phone keeps its memory */
  var KEEP = 2;
  var STORES = null;  /* the page's kit stores, ROMK and HIK, and its twelve-bit rounding */

  function decodeWith(dec, ab) {
    return new Promise(function (ok, no) { var r = dec.decodeAudioData(ab, ok, no); if (r && r.then) r.then(ok, no); });
  }
  function onsetAt(d, sr) {           /* the hit, 2 ms early: whatever silence the decoder added in front is dropped */
    var pk = 0, i;
    for (i = 0; i < d.length; i++) { var a = d[i] < 0 ? -d[i] : d[i]; if (a > pk) pk = a; }
    var thr = pk * 0.01; i = 0;
    while (i < d.length && Math.abs(d[i]) < thr) i++;
    return Math.max(0, i - Math.round(0.002 * sr)) / sr;
  }
  function slice(d, sr, t, len) {
    var a = Math.round(t * sr), n = Math.max(64, Math.round(len * sr)), o = new Float32Array(n);
    o.set(d.subarray(a, Math.min(d.length, a + n)));
    return o;
  }
  function setState(b, s) { STATE[b] = s; paintLines(); }
  function forget(b) {
    delete DATA[b]; delete JOBS[b]; delete STATE[b];
    if (STORES) { delete STORES.rom[b]; delete STORES.hi[b]; }
  }
  /* make(id), from the page: a made:1 pad drawn by the page, as {lo: twelve-bit 26,040 Hz, hi: 44,100 Hz} (or a promise of it) */
  function load(b, rom, hi, q12, make) {
    if (!has(b)) return Promise.resolve();
    STORES = { rom: rom, hi: hi, q12: q12 };
    var at = ORDER.indexOf(b); if (at >= 0) ORDER.splice(at, 1); ORDER.push(b);
    if (JOBS[b]) return JOBS[b];
    var kit = KITS[b], jobs = [];
    Object.keys(kit.pads).forEach(function (id) {
      var f = files(b, id);
      LAYERS.forEach(function (lay) { f[lay].forEach(function (name, j) { jobs.push({ id: id, lay: lay, j: j, name: name }); }); });
    });
    var OC = root.OfflineAudioContext || root.webkitOfflineAudioContext;
    if (!OC || !root.fetch) { setState(b, { state: "failed", got: 0, total: jobs.length }); return Promise.resolve(); }
    var decHi = new OC(1, 1, HI), decLo = new OC(1, 1, LO);
    var got = {}, n = 0, bad = 0, idx = 0;
    setState(b, { state: "loading", got: 0, total: jobs.length });
    function worker() {
      if (idx >= jobs.length) return Promise.resolve();
      var jb = jobs[idx++];
      return fetch(BASE + kit.dir + "/" + jb.name + ".mp3?v=" + VER)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(function (ab) { return Promise.all([decodeWith(decHi, ab.slice(0)), decodeWith(decLo, ab)]); })
        .then(function (two) { got[jb.id + "/" + jb.lay + "/" + jb.j] = { h: two[0].getChannelData(0), l: two[1].getChannelData(0) }; })
        .catch(function () { bad++; })
        .then(function () { n++; if (STATE[b]) STATE[b].got = n; return worker(); });
    }
    var job = Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]).then(function () {
      if (bad) { forget(b); setState(b, { state: "failed", got: n - bad, total: jobs.length }); return; }
      /* AOG-DRUM-REAL-V2: the pads the page draws itself, before the kit counts as ready */
      var mine = Object.keys(kit.pads).filter(function (id) { return kit.pads[id].made; });
      return Promise.all(mine.map(function (id) {
        return Promise.resolve(make ? make(id) : null).catch(function () { return null; }).then(function (o) { return [id, o]; });
      })).then(function (drawn) { ready(drawn); });
    });
    function ready(drawn) {
      var data = {}, r = rom[b] || (rom[b] = {}), h = hi[b] || (hi[b] = {});
      drawn.forEach(function (d) { data[d[0]] = { made: true }; if (d[1] && d[1].lo && d[1].hi) { r[d[0]] = d[1].lo; h[d[0]] = d[1].hi; } });
      Object.keys(kit.pads).forEach(function (id) {
        if (kit.pads[id].made) return;
        var f = files(b, id), first = got[id + "/m/0"];
        var len = first.h.length / HI - onsetAt(first.h, HI);          /* every take of a pad is as long as its first normal one */
        data[id] = {};
        LAYERS.forEach(function (lay) {
          data[id][lay] = f[lay].map(function (name, j) {
            var g = got[id + "/" + lay + "/" + j], t = onsetAt(g.h, HI);
            return { hi: slice(g.h, HI, t, len), lo: q12(slice(g.l, LO, t, len)) };
          });
        });
        r[id] = data[id].m[0].lo; h[id] = data[id].m[0].hi;
      });
      DATA[b] = data;
      setState(b, { state: "ready", got: n, total: jobs.length });
      var keep = ORDER.slice(-KEEP);                 /* the two kits asked for last stay; an older one is let go */
      Object.keys(DATA).forEach(function (k) { if (k !== b && keep.indexOf(k) < 0) forget(k); });
    }
    JOBS[b] = job;
    return job;
  }

  /* ── playing it ──────────────────────────────────────────────────────────── */
  function vid(b, id, lay, j) { return b + ":" + id + ":" + lay + j; }
  /* every take of this pad goes to the engine under its own name; any other recorded kit's takes of the pad are cleared */
  function post(port, b, id, cut) {
    if (!port || !has(b) || !DATA[b] || !DATA[b][id] || !cut) return;
    var sent = port.__aogReal || (port.__aogReal = {});
    Object.keys(sent).forEach(function (v) {
      var p = v.split(":"); if (p[1] === id && p[0] !== b) { port.postMessage({ type: "clear", id: v }); delete sent[v]; }
    });
    if (DATA[b][id].made) return;                     /* AOG-DRUM-REAL-V2: the page sends its own drawn pad */
    LAYERS.forEach(function (lay) {
      DATA[b][id][lay].forEach(function (tk, j) {
        var lo = cut(tk.lo), hi = cut(tk.hi), v = vid(b, id, lay, j);
        port.postMessage({ type: "kit", id: v, rate: LO, samples: lo.buffer, hi: hi.buffer, hiRate: HI }, [lo.buffer, hi.buffer]);
        sent[v] = 1;
      });
    });
  }
  var RR = {};
  function layerOf(accent) { return (accent === 2 || accent === true) ? "h" : accent === 3 ? "s" : "m"; }
  function pick(b, id, accent) {
    var lay = layerOf(accent), p = KITS[b].pads[id], n = p ? p.n[LAYERS.indexOf(lay)] : 0;
    if (!n) { lay = "m"; n = p ? p.n[1] : 1; }
    var key = b + id + lay, j = (RR[key] || 0) % n; RR[key] = j + 1;
    return { lay: lay, j: j };
  }
  /* which recording this hit plays: the layer by how hard it is struck, the take in turn */
  function route(m, b, id, accent) {
    if (!has(b) || made(b, id)) return m;           /* a pad the page draws keeps its own name */
    var p = KITS[b].pads[id], k = pick(b, id, accent);
    m.id = vid(b, id, k.lay, k.j);
    if (p && p.hat) m.choke = 1;
    return m;
  }
  /* without the sampler engine (a very old browser, or the first tap before it starts): play the recording directly */
  function playDirect(ac, dest, b, id, t0, accent, level) {
    var d = DATA[b] && DATA[b][id]; if (!d || d.made || !ac || !dest) return;
    var k = pick(b, id, accent), tk = d[k.lay] && d[k.lay][k.j]; if (!tk) return;
    try {
      var buf = ac.createBuffer(1, tk.hi.length, HI); buf.getChannelData(0).set(tk.hi);
      var s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = buf; g.gain.value = Math.max(0, Math.min(1, level == null ? 0.46 : level));
      s.connect(g); g.connect(dest); s.start(Math.max(t0 || 0, ac.currentTime));
    } catch (e) {}
  }

  /* ── what the page shows ─────────────────────────────────────────────────── */
  var LANG = "en", BANK = "";
  function lineText(b, lang) {
    var s = STATE[b];
    if (!has(b) || !s) return "";
    if (s.state === "loading") return w("loading", lang);
    if (s.state === "failed") return w("failed", lang);
    return "";
  }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function lineHtml(b, lang) {
    if (!has(b)) return "";
    LANG = lang || "en"; BANK = b;
    var t = lineText(b, LANG);
    return '<span class="realkit-line" role="status" data-realkit-line="' + b + '"' + (t ? "" : " hidden") + ">" + esc(t) + "</span>";
  }
  function paintLines() {
    var d = root.document; if (!d) return;
    Array.prototype.forEach.call(d.querySelectorAll("[data-realkit-line]"), function (el) {
      var t = lineText(el.getAttribute("data-realkit-line"), LANG);
      if (el.textContent !== t) el.textContent = t;
      el.hidden = !t;
    });
  }
  /* the recorded kits sit together under their own heading in the Sounds menu */
  function decorate(doc, lang) {
    LANG = lang || LANG;
    var g = w("group", LANG);
    Array.prototype.forEach.call((doc || root.document).querySelectorAll("[data-bank],[data-simple-bank]"), function (el) {
      var b = el.getAttribute("data-bank") || el.getAttribute("data-simple-bank");
      if (has(b)) el.setAttribute("data-aog-group", g);
    });
    paintLines();
  }
  function creditHtml(lang) {
    return "<p>" + esc(w("credit", lang)) + ' <a href="/audio/drums/CREDITS.txt">' + esc(w("credits", lang)) + "</a></p>";
  }
  /* the line's look: one quiet line under the row, in the machine's warm ink, readable on its dark case */
  function style() {
    var d = root.document; if (!d || d.getElementById("aogRealKitCss")) return;
    var s = d.createElement("style"); s.id = "aogRealKitCss";
    s.textContent = ".realkit-line{flex:1 1 100%;color:#ffd9a8;font-size:.9rem;line-height:1.35;margin:.2rem 0 0;letter-spacing:0;text-transform:none;font-weight:600}" +
      ".realkit-line[hidden]{display:none}";
    (d.head || d.documentElement).appendChild(s);
  }
  try { style(); } catch (e) {}

  root.AOGDrumKit = {
    ids: IDS.slice(), starters: STARTERS, parts: parts, unparts: unparts, has: has, made: made, label: label, padNames: padNames, files: files,
    load: load, post: post, route: route, playDirect: playDirect, state: function (b) { return STATE[b] || null; },
    ready: function (b) { return !!DATA[b]; }, lineHtml: lineHtml, decorate: decorate, creditHtml: creditHtml, words: WORDS
  };
})(window);
