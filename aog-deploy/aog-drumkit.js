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

   · A kit downloads only when it is picked (0.3 to 1.3 MB since AOG-DRUM-STEREO-V1), with one calm line while it gets ready.
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
     recordings, with the same letter, name and character, each pad as loud as its page-made sound was (the
     near-silent closed hats of I, J, K and M, J's open hat and O's roll a little louder, so they sound clearly). Where no
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
   Credits: audio/drums/CREDITS.txt. ══════════════════════════════════════════════════════════════════════════════

   ══ AOG-DRUM-STEREO-V1 (2026-10-04) — THE CYMBALS, HATS AND HAND DRUMS IN TRUE STEREO ══════════════════════════════════
   Jimmy: "REAL EVERYTHING if possible". Many of these recordings were made with two microphones standing apart (the
   overheads, the room, the hand percussion). Their two sides hear a cymbal a little differently, so adding them into
   one channel cancelled some pitches and not others: a hollow, phasey sound. Every pad whose two sides differ is now
   built again in stereo from the same takes, as loud as before (music-handoff/tools/drumkits, AOG-DRUM-STEREO-V1);
   pads recorded with one microphone stay mono. A kit with stereo pads moved to a new folder (dir ending in 2), since
   the old files stay cached for a year. Here: a stereo file keeps both sides (hi2 and lo2 beside hi and lo), they are
   cut and turned round together, and the engine plays the left side on the left and the right on the right; a mono
   file plays as before. ════════════════════════════════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";
  var BASE = "/audio/drums/", VER = "5";   /* 5: Kit Y's kicks stop ringing low into the next beat (kick_rattle.py --tail; Jimmy, 2026-10-06: "it sounds like a wind up") · 4: the snare-wire buzz in eight kits' kicks quieted (music-handoff/tools/drumkits/kick_rattle.py; Jimmy, 2026-10-06: "a spring before the snare") · 3: Kit T's kick made again with its body, so it is a drum, not a stick (Jimmy, 2026-10-04) (2 was its two hard kicks brought under full scale) */
  var HI = 44100, LO = 26040;
  /* A pad: the name it shows, the file it plays (name-s / name-m / name-h, numbered when there are two or more takes),
     and how many takes each layer has: [soft, normal, hard]. hat:1 = it shuts the open hat, as a foot does.
     made:1 = the page draws this pad itself (an electronic sound inside a recorded kit). */
  function P(name, n, extra) { var o = { name: name, n: n || [0, 0, 0] }; if (extra) for (var k in extra) o[k] = extra[k]; return o; }
  /* the recorded kits. P to T and U to Y follow the drummers Jimmy named; on screen they go by style, never by player */
  var KITS = {
    /* AOG-DRUM-REAL-V2: the kits that used to be made on the page, now recorded (same letter, name and character) */
    D: { dir: "dusty2", en: "Kit D · dusty breaks", es: "Kit D · breaks polvorientos",
      pads: { kick: P("THUMP", [1, 2, 2]), snare: P("CRACK", [1, 2, 2]), ch: P("SHAKER", [1, 2, 1]), oh: P("TAMB", [1, 1, 1]),
              clap: P("CLAP", [1, 1, 1]), tom: P("TIMBAL", [1, 2, 1]), rim: P("BLOCK", [1, 2, 1]), bell: P("TRIANG", [1, 1, 1]) } },
    E: { dir: "boombap2", en: "Kit E · boom bap", es: "Kit E · boom bap",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("CLAP", [1, 2, 1]), tom: P("LOWTOM", [1, 1, 1]), rim: P("STICK", [1, 1, 1]), bell: P("SCRTCH", [1, 2, 1]) } },
    G: { dir: "lofi", en: "Kit G · lo-fi", es: "Kit G · lo-fi",
      pads: { kick: P("SOFT", [1, 2, 1]), snare: P("BRUSH", [1, 2, 1]), ch: P("TICK", [1, 2, 1]), oh: P("SIZZLE", [1, 1, 1]),
              clap: P("CLAP", [1, 1, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIM", [1, 1, 1]), bell: P("KEYS", [1, 1, 1]) } },
    H: { dir: "latin2", en: "Kit H · Latin percussion", es: "Kit H · percusión latina",
      pads: { kick: P("BOMBO", [1, 2, 1]), snare: P("TIMBAL", [1, 2, 1]), ch: P("GUIRO", [1, 1, 1]), oh: P("SHAKER", [1, 1, 1]),
              clap: P("CLAVE", [1, 2, 1]), tom: P("CONGA", [1, 2, 1]), rim: P("BONGO", [1, 2, 1]), bell: P("AGOGO", [1, 1, 1]) } },
    I: { dir: "live2", en: "Kit I · live drums", es: "Kit I · batería en vivo",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 2, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    J: { dir: "arena2", en: "Kit J · rock arena", es: "Kit J · rock de estadio",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("CLAPS", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("STOMP", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    K: { dir: "jazzbrush2", en: "Kit K · jazz brushes", es: "Kit K · jazz con escobillas",
      pads: { kick: P("KICK", [1, 2, 1]), snare: P("BRUSH", [1, 2, 1]), ch: P("CHICK", [1, 2, 1]), oh: P("SWISH", [1, 2, 1]),
              clap: P("SLAP", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("BASS", [1, 2, 1]) } },
    /* AOG-DRUM-909-V1 (2026-10-05) — Jimmy: "REAL EVERYTHING if possible". Kit L is a real drum machine now: a Roland
       TR-909 sampled by Janne G:son Berg from his own machine (the "TR-909 JGB pack" on Freesound, posted by altemark,
       CC BY 4.0). Each pad sits where its page-made sound sat (its hats and ride a little louder, so they are heard). The
       machine has no chord, so STAB is still drawn by the page. machine:1 = a drum machine, recorded: it stays under the
       drum machine heading in the Sounds menu. */
    L: { dir: "house909", en: "Kit L · 909 house", es: "Kit L · house 909", machine: 1,
      pads: { kick: P("909", [1, 2, 1]), snare: P("SNARE", [1, 2, 1]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("CLAP", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("STAB", null, { made: 1 }) } },
    M: { dir: "reggae2", en: "Kit M · reggae and dub", es: "Kit M · reggae y dub",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 1]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("SYNTOM", null, { made: 1 }), tom: P("TOM", [1, 1, 1]), rim: P("XSTICK", [1, 2, 1]), bell: P("SKANK", [1, 2, 1]) } },
    N: { dir: "afrobeat2", en: "Kit N · afrobeat", es: "Kit N · afrobeat",
      pads: { kick: P("KICK", [1, 2, 1]), snare: P("SNARE", [1, 2, 1]), ch: P("SHAKER", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("DJEMBE", [1, 2, 1]), tom: P("CONGA", [1, 2, 1]), rim: P("STICKS", [1, 1, 1]), bell: P("BELL", [1, 1, 1]) } },
    O: { dir: "marching2", en: "Kit O · marching band", es: "Kit O · banda de marcha",
      pads: { kick: P("BASS", [1, 2, 1]), snare: P("SNARE", [1, 2, 1]), ch: P("CLICK", [1, 1, 1]), oh: P("CYMBAL", [1, 1, 1]),
              clap: P("ROLL", [1, 2, 1]), tom: P("TENOR", [1, 2, 1]), rim: P("RIM", [1, 1, 1]), bell: P("BELLS", [1, 1, 1]) } },
    P: { dir: "studio2", en: "Kit P · studio session, dry", es: "Kit P · sesión de estudio, seca",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 1, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    Q: { dir: "bigroom2", en: "Kit Q · big room rock", es: "Kit Q · rock en sala grande",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("HITOM", [1, 1, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    R: { dir: "bigband2", en: "Kit R · big-band swing", es: "Kit R · swing de big band",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("PEDAL", [1, 2, 1], { hat: 1 }), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("SIZZLE", [1, 1, 1]) } },
    S: { dir: "prog2", en: "Kit S · prog rock, many toms", es: "Kit S · rock progresivo, muchos toms",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("HITOM", [1, 1, 1]), tom: P("MIDTOM", [1, 1, 1]), rim: P("FLOOR", [1, 1, 1]), bell: P("CRASH", [1, 1, 1]) } },
    T: { dir: "groovemetal", en: "Kit T · groove metal", es: "Kit T · groove metal",
      pads: { kick: P("KICK", [1, 4, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("CHINA", [1, 1, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    /* AOG-DRUM-REAL-V2: five more kits after Jimmy's drummers (U Buddy Rich, W Jeff Porcaro, X John Bonham) */
    U: { dir: "jazzclub2", en: "Kit U · jazz club", es: "Kit U · club de jazz",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("PEDAL", [1, 2, 1], { hat: 1 }), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    V: { dir: "brushes", en: "Kit V · brush ballad", es: "Kit V · balada con escobillas",
      pads: { kick: P("KICK", [1, 2, 1]), snare: P("SNARE", [1, 2, 1]), ch: P("CHICK", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("STIR", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("FLUTTR", [1, 1, 1]) } },
    W: { dir: "funk2", en: "Kit W · studio funk", es: "Kit W · funk de estudio",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("RIDE", [1, 2, 1]), bell: P("CRASH", [1, 1, 1]) } },
    X: { dir: "vintage70-2", en: "Kit X · 1970s vintage", es: "Kit X · vintage de los años 70",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("TOM", [1, 1, 1]), tom: P("FLOOR", [1, 1, 1]), rim: P("PEDAL", [1, 2, 1], { hat: 1 }), bell: P("CRASH", [1, 1, 1]) } },
    Y: { dir: "break2", en: "Kit Y · hip-hop break", es: "Kit Y · break de hip-hop",
      pads: { kick: P("KICK", [1, 2, 2]), snare: P("SNARE", [1, 2, 2]), ch: P("HAT", [1, 2, 1]), oh: P("OPEN", [1, 1, 1]),
              clap: P("XSTICK", [1, 2, 1]), tom: P("TOM", [1, 1, 1]), rim: P("FLOOR", [1, 1, 1]), bell: P("CRASH", [1, 1, 1]) } }
  };
  var IDS = ["D", "E", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y"];
  /* ══ AOG-DRUM-PERC-V1 (2026-10-13) — HAND PERCUSSION, HAND DRUMS AND THE TABLA ══════════════════════════════════════
     Jimmy: "DO them all." Four recorded kits, eight pads each (music-handoff/tools/drumkits/kits_perc.py): the school's
     hand percussion; the djembe and cajón (with maracas, hand claps and the bell of a djembe group); the congas and
     bongos; and the tabla. Every pad says what it is in plain words, in English and Spanish (en, es). drum: the pads of
     one drum share it, so a new stroke stops the ring of the last one, as a hand on the skin does (a muted triangle
     stops the open one; the bayan's ke stops its ghe). look: how the Drum Kit draws a pad that is not a drum ("small",
     "cym"). Nearly every strength has two or three takes, played in turn. Real recordings, CC0: VCSL, Virtuosity Drums, Swirly Drums, FreePats World percussion, and dio_333's tabla
     strokes (via Sonic Pi). The few strokes no free recording has are shaped here from the same drum's recordings,
     and CREDITS.txt says which. A kit downloads only when it is picked, like every recorded kit. */
  function W2(name, n, en, es, extra) { var o = { en: en, es: es }; if (extra) for (var k in extra) o[k] = extra[k]; return P(name, n, o); }
  KITS.HP = { dir: "handperc", en: "Hand percussion", es: "Percusión de mano", hand: 1,
    pads: { kick: W2("WBLOW", [3, 3, 3], "Woodblock · low", "Bloque de madera · grave", { look: "small" }),
            snare: W2("TAMBHIT", [2, 2, 2], "Tambourine · hit", "Pandereta · golpe"),
            ch: W2("EGG", [2, 2, 2], "Egg shaker", "Huevo sonoro"),
            oh: W2("TAMBSHK", [2, 3, 2], "Tambourine · shake", "Pandereta · sacudida"),
            clap: W2("CLAVES", [2, 2, 2], "Claves", "Claves", { look: "small" }),
            tom: W2("WBHIGH", [3, 3, 3], "Woodblock · high", "Bloque de madera · agudo"),
            rim: W2("TRIMUTE", [2, 2, 2], "Triangle · muted", "Triángulo · apagado", { drum: "tri", look: "small" }),
            bell: W2("TRIOPEN", [2, 2, 2], "Triangle · open", "Triángulo · abierto", { drum: "tri", look: "cym" }) } };
  KITS.HD = { dir: "handdrums", en: "Hand drums · djembe and cajón", es: "Tambores de mano · yembé y cajón", hand: 1,
    pads: { kick: W2("DJBASS", [2, 2, 2], "Djembe · bass", "Yembé · grave", { drum: "dj" }),
            snare: W2("DJSLAP", [2, 2, 2], "Djembe · slap", "Yembé · golpe seco", { drum: "dj" }),
            ch: W2("MARACA", [2, 2, 2], "Maracas", "Maracas"),
            oh: W2("DJTONE", [2, 2, 2], "Djembe · tone", "Yembé · tono", { drum: "dj" }),
            clap: W2("CLAP", [1, 2, 2], "Hand claps", "Palmas", { look: "small" }),
            tom: W2("CAJBASS", [2, 3, 2], "Cajón · bass", "Cajón · grave"),
            rim: W2("CAJSLAP", [2, 3, 2], "Cajón · slap", "Cajón · golpe seco"),
            bell: W2("COWBELL", [1, 1, 1], "Cowbell", "Cencerro", { look: "small" }) } };
  KITS.HC = { dir: "congas", en: "Hand drums · congas and bongos", es: "Tambores de mano · congas y bongós", hand: 1,
    pads: { kick: W2("CGBASS", [2, 2, 2], "Conga · bass", "Conga · grave", { drum: "cg" }),
            snare: W2("CGSLAP", [2, 2, 2], "Conga · slap", "Conga · golpe seco", { drum: "cg" }),
            ch: W2("CGMUTE", [2, 2, 2], "Conga · muted", "Conga · apagado", { drum: "cg" }),
            oh: W2("CGOPEN", [2, 2, 2], "Conga · open", "Conga · abierto", { drum: "cg" }),
            clap: W2("TUMBA", [2, 2, 2], "Tumba · open", "Tumba · abierto"),
            tom: W2("BGLOW", [2, 2, 2], "Bongo · low", "Bongó · grave"),
            rim: W2("BGHIGH", [2, 2, 2], "Bongo · high", "Bongó · agudo", { drum: "bg" }),
            bell: W2("BGSLAP", [2, 2, 2], "Bongo · slap", "Bongó · golpe seco", { drum: "bg" }) } };
  KITS.TB = { dir: "tabla", en: "Tabla", es: "Tabla", hand: 1,
    pads: { kick: W2("GHE", [2, 2, 2], "Bayan · ghe (low)", "Bayan · ghe (grave)", { drum: "bayan" }),
            snare: W2("NA", [1, 1, 1], "Dayan · na", "Dayan · na", { drum: "dayan" }),
            ch: W2("TE", [2, 2, 2], "Dayan · te", "Dayan · te", { drum: "dayan" }),
            oh: W2("TIN", [2, 2, 2], "Dayan · tin", "Dayan · tin", { drum: "dayan" }),
            clap: W2("TUN", [2, 2, 2], "Dayan · tun", "Dayan · tun", { drum: "dayan" }),
            tom: W2("GLIDE", [1, 2, 2], "Bayan · glide", "Bayan · deslizado", { drum: "bayan" }),
            rim: W2("KE", [2, 2, 2], "Bayan · ke (closed)", "Bayan · ke (cerrado)", { drum: "bayan" }),
            bell: W2("DHA", [2, 2, 2], "Dha (both hands)", "Dha (las dos manos)", { drum: "bayan" }) } };
  IDS.push("HP", "HD", "HC", "TB");
  /* ══ AOG-DRUM-MORE-V1 (2026-10-18) — Jimmy: "Can we get more drum kits produced?", then "Choose them all!" ════════
     More recorded kits, each its own sound (music-handoff/tools/drumkits/kits_more.py; credits in CREDITS.txt). With so
     many kits, the kit menus show them in groups: Drum sets, Electronic, World, Orchestra and marching, Hand percussion.
     grp: the kit's group (a kit without one is a drum set; the older kits are placed by GROUP_OF). A kit with hand:1 is a
     kit of its own: its grooves bring it, and the retired classic machine leaves it out. */
  var GROUPS = [
    { id: "drums", en: "Drum sets", es: "Baterías" },
    { id: "electronic", en: "Electronic", es: "Electrónica" },
    { id: "world", en: "World", es: "Del mundo" },
    { id: "orch", en: "Orchestra and marching", es: "Orquesta y banda de marcha" },
    { id: "hand", en: "Hand percussion", es: "Percusión de mano" }
  ];
  var GROUP_OF = { H: "world", N: "world", O: "orch", L: "electronic", HP: "hand", HD: "hand", HC: "hand", TB: "hand" };
  function group(b) { var k = KITS[b]; return !k ? "" : (k.grp || GROUP_OF[b] || "drums"); }
  /* the grooves of the new kits sit in the beat menus under the same kinds of name */
  var BEAT_GROUPS = {
    drums: { en: "More drum set grooves", es: "Más ritmos de batería" },
    electronic: { en: "Electronic grooves", es: "Ritmos electrónicos" },
    world: { en: "World rhythms", es: "Ritmos del mundo" },
    orch: { en: "Orchestra", es: "Orquesta" }
  };
  /* the new kits, every pad in plain words (en, es); look: how the Drum Kit draws a pad that is not a drum */
  function K(grp, dir, en, es, pads) { return { dir: dir, en: en, es: es, hand: 1, grp: grp, pads: pads }; }
  /* OR · the back row of an orchestra (VCSL, CC0). The two timpani are tuned a fourth apart (F sharp and B) */
  KITS.OR = K("orch", "orchestra", "Orchestral percussion", "Percusión de orquesta", {
    kick: W2("BASSDR", [2, 2, 2], "Bass drum", "Bombo"),
    snare: W2("SNARE", [2, 2, 2], "Snare drum", "Caja"),
    ch: W2("TRIANG", [1, 2, 2], "Triangle", "Triángulo", { look: "cym" }),
    oh: W2("SUSCYM", [1, 1, 1], "Suspended cymbal", "Platillo suspendido", { look: "cym" }),
    clap: W2("CYMBAL", [1, 2, 2], "Crash cymbals", "Platillos de choque", { look: "cym" }),
    tom: W2("TIMPLO", [1, 2, 2], "Timpani · low", "Timbal · grave"),
    rim: W2("TIMPHI", [1, 2, 2], "Timpani · high", "Timbal · agudo"),
    bell: W2("GONG", [1, 1, 1], "Gong", "Gong", { look: "cym" }) });
  /* ME · Middle Eastern: the darbuka (FreePats), a tambourine's jingles (the riq is a tambourine), frame drums and
     finger cymbals (VCSL). One darbuka, one ring: a new doum, tek or slap stops the last one's ring */
  KITS.ME = K("world", "mideast", "Middle Eastern · darbuka", "Medio Oriente · darbuka", {
    kick: W2("DOUM", [2, 3, 2], "Darbuka · doum (low)", "Darbuka · dum (grave)", { drum: "darb" }),
    snare: W2("TEK", [2, 3, 2], "Darbuka · tek (high)", "Darbuka · tek (agudo)", { drum: "darb" }),
    ch: W2("KA", [2, 2, 2], "Darbuka · ka (other hand)", "Darbuka · ka (la otra mano)"),
    oh: W2("JINGLE", [2, 3, 2], "Tambourine · jingles", "Pandereta · sonajas", { look: "small" }),
    clap: W2("PA", [2, 3, 2], "Darbuka · slap", "Darbuka · golpe seco", { drum: "darb" }),
    tom: W2("FRAMLO", [2, 2, 2], "Frame drum · low", "Tambor de marco · grave"),
    rim: W2("FRAMHI", [2, 2, 2], "Frame drum · high", "Tambor de marco · agudo"),
    bell: W2("ZILLS", [1, 1, 1], "Finger cymbals", "Platillos de dedo", { look: "cym" }) });
  /* SB · samba / batucada (VCSL). The caixa is a snare drum, the ganzá a shaker, then an agogô bell and a whistle. No free
     recording of a surdo, repinique or tamborim was found: the nearest real drums play their parts, and the pads say so */
  KITS.SB = K("world", "samba", "Samba · batucada", "Samba · batucada", {
    kick: W2("SURDO", [2, 2, 2], "Bass drum · surdo part", "Bombo · parte del surdo"),
    snare: W2("CAIXA", [2, 2, 2], "Snare drum · caixa", "Caja · caixa"),
    ch: W2("GANZA", [2, 2, 2], "Shaker · ganzá", "Sonajero · ganzá", { look: "small" }),
    oh: W2("TAMBOR", [2, 2, 2], "Small drum · tamborim part", "Tambor pequeño · parte del tamborim", { look: "small" }),
    clap: W2("REPIQ", [2, 2, 2], "High drum · repinique part", "Tambor agudo · parte del repinique"),
    tom: W2("SURDO2", [2, 2, 2], "Low drum · second surdo", "Tambor grave · segundo surdo"),
    rim: W2("AGOGO", [1, 1, 1], "Agogô bell", "Agogó", { look: "small" }),
    bell: W2("APITO", [1, 1, 1], "Whistle · apito", "Silbato · apito", { look: "small" }) });
  /* BP · body percussion (body_percussion, sfzinstruments, CC0): everything a body can play, for a class with no drums */
  KITS.BP = K("hand", "body", "Body percussion", "Percusión corporal", {
    kick: W2("STOMP", [2, 3, 2], "Stomp", "Pisotón"),
    snare: W2("CLAP", [2, 3, 2], "Hand clap", "Palmada", { look: "small" }),
    ch: W2("SNAP", [2, 3, 2], "Finger snap", "Chasquido", { look: "small" }),
    oh: W2("FCLAP", [2, 3, 2], "Quiet clap (two fingers)", "Palmada suave (dos dedos)", { look: "small" }),
    clap: W2("CHEST", [2, 2, 2], "Chest pat", "Palmada en el pecho"),
    tom: W2("BELLY", [2, 2, 2], "Tummy pat", "Palmada en la barriga"),
    rim: W2("HEEL", [2, 3, 2], "Heel tap", "Golpe de talón", { look: "small" }),
    bell: W2("CHEEK", [2, 2, 2], "Cheek pop", "Golpe en la mejilla", { look: "small" }) });
  /* The drum-set styles (kits_more2.py): every pad recorded; rooms, gates and the crunch are made here. GS and PK and PO
     use MuldjordKit (Lars Muldjord, CC BY 4.0); MT, JG Virtuosity Drums; DS Big Rusty Drums; claps, tambourines, a
     cowbell and hats from VCSL; the stomp from body_percussion; PO's synth tom from FreePats (made by a synthesizer) */
  function DK(o) { var p = {}; for (var id in o) p[id] = W2(o[id][0], o[id][1], o[id][2], o[id][3], o[id][4]); return p; }
  KITS.GS = K("drums", "gospel", "Gospel and church", "Góspel e iglesia", DK({
    kick: ["KICK", [2, 3, 2], "Kick", "Bombo"], snare: ["SNARE", [2, 3, 2], "Snare", "Caja"],
    ch: ["HAT", [2, 3, 2], "Hi-hat", "Charles"], oh: ["OPEN", [2, 2, 2], "Open hi-hat", "Charles abierto"],
    clap: ["CLAPS", [2, 3, 2], "Church claps", "Palmas de la iglesia", { look: "small" }], tom: ["TOM", [2, 2, 2], "Tom", "Tom"],
    rim: ["TAMB", [2, 2, 2], "Tambourine", "Pandereta", { look: "small" }], bell: ["CRASH", [1, 2, 2], "Crash", "Crash"] }));
  KITS.MT = K("drums", "motown", "Motown and 60s soul", "Motown y soul de los 60", DK({
    kick: ["KICK", [1, 2, 2], "Kick", "Bombo"], snare: ["SNTAMB", [1, 2, 2], "Snare and tambourine", "Caja y pandereta"],
    ch: ["HAT", [1, 2, 2], "Hi-hat", "Charles"], oh: ["OPEN", [1, 2, 2], "Open hi-hat", "Charles abierto"],
    clap: ["CLAPS", [2, 2, 2], "Hand claps", "Palmas", { look: "small" }], tom: ["TOM", [1, 2, 2], "Tom", "Tom"],
    rim: ["STOMP", [2, 3, 2], "Foot stomp on a board", "Pisotón en una tabla"], bell: ["TAMB", [1, 2, 2], "Tambourine shake", "Pandereta · sacudida", { look: "small" }] }));
  KITS.DS = K("drums", "disco", "Disco", "Disco", DK({
    kick: ["KICK", [1, 2, 2], "Kick", "Bombo"], snare: ["SNARE", [1, 2, 2], "Snare", "Caja"],
    ch: ["HAT", [1, 2, 1], "Hi-hat", "Charles"], oh: ["OPEN", [1, 1, 2], "Half-open hi-hat", "Charles medio abierto"],
    clap: ["CLAP", [2, 3, 2], "Hand claps", "Palmas", { look: "small" }], tom: ["TOM", [1, 1, 1], "Deep tom", "Tom grave"],
    rim: ["COWBEL", [1, 1, 1], "Cowbell", "Cencerro", { look: "small" }], bell: ["CRASH", [1, 1, 1], "Crash", "Crash"] }));
  KITS.PK = K("drums", "punk", "Punk and garage", "Punk y garaje", DK({
    kick: ["KICK", [2, 2, 2], "Kick", "Bombo"], snare: ["SNARE", [2, 2, 2], "Snare", "Caja"],
    ch: ["HAT", [2, 2, 2], "Hi-hat", "Charles"], oh: ["OPEN", [1, 2, 2], "Open hi-hat", "Charles abierto"],
    clap: ["CHINA", [1, 2, 2], "China cymbal", "Platillo china"], tom: ["FLOOR", [2, 2, 2], "Floor tom", "Tom de piso"],
    rim: ["RIDE", [2, 2, 2], "Ride", "Ride"], bell: ["CRASH", [1, 2, 2], "Crash", "Crash"] }));
  KITS.PO = K("drums", "pop80s", "1980s pop", "Pop de los 80", DK({
    kick: ["KICK", [2, 2, 2], "Kick", "Bombo"], snare: ["GATED", [2, 2, 2], "Big 80s snare", "Caja grande de los 80"],
    ch: ["HAT", [2, 2, 2], "Hi-hat", "Charles"], oh: ["OPEN", [1, 2, 2], "Open hi-hat", "Charles abierto"],
    clap: ["CLAP", [2, 2, 2], "Big claps", "Palmas grandes", { look: "small" }], tom: ["TOM", [2, 2, 2], "Big tom", "Tom grande"],
    rim: ["SYNTOM", [1, 2, 2], "Synth tom (synthesizer)", "Tom de sintetizador"], bell: ["CRASH", [1, 2, 2], "Crash", "Crash"] }));
  KITS.JG = K("drums", "jungle", "Drum and bass · jungle", "Drum and bass · jungle", DK({
    kick: ["KICK", [1, 2, 2], "Kick", "Bombo"], snare: ["SNARE", [1, 2, 2], "Snare", "Caja"],
    ch: ["HAT", [1, 2, 2], "Hi-hat", "Charles"], oh: ["OPEN", [1, 2, 2], "Open hi-hat", "Charles abierto"],
    clap: ["GHOST", [1, 2, 2], "Ghost snare (soft)", "Caja fantasma (suave)"], tom: ["TOM", [1, 2, 2], "Tom", "Tom"],
    rim: ["RIDE", [1, 2, 2], "Ride", "Ride"], bell: ["CRASH", [1, 2, 2], "Crash", "Crash"] }));
  /* RG and TR · electronic: Sonic Pi's drum-machine samples (CC0, from Freesound), with VCSL claps and, for reggaeton, a
     Virtuosity timbale and cross-stick. One recording a sound, so a strength is that recording played softer or louder */
  KITS.RG = K("electronic", "reggaeton", "Reggaeton", "Reguetón", DK({
    kick: ["KICK", [1, 1, 1], "Kick", "Bombo"], snare: ["SNARE", [1, 1, 1], "Snare", "Caja"],
    ch: ["HAT", [1, 1, 1], "Hi-hat", "Charles"], oh: ["OPEN", [1, 1, 1], "Open hi-hat", "Charles abierto"],
    clap: ["CLAP", [2, 2, 2], "Hand claps", "Palmas", { look: "small" }], tom: ["TIMBAL", [1, 2, 1], "Timbale", "Timbal"],
    rim: ["XSTICK", [1, 2, 1], "Cross-stick", "Aro cruzado"], bell: ["BOOM", [1, 1, 1], "808 boom", "Bum 808"] }));
  KITS.TR = K("electronic", "trap", "Trap", "Trap", DK({
    kick: ["KICK", [1, 1, 1], "808 kick", "Bombo 808"], snare: ["SNARE", [1, 1, 1], "Snare", "Caja"],
    ch: ["HAT", [1, 1, 1], "Hi-hat", "Charles"], oh: ["OPEN", [1, 1, 1], "Open hi-hat", "Charles abierto"],
    clap: ["CLAP", [2, 2, 2], "Hand claps", "Palmas", { look: "small" }], tom: ["SNAP", [2, 2, 2], "Finger snap", "Chasquido", { look: "small" }],
    rim: ["CLICK", [1, 1, 1], "Click", "Clic", { look: "small" }], bell: ["BOOM", [1, 1, 1], "808 boom (long)", "Bum 808 (largo)"] }));
  /* AOG-DRUM-CRUNCH-V1 (kits_more3.py): TH thrash metal, tight (MuldjordKit, CC BY 4.0): a clicky kick for double-kick
     runs, a dry cracking snare, a china; BM the crunchy beat machine (Gogodze Phu Vol II, CC0, through its old microphone;
     VCSL claps and a tambourine), every pad through a 12-bit sampler's grit, made here */
  KITS.TH = K("drums", "thrash", "Thrash metal, tight", "Thrash metal, seco y preciso", DK({
    kick: ["KICK", [2, 3, 2], "Kick (a click for fast double kick)", "Bombo (con clic, para doble bombo rápido)"], snare: ["SNARE", [2, 3, 2], "Snare (tight and dry)", "Caja (seca y precisa)"],
    ch: ["HAT", [2, 3, 2], "Hi-hat", "Charles"], oh: ["OPEN", [1, 2, 2], "Open hi-hat", "Charles abierto"],
    clap: ["CHINA", [1, 2, 2], "China cymbal", "Platillo china"], tom: ["TOM", [2, 2, 2], "Tom", "Tom"],
    rim: ["RIDE", [2, 2, 2], "Ride (its bell on an accent)", "Ride (la campana con acento)"], bell: ["CRASH", [1, 2, 2], "Crash", "Crash"] }));
  KITS.BM = K("electronic", "crunch", "Crunchy beat machine", "Caja de ritmos crujiente", DK({
    kick: ["KICK", [1, 2, 2], "Kick", "Bombo"], snare: ["SNARE", [1, 2, 2], "Snare", "Caja"],
    ch: ["HAT", [1, 2, 2], "Hi-hat", "Charles"], oh: ["OPEN", [1, 2, 2], "Open hi-hat", "Charles abierto"],
    clap: ["CLAP", [2, 2, 2], "Hand claps", "Palmas", { look: "small" }], tom: ["LOWTOM", [1, 2, 2], "Low tom", "Tom grave"],
    rim: ["RIM", [1, 2, 2], "Cross-stick", "Aro cruzado", { look: "small" }], bell: ["TAMB", [2, 2, 2], "Tambourine", "Pandereta", { look: "small" }] }));
  IDS.push("OR", "ME", "SB", "BP", "GS", "MT", "DS", "PK", "PO", "JG", "RG", "TR", "TH", "BM");
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
  /* AOG-DRUM-PERC-V1: a groove for each new kit (hand:1 = it plays on its own kit; the Drum Kit and the Drum Machine
     switch to that kit when it is picked, and nothing plays until Play is pressed). The tabla plays teental, the
     sixteen-beat cycle: dha dhin dhin dha | dha dhin dhin dha | dha tin tin ta | ta dhin dhin dha, one beat every two
     steps at 60 (120 beats a minute, a calm middle speed), in two parts of eight beats. Dhin is tin and ghe together. */
  STARTERS.push(
    { id: "schoolband", en: "Classroom percussion", es: "Percusión para la clase", kit: "HP", bpm: 96, swing: 0.50, hand: 1,
      map: { ch: [1,0,3,0,1,0,3,0,1,0,3,0,1,0,3,0], kick: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], tom: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
             oh: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } },
    { id: "djembe", en: "Djembe and bell", es: "Yembé y campana", kit: "HD", bpm: 100, swing: 0.50, hand: 1,
      map: { kick: [2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], oh: [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
             bell: [1,0,0,0,3,0,0,0,1,0,0,0,3,0,0,0] } },
    { id: "cajon", en: "Cajón groove", es: "Ritmo de cajón", kit: "HD", bpm: 92, swing: 0.50, hand: 1,
      map: { tom: [2,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0], rim: [0,0,3,0,2,0,0,0,0,0,3,0,2,0,0,3], ch: [1,0,3,0,1,0,3,0,1,0,3,0,1,0,3,0] } },
    { id: "tumbao", en: "Conga tumbao", es: "Tumbao de conga", kit: "HC", bpm: 100, swing: 0.50, hand: 1,
      map: { kick: [3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0], ch: [0,0,3,0,0,0,3,0,0,0,3,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0],
             oh: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0], clap: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0] } },
    { id: "teental", en: "Tabla · teental (16 beats)", es: "Tabla · teental (16 tiempos)", kit: "TB", bpm: 60, swing: 0.50, hand: 1,
      map: { bell: [2,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0], oh: [0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0], kick: [0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0] },
      parts: [{ len: 16, map: { bell: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], oh: [0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0],
        snare: [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0], kick: [0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0] } }] }
  );
  /* AOG-DRUM-MORE-V1: a groove or two for each new kit, in its kind's group of the beat menus (grp); each brings its kit
     (hand:1) and plays nothing until Play is pressed */
  STARTERS.push(
    /* a concert march: bass drum and crash cymbals together on 1 and 3, the snare's march figure, the timpani on the
       home note (B) and the fifth (F sharp) */
    { id: "orchmarch", en: "Orchestra march", es: "Marcha de orquesta", kit: "OR", bpm: 112, swing: 0.50, hand: 1, grp: "orch",
      map: { kick: [2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], clap: [2,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], snare: [1,0,3,3,1,0,1,0,1,0,3,3,1,0,1,3],
             rim: [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0], tom: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0], ch: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0] } },
    /* a big finish: the low timpani rolls louder and louder, then everything lands together with the gong */
    { id: "orchfinale", en: "Big finish with the gong", es: "Gran final con el gong", kit: "OR", bpm: 76, swing: 0.50, hand: 1, grp: "orch",
      map: { tom: [3,3,3,3,3,3,3,3,1,1,1,1,2,2,2,2], snare: [0,0,0,0,0,0,0,0,3,3,3,3,1,1,1,1], oh: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0] },
      parts: [{ len: 16, map: { kick: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], clap: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        rim: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], ch: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0] } }] },
    /* maqsum, the most played rhythm of Arabic music: doum tek - tek doum - tek -, the ka filling in between */
    { id: "maqsum", en: "Darbuka · maqsum", es: "Darbuka · maqsum", kit: "ME", bpm: 100, swing: 0.50, hand: 1, grp: "world",
      map: { kick: [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0], snare: [0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0], ch: [0,0,0,0,3,0,0,3,0,0,3,0,0,0,3,3],
             oh: [3,0,3,0,3,0,3,0,3,0,3,0,3,0,3,0], bell: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } },
    /* baladi, "of the country": doum doum - tek doum - tek -, the frame drum underneath */
    { id: "baladi", en: "Darbuka · baladi", es: "Darbuka · baladi", kit: "ME", bpm: 92, swing: 0.50, hand: 1, grp: "world",
      map: { kick: [2,0,1,0,0,0,0,0,2,0,0,0,0,0,0,0], snare: [0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0], ch: [0,0,0,0,3,3,0,0,0,0,3,3,0,0,3,0],
             tom: [3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0], oh: [0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0] } },
    /* a samba school's batucada: the second surdo on 1 and 3 answered by the first on 2 and 4, the caixa's sixteenths,
       the tamborim's teleco-teco, the ganzá and the agogô; the whistle calls the start of the second part */
    { id: "batucada", en: "Samba batucada", es: "Batucada de samba", kit: "SB", bpm: 104, swing: 0.54, hand: 1, grp: "world",
      map: { tom: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], kick: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], snare: [2,3,3,1,2,3,3,1,2,3,3,1,2,3,1,1],
             oh: [1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1], ch: [2,3,3,3,2,3,3,3,2,3,3,3,2,3,3,3], rim: [1,0,1,0,0,1,0,1,0,1,0,1,0,0,1,0] },
      parts: [{ len: 16, map: { bell: [2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0], tom: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], kick: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],
        clap: [0,0,0,0,0,0,0,0,2,0,1,1,0,1,0,1], snare: [2,3,3,1,2,3,3,1,2,3,3,1,2,3,1,1], ch: [2,3,3,3,2,3,3,3,2,3,3,3,2,3,3,3] } }] },
    /* samba-reggae, slower and heavier, as the bloco drummers of Salvador play it */
    { id: "sambareggae", en: "Samba-reggae", es: "Samba-reggae", kit: "SB", bpm: 92, swing: 0.50, hand: 1, grp: "world",
      map: { kick: [2,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0], tom: [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1], clap: [0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0],
             snare: [1,0,0,3,1,0,0,3,1,0,0,3,1,0,3,3], ch: [1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3] } },
    /* body percussion: stomp, stomp, clap, the stadium beat everyone knows how to join */
    { id: "bodystomp", en: "Stomp, stomp, clap", es: "Pisotón, pisotón, palmada", kit: "BP", bpm: 80, swing: 0.50, hand: 1, grp: "hand",
      map: { kick: [2,0,1,0,0,0,0,0,2,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0] } },
    /* a body percussion circle: snaps keep time, the chest and tummy answer, a clap on 2 and 4 */
    { id: "bodycircle", en: "Body percussion circle", es: "Círculo de percusión corporal", kit: "BP", bpm: 96, swing: 0.50, hand: 1, grp: "hand",
      map: { kick: [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0], snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], ch: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
             clap: [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0], tom: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], bell: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0] } },
    /* gospel: a fast praise break (sixteenth hats, the tambourine, claps with the backbeat) and a slow Sunday shuffle */
    { id: "praisebreak", en: "Gospel praise break", es: "Góspel · praise break", kit: "GS", bpm: 136, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,0,1,0,0,1,0,2,0,0,1,0,0,1,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,3], ch: [1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3],
             clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], rim: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] } },
    { id: "sundayshuffle", en: "Sunday shuffle", es: "Shuffle del domingo", kit: "GS", bpm: 76, swing: 0.67, hand: 1, grp: "drums",
      map: { kick: [2,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,3,0,0,0,0,2,0,0,3], ch: [1,0,3,0,1,0,3,0,1,0,3,0,1,0,3,0],
             clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], rim: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0] } },
    /* Motown: the snare and tambourine on every beat, and a beat for the foot on the stomp board */
    { id: "motownsnare", en: "Motown · snare on every beat", es: "Motown · caja en cada tiempo", kit: "MT", bpm: 120, swing: 0.50, hand: 1, grp: "drums",
      map: { snare: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0], kick: [2,0,0,0,0,0,1,0,2,0,0,0,0,0,1,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
             bell: [0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0] } },
    { id: "stompboard", en: "Stomp board soul", es: "Soul con pisotones", kit: "MT", bpm: 116, swing: 0.50, hand: 1, grp: "drums",
      map: { rim: [2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
             kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] } },
    /* disco: four on the floor, the half-open hat on every "and", claps with the backbeat; then a tom fill */
    { id: "discofloor", en: "Disco, four on the floor", es: "Disco, cuatro en el piso", kit: "DS", bpm: 120, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
             oh: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], ch: [1,3,0,3,1,3,0,3,1,3,0,3,1,3,0,3] } },
    { id: "discofill", en: "Disco with a tom fill", es: "Disco con redoble de toms", kit: "DS", bpm: 118, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], oh: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
             rim: [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0], bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
      parts: [{ len: 16, map: { kick: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0], oh: [0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0],
        tom: [0,0,0,0,0,0,0,0,2,0,1,0,2,1,1,2], clap: [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0] } }] },
    /* punk: the fast "and" snare over a kick on the beat; and a garage beat with the hats open and washing */
    { id: "punkfast", en: "Fast punk", es: "Punk rápido", kit: "PK", bpm: 190, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0], snare: [0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
             bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } },
    { id: "garagerock", en: "Garage rock", es: "Rock de garaje", kit: "PK", bpm: 140, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,0,0,0,0,1,0,2,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], oh: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
             clap: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } },
    /* the 1980s: the big gated snare and claps; then a fill round the big toms and the synth tom */
    { id: "gated80s", en: "1980s pop backbeat", es: "Pop de los 80", kit: "PO", bpm: 112, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,0,0,0,0,0,1,2,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
             ch: [1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3] } },
    { id: "toms80s", en: "1980s pop with a big tom fill", es: "Pop de los 80 con redoble grande", kit: "PO", bpm: 108, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,0,0,0,0,0,1,2,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3], bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
      parts: [{ len: 16, map: { kick: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0], ch: [1,3,1,3,1,3,1,3,0,0,0,0,0,0,0,0],
        tom: [0,0,0,0,0,0,0,0,2,0,1,0,2,0,1,0], rim: [0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1] } }] },
    /* drum and bass: a jungle break in two bars (ghost notes between), and a two-step roller */
    { id: "junglebreak", en: "Jungle break", es: "Break de jungle", kit: "JG", bpm: 168, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], clap: [0,0,0,0,0,0,0,3,0,3,0,0,0,0,0,3],
             ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] },
      parts: [{ len: 16, map: { kick: [2,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,0,0,2,0], clap: [0,0,0,0,0,0,0,3,0,3,0,0,3,0,0,0],
        ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0], oh: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0] } }] },
    { id: "dnbroller", en: "Drum and bass roller", es: "Drum and bass que rueda", kit: "JG", bpm: 174, swing: 0.50, hand: 1, grp: "drums",
      map: { kick: [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,3,1,3,1,3,1,3,1,3,1,3,1,3,1,3],
             rim: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], clap: [0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,3] } },
    /* reggaeton: the dembow (boom, ch-boom, chick), then the same with timbales */
    { id: "dembowrg", en: "Reggaeton dembow", es: "Dembow de reguetón", kit: "RG", bpm: 92, swing: 0.50, hand: 1, grp: "electronic",
      map: { kick: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0], snare: [0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
             bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } },
    { id: "perreo", en: "Dembow with timbales", es: "Dembow con timbales", kit: "RG", bpm: 96, swing: 0.50, hand: 1, grp: "electronic",
      map: { kick: [2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0], rim: [0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0], clap: [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
             tom: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] } },
    /* trap: half-time, the 808 under the kick, hats that roll; then a bounce with snaps */
    { id: "trap808", en: "Trap with hat rolls", es: "Trap con redobles de charles", kit: "TR", bpm: 140, swing: 0.50, hand: 1, grp: "electronic",
      map: { kick: [2,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0], bell: [2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
             clap: [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], ch: [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,1] } },
    { id: "trapbounce", en: "Trap bounce with snaps", es: "Trap con chasquidos", kit: "TR", bpm: 150, swing: 0.50, hand: 1, grp: "electronic",
      map: { kick: [2,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0], bell: [2,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0], snare: [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0],
             tom: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], ch: [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1], oh: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } },
    /* AOG-DRUM-CRUNCH-V1 · thrash, tight: the thrash beat (kick on the beat, snare on every "and", the ride on eighths),
       the gallop (one eighth and two sixteenths on the kick), and a half-time breakdown on a double kick with a fill */
    { id: "thrashbeat", en: "Thrash beat", es: "Ritmo de thrash", kit: "TH", bpm: 176, swing: 0.50, hand: 1, grp: "metal",
      map: { kick: [2,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0], snare: [0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0], rim: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
             bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } },
    { id: "thrashgallop", en: "Gallop on the double kick", es: "Galope con doble bombo", kit: "TH", bpm: 150, swing: 0.50, hand: 1, grp: "metal",
      map: { kick: [2,0,1,1,2,0,1,1,2,0,1,1,2,0,1,1], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
             bell: [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] } },
    { id: "thrashbreak", en: "Half-time breakdown with a fill", es: "Breakdown a medio tiempo con redoble", kit: "TH", bpm: 130, swing: 0.50, hand: 1, grp: "metal",
      map: { kick: [2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1], snare: [0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0], clap: [2,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] },
      parts: [{ len: 16, map: { kick: [2,1,1,1,2,1,1,1,2,0,0,0,2,0,0,0], snare: [0,0,0,0,0,0,0,0,2,0,0,0,2,0,1,1], clap: [2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        tom: [0,0,0,0,0,0,0,0,0,0,2,1,0,0,0,0] } }] },
    /* the crunchy beat machine: boom bap with a swing, a head-nod with the cross-stick, and a loose, late groove in two bars */
    { id: "crunchboombap", en: "Crunchy boom bap", es: "Boom bap crujiente", kit: "BM", bpm: 90, swing: 0.58, hand: 1, grp: "hiphop",
      map: { kick: [2,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0], ch: [1,0,3,0,1,0,3,0,1,0,3,0,1,0,3,0],
             bell: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0] } },
    { id: "crunchnod", en: "Head-nod with the cross-stick", es: "Para mover la cabeza, con aro cruzado", kit: "BM", bpm: 84, swing: 0.62, hand: 1, grp: "hiphop",
      map: { kick: [2,0,0,1,0,0,0,0,2,0,1,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,3], ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0],
             oh: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0], rim: [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0] } },
    { id: "crunchloose", en: "Loose and late, in two bars", es: "Suelto y atrasado, en dos compases", kit: "BM", bpm: 76, swing: 0.66, hand: 1, grp: "hiphop",
      map: { kick: [2,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0], clap: [0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0],
             ch: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0] },
      parts: [{ len: 16, map: { kick: [2,0,0,0,0,0,1,0,0,1,0,1,0,0,0,0], snare: [0,0,0,0,2,0,0,0,0,0,0,0,0,2,0,0], clap: [0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0],
        ch: [1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0], tom: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1] } }] }
  );
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
    credit:  { en: "The recorded kits are real drums and percussion, free for everyone (CC0), from Karoryfer Samples, Versilian Studios and Jeff Learman. Kit L is a real 909 drum machine, recorded by Janne G:son Berg (CC BY 4.0). Kits A and B play a real 1978 drum machine (CC0). The hand percussion, hand drums and tabla are real too (CC0): Versilian Studios, Karoryfer Samples, FreePats and dio_333. A few strokes are shaped here from the same drum. The gospel, punk, 1980s pop and thrash kits use MuldjordKit by Lars Muldjord (CC BY 4.0); the body percussion is from sfzinstruments (CC0); reggaeton and trap use Sonic Pi's samples (CC0).",
               es: "Los kits grabados son batería y percusión de verdad, libres para todos (CC0), de Karoryfer Samples, Versilian Studios y Jeff Learman. El kit L es una caja de ritmos 909 de verdad, grabada por Janne G:son Berg (CC BY 4.0). Los kits A y B tocan una caja de ritmos de verdad de 1978 (CC0). La percusión de mano, los tambores de mano y la tabla también son de verdad (CC0): Versilian Studios, Karoryfer Samples, FreePats y dio_333. Algunos golpes se hacen aquí a partir del mismo tambor. Los kits de góspel, punk, pop de los 80 y thrash usan MuldjordKit de Lars Muldjord (CC BY 4.0); la percusión corporal es de sfzinstruments (CC0); el reguetón y el trap usan las muestras de Sonic Pi (CC0)." },
    handGroup: { en: "Hand drums and percussion", es: "Tambores de mano y percusión" },
    credits: { en: "Full credits", es: "Créditos completos" }
  };
  function w(k, lang) { var o = WORDS[k]; return o ? (lang === "es" ? o.es : o.en) : k; }

  function has(b) { return Object.prototype.hasOwnProperty.call(KITS, b); }
  function machine(b) { return !!(has(b) && KITS[b].machine); }   /* AOG-DRUM-909-V1: a drum machine, recorded */
  function label(b) { var k = KITS[b]; return k ? [k.en, k.es] : ["", ""]; }
  /* AOG-DRUM-PERC-V1: the pad's own words in plain English or Spanish ("" when it has none: the page uses its own) */
  function padWord(b, id, lang) { var k = KITS[b], p = k && k.pads[id]; return p && p.en ? (lang === "es" ? p.es : p.en) : ""; }
  function drumOf(b, id) { var k = KITS[b], p = k && k.pads[id]; return (p && p.drum) || ""; }
  function look(b, id) { var k = KITS[b], p = k && k.pads[id]; return (p && p.look) || ""; }
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
  var ORDER = [];     /* banks asked for, the latest last: three stay ready, so a phone keeps its memory */
  /* AOG-DRUM-KEEP3-V1 (2026-10-11) — the Drum Machine's bank A plays three kits at once (pads 1–8, 9–16, 17–24). With two
     kept, the third one to get ready let the first go, and pads 1–8 fell silent. */
  var KEEP = 3;
  var STORES = null;  /* the page's kit stores, ROMK and HIK, and its twelve-bit rounding */

  function decodeWith(dec, ab) {
    return new Promise(function (ok, no) { var r = dec.decodeAudioData(ab, ok, no); if (r && r.then) r.then(ok, no); });
  }
  function onsetAt(d, sr, d2) {       /* the hit, 2 ms early: whatever silence the decoder added in front is dropped */
    var pk = 0, i, a;                 /* AOG-DRUM-STEREO-V1: a stereo hit starts where either side starts */
    for (i = 0; i < d.length; i++) { a = d[i] < 0 ? -d[i] : d[i]; if (a > pk) pk = a; }
    if (d2) for (i = 0; i < d2.length; i++) { a = d2[i] < 0 ? -d2[i] : d2[i]; if (a > pk) pk = a; }
    var thr = pk * 0.01; i = 0;
    while (i < d.length && Math.abs(d[i]) < thr && !(d2 && Math.abs(d2[i]) >= thr)) i++;
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
  /* AOG-DRUM-QUICK-V2 (2026-10-05) — Jimmy: "There is such a delay when I am trying to add my own beats. I picked a drum kit
     … my goodness it was delayed a lot." opts.hiOnly (the Beat Lab and the Drum Kit play only the 44.1 kHz recordings):
     the 1987 copy at 26,040 Hz is not decoded or cut. And a kit's pads are made ready one at a time, letting the page
     breathe in between, so a tap or a playing loop never waits behind a kit that is getting ready. */
  function load(b, rom, hi, q12, make, opts) {
    var hiOnly = !!(opts && opts.hiOnly);
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
    var decHi = new OC(1, 1, HI), decLo = hiOnly ? null : new OC(1, 1, LO);
    var got = {}, n = 0, bad = 0, idx = 0;
    setState(b, { state: "loading", got: 0, total: jobs.length });
    function worker() {
      if (idx >= jobs.length) return Promise.resolve();
      var jb = jobs[idx++];
      return fetch(BASE + kit.dir + "/" + jb.name + ".mp3?v=" + VER)
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(function (ab) { return hiOnly ? decodeWith(decHi, ab).then(function (x) { return [x, null]; }) : Promise.all([decodeWith(decHi, ab.slice(0)), decodeWith(decLo, ab)]); })
        .then(function (two) {
          var o = { h: two[0].getChannelData(0), l: two[1] ? two[1].getChannelData(0) : null };
          /* AOG-DRUM-STEREO-V1: a stereo recording keeps its right side too */
          if (two[0].numberOfChannels > 1) o.h2 = two[0].getChannelData(1);
          if (two[1] && two[1].numberOfChannels > 1) o.l2 = two[1].getChannelData(1);
          got[jb.id + "/" + jb.lay + "/" + jb.j] = o;
        })
        .catch(function () { bad++; })
        .then(function () { n++; if (STATE[b]) STATE[b].got = n; return worker(); });
    }
    var job = Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]).then(function () {
      if (bad) { forget(b); setState(b, { state: "failed", got: n - bad, total: jobs.length }); return; }
      /* AOG-DRUM-REAL-V2: the pads the page draws itself, before the kit counts as ready */
      var mine = Object.keys(kit.pads).filter(function (id) { return kit.pads[id].made; });
      return Promise.all(mine.map(function (id) {
        return Promise.resolve(make ? make(id) : null).catch(function () { return null; }).then(function (o) { return [id, o]; });
      })).then(function (drawn) { return ready(drawn); });
    });
    function ready(drawn) {
      var data = {}, r = rom[b] || (rom[b] = {}), h = hi[b] || (hi[b] = {});
      drawn.forEach(function (d) { data[d[0]] = { made: true }; if (d[1] && d[1].lo && d[1].hi) { r[d[0]] = d[1].lo; h[d[0]] = d[1].hi; } });
      var ids = Object.keys(kit.pads).filter(function (id) { return !kit.pads[id].made; });
      var breathe = function () { return new Promise(function (ok) { setTimeout(ok, 0); }); };
      var one = function (id) {
        var f = files(b, id), first = got[id + "/m/0"];
        var len = first.h.length / HI - onsetAt(first.h, HI, first.h2);          /* every take of a pad is as long as its first normal one */
        data[id] = {};
        LAYERS.forEach(function (lay) {
          data[id][lay] = f[lay].map(function (name, j) {
            var g = got[id + "/" + lay + "/" + j], t = onsetAt(g.h, HI, g.h2);
            var tk = { hi: slice(g.h, HI, t, len), lo: g.l ? q12(slice(g.l, LO, t, len)) : null };
            if (g.h2) { tk.hi2 = slice(g.h2, HI, t, len); tk.lo2 = g.l2 ? q12(slice(g.l2, LO, t, len)) : null; }   /* AOG-DRUM-STEREO-V1 */
            return tk;
          });
        });
        r[id] = data[id].m[0].lo; h[id] = data[id].m[0].hi;
      };
      return ids.reduce(function (p, id) { return p.then(function () { one(id); return breathe(); }); }, Promise.resolve()).then(function () {
        DATA[b] = data;
        setState(b, { state: "ready", got: n, total: jobs.length });
        var keep = ORDER.slice(-KEEP);                 /* the three kits asked for last stay; an older one is let go */
        Object.keys(DATA).forEach(function (k) { if (k !== b && keep.indexOf(k) < 0) forget(k); });
      });
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
        var m = { type: "kit", id: v, rate: LO, samples: lo.buffer, hi: hi.buffer, hiRate: HI }, move = [lo.buffer, hi.buffer];
        if (tk.hi2 && tk.lo2) {           /* AOG-DRUM-STEREO-V1: the right side, cut (and turned round) the same way */
          var lo2 = cut(tk.lo2), hi2 = cut(tk.hi2);
          m.samples2 = lo2.buffer; m.hi2 = hi2.buffer; move.push(lo2.buffer, hi2.buffer);
        }
        port.postMessage(m, move);
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
  /* AOG-DRUM-QUICK-V1 (2026-10-05) — Jimmy: "When the drum kits are playing in the beat pad, when I hit the pads they are
     delayed." Every hit made a new buffer and copied its recording into it (a cymbal is ~half a million samples), on the
     same thread that hears the tap. Each recording is now made into a buffer once per sound engine and reused: a source
     may share a buffer, and the same hit sounds the same. */
  var BUFS = typeof WeakMap !== "undefined" ? new WeakMap() : null;
  function bufFor(ac, tk) {
    var m = BUFS ? BUFS.get(ac) : null;
    if (BUFS && !m) { m = new WeakMap(); BUFS.set(ac, m); }
    var buf = m ? m.get(tk) : null; if (buf) return buf;
    buf = ac.createBuffer(tk.hi2 ? 2 : 1, tk.hi.length, HI); buf.getChannelData(0).set(tk.hi);
    if (tk.hi2) buf.getChannelData(1).set(tk.hi2);                   /* AOG-DRUM-STEREO-V1 */
    if (m) m.set(tk, buf);
    return buf;
  }
  function playDirect(ac, dest, b, id, t0, accent, level) {
    var d = DATA[b] && DATA[b][id]; if (!d || d.made || !ac || !dest) return;
    var k = pick(b, id, accent), tk = d[k.lay] && d[k.lay][k.j]; if (!tk) return;
    try {
      var buf = bufFor(ac, tk);
      var s = ac.createBufferSource(), g = ac.createGain();
      s.buffer = buf; g.gain.value = Math.max(0, Math.min(1, level == null ? 0.46 : level));
      s.connect(g); g.connect(dest); s.start(Math.max(t0 || 0, ac.currentTime));
      return { src: s, gain: g };                     /* AOG-KIT-PAGE-V1: the Drum Kit stops a ringing open hat with it */
    } catch (e) {}
    return null;
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
      if (has(b) && !machine(b)) el.setAttribute("data-aog-group", KITS[b].hand ? w("handGroup", LANG) : g);   /* AOG-DRUM-PERC-V1 */
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
    ids: IDS.slice(), starters: STARTERS, parts: parts, unparts: unparts, has: has, machine: machine, made: made, label: label, padNames: padNames, files: files,
    load: load, post: post, route: route, playDirect: playDirect, state: function (b) { return STATE[b] || null; },
    ready: function (b) { return !!DATA[b]; },
    /* AOG-DRUM-PERC-V1: a pad's own words, the drum it belongs to, how the Drum Kit draws it, and the hand-drum kits */
    padWord: padWord, drumOf: drumOf, look: look, hand: function (b) { return !!(has(b) && KITS[b].hand); },
    /* AOG-DRUM-MORE-V1: the kit menus' groups, in order, and each kit's group; the new grooves' beat-menu groups */
    groups: GROUPS, group: group, beatGroups: BEAT_GROUPS,
    takes: function (b, id) { var p = has(b) && KITS[b].pads[id]; return p ? p.n.slice() : [0, 0, 0]; },   /* the takes of each strength: soft, normal, hard */
    lineHtml: lineHtml, decorate: decorate, creditHtml: creditHtml, words: WORDS
  };
})(window);
