
/* =========================================================================
   PRINT · COPY LINK · QR  ·  THE HANDOFF LAYER          built 2026-08-29

   Jimmy's brief: "The Exit Slip data should not be trapped inside
   Architecture of Grace." Then, an hour later: "should work for all the
   reflections or IEP data that is graphed, etc."

   So this is NOT an exit-slip feature. It is ONE mechanism that any screen
   holding data can hand a snapshot to, and it does exactly three things:

       PRINT      a clean 8.5 x 11 record
       COPY LINK  a direct link to that same record
       QR CODE    the same link again, for paper

   There is NO EMAIL and there must never be one. The platform's job ends at
   making the record portable; the school's own approved channel carries it.

   ---------------------------------------------------------------- THE RULES

   1 · THE PRINTED PAGE AND THE SHARED PAGE ARE THE SAME DOCUMENT.
       docHtml() is called once by the print path and once by the viewer.
       A record that reads differently on paper than on a phone is two
       records, and the second one is the one nobody proof-read.

   2 · A SCREEN NEVER HANDS OVER ITS HTML. It hands over a PACKET — a plain
       data object in the schema below. The viewer draws it. This is the
       whole security boundary: a link carries DATA, never markup, so a
       forged link cannot execute anything. sanitize() runs on every packet
       that arrives from a link, before a single character reaches the page,
       and it COERCES rather than trusts: numbers through +x, strings
       through esc(), block types through a whitelist, everything capped.

   3 · THE DATA TRAVELS INSIDE THE LINK, IN THE FRAGMENT.
       Everything after "#" is never sent to any server — not to Netlify,
       not to Google, not to Architecture of Grace. Which means the shared
       record touches no server logs, cannot be crawled or indexed, needs no
       account, and opens with no internet. It also means the link IS the
       data, and the honest consequences of that are written on the screen
       where a teacher will read them before they press Copy.

   4 · NO NAME EVER ENTERS A LINK. A packet carries the opaque student code
       and nothing else. The code-to-name list is the teacher's paper and is
       still the only place the two connect. See [[aog-student-links]].

   5 · ⚠ THERE IS NO REVOKE, AND THE SCREEN SAYS SO.
       §8 of the handoff asks for one. It cannot be built honestly without a
       server, and this product deliberately has none: no accounts, no AoG
       backend, the school owns its own Sheet. A Revoke button that only
       wrote to the teacher's own device would do NOTHING to a link already
       sent, and would be a lie printed on a safety control.

       What ships instead is real: an END DATE, sealed INSIDE the encrypted
       payload where it cannot be edited, after which this page refuses to
       render the record. Plus a record on the teacher's device of what was
       shared and when it lapses. The share sheet says, in as many words,
       that a link can be given an end date but cannot be recalled — the
       same as the paper copy it replaces.

   6 · THE SEAL IS AES-GCM, AND IT IS NOT A PASSWORD.
       The key rides in the same fragment, so anyone holding the whole link
       can read the record. What the seal genuinely buys is (a) the URL text
       itself is meaningless to anything that logs or photographs it, and
       (b) TAMPER EVIDENCE — nobody can edit the numbers in a shared
       educational record before forwarding it, and nobody can move the end
       date. Never describe it to a school as access control.
       Same discipline as the dashboard soft gate: say what it is.

   ---------------------------------------------------------------- THE LINK

       https://<host>/shared#s=<ver>.<key>.<data>

       ver   a1  AES-GCM sealed, deflate-raw compressed   (the normal case)
             a0  AES-GCM sealed, uncompressed
             p1  plain, compressed      (no crypto.subtle — file:// or http)
             p0  plain, uncompressed
       key   base64url of the 32-byte AES key, or empty for p*
       data  base64url of iv(12) || ciphertext, or of the payload for p*

   ⚠ NEVER put the payload in the query string. A "?" is sent to the server
     on every request, which would put a child's record into Netlify's logs
     and into every referrer header the page ever emits.

   ------------------------------------------------------------ THE SCHEMA

   packet = {
     v:1,
     k   kind key      "exit" | "iep" | "checkin" | "reflection"
     t   title         "Exit slips"
     s   subject       "A104"        the CODE. never a name.
     c   context       "Period 3"
     r   range         "Sep 1 - Sep 30"
     o   school        "Northside Junior High"
     g   generated     ISO datetime
     x   expires       "2026-09-28" or ""
     b   [ blocks ]
   }

   block kinds, all optional-field tolerant:
     {y:"note",  h, p}                        a stated caveat
     {y:"kv",    h, i:[[label,value],...]}    the four-tile grid
     {y:"bars",  h, d, i:[[label,count],...], n}
     {y:"rows",  h, i:[[when,gist,detail],...]}
     {y:"grid",  h, cls:[], days:[], c:[[ci,di,fav,hard]], key, p}
     {y:"words", h, i:[[day,word],...], p}
     {y:"chart", ...}                         see chartSvg()
     {y:"table", h, cols:[], rows:[[]], p}
     {y:"prov",  h, i:[[label,value],...], p} the signature block

   ⚠ EVERY BAR IS THE SAME COLOR AND NOTHING IS RANKED. The exit slip's
     §12 does not stop applying because the reader is a parent. If you ever
     find yourself wanting to paint "difficult" amber on this page, read
     [[aog-exit-slip]] first and then do not.
   ========================================================================= */
(function () {
  "use strict";

  var VER = 1;
  var HASH_KEY = "s";
  var SHARE_PATH = "/shared";
  var LOG_KEY = "aog.handoff.shared.v1";   /* what was shared, on this device */
  var MAX_BLOCKS = 60, MAX_ITEMS = 400, MAX_STR = 4000, MAX_SER = 8, MAX_PTS = 400;

  function isEs() {
    try { return (document.documentElement.getAttribute("lang") || "en").slice(0, 2) === "es"; }
    catch (e) { return false; }
  }
  function T(en, es) { return isEs() ? es : en; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function str(s, cap) { s = String(s == null ? "" : s); return s.slice(0, cap || MAX_STR); }
  function num(v, dflt) { v = +v; return isFinite(v) ? v : (dflt || 0); }
  function arr(a, cap) { return Array.isArray(a) ? a.slice(0, cap || MAX_ITEMS) : []; }
  function el(id) { return document.getElementById(id); }
  function todayISO() {
    var d = new Date(), m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function plusDaysISO(n) {
    var d = new Date(); d.setDate(d.getDate() + n);
    var m = d.getMonth() + 1, da = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (da < 10 ? "0" + da : da);
  }
  function prettyISO(iso) {
    var p = String(iso || "").slice(0, 10).split("-");
    if (p.length !== 3) return "";
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    if (isNaN(d.getTime())) return "";
    try { return d.toLocaleDateString(isEs() ? "es" : "en", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return iso; }
  }
  function isDark() {
    try {
      var r = document.documentElement.getAttribute("data-theme");
      if (r === "dark") return true;
      if (r === "light") return false;
      return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch (e) { return false; }
  }
  /* Whatever this device calls its school, if it has said. Filled in ONE
     place rather than by four packet builders, and never invented — a blank
     line is better than a guess on a page that leaves the building. */
  function defaultOrg() {
    try {
      var o = (window.AOGOrg && window.AOGOrg.get) ? String(window.AOGOrg.get() || "").trim() : "";
      return o.slice(0, 120);
    } catch (e) { return ""; }
  }

  /* ---------------------------------------------------------------- base64url
     Standard base64 carries "+" and "/", both of which a URL, a text message
     and a QR encoder each treat differently. base64url carries neither, and
     the padding is dropped because "=" is the one character an email client
     is most likely to line-break. */
  function b64u(bytes) {
    var s = "", i, CH = 0x8000;
    for (i = 0; i < bytes.length; i += CH) {
      s += String.fromCharCode.apply(null, bytes.subarray ? bytes.subarray(i, i + CH) : bytes.slice(i, i + CH));
    }
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function unb64u(s) {
    s = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function utf8(s) { return new TextEncoder().encode(s); }
  function unutf8(b) { return new TextDecoder().decode(b); }

  /* ------------------------------------------------------------- compression
     deflate-raw through the platform's own CompressionStream. A record is
     mostly repeated option labels and class names, which is the best case
     for it — a month of one student's slips comes down by roughly four
     fifths, and that is the difference between a QR code that scans off a
     printed page and one that does not. Absent (older Safari, some managed
     browsers) it simply is not used and the link is longer; the ver flag
     says which happened, so a link made on one device always opens on
     another. */
  function canZip() {
    try { return typeof CompressionStream === "function" && typeof DecompressionStream === "function"; }
    catch (e) { return false; }
  }
  function zip(bytes) {
    if (!canZip()) return Promise.resolve(null);
    try {
      var cs = new CompressionStream("deflate-raw");
      var w = cs.writable.getWriter();
      w.write(bytes); w.close();
      return new Response(cs.readable).arrayBuffer().then(function (b) { return new Uint8Array(b); })
        .catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  function unzip(bytes) {
    try {
      var ds = new DecompressionStream("deflate-raw");
      var w = ds.writable.getWriter();
      w.write(bytes); w.close();
      return new Response(ds.readable).arrayBuffer().then(function (b) { return new Uint8Array(b); });
    } catch (e) { return Promise.reject(e); }
  }

  /* ------------------------------------------------------------------- seal
     ⚠ READ THE HEADER. This is tamper-evidence and opacity, NOT a password:
     the key is in the same link. It is here so that a URL sitting in a text
     message, a print queue or a photographed QR code says nothing on its
     own, and so that the numbers in a shared educational record — and its
     end date — cannot be edited on the way to the next person. */
  function subtle() {
    try { return (window.crypto && window.crypto.subtle) ? window.crypto.subtle : null; } catch (e) { return null; }
  }
  function seal(json) {
    var raw = utf8(json);
    return zip(raw).then(function (z) {
      var body = z && z.length < raw.length ? z : raw;
      var zf = (z && z.length < raw.length) ? "1" : "0";
      var S = subtle();
      if (!S) return Promise.resolve("p" + zf + "." + "." + b64u(body));
      var iv = window.crypto.getRandomValues(new Uint8Array(12));
      return S.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
        .then(function (key) {
          return S.encrypt({ name: "AES-GCM", iv: iv }, key, body).then(function (ct) {
            return S.exportKey("raw", key).then(function (rk) {
              var ctb = new Uint8Array(ct), all = new Uint8Array(12 + ctb.length);
              all.set(iv, 0); all.set(ctb, 12);
              return "a" + zf + "." + b64u(new Uint8Array(rk)) + "." + b64u(all);
            });
          });
        })
        .catch(function () { return "p" + zf + "." + "." + b64u(body); });
    });
  }
  function unseal(token) {
    var p = String(token || "").split(".");
    if (p.length !== 3) return Promise.reject(new Error("shape"));
    var ver = p[0], keyS = p[1], dataS = p[2];
    if (!/^[ap][01]$/.test(ver)) return Promise.reject(new Error("ver"));
    var data;
    try { data = unb64u(dataS); } catch (e) { return Promise.reject(new Error("b64")); }
    var step;
    if (ver.charAt(0) === "a") {
      var S = subtle();
      if (!S) return Promise.reject(new Error("nocrypto"));
      var iv = data.subarray(0, 12), ct = data.subarray(12);
      step = S.importKey("raw", unb64u(keyS), { name: "AES-GCM" }, false, ["decrypt"])
        .then(function (k) { return S.decrypt({ name: "AES-GCM", iv: iv }, k, ct); })
        .then(function (b) { return new Uint8Array(b); });
    } else {
      step = Promise.resolve(data);
    }
    return step.then(function (body) {
      return ver.charAt(1) === "1" ? unzip(body) : body;
    }).then(function (body) {
      return JSON.parse(unutf8(body));
    });
  }

  /* ================================================================= SANITISE
     ⚠ THIS IS THE SECURITY BOUNDARY AND IT IS THE ONLY ONE.

     Everything below it treats the packet as trustworthy, so everything
     above it must make that true. The rule is COERCE, NEVER TRUST: a field
     that should be a number goes through +x, a field that should be a
     string is truncated and escaped at render, a block type that is not in
     the whitelist is dropped whole, and every list is capped so a hostile
     link cannot hang the browser by asking for two million rows.

     Nothing here ever produces markup. There is no innerHTML path from a
     link to the page that does not pass through esc(). If you add a block
     kind, add its sanitizer IN THE SAME EDIT. */
  var BLOCKS = { note: 1, kv: 1, bars: 1, rows: 1, grid: 1, words: 1, chart: 1, table: 1, prov: 1 };
  var KINDS  = { exit: 1, iep: 1, checkin: 1, reflection: 1, other: 1 };
  var HEX = /^#[0-9a-fA-F]{3,8}$/;

  function col(c, dflt) { c = String(c || ""); return HEX.test(c) ? c : dflt; }
  function pair(a) { return [str(a && a[0], 200), str(a && a[1], 400)]; }

  function sanitize(p) {
    p = (p && typeof p === "object") ? p : {};
    var out = {
      v: 1,
      k: KINDS[String(p.k)] ? String(p.k) : "other",
      t: str(p.t, 160),
      s: str(p.s, 60),
      c: str(p.c, 200),
      r: str(p.r, 160),
      o: str(p.o, 160),
      g: str(p.g, 40),
      x: /^\d{4}-\d{2}-\d{2}$/.test(String(p.x || "")) ? String(p.x) : "",
      b: []
    };
    arr(p.b, MAX_BLOCKS).forEach(function (b) {
      if (!b || typeof b !== "object" || !BLOCKS[String(b.y)]) return;
      var y = String(b.y), o = { y: y, h: str(b.h, 200) };
      /* pb survives sanitizing for every block type: it is display-only —
         "start a printed page here" — and coerced to a bare 1, so a packet
         arriving off a link can place page breaks and nothing else with it. */
      if (b.pb) o.pb = 1;
      if (y === "note") { o.p = str(b.p, MAX_STR); out.b.push(o); return; }
      if (y === "kv" || y === "prov") {
        o.i = arr(b.i, 40).map(pair);
        o.p = str(b.p, MAX_STR);
        out.b.push(o); return;
      }
      if (y === "bars") {
        o.d = str(b.d, 300);
        o.n = Math.max(0, Math.min(100000, Math.round(num(b.n, 0))));
        o.i = arr(b.i, 60).map(function (x) {
          return [str(x && x[0], 200), Math.max(0, Math.min(100000, Math.round(num(x && x[1], 0))))];
        });
        out.b.push(o); return;
      }
      if (y === "rows") {
        o.i = arr(b.i, MAX_ITEMS).map(function (x) {
          return [str(x && x[0], 80), str(x && x[1], 400), str(x && x[2], 1200)];
        });
        o.p = str(b.p, MAX_STR);
        out.b.push(o); return;
      }
      if (y === "words") {
        o.i = arr(b.i, 200).map(function (x) { return [str(x && x[0], 40), str(x && x[1], 80)]; });
        o.p = str(b.p, MAX_STR);
        out.b.push(o); return;
      }
      if (y === "grid") {
        o.cls = arr(b.cls, 40).map(function (x) { return str(x, 80); });
        o.days = arr(b.days, 60).map(function (x) { return str(x, 24); });
        o.c = arr(b.c, 2000).map(function (x) {
          return [Math.max(0, Math.round(num(x && x[0], 0))), Math.max(0, Math.round(num(x && x[1], 0))),
                  (x && x[2]) ? 1 : 0, (x && x[3]) ? 1 : 0];
        }).filter(function (x) { return x[0] < o.cls.length && x[1] < o.days.length; });
        o.key = str(b.key, 400); o.p = str(b.p, MAX_STR);
        out.b.push(o); return;
      }
      if (y === "table") {
        o.cols = arr(b.cols, 12).map(function (x) { return str(x, 80); });
        o.rows = arr(b.rows, MAX_ITEMS).map(function (r) {
          return arr(r, 12).map(function (x) { return str(x, 300); });
        });
        o.p = str(b.p, MAX_STR);
        out.b.push(o); return;
      }
      if (y === "chart") {
        o.ymin = num(b.ymin, 0); o.ymax = num(b.ymax, 100);
        if (!(o.ymax > o.ymin)) { o.ymin = 0; o.ymax = 100; }
        o.yt = arr(b.yt, 12).map(function (v) { return num(v, 0); });
        o.yu = str(b.yu, 24);
        o.xmin = num(b.xmin, 0); o.xmax = num(b.xmax, 1);
        if (!(o.xmax > o.xmin)) o.xmax = o.xmin + 1;
        o.xl = arr(b.xl, 12).map(function (x) {
          return [num(x && x[0], 0), str(x && x[1], 40),
                  ({ start: "start", middle: "middle", end: "end" })[String(x && x[2])] || "middle"];
        });
        o.ser = arr(b.ser, MAX_SER).map(function (s) {
          s = s || {};
          return {
            n: str(s.n, 60),
            c: col(s.c, "#0A1E33"),
            cd: col(s.cd, col(s.c, "#CFE0F2")),
            dash: /^[\d\s.]{0,20}$/.test(String(s.dash || "")) ? String(s.dash || "") : "",
            dot: s.dot ? 1 : 0,
            p: arr(s.p, MAX_PTS).map(function (q) { return [num(q && q[0], 0), num(q && q[1], 0)]; }),
            r: arr(s.r, MAX_PTS).map(function (q) { return [num(q && q[0], 0), num(q && q[1], 0), num(q && q[2], 0)]; }),
            lab: arr(s.lab, MAX_PTS).map(function (q) { return [num(q && q[0], 0), num(q && q[1], 0), str(q && q[2], 24)]; })
          };
        });
        o.key = str(b.key, 800); o.p = str(b.p, MAX_STR);
        out.b.push(o); return;
      }
    });
    return out;
  }

  /* ==================================================================== CHART
     ONE generic renderer, drawn from numbers only. The arithmetic behind
     every series still belongs to the screen that owns it — the IEP block
     computes its own aimline and its own scale through its own exported
     helpers, the check-in layer hands over its own buckets — and only the
     DRAWING lives here. Shared numbers, kept mechanics: the same split the
     exit slip and the check-in already made for their stages.

     ⚠ COLOR IS NEVER THE INFORMATION. Every series is also named at its
     own last point, and a dashed line stays dashed on paper, because a
     parent may be reading this in grayscale off a school photocopier. */
  function chartSvg(b, opts) {
    opts = opts || {};
    var dark = opts.print ? false : isDark();
    var W = 660, H = 268, ml = 46, mr = 74, mt = 16, mb = 34;
    var ink   = opts.print ? "#33404F" : "var(--ink-soft,#46506E)";
    var faint = opts.print ? "#5A6674" : "var(--ink-faint,#6C7686)";
    var grid  = opts.print ? "#D8DEE6" : "var(--rule,#E4DAC5)";
    var card  = opts.print ? "#FFFFFF" : "var(--card,#fff)";
    function X(v) { return ml + (W - ml - mr) * ((v - b.xmin) / (b.xmax - b.xmin)); }
    function Y(v) {
      v = Math.max(b.ymin, Math.min(b.ymax, v));
      return mt + (H - mt - mb) * (1 - (v - b.ymin) / (b.ymax - b.ymin));
    }
    function n1(v) { return (Math.round(v * 10) / 10); }
    var s = "";
    var endLabs = [];
    (b.yt.length ? b.yt : [b.ymin, b.ymax]).forEach(function (tk) {
      var y = Y(tk).toFixed(1);
      s += '<line x1="' + ml + '" y1="' + y + '" x2="' + (W - mr) + '" y2="' + y + '" stroke="' + grid + '" stroke-width="1"/>' +
           '<text x="' + (ml - 7) + '" y="' + (Y(tk) + 3.5).toFixed(1) + '" text-anchor="end" font-size="10.5" fill="' + faint + '">' +
             esc(n1(tk) + (b.yu === "%" ? "%" : "")) + "</text>";
    });
    if (b.yu && b.yu !== "%") {
      s += '<text x="' + ml + '" y="11" text-anchor="start" font-size="9.5" font-weight="700" fill="' + faint + '">' + esc(b.yu) + "</text>";
    }
    b.xl.forEach(function (x) {
      s += '<text x="' + X(x[0]).toFixed(1) + '" y="' + (H - mb + 17) + '" text-anchor="' + x[2] +
           '" font-size="10.5" fill="' + ink + '">' + esc(x[1]) + "</text>";
    });
    b.ser.forEach(function (se) {
      var c = (dark ? se.cd : se.c);
      /* the spread first, so a line is never drawn under its own whisker */
      se.r.forEach(function (q) {
        if (Math.abs(q[2] - q[1]) < 0.001) return;
        s += '<line class="hd-range" x1="' + X(q[0]).toFixed(1) + '" y1="' + Y(q[1]).toFixed(1) +
             '" x2="' + X(q[0]).toFixed(1) + '" y2="' + Y(q[2]).toFixed(1) +
             '" stroke="' + c + '" stroke-width="2" stroke-linecap="round" opacity=".55"/>';
      });
      if (se.p.length) {
        var d = se.p.map(function (q, i) { return (i ? "L" : "M") + X(q[0]).toFixed(1) + " " + Y(q[1]).toFixed(1); }).join(" ");
        s += '<path class="hd-line" d="' + d + '" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"' +
             (se.dash ? ' stroke-dasharray="' + esc(se.dash) + '"' : "") + "/>";
        if (se.dot) {
          se.p.forEach(function (q) {
            s += '<circle cx="' + X(q[0]).toFixed(1) + '" cy="' + Y(q[1]).toFixed(1) + '" r="3.6" fill="' + card +
                 '" stroke="' + c + '" stroke-width="2"/>';
          });
        }
        /* ⚠ THE SERIES IS NAMED AT ITS OWN END, not only in a key. A reader
           who cannot separate two hues still knows which line is which.
           Collected first and drawn after the loop — see the collision note
           there. */
        if (se.n) {
          var lastP = se.p[se.p.length - 1];
          endLabs.push({ x: X(lastP[0]) + 7, y: Y(lastP[1]) + 3.8, c: c, n: se.n });
        }
      }
      se.lab.forEach(function (q) {
        s += '<text x="' + X(q[0]).toFixed(1) + '" y="' + Y(q[1]).toFixed(1) + '" text-anchor="middle" font-size="9.5" font-weight="700" fill="' + c + '">' +
             esc(q[2]) + "</text>";
      });
    });
    /* ⚠ TWO LINES ENDING ON THE SAME VALUE NAMED THEMSELVES ON THE SAME
       PIXEL — "Connected" printed through "Arriving" and neither could be
       read (found on the /shared page 2026-08-29, on a chart with one
       week of data and two fives). The rule above survives: every series
       is still named at its own end, in its own color. Colliding names
       are only nudged apart — downward, top-most first, twelve pixels
       apart — and never moved off the x of their line's end. */
    endLabs.sort(function (a, bq) { return a.y - bq.y; });
    for (var li = 1; li < endLabs.length; li++) {
      if (endLabs[li].y - endLabs[li - 1].y < 12) endLabs[li].y = endLabs[li - 1].y + 12;
    }
    endLabs.forEach(function (q) {
      s += '<text x="' + q.x.toFixed(1) + '" y="' + q.y.toFixed(1) +
           '" font-size="11" font-weight="700" fill="' + q.c + '">' + esc(q.n) + "</text>";
    });
    return '<svg class="hd-chart" viewBox="0 0 ' + W + " " + H + '" width="100%" role="img" preserveAspectRatio="xMidYMid meet" ' +
           'aria-label="' + esc(b.h || T("Chart", "Gráfica")) + '">' + s + "</svg>";
  }

  /* ================================================================ THE PAGE
     One renderer. The print path calls it with {print:true} so the colors
     are pinned light — a chart drawn in dark-theme ink on white paper is
     the exact bug the IEP charts already learned. Everything else is
     identical, deliberately: the parent reading this on a phone and the
     copy in the file are the same document. */
  function docHtml(p, opts) {
    opts = opts || {};
    var h = '<div class="hd-doc' + (opts.print ? " hd-print" : "") + '">';
    h += '<header class="hd-mast">' +
           '<div class="hd-brand">Architecture of Grace</div>' +
           '<h1>' + esc(p.t || T("Record", "Registro")) + "</h1>" +
           '<div class="hd-sub">' +
             (p.s ? '<span class="hd-code">' + esc(p.s) + "</span>" : "") +
             (p.c ? '<span>' + esc(p.c) + "</span>" : "") +
             (p.r ? '<span>' + esc(p.r) + "</span>" : "") +
             (p.o ? '<span>' + esc(p.o) + "</span>" : "") +
           "</div>" +
         "</header>";
    /* b.pb: this block starts a fresh printed page. The wrapper carries
       .hd-pagebreak (styled only inside @media print) so the screen copy of
       the same document keeps flowing — one document, two paces. */
    p.b.forEach(function (b) {
      var bh = blockHtml(b, opts);
      h += b.pb ? '<div class="hd-pagebreak">' + bh + "</div>" : bh;
    });
    h += '<footer class="hd-foot">' +
           '<div>' + esc(T("Architecture of Grace · Understood Before Measured", "Architecture of Grace · Comprendido antes que medido")) + "</div>" +
           '<div>' + esc(T("Prepared ", "Preparado ") + (prettyISO(String(p.g || "").slice(0, 10)) || todayISO())) +
             (p.x ? esc(" · " + T("this link stops showing data after ", "este enlace deja de mostrar datos después del ") + prettyISO(p.x)) : "") + "</div>" +
         "</footer>" + (opts.tail || "") + "</div>";
    return h;
  }

  function blockHtml(b, opts) {
    var y = b.y;
    var head = b.h ? '<h2 class="hd-h">' + esc(b.h) + "</h2>" : "";
    if (y === "note") {
      return '<section class="hd-sec hd-note">' + head + (b.p ? "<p>" + esc(b.p) + "</p>" : "") + "</section>";
    }
    if (y === "kv") {
      return '<section class="hd-sec">' + head + '<div class="hd-tiles">' +
        b.i.map(function (x) {
          return '<div class="hd-tile"><div class="hd-tk">' + esc(x[0]) + '</div><div class="hd-tv">' + esc(x[1]) + "</div></div>";
        }).join("") + "</div>" + (b.p ? '<p class="hd-p">' + esc(b.p) + "</p>" : "") + "</section>";
    }
    if (y === "prov") {
      return '<section class="hd-sec hd-prov">' + head + '<div class="hd-provg">' +
        b.i.map(function (x) {
          return '<div><span class="hd-pl">' + esc(x[0]) + '</span><span class="hd-pr">' + esc(x[1]) + "</span></div>";
        }).join("") + "</div>" + (b.p ? '<p class="hd-p">' + esc(b.p) + "</p>" : "") + "</section>";
    }
    if (y === "bars") {
      /* ⚠ EVERY BAR IS THE SAME COLOR. See the header. */
      var max = 0; b.i.forEach(function (x) { if (x[1] > max) max = x[1]; });
      return '<section class="hd-sec">' + head + (b.d ? '<p class="hd-den">' + esc(b.d) + "</p>" : "") +
        (b.i.length
          ? '<div class="hd-bars">' + b.i.map(function (x) {
              var w = max > 0 ? Math.max(2, Math.round(x[1] / max * 100)) : 2;
              return '<div class="hd-bar"><span class="hd-bl">' + esc(x[0]) + "</span>" +
                     '<span class="hd-btrack"><span class="hd-bfill" style="width:' + w + '%"></span></span>' +
                     '<span class="hd-bn">' + esc(String(x[1])) + "</span></div>";
            }).join("") + "</div>"
          : '<p class="hd-p">' + esc(T("Nobody answered this one.", "Nadie respondió esta.")) + "</p>") +
        "</section>";
    }
    if (y === "rows") {
      return '<section class="hd-sec hd-rows">' + head +
        b.i.map(function (x) {
          return '<article class="hd-row"><div class="hd-when">' + esc(x[0]) + "</div>" +
                 '<div class="hd-gist">' + esc(x[1]) + "</div>" +
                 (x[2] ? '<div class="hd-detail">' + esc(x[2]) + "</div>" : "") + "</article>";
        }).join("") + (b.p ? '<p class="hd-p">' + esc(b.p) + "</p>" : "") + "</section>";
    }
    if (y === "words") {
      return '<section class="hd-sec">' + head + '<div class="hd-words">' +
        b.i.map(function (x) {
          return '<span class="hd-word"><span class="hd-wd">' + esc(x[0]) + '</span><span class="hd-ww">' + esc(x[1]) + "</span></span>";
        }).join("") + "</div>" + (b.p ? '<p class="hd-p">' + esc(b.p) + "</p>" : "") + "</section>";
    }
    if (y === "grid") {
      /* ⚠ A PICTURE OF REPETITION, NOT OF PROGRESS — and filled and outlined
         are two questions, never two ends of a scale. Same fill, same size,
         both named in the key. [[aog-exit-student]] */
      var cell = {};
      b.c.forEach(function (x) { cell[x[0] + ":" + x[1]] = x; });
      return '<section class="hd-sec"><div class="hd-scroll">' + head +
        '<table class="hd-grid"><thead><tr><th scope="col">' + esc(T("Class", "Clase")) + "</th>" +
        b.days.map(function (d) { return '<th scope="col">' + esc(d) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        b.cls.map(function (c, ci) {
          return "<tr><th scope=\"row\">" + esc(c) + "</th>" + b.days.map(function (d, di) {
            var x = cell[ci + ":" + di];
            var marks = "";
            if (x && x[2]) marks += '<span class="hd-dot fill" title="' + esc(T("enjoyed most", "más disfrutada")) + '"></span>';
            if (x && x[3]) marks += '<span class="hd-dot open" title="' + esc(T("most challenging", "más difícil")) + '"></span>';
            return "<td>" + (marks || '<span class="hd-empty">·</span>') + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>" +
        (b.key ? '<p class="hd-key"><span class="hd-dot fill"></span> ' + esc(b.key) + "</p>" : "") +
        (b.p ? '<p class="hd-p">' + esc(b.p) + "</p>" : "") + "</section>";
    }
    if (y === "table") {
      return '<section class="hd-sec"><div class="hd-scroll">' + head +
        '<table class="hd-table"><thead><tr>' + b.cols.map(function (c) { return '<th scope="col">' + esc(c) + "</th>"; }).join("") +
        "</tr></thead><tbody>" + b.rows.map(function (r) {
          return "<tr>" + r.map(function (v, i) { return i === 0 ? '<th scope="row">' + esc(v) + "</th>" : "<td>" + esc(v) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>" + (b.p ? '<p class="hd-p">' + esc(b.p) + "</p>" : "") + "</section>";
    }
    if (y === "chart") {
      return '<section class="hd-sec hd-chartsec">' + head +
        '<div class="hd-chartwrap">' + chartSvg(b, opts) + "</div>" +
        (b.key ? '<p class="hd-key">' + esc(b.key) + "</p>" : "") +
        (b.p ? '<p class="hd-p">' + esc(b.p) + "</p>" : "") + "</section>";
    }
    return "";
  }

  /* ==================================================================== LOOK
     Two surfaces, one stylesheet:
       .hd-doc      the record itself — screen AND paper, one set of rules
       .hd-sheet    the teacher's Print / Copy link / QR panel

     ⚠ NO OPACITY ON TEXT anywhere in here. --ink-faint clears 4.5:1 against
       --paper on its own; knocking it back is what put 22 nodes into an axe
       report on the exit-slip panel. [[aog-exit-slip]]
     ⚠ THE PRINTED DOCUMENT IS PINNED LIGHT. A record printed out of dark
       theme is light ink on white paper. .hd-print sets literal colors and
       never reads a token. [[aog-iep-chart]]
     ⚠ #aogShareView IS AN OVERLAY, NOT A .screen. Giving it an ID rule that
       lays it out would leave it painted on every page of the site, which is
       the bug that would have blanked every page when the exit slip shipped.
       It is display:none until open() adds .on. */
  var CSSED = false;
  function injectCss() {
    if (CSSED || document.getElementById("aog-handoff-css")) { CSSED = true; return; }
    CSSED = true;
    var s = document.createElement("style");
    s.id = "aog-handoff-css";
    s.textContent = [
      /* ---- the record ------------------------------------------------- */
      ".hd-doc{max-width:820px;margin:0 auto;padding:26px 22px 40px;color:var(--ink,#16202B);",
        "font-family:Georgia,'Iowan Old Style','Times New Roman',serif;line-height:1.62;}",
      ".hd-mast{border-bottom:2px solid var(--navy,#0A1E33);padding-bottom:14px;margin:0 0 22px;}",
      ".hd-brand{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;font-size:11px;font-weight:800;",
        "letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint,#6C7686);margin:0 0 6px;}",
      ".hd-doc h1{font-size:29px;line-height:1.2;margin:0 0 8px;font-weight:700;color:var(--ink,#16202B);}",
      ".hd-sub{display:flex;flex-wrap:wrap;gap:6px 14px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;",
        "font-size:13.5px;color:var(--ink-soft,#46506E);align-items:center;}",
      ".hd-code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;font-size:13px;letter-spacing:.06em;",
        "background:var(--aog-dusk,#4A5578);color:var(--aog-on,#fff);border-radius:999px;padding:2px 11px;}",
      ".hd-sec{margin:0 0 26px;break-inside:avoid;}",
      ".hd-h{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:12px;font-weight:800;letter-spacing:.1em;",
        "text-transform:uppercase;color:var(--ink-soft,#46506E);margin:0 0 8px;}",
      ".hd-note{border-left:3px solid var(--rule,#E4DAC5);padding:2px 0 2px 14px;}",
      ".hd-note p{margin:0;font-size:15px;color:var(--ink-soft,#46506E);}",
      ".hd-p{margin:9px 0 0;font-size:13.5px;color:var(--ink-faint,#6C7686);",
        "font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;line-height:1.6;}",
      ".hd-den{margin:0 0 9px;font-size:13px;color:var(--ink-faint,#6C7686);",
        "font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;}",
      /* tiles */
      ".hd-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;}",
      ".hd-tile{border:1px solid var(--rule,#E4DAC5);border-radius:12px;padding:12px 14px;background:var(--card,#fff);}",
      ".hd-tk{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:11px;font-weight:800;letter-spacing:.08em;",
        "text-transform:uppercase;color:var(--ink-faint,#6C7686);margin:0 0 4px;}",
      ".hd-tv{font-size:19px;font-weight:700;line-height:1.35;color:var(--ink,#16202B);}",
      /* bars — ONE color, always */
      ".hd-bars{display:flex;flex-direction:column;gap:7px;}",
      ".hd-bar{display:grid;grid-template-columns:minmax(0,1fr) 40% auto;align-items:center;gap:10px;",
        "font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:14px;}",
      ".hd-btrack{display:block;height:9px;border-radius:99px;background:var(--rule,#E4DAC5);overflow:hidden;}",
      ".hd-bfill{display:block;height:100%;border-radius:99px;background:var(--aog-dusk,#4A5578);}",
      ".hd-bn{font-variant-numeric:tabular-nums;font-weight:700;color:var(--ink-soft,#46506E);min-width:2ch;text-align:right;}",
      /* rows */
      ".hd-rows .hd-row{border-top:1px solid var(--rule,#E4DAC5);padding:11px 0;break-inside:avoid;}",
      ".hd-rows .hd-row:first-of-type{border-top:0;}",
      ".hd-when{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:11.5px;font-weight:800;",
        "letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint,#6C7686);margin:0 0 3px;}",
      ".hd-gist{font-size:15.5px;color:var(--ink,#16202B);}",
      ".hd-detail{font-size:14px;color:var(--ink-soft,#46506E);margin-top:4px;}",
      /* words */
      ".hd-words{display:flex;flex-wrap:wrap;gap:8px;}",
      ".hd-word{display:inline-flex;flex-direction:column;border:1px solid var(--rule,#E4DAC5);border-radius:10px;",
        "padding:6px 11px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;}",
      ".hd-wd{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint,#6C7686);}",
      ".hd-ww{font-size:14.5px;font-weight:600;color:var(--ink,#16202B);}",
      /* grid + table */
      ".hd-scroll{overflow-x:auto;}",
      ".hd-grid,.hd-table{border-collapse:collapse;width:100%;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:13px;}",
      ".hd-grid th,.hd-grid td,.hd-table th,.hd-table td{border:1px solid var(--rule,#E4DAC5);padding:6px 8px;text-align:left;",
        "color:var(--ink,#16202B);}",
      ".hd-grid thead th,.hd-table thead th{font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;",
        "color:var(--ink-soft,#46506E);white-space:nowrap;}",
      ".hd-grid td{text-align:center;}",
      ".hd-dot{display:inline-block;width:11px;height:11px;border-radius:50%;margin:0 1.5px;vertical-align:middle;}",
      ".hd-dot.fill{background:var(--aog-dusk,#4A5578);border:1.5px solid var(--aog-dusk,#4A5578);}",
      ".hd-dot.open{background:transparent;border:1.5px solid var(--aog-dusk,#4A5578);}",
      ".hd-empty{color:var(--ink-faint,#6C7686);}",
      ".hd-key{margin:9px 0 0;font-size:13px;color:var(--ink-soft,#46506E);",
        "font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;}",
      /* chart */
      ".hd-chartwrap{border:1px solid var(--rule,#E4DAC5);border-radius:12px;padding:10px 8px;background:var(--card,#fff);}",
      ".hd-chart{display:block;width:100%;height:auto;}",
      /* provenance */
      ".hd-prov{border:1px solid var(--rule,#E4DAC5);border-radius:12px;padding:14px 16px;}",
      ".hd-provg{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px 22px;}",
      ".hd-provg>div{display:flex;align-items:flex-end;gap:8px;}",
      ".hd-pl{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:11px;font-weight:800;letter-spacing:.07em;",
        "text-transform:uppercase;color:var(--ink-faint,#6C7686);white-space:nowrap;}",
      ".hd-pr{flex:1;border-bottom:1px solid var(--ink-faint,#6C7686);min-height:19px;font-size:14px;color:var(--ink,#16202B);}",
      ".hd-foot{border-top:1px solid var(--rule,#E4DAC5);margin-top:30px;padding-top:12px;display:flex;flex-wrap:wrap;",
        "justify-content:space-between;gap:6px 18px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;",
        "font-size:11.5px;color:var(--ink-faint,#6C7686);}",

      /* ---- the viewer overlay ----------------------------------------- */
      "#aogShareView{display:none;}",
      "#aogShareView.on{display:block;position:fixed;inset:0;z-index:99990;overflow:auto;-webkit-overflow-scrolling:touch;",
        "background:var(--paper,#FBF8F1);overscroll-behavior:auto;}",
      "#aogShareView .hd-vbar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:9px;align-items:center;",
        "padding:10px 16px;background:var(--navy,#0A1E33);color:#fff;}",
      "#aogShareView .hd-vbar .hd-vt{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:12px;font-weight:700;",
        "letter-spacing:.1em;text-transform:uppercase;color:#EAF0F7;margin-right:auto;}",
      "#aogShareView .hd-ro{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:11px;font-weight:800;",
        "letter-spacing:.07em;text-transform:uppercase;background:rgba(255,255,255,.16);color:#fff;border-radius:999px;padding:3px 10px;}",
      "#aogShareView .hd-lapsed{max-width:640px;margin:64px auto;padding:0 22px;text-align:center;",
        "font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;color:var(--ink,#16202B);}",
      "#aogShareView .hd-lapsed h1{font-size:24px;margin:0 0 12px;}",
      "#aogShareView .hd-lapsed p{font-size:15.5px;color:var(--ink-soft,#46506E);line-height:1.65;margin:0 0 10px;}",

      /* ---- buttons shared by the bar and the sheet --------------------- */
      ".hd-b{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;font-size:13.5px;font-weight:700;cursor:pointer;",
        "border-radius:999px;padding:8px 15px;border:1.5px solid var(--aog-dusk,#4A5578);",
        "background:var(--aog-dusk,#4A5578);color:var(--aog-on,#fff);}",
      ".hd-b.ghost{background:transparent;color:var(--aog-dusk,#4A5578);}",
      ".hd-b:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      "#aogShareView .hd-vbar .hd-b{border-color:#fff;background:#fff;color:var(--navy,#0A1E33);}",
      "#aogShareView .hd-vbar .hd-b.ghost{background:transparent;color:#fff;}",

      /* the button any panel mounts */
      ".hd-mount{display:inline-flex;align-items:center;gap:7px;}",

      /* ---- the share sheet -------------------------------------------- */
      "#aogShareSheet{display:none;}",
      "#aogShareSheet.on{display:flex;position:fixed;inset:0;z-index:99991;align-items:flex-start;justify-content:center;",
        "padding:22px 14px;overflow:auto;background:rgba(8,14,22,.58);}",
      ".hd-sheet{width:100%;max-width:560px;background:var(--card,#fff);border-radius:18px;border:1px solid var(--rule,#E4DAC5);",
        "box-shadow:0 26px 60px -22px rgba(0,0,0,.55);padding:20px 22px 22px;",
        "font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--ink,#16202B);}",
      ".hd-sheet h2{margin:0 0 3px;font-size:20px;font-weight:700;}",
      ".hd-sheet .hd-what{margin:0 0 16px;font-size:13.5px;color:var(--ink-faint,#6C7686);}",
      /* the share half folds — see the two-verbs note in sheetHtml() */
      ".hd-share{margin-top:14px;border-top:1px solid var(--rule,#E4DAC5);padding-top:4px;}",
      ".hd-share>summary{display:inline-block;list-style:none;cursor:pointer;padding:10px 16px;margin-top:8px;",
        "border:1.5px solid var(--rule-hard,#CBBB9A);border-radius:999px;font-size:14px;font-weight:650;",
        "color:var(--ink,#0A1E33);background:transparent;}",
      ".hd-share>summary::-webkit-details-marker{display:none;}",
      ".hd-share>summary::after{content:\" \\2192\";}",
      ".hd-share[open]>summary::after{content:\" \\2193\";}",
      ".hd-share>summary:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      ".hd-share[open]>summary{margin-bottom:6px;}",
      ".hd-linkraw{margin:10px 0;}",
      ".hd-linkraw>summary{cursor:pointer;font-size:12.5px;font-weight:650;color:var(--ink-soft,#46506E);padding:4px 0;}",
      ".hd-linkraw>summary:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      ".hd-acts{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 16px;}",
      ".hd-fld{margin:0 0 14px;}",
      ".hd-lab{display:block;font-size:11.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;",
        "color:var(--ink-soft,#46506E);margin:0 0 6px;}",
      ".hd-exp{display:flex;flex-wrap:wrap;gap:6px;}",
      ".hd-e{font-size:13px;font-weight:700;cursor:pointer;border-radius:999px;padding:6px 12px;",
        "border:1.5px solid var(--rule,#E4DAC5);background:var(--paper,#FBF8F1);color:var(--ink-soft,#46506E);}",
      ".hd-e.on{background:var(--aog-dusk,#4A5578);border-color:var(--aog-dusk,#4A5578);color:var(--aog-on,#fff);}",
      ".hd-e:focus-visible{outline:3px solid var(--gold,#D9A33B);outline-offset:2px;}",
      ".hd-url{width:100%;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.5;",
        "border:1px solid var(--rule,#E4DAC5);border-radius:10px;padding:9px 11px;background:var(--paper,#FBF8F1);",
        "color:var(--ink,#16202B);resize:vertical;min-height:76px;}",
      ".hd-meter{margin:7px 0 0;font-size:12.5px;color:var(--ink-soft,#46506E);}",
      ".hd-meter.warn{color:var(--gold-deep,#8A6416);font-weight:700;}",
      ".hd-meter.bad{color:var(--red,#9C2B2B);font-weight:700;}",
      ".hd-qr{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;margin:0 0 14px;}",
      ".hd-qrbox{background:#fff;padding:10px;border-radius:12px;border:1px solid var(--rule,#E4DAC5);line-height:0;}",
      ".hd-qrbox img,.hd-qrbox canvas{display:block;width:168px;height:168px;}",
      ".hd-qrside{flex:1;min-width:170px;display:flex;flex-direction:column;gap:8px;}",
      ".hd-check{display:flex;align-items:flex-start;gap:9px;font-size:13.5px;color:var(--ink-soft,#46506E);line-height:1.5;}",
      ".hd-check input{margin-top:3px;width:17px;height:17px;flex:0 0 auto;}",
      ".hd-truth{border:1px solid var(--rule,#E4DAC5);border-left:3px solid var(--gold,#D9A33B);border-radius:10px;",
        "padding:11px 13px;font-size:13px;line-height:1.62;color:var(--ink-soft,#46506E);margin:0 0 14px;}",
      ".hd-truth strong{color:var(--ink,#16202B);}",
      ".hd-said{font-size:13px;font-weight:700;color:var(--aog-dusk,#4A5578);min-height:18px;}",
      ".hd-said.bad{color:var(--red,#9C2B2B);}",
      ".hd-sfoot{display:flex;gap:9px;justify-content:flex-end;margin-top:4px;}",

      /* ---- dark: only what a token does not already carry -------------- */
      ":root[data-theme=\"dark\"] .hd-tile,:root[data-theme=\"dark\"] .hd-chartwrap,",
        ":root[data-theme=\"dark\"] .hd-sheet{background:#13202C;}",
      ":root[data-theme=\"dark\"] .hd-url,:root[data-theme=\"dark\"] .hd-e{background:#0E1922;}",
      ":root[data-theme=\"dark\"] .hd-qrbox{background:#fff;}",
      ":root[data-theme=\"dark\"] .hd-meter.warn{color:#E8BE63;}",
      ":root[data-theme=\"dark\"] .hd-meter.bad{color:#F09A9A;}",
      ":root[data-theme=\"dark\"] .hd-said.bad{color:#F09A9A;}",

      /* ---- phones ------------------------------------------------------ */
      "@media (max-width:600px){",
        ".hd-doc{padding:18px 15px 30px;}",
        ".hd-doc h1{font-size:24px;}",
        ".hd-bar{grid-template-columns:minmax(0,1fr) auto;}",
        ".hd-bar .hd-btrack{grid-column:1 / -1;}",
        ".hd-qrbox img,.hd-qrbox canvas{width:140px;height:140px;}",
      "}",

      /* ==================== PAPER ==================================== */
      /* ⚠ The printed record is BLACK ON WHITE whatever the screen theme.
            Every color below is a literal, and nothing here reads a token. */
      "@media print{",
        "body.hd-printing>*{display:none !important;}",
        "body.hd-printing #aogHandoffPrint{display:block !important;}",
        /* ⚠ VISIBILITY TOO, NOT ONLY DISPLAY. aog-styles.css prints with
           `body * {visibility:hidden !important}` so the IEP report can be
           the only thing on its paper. The QR cards learned this and counter
           it; this layer never did — so Print data and the whole /shared
           page printed a header and footer around a blank body while every
           display rule here was perfectly right, and the .29at repair could
           not save them because A DESCENDANT'S DISPLAY CAN NEVER RESCUE AN
           ANCESTOR'S VISIBILITY, in either direction. Same lesson as the
           cards, mirrored. Found on paper 2026-08-29, the night before
           school. */
        "body.hd-printing #aogHandoffPrint,body.hd-printing #aogHandoffPrint *{visibility:visible !important;}",
        "body.hd-shared #aogShareView,body.hd-shared #aogShareView *{visibility:visible !important;}",
        "body.hd-shared>*:not(#aogShareView){display:none !important;}",
        "body.hd-shared #aogShareView{position:static !important;overflow:visible !important;background:#fff !important;}",
        "#aogShareView .hd-vbar,#aogShareSheet{display:none !important;}",
        "@page{size:letter portrait;margin:0.55in 0.6in 0.6in;}",
        "html,body{background:#fff !important;}",
        ".hd-doc{max-width:none;margin:0;padding:0;color:#101820 !important;font-size:11.6pt;line-height:1.5;}",
        ".hd-doc h1{font-size:21pt;color:#101820 !important;}",
        ".hd-mast{border-bottom:2pt solid #101820 !important;}",
        ".hd-brand,.hd-tk,.hd-when,.hd-wd,.hd-pl,.hd-h{color:#3C4652 !important;}",
        ".hd-sub,.hd-detail,.hd-note p,.hd-key{color:#2A3440 !important;}",
        ".hd-p,.hd-den,.hd-foot{color:#4A5560 !important;}",
        ".hd-gist,.hd-tv,.hd-ww,.hd-pr{color:#101820 !important;}",
        ".hd-code{background:#101820 !important;color:#fff !important;",
          "-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
        ".hd-tile,.hd-chartwrap,.hd-prov,.hd-word{border-color:#B9C1CA !important;background:#fff !important;}",
        ".hd-grid th,.hd-grid td,.hd-table th,.hd-table td,.hd-rows .hd-row,.hd-note,.hd-foot{border-color:#B9C1CA !important;}",
        ".hd-btrack{background:#DFE4E9 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
        ".hd-bfill{background:#3B4658 !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
        ".hd-dot.fill{background:#3B4658 !important;border-color:#3B4658 !important;",
          "-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
        ".hd-dot.open{background:transparent !important;border-color:#3B4658 !important;}",
        ".hd-sec{break-inside:avoid;page-break-inside:avoid;}",
        ".hd-rows .hd-row{break-inside:avoid;page-break-inside:avoid;}",
        ".hd-h{break-after:avoid;page-break-after:avoid;}",
        ".hd-scroll{overflow:visible !important;}",
        ".hd-pagebreak{break-before:page;page-break-before:always;}",
        ".hd-qrprint{display:flex !important;gap:14px;align-items:center;border:1pt solid #B9C1CA;border-radius:8pt;",
          "padding:10pt 12pt;margin-top:18pt;break-inside:avoid;}",
        ".hd-qrprint img{width:1.35in;height:1.35in;display:block;}",
        ".hd-qrprint .hd-qrsay{font-family:ui-sans-serif,system-ui,sans-serif;font-size:9.5pt;line-height:1.45;color:#2A3440;}",
        ".hd-noprint{display:none !important;}",
      "}",
      ".hd-qrprint{display:none;}",
      /* ══ AOG-PAPER-APEX-V1 (2026-09-26) — Jimmy: the printables that come from
         the data "look meh … the FACELIFT PULLED UP TO THE CEILING as the apex."
         Every record this layer draws (IEP progress, exit slips, check-ins,
         self-reflections, anything shared or printed from the data) gets one
         architecture: a navy masthead lit with a rose window and a gold rule,
         leaded section headers, tiles with a band of stained glass, a framed
         chart, and a signed foot. Paper keeps its colours (print-color-adjust),
         and four tiles sit in one row so a goal no longer sprawls over pages. */
      ".hd-doc{font-family:Georgia,'Iowan Old Style',serif;}",
      ".hd-mast{position:relative;overflow:hidden;background:#0A1E33;color:#F4EEE2;border:0 !important;border-radius:16px;",
        "padding:22px 26px 20px 118px;margin:0 0 26px;box-shadow:inset 0 -5px 0 #C9A24A;",
        "-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
      ".hd-mast::before{content:'';position:absolute;left:22px;top:50%;width:76px;height:76px;margin-top:-38px;border-radius:50%;",
        "background:radial-gradient(circle,#0A1E33 0 34%,transparent 35%),",
        "conic-gradient(#2F63B8 0 12.5%,#B8457A 0 25%,#2E8B57 0 37.5%,#B87A12 0 50%,#7B4FA0 0 62.5%,#1F8080 0 75%,#A8323E 0 87.5%,#3F4AA6 0);",
        "box-shadow:0 0 0 3px #1E1F22,0 0 0 5px #C9A24A;-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
      ".hd-mast::after{content:'A';position:absolute;left:22px;top:50%;width:76px;line-height:76px;margin-top:-38px;text-align:center;",
        "font:700 30px/76px Georgia,serif;color:#F2C964;}",
      ".hd-mast .hd-brand{color:#E7C46A !important;letter-spacing:.22em;}",
      ".hd-mast h1{color:#F4EEE2 !important;font-size:30px;letter-spacing:-.01em;}",
      ".hd-mast .hd-sub{color:#D6DEE8 !important;}",
      ".hd-mast .hd-code{background:#C9A24A !important;color:#0A1E33 !important;}",
      ".hd-h{display:flex;align-items:center;gap:10px;color:#7d5a15 !important;letter-spacing:.14em;}",
      ".hd-h::before{content:'';width:26px;height:3px;border-radius:2px;background:#C9A24A;flex:none;",
        "-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
      ".hd-note{border-left:4px solid #C9A24A !important;background:#FBF6EA;border-radius:0 12px 12px 0;padding:12px 16px !important;",
        "-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
      ".hd-tiles{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));}",
      ".hd-tile{position:relative;border:1.5px solid #1E1F22 !important;border-radius:12px;padding:16px 14px 12px !important;overflow:hidden;",
        "-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
      ".hd-tile::before{content:'';position:absolute;left:0;right:0;top:0;height:5px;background:#2F63B8;}",
      ".hd-tile:nth-child(4n+2)::before{background:#2E8B57;}.hd-tile:nth-child(4n+3)::before{background:#B87A12;}.hd-tile:nth-child(4n+4)::before{background:#7B4FA0;}",
      ".hd-tv{font-size:17px;}",
      ".hd-chartwrap{border:1.5px solid #1E1F22 !important;box-shadow:inset 0 5px 0 #1F8080;padding:16px 10px 10px !important;",
        "-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
      ".hd-prov{border:1.5px solid #1E1F22 !important;box-shadow:inset 0 5px 0 #C9A24A;-webkit-print-color-adjust:exact;print-color-adjust:exact;}",
      ".hd-foot{justify-content:center;text-align:center;border-top:2px solid #C9A24A !important;font-style:italic;}",
      "@media print{",
        ".hd-mast{background:#0A1E33 !important;}",
        ".hd-mast h1{font-size:22pt !important;color:#F4EEE2 !important;}",
        ".hd-mast .hd-brand{color:#E7C46A !important;}.hd-mast .hd-sub{color:#D6DEE8 !important;}",
        ".hd-tiles{grid-template-columns:repeat(4,1fr) !important;gap:8pt !important;}",
        ".hd-tv{font-size:12.5pt !important;}",
        ".hd-tile{border-color:#1E1F22 !important;}",
        ".hd-note{background:#FBF6EA !important;}",
        ".hd-sec{margin-bottom:16pt !important;}",
      "}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  }

  /* =================================================================== PRINT
     ⚠ NEVER PUT window.print() BEHIND A TIMER. iOS Safari allows printing
     only while still inside the user-gesture chain; a setTimeout hop of any
     length makes it "automatic printing" and Safari blocks it with a dialog.
     Eight paths in this file had that bug in August. Write the document
     synchronously, print, and defer ONLY the cleanup. [[aog-ios-print]]

     Which is also why the share sheet SEALS THE LINK THE MOMENT IT OPENS
     rather than when Print is pressed: sealing is async (crypto and
     compression both are), so doing it on the click would leave the gesture
     chain and re-break exactly what was fixed. By the time a finger lands on
     Print the link and its QR are already sitting in memory. */
  function printHost() {
    var h = el("aogHandoffPrint");
    if (!h) {
      h = document.createElement("div");
      h.id = "aogHandoffPrint";
      h.style.display = "none";
      document.body.appendChild(h);
    }
    return h;
  }
  function fileName(p) {
    var bits = [p.t || "record", p.s || "", (p.r || "").replace(/[^\w\s-]/g, " ")];
    return bits.join(" ").replace(/\s+/g, " ").trim().slice(0, 90) || "Architecture of Grace";
  }
  function printPacket(p, qrDataUrl) {
    p = sanitize(p);
    if (!p.o) p.o = defaultOrg();
    injectCss();
    var host = printHost();
    var extra = qrDataUrl
      ? '<div class="hd-qrprint"><img src="' + esc(qrDataUrl) + '" alt="' +
        esc(T("QR code linking to this record", "Código QR que enlaza a este registro")) + '">' +
        '<div class="hd-qrsay"><strong>' + esc(T("Scan to view this record digitally.", "Escanea para ver este registro en digital.")) + "</strong><br>" +
        esc(T("The data is inside the code itself — it opens with or without internet, and nothing is looked up on a server.",
              "Los datos están dentro del propio código — se abre con o sin internet y no se consulta nada en un servidor.")) +
        (p.x ? "<br>" + esc(T("This code stops showing data after ", "Este código deja de mostrar datos después del ") + prettyISO(p.x)) : "") +
        "</div></div>"
      : "";
    /* ⚠ A WINDOW OF ITS OWN, THE WAY THE IEP PAGES PRINT. Three repairs
       tried to make this record printable INSIDE the app — .29at unhid its
       display, the sw bump delivered that, .29ba unhid its visibility — and
       each was real and insufficient, because the app's stylesheet is a
       place where print rules fight: every rule added for one surface is a
       rule every other surface must survive. The IEP meeting pages never
       had this bug, because they print from a window that contains ONLY the
       document. This does the same: the record, this layer's own
       stylesheet, and nothing else. Printing in place survives below only
       as the popup-blocked fallback.
       ⚠ SYNCHRONOUS, inside the click — open, write, print, no timer
       before print. [[aog-ios-print]] */
    var html = docHtml(p, { print: true, tail: extra });
    var css = "";
    try { css = (document.getElementById("aog-handoff-css") || {}).textContent || ""; } catch (eC) {}
    var w = null;
    try { w = window.open("", "_blank"); } catch (eW) {}
    if (w && w.document && css) {
      try {
        w.document.open();
        w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(fileName(p)) + "</title>" +
          '<style>body{margin:0;background:#fff;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;color:#101820;}</style>' +
          "<style>" + css + "</style></head>" +
          '<body class="hd-printing"><div id="aogHandoffPrint" style="display:block">' + html + "</div></body></html>");
        w.document.close();
        w.focus();
        try { w.print(); } catch (eP) {}
        return;
      } catch (eD) {}
    }
    var host = printHost();
    host.innerHTML = html;
    var prev = document.title;
    document.title = fileName(p);
    document.body.classList.add("hd-printing");
    aogPrintHold(function () {
      document.body.classList.remove("hd-printing");
      document.title = prev;
      host.innerHTML = "";
    });
    try { window.print(); } catch (e) {}
  }

  /* ====================================================================== QR
     The QR carries THE SAME LINK, never a different one — §5 of the brief,
     and the only version of a QR code that is not a trap.

     Which means its size is the link's size, and a link that carries a
     month of one student's record is a genuinely large code. So the sheet
     MEASURES it and says what will actually happen on paper instead of
     drawing a black smear and letting a teacher find out at the printer.
     Past what a QR can hold at all, no code is drawn and the screen says
     to narrow the range. */
  var QR_L_MAX = 2953;                       /* version 40, error level L   */
  function qrGrade(n) {
    if (n <= 900)  return { k: "ok",   s: T("Scans easily.", "Se escanea fácilmente.") };
    if (n <= 1700) return { k: "ok",   s: T("Scans well. Print it at least an inch and a half across.", "Se escanea bien. Imprímelo de al menos 4 cm de ancho.") };
    if (n <= QR_L_MAX) return { k: "warn", s: T("Dense. Print it at least two inches across, or narrow the range to make it easier.", "Denso. Imprímelo de al menos 5 cm, o reduce el rango para simplificarlo.") };
    return { k: "bad", s: T("Too much data for a QR code. Copy Link and Print still work — narrow the range for a code.", "Demasiados datos para un código QR. Copiar enlace e Imprimir siguen funcionando — reduce el rango para generar un código.") };
  }
  function drawQr(box, url) {
    box.innerHTML = "";
    return new Promise(function (done) {
      var p = null;
      try { p = (typeof ensureQrLib === "function") ? ensureQrLib() : null; } catch (e) {}
      if (!p) return done(null);
      p.then(function (ok) {
        if (!ok || !window.QRCode) return done(null);
        try {
          new window.QRCode(box, {
            text: url, width: 512, height: 512,
            colorDark: "#000000", colorLight: "#ffffff",
            correctLevel: window.QRCode.CorrectLevel.L
          });
        } catch (e) { box.innerHTML = ""; return done(null); }
        /* qrcodejs paints a canvas and, on some browsers, an img beside it.
           Either can produce the data URL the print path and the download
           both need, so take whichever actually rendered. */
        setTimeout(function () {
          var cv = box.querySelector("canvas"), im = box.querySelector("img");
          var data = null;
          try { if (cv) data = cv.toDataURL("image/png"); } catch (e) {}
          if (!data && im && im.src) data = im.src;
          done(data || null);
        }, 60);
      }, function () { done(null); });
    });
  }

  /* ============================================================ WHAT WAS SENT
     Not a kill switch — there cannot be one. A record, on this device, of
     what left it and when each link lapses, so a teacher can answer the
     question a parent or an administrator will eventually ask.
     Deliberately NOT on the delete keep-list: wiping this device should
     take it with everything else. [[aog-security-posture]] */
  function logRead() {
    try { var a = JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function logWrite(row) {
    try {
      var a = logRead();
      a.unshift(row);
      localStorage.setItem(LOG_KEY, JSON.stringify(a.slice(0, 60)));
    } catch (e) {}
  }

  /* ============================================================ THE SHEET
     Three actions and nothing else. §9: no forms, no email addresses, no
     communication wizard. The teacher presses one of three things and gets
     on with their day.

     ⚠ THE LINK IS ALWAYS ON THE SCREEN, in a field, selectable. The exit
     panel learned this the hard way in .28f — a screen that says HAND THIS
     OUT and then makes you retype it is not finished — and a clipboard
     write is exactly the thing a school-managed browser, or plain http,
     quietly refuses. [[aog-exit-student]] */
  var EXPIRIES = [
    { d: 7,   en: "7 days",     es: "7 días" },
    { d: 30,  en: "30 days",    es: "30 días" },
    { d: 90,  en: "90 days",    es: "90 días" },
    { d: 0,   en: "No end date", es: "Sin fecha final" }
  ];
  var SHEET = { pk: null, days: 30, url: "", qr: null, seq: 0, lastFocus: null };

  function sheetHost() {
    var h = el("aogShareSheet");
    if (!h) {
      h = document.createElement("div");
      h.id = "aogShareSheet";
      h.setAttribute("role", "dialog");
      h.setAttribute("aria-modal", "true");
      h.setAttribute("aria-label", T("Print or share this record", "Imprimir o compartir este registro"));
      document.body.appendChild(h);
      h.addEventListener("click", function (ev) { if (ev.target === h) closeSheet(); });
    }
    return h;
  }
  function say(msg, bad) {
    var n = el("hdSaid");
    if (!n) return;
    n.textContent = msg || "";
    n.className = "hd-said" + (bad ? " bad" : "");
  }
  function linkFor(pk, days) {
    var p = JSON.parse(JSON.stringify(pk));
    p.g = new Date().toISOString();
    p.x = days > 0 ? plusDaysISO(days) : "";
    var base;
    try {
      var o = location.origin || "";
      base = /^https?:/.test(o) ? (o.replace(/\/+$/, "") + SHARE_PATH) : (location.href.split("#")[0]);
    } catch (e) { base = SHARE_PATH; }
    return seal(JSON.stringify(sanitize(p))).then(function (tok) {
      return { url: base + "#" + HASH_KEY + "=" + tok, packet: sanitize(p) };
    });
  }
  function refreshLink() {
    var mine = ++SHEET.seq;
    SHEET.url = ""; SHEET.qr = null;
    var box = el("hdQrBox"), meter = el("hdMeter"), ta = el("hdUrl"), inc = el("hdIncQr");
    if (ta) ta.value = T("Building the link…", "Creando el enlace…");
    if (meter) { meter.className = "hd-meter"; meter.textContent = ""; }
    if (box) box.innerHTML = "";
    if (inc) inc.disabled = true;
    return linkFor(SHEET.pk, SHEET.days).then(function (r) {
      if (mine !== SHEET.seq) return;
      SHEET.url = r.url; SHEET.sealed = r.packet;
      if (ta) ta.value = r.url;
      var n = r.url.length, g = qrGrade(n);
      if (meter) {
        meter.className = "hd-meter" + (g.k === "ok" ? "" : (" " + g.k));
        meter.textContent = n.toLocaleString() + T(" characters. ", " caracteres. ") + g.s;
      }
      if (g.k === "bad") {
        if (box) {
          box.innerHTML = '<div style="width:168px;font-size:12.5px;line-height:1.5;color:var(--ink-soft,#46506E);' +
            'font-family:ui-sans-serif,system-ui,sans-serif;padding:6px 2px;">' +
            esc(T("No QR code for this one — there is more data here than a QR can hold. The link and the printout both still work.",
                  "Sin código QR — hay más datos de los que cabe en un QR. El enlace y la impresión siguen funcionando.")) + "</div>";
        }
        return;
      }
      if (!box) return;
      return drawQr(box, r.url).then(function (data) {
        if (mine !== SHEET.seq) return;
        SHEET.qr = data;
        if (inc) inc.disabled = !data;
        if (!data && box && !box.querySelector("canvas,img")) {
          box.innerHTML = '<div style="width:168px;font-size:12.5px;line-height:1.5;color:var(--ink-soft,#46506E);' +
            'font-family:ui-sans-serif,system-ui,sans-serif;padding:6px 2px;">' +
            esc(T("The QR generator needs the internet the first time it is used. The link above works either way.",
                  "El generador de QR necesita internet la primera vez. El enlace de arriba funciona igual.")) + "</div>";
        }
      });
    }, function () {
      if (mine !== SHEET.seq) return;
      if (ta) ta.value = "";
      say(T("This browser could not build the link. Print still works.", "Este navegador no pudo crear el enlace. Imprimir sí funciona."), true);
    });
  }

  function sheetHtml(p) {
    var recent = logRead().slice(0, 3);
    return '<div class="hd-sheet" tabindex="-1">' +
      "<h2>" + esc(T("Print / Share", "Imprimir / Compartir")) + "</h2>" +
      '<p class="hd-what">' + esc([p.t, p.s, p.c, p.r].filter(Boolean).join(" · ")) + "</p>" +

      /* ⚠ TWO VERBS, ONE FACE. This sheet used to put everything face-up at
         once — the sealed link, its character count, four expiry chips, three
         QR controls and three paragraphs of link-truth — and a teacher who
         only wanted paper called it overwhelming, because it was (Jimmy,
         8/29). Printing is one press and owes the reader nothing else.
         Everything that exists only in service of a LINK lives behind the
         one disclosure below, and appears the moment sharing is chosen.
         Nothing was removed and no wording changed; every control keeps its
         id and its wiring. The link is still sealed when the sheet OPENS,
         not when the disclosure does — the iOS gesture rule above. */
      '<div class="hd-acts">' +
        '<button type="button" class="hd-b" id="hdPrint">' + esc(T("Print data", "Imprimir datos")) + "</button>" +
      "</div>" +

      '<details class="hd-share">' +
      "<summary>" + esc(T("Share as a link or QR code", "Compartir como enlace o código QR")) + "</summary>" +

      '<div class="hd-acts">' +
        '<button type="button" class="hd-b ghost" id="hdCopy">' + esc(T("Copy link", "Copiar enlace")) + "</button>" +
      "</div>" +

      '<div class="hd-fld">' +
        '<span class="hd-lab" id="hdExpLab">' + esc(T("This link stops showing the data after", "Este enlace deja de mostrar los datos después de")) + "</span>" +
        '<div class="hd-exp" role="group" aria-labelledby="hdExpLab">' +
          EXPIRIES.map(function (e) {
            return '<button type="button" class="hd-e' + (SHEET.days === e.d ? " on" : "") + '" data-hde="' + e.d +
              '" aria-pressed="' + (SHEET.days === e.d ? "true" : "false") + '">' + esc(T(e.en, e.es)) + "</button>";
          }).join("") +
        "</div>" +
      "</div>" +

      '<details class="hd-linkraw"><summary>' + esc(T("See the link itself", "Ver el enlace")) + "</summary>" +
        '<div class="hd-fld">' +
        '<label class="hd-lab" for="hdUrl">' + esc(T("The link", "El enlace")) + "</label>" +
        '<textarea class="hd-url" id="hdUrl" readonly spellcheck="false" aria-describedby="hdMeter"></textarea>' +
        '<p class="hd-meter" id="hdMeter"></p>' +
      "</div></details>" +

      '<div class="hd-qr">' +
        '<div class="hd-qrbox" id="hdQrBox" aria-hidden="true"></div>' +
        '<div class="hd-qrside">' +
          '<button type="button" class="hd-b ghost" id="hdQrDl">' + esc(T("Download QR code", "Descargar código QR")) + "</button>" +
          '<button type="button" class="hd-b ghost" id="hdQrPrint">' + esc(T("Print QR code", "Imprimir código QR")) + "</button>" +
          '<label class="hd-check"><input type="checkbox" id="hdIncQr" disabled>' +
            "<span>" + esc(T("Put the QR code on the printed report", "Poner el código QR en el informe impreso")) + "</span></label>" +
        "</div>" +
      "</div>" +

      /* ⚠ THE PARAGRAPH THAT MUST NOT BE SOFTENED. It is the difference
         between a teacher who knows what they just made and one who thinks
         this is a login. See rule 5 in the header. Not one word changed when
         the sheet was decluttered: it lives inside the SHARE disclosure
         because it is the truth about the LINK, and it is face-up the moment
         a link is on the table. Printing creates no link and owes none of
         this. */
      '<div class="hd-truth">' +
        "<strong>" + esc(T("What this link is.", "Qué es este enlace.")) + "</strong> " +
        esc(T("The data travels inside the link itself, so it opens with no account and no internet, and nothing about it is stored on a server or reaches Architecture of Grace. It carries the student code, never a name.",
              "Los datos viajan dentro del propio enlace, así que se abre sin cuenta y sin internet, y nada se guarda en un servidor ni llega a Architecture of Grace. Lleva el código del estudiante, nunca un nombre.")) +
        "<br><br><strong>" + esc(T("A link cannot be recalled.", "Un enlace no se puede retirar.")) + "</strong> " +
        esc(T("Anyone holding it can open it, so hand it out the way you would hand out the paper copy. The end date above is sealed inside the link and cannot be edited — after that day this page stops showing the record — but someone who already opened it may have kept a copy, exactly as with paper.",
              "Cualquiera que lo tenga puede abrirlo, así que repártelo como repartirías la copia en papel. La fecha final está sellada dentro del enlace y no se puede editar — a partir de ese día esta página deja de mostrar el registro — pero quien ya lo abrió pudo guardar una copia, igual que con el papel.")) +
        "<br><br>" +
        esc(T("Architecture of Grace does not send anything. Share it through whatever your school already uses.",
              "Architecture of Grace no envía nada. Compártelo por el medio que tu escuela ya use.")) +
      "</div>" +

      (recent.length
        ? '<div class="hd-fld"><span class="hd-lab">' + esc(T("Shared from this device", "Compartido desde este dispositivo")) + "</span>" +
          recent.map(function (r) {
            return '<div style="font-size:12.5px;color:var(--ink-faint,#6C7686);line-height:1.6;">' +
              esc(String(r.t || "") + (r.s ? (" · " + r.s) : "") + " — " + prettyISO(String(r.at || "").slice(0, 10)) +
                  (r.x ? (T(", ends ", ", termina ") + prettyISO(r.x)) : T(", no end date", ", sin fecha final"))) + "</div>";
          }).join("") + "</div>"
        : "") +

      "</details>" +

      '<p class="hd-said" id="hdSaid" role="status" aria-live="polite"></p>' +
      '<div class="hd-sfoot"><button type="button" class="hd-b ghost" id="hdClose">' + esc(T("Close", "Cerrar")) + "</button></div>" +
    "</div>";
  }

  function openSheet(p) {
    p = sanitize(p);
    if (!p.b.length) {
      try { alert(T("There is nothing to share here yet.", "Todavía no hay nada que compartir aquí.")); } catch (e) {}
      return;
    }
    injectCss();
    if (!p.o) p.o = defaultOrg();
    SHEET.pk = p; SHEET.url = ""; SHEET.qr = null; SHEET.sealed = null; NOTED = false;
    try { SHEET.lastFocus = document.activeElement; } catch (e) {}
    var host = sheetHost();
    host.innerHTML = sheetHtml(p);
    host.classList.add("on");
    try { host.querySelector(".hd-sheet").focus(); } catch (e) {}
    wireSheet(host, p);
    refreshLink();
  }
  function closeSheet() {
    var host = el("aogShareSheet");
    if (!host) return;
    host.classList.remove("on");
    host.innerHTML = "";
    SHEET.seq++;
    try { if (SHEET.lastFocus && SHEET.lastFocus.focus) SHEET.lastFocus.focus(); } catch (e) {}
  }
  function wireSheet(host, p) {
    var q = function (id) { return host.querySelector("#" + id); };
    var close = q("hdClose");
    if (close) close.addEventListener("click", closeSheet);
    host.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" || ev.key === "Esc") { ev.preventDefault(); closeSheet(); }
    });
    Array.prototype.forEach.call(host.querySelectorAll("[data-hde]"), function (b) {
      b.addEventListener("click", function () {
        SHEET.days = +b.getAttribute("data-hde") || 0;
        Array.prototype.forEach.call(host.querySelectorAll("[data-hde]"), function (o) {
          var on = (+o.getAttribute("data-hde") || 0) === SHEET.days;
          o.className = "hd-e" + (on ? " on" : "");
          o.setAttribute("aria-pressed", on ? "true" : "false");
        });
        say("");
        refreshLink();
      });
    });

    /* PRINT — synchronous from the click. The link and the QR were sealed
       when the sheet opened, precisely so this line can stay synchronous. */
    var pr = q("hdPrint");
    if (pr) pr.addEventListener("click", function () {
      var inc = q("hdIncQr");
      var withQr = !!(inc && inc.checked && SHEET.qr);
      printPacket(withQr ? (SHEET.sealed || p) : p, withQr ? SHEET.qr : null);
      if (withQr || SHEET.url) noteShared();
    });

    var cp = q("hdCopy");
    if (cp) cp.addEventListener("click", function () {
      var ta = q("hdUrl");
      if (!SHEET.url) { say(T("The link is still building — one moment.", "El enlace se está creando — un momento."), true); return; }
      var done = function () { say(T("Copied. Paste it wherever your school already shares things.", "Copiado. Pégalo donde tu escuela ya comparta cosas.")); noteShared(); };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(SHEET.url).then(done, function () { fallback(); });
          return;
        }
      } catch (e) {}
      fallback();
      function fallback() {
        try { ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length); } catch (e2) {}
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e3) {}
        if (ok) done();
        else say(T("This browser will not let a page copy for you — the link is selected above, press Ctrl/Cmd+C.",
                   "Este navegador no permite copiar por ti — el enlace está seleccionado arriba, presiona Ctrl/Cmd+C."), true);
      }
    });

    var dl = q("hdQrDl");
    if (dl) dl.addEventListener("click", function () {
      if (!SHEET.qr) { say(T("No QR code for this one.", "No hay código QR para este."), true); return; }
      try {
        var a = document.createElement("a");
        a.href = SHEET.qr;
        a.download = (fileName(p) + " QR.png").replace(/[\/\\:*?"<>|]/g, "-");
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        say(T("Saved to your downloads.", "Guardado en tus descargas."));
        noteShared();
      } catch (e) { say(T("This browser blocked the download. Right-click the code and save it instead.", "El navegador bloqueó la descarga. Haz clic derecho en el código y guárdalo."), true); }
    });

    var qp = q("hdQrPrint");
    if (qp) qp.addEventListener("click", function () {
      if (!SHEET.qr) { say(T("No QR code for this one.", "No hay código QR para este."), true); return; }
      injectCss();
      var host2 = printHost();
      host2.innerHTML = '<div class="hd-doc hd-print"><header class="hd-mast">' +
        '<div class="hd-brand">Architecture of Grace</div><h1>' + esc(p.t || "") + "</h1>" +
        '<div class="hd-sub">' + [p.s, p.c, p.r].filter(Boolean).map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div></header>" +
        '<div class="hd-qrprint" style="display:flex;"><img src="' + esc(SHEET.qr) + '" alt="' + esc(T("QR code", "Código QR")) + '">' +
        '<div class="hd-qrsay"><strong>' + esc(T("Scan to view this record digitally.", "Escanea para ver este registro en digital.")) + "</strong><br>" +
        esc(T("The data is inside the code itself.", "Los datos están dentro del propio código.")) +
        (SHEET.sealed && SHEET.sealed.x ? "<br>" + esc(T("Stops showing data after ", "Deja de mostrar datos después del ") + prettyISO(SHEET.sealed.x)) : "") +
        "</div></div></div>";
      var prev = document.title;
      document.title = fileName(p) + " QR";
      document.body.classList.add("hd-printing");
      aogPrintHold(function () {
        document.body.classList.remove("hd-printing");
        document.title = prev; host2.innerHTML = "";
      });
      try { window.print(); } catch (e) {}
      noteShared();
    });
  }
  var NOTED = false;
  function noteShared() {
    if (NOTED) return;
    NOTED = true;
    var p = SHEET.sealed || SHEET.pk || {};
    logWrite({ t: p.t || "", s: p.s || "", k: p.k || "", at: new Date().toISOString(), x: p.x || "", n: (SHEET.url || "").length });
  }

  /* ================================================================ THE VIEW
     §4 · What the recipient gets is the record and nothing else: no other
     students, no other classes, no teacher controls, no editing, no
     settings, no way to navigate into the rest of the application. It is a
     full-viewport overlay rather than a .screen precisely so it cannot be
     reached by any of the site's own routing, and so that whatever the app
     happened to boot underneath it is simply not visible.

     ⚠ IT IS NOT A .screen AND MUST NOT BECOME ONE. An ID rule that lays a
     section out beats .screen{display:none} and leaves it painted on every
     page of the site — the bug that would have blanked every page when the
     exit slip shipped. #aogShareView is display:none until .on is added. */
  function viewHost() {
    var h = el("aogShareView");
    if (!h) {
      h = document.createElement("div");
      h.id = "aogShareView";
      document.body.appendChild(h);
    }
    return h;
  }
  function noindex() {
    try {
      if (document.querySelector('meta[name="robots"][data-hd]')) return;
      var m = document.createElement("meta");
      m.name = "robots"; m.content = "noindex,noarchive,nosnippet";
      m.setAttribute("data-hd", "1");
      document.head.appendChild(m);
    } catch (e) {}
  }
  function shell(inner) {
    injectCss();
    noindex();
    var h = viewHost();
    h.innerHTML = inner;
    h.classList.add("on");
    document.body.classList.add("hd-shared");
    try { document.body.style.overflow = "hidden"; } catch (e) {}
    return h;
  }
  function bar(p) {
    return '<div class="hd-vbar hd-noprint">' +
      '<span class="hd-vt">Architecture of Grace</span>' +
      '<span class="hd-ro">' + esc(T("Read only", "Solo lectura")) + "</span>" +
      '<button type="button" class="hd-b" id="hdVPrint">' + esc(T("Print / Save PDF", "Imprimir / Guardar PDF")) + "</button>" +
      "</div>";
  }
  function lapsed(p) {
    return '<div class="hd-vbar hd-noprint"><span class="hd-vt">Architecture of Grace</span></div>' +
      '<div class="hd-lapsed"><h1>' + esc(T("This link has reached its end date", "Este enlace llegó a su fecha final")) + "</h1>" +
      "<p>" + esc(T("The teacher who shared this set it to stop showing data after ", "Quien lo compartió lo configuró para dejar de mostrar datos después del ") +
        prettyISO(p.x) + ".") + "</p>" +
      "<p>" + esc(T("Nothing is missing and nothing went wrong. Ask them for a fresh link if you still need the record.",
                    "No falta nada ni hubo un error. Pide un enlace nuevo si todavía necesitas el registro.")) + "</p></div>";
  }
  function openView(p) {
    p = sanitize(p);
    if (p.x && todayISO() > p.x) { shell(lapsed(p)); return; }
    var h = shell(bar(p) + docHtml(p, {}));
    try { document.title = fileName(p) + " · Architecture of Grace"; } catch (e) {}
    var b = el("hdVPrint");
    /* Through printPacket, so the shared page prints from a clean window
       too — same reasons, same fallback. Still synchronous in the click.
       [[aog-ios-print]] */
    if (b) b.addEventListener("click", function () { try { printPacket(p, null); } catch (e) { try { window.print(); } catch (e2) {} } });
  }
  function viewError(kind) {
    shell('<div class="hd-vbar hd-noprint"><span class="hd-vt">Architecture of Grace</span></div>' +
      '<div class="hd-lapsed"><h1>' + esc(T("This link could not be opened", "No se pudo abrir este enlace")) + "</h1>" +
      "<p>" + esc(kind === "nocrypto"
        ? T("This browser cannot unseal a shared record. Opening the link over https, in Chrome, Safari or Edge, will work.",
            "Este navegador no puede abrir un registro sellado. Abrir el enlace por https en Chrome, Safari o Edge funcionará.")
        : T("The link looks incomplete — most often it was broken across two lines by a message or an email. Ask for it again and paste the whole thing.",
            "El enlace parece incompleto — casi siempre se partió en dos líneas al enviarlo. Pídelo de nuevo y pega el enlace completo.")) + "</p>" +
      '<p><a href="./" style="color:var(--aog-dusk,#4A5578);font-weight:700;">' + esc(T("Go to Architecture of Grace", "Ir a Architecture of Grace")) + "</a></p></div>");
  }
  function hashToken() {
    var raw = "";
    try { raw = String(location.hash || "").replace(/^#/, ""); } catch (e) {}
    if (raw.indexOf(HASH_KEY + "=") !== 0) return "";
    return raw.slice(HASH_KEY.length + 1);
  }
  var BOOTED = false;
  function bootView() {
    var tok = hashToken();
    if (!tok || BOOTED) return false;
    BOOTED = true;
    shell('<div class="hd-vbar hd-noprint"><span class="hd-vt">Architecture of Grace</span></div>' +
          '<div class="hd-lapsed"><p>' + esc(T("Opening the record…", "Abriendo el registro…")) + "</p></div>");
    unseal(tok).then(function (p) { openView(p); },
                     function (e) { viewError(String(e && e.message) === "nocrypto" ? "nocrypto" : "shape"); });
    return true;
  }

  /* ================================================================ SOURCES
     ⚠ ONE TABLE. Every screen that can hand over a record is listed here
     once, and each entry does nothing but call that screen's own packet
     builder. The §-rules behind each number stay where they were written —
     this layer never re-implements one. Adding a screen is one line here
     and one packet() on the module that owns the data.

     A missing module returns null and the button simply does not appear,
     so a flag-hidden or not-yet-loaded screen costs nothing. */
  var SOURCES = {
    "exit:class":     function ()    { return (window.AOGExitView && window.AOGExitView.packet) ? window.AOGExitView.packet() : null; },
    "exit:student":   function (sid) { return (window.AOGExitStudent && window.AOGExitStudent.packet) ? window.AOGExitStudent.packet(sid) : null; },
    "iep:student":    function (who) { return (typeof window.aogIepPacket === "function") ? window.aogIepPacket(who) : null; },
    "checkin:student":function (sid) { return (window.AOGCheckins && window.AOGCheckins.packet) ? window.AOGCheckins.packet(sid) : null; }
  };

  /* One delegated listener for the whole document. Every panel here is
     re-rendered wholesale by its own module — the exit panel on a range
     chip, the IEP body on a keystroke — so a handler bound to a button is a
     handler that stops existing. A data attribute survives every render. */
  function onClick(ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("[data-hdshare]") : null;
    if (!b) return;
    ev.preventDefault();
    var id = b.getAttribute("data-hdshare") || "";
    var arg = b.getAttribute("data-hdarg") || "";
    var fn = SOURCES[id];
    var pk = null;
    try { pk = fn ? fn(arg) : null; } catch (e) { pk = null; }
    if (!pk) {
      try { alert(T("There is nothing to share here yet.", "Todavía no hay nada que compartir aquí.")); } catch (e2) {}
      return;
    }
    openSheet(pk);
  }

  /* The button, in one place, so every screen's reads the same.
     Callers put it in their own markup — this layer never reaches into
     another module's DOM to inject a control. */
  function buttonHtml(id, arg, opts) {
    opts = opts || {};
    return '<button type="button" class="' + (opts.cls || "hd-b ghost") + ' hd-noprint" data-hdshare="' + esc(id) + '"' +
      (arg ? ' data-hdarg="' + esc(arg) + '"' : "") + ">" +
      esc(opts.label || T("Print / Share", "Imprimir / Compartir")) + "</button>";
  }

  /* ------------------------------------------------------------------ boot */
  function init() {
    try { document.addEventListener("click", onClick, false); } catch (e) {}
    try { window.addEventListener("hashchange", function () { if (!BOOTED) bootView(); }); } catch (e) {}
    bootView();
  }
  if (document.body) init();
  else document.addEventListener("DOMContentLoaded", init);

  window.AOGHandoff = {
    version: VER,
    button: buttonHtml,
    share: openSheet,
    print: function (p) { printPacket(p, null); },
    close: closeSheet,
    doc: docHtml,
    sanitize: sanitize,
    seal: seal,
    unseal: unseal,
    link: linkFor,
    sources: SOURCES,
    org: defaultOrg,
    register: function (id, fn) { if (id && typeof fn === "function") SOURCES[String(id)] = fn; return id; },
    shared: logRead,
    /* for the harness and the console — never used by the UI */
    qrGrade: qrGrade,
    open: openView
  };
})();
