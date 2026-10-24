/* AOG-EXPORT-PRO-V1 (2026-10-23) — files that leave the Studio as a pro's would. Jimmy wants the Studio pro-grade everywhere.
   Fetched the first time a song is sent out (the Mixing Desk's Send it out, or ✉ Send to a friend); nothing of it loads before.

   What it makes:
   · WAV (best): the desk's own file, untouched, with a LIST INFO chunk after the sound (INAM title, IART artist, IPRD album,
     ICRD year, ICMT tempo and key, ISFT the Studio). Only the RIFF size changes; the sound's bytes are the very same.
   · M4A (small, plays everywhere): AAC-LC at 256 kb/s through WebCodecs AudioEncoder (Safari 26 on iPhone, iPad and Mac;
     Chrome and Edge on Mac, Windows, Android). Where AudioEncoder has no AAC (an iPhone before iOS 26), MediaRecorder makes
     the AAC in real time (it takes as long as the song) and the file is written again here, with its tags. A browser with
     neither (Firefox, Chrome on Linux) gets an MP3 and is told so. Our own MP4 writer: an edit list trims the encoder's
     priming (measured by decoding the frames and lining them up with the song) and the end, so the file is exactly as long
     as the song; tags as iTunes reads them (moov/udta/meta/ilst: ©nam ©ART ©alb ©day ©cmt ©too tmpo covr, and
     ----:com.apple.iTunes:initialkey).
   · MP3 (320 kb/s CBR): our own encoder (below, in a Worker built from this file's own text; up to four at once, each a
     stretch of the song). MPEG-1 Layer III, long blocks, plain stereo, a band-by-band noise check with scalefactors and the
     bit reservoir. Its tables are the standard's (ISO/IEC 11172-3: the analysis window and the Huffman codes, taken from
     PDMP3, released into the public domain under the Unlicense, and checked by decoding with ffmpeg). No LAME code: LAME is
     LGPL. An Info frame (the LAME-style tag: frames, bytes, a seek table, the encoder's delay and padding, both CRCs) and
     an ID3v2.3 tag (TIT2 TPE1 TALB TYER TBPM TKEY COMM TSSE, APIC for a cover, and the iTunSMPB comment Apple players use
     to trim the start and end).
   · The tags: the song's name, the artist (Listen back's name on this device, aog.studio.artist.v1, else "Me" / "Yo"),
     album "Architecture of Grace Studio", the year, the tempo and key from AOGSong, and a cover when one is given.
   · A lossy ceiling: before an M4A or MP3 is made the level comes down, if needed, so its true peak is −1.5 dBTP at most;
     then the file is decoded and measured, and made again a little lower until the decoded true peak is under −1 dBTP.
   Silent until used: no AudioContext but the real-time recorder's (owned by AOGVU), Workers only while a file is made,
   heavy work in the Workers; the page only joins the pieces. Test: music-handoff/tests/studio/export.js. */
(function () {
  "use strict";
  if (window.AOGExport) return;
  var D = document;

  /* ══════════ the Worker's code: the MP3 encoder, the true-peak meter, CRC-16, lining two sounds up ══════════ */
  function core(G) {
    /* ISO/IEC 11172-3 tables (from PDMP3, Unlicense): HLEN the Huffman code lengths (a=1 … s=19), HBITS the codes end to end
       (base64), for tables 1 2 3 5 6 7 8 9 10 11 12 13 15 16 24 and 32; DWIN the synthesis window D[0…256]·65536 */
    var HLEN = "acbcacfcceeefbbfcbeeefacfgccfgffghgfghccegcbdeddeffefgacfhhicdfgghfeghhigghiiigghiijhhijjjbcfhhicbdhhhfdfhhihhhiijhghijjihiikkccefhiccdefhddefghfefgghgfgghihghhiiacfhiiijcdfghihhffghijiigghijjijhhijjjjjiijjkkjkhhijjjkkihijjkkkbceghihiccdfhhgheefghihhgfgihjhihhhiijijhhijjkjkhgghijjjhghijjjjdceghiiiccdegghhedefghghfeffghhhgfgghhhihghhhihihgghhiijihhiiiijadfghiijijkkllmmcdfghhiiiijjklllffghiijjijjkklmmgghiijjjjkkkklmmhgiijjkkjkkllmmnihijjjkkkklkmmnniijjkkkkklllmmnnjijkkkllllmmmnppihijjkkllllmmnoojijjkkkmlmmnnnpojjjkkllmlmnmnopqkjjkllllmmmnooopkkkllmlmnnoooppplklmmmnnnnnopoppmllmmmonnqoooqppllmnnnonooppsrspcdegghiiijjkkklmdcefgghhhiijjjkkeeefgghhhiijjkkkfffgghhiiijjjkkkgfgghhiiiijjjkkkhgghhhiiiijjkkklighhhiiiijjjkkllihhiiiijjjjjkkklihhiiiijjjjkklllihiiiijjjkkkkllljiiijjjjjkkkklmljiiijjjjkkkklllmkjijjjkkkkkkllmmkjjjjkkkklllllmmlkkkkkkkllllmmlmlkkkkkklllllmmmmadfhiijjkkklllmicdfghiiijjjklklhffghiijjkjkkkllihghiijjjkklllmmjihiijjkkklllmmmiihiijkklkllmmmnjjiijkkkkllllmmnjjijjkkkllmmmmoojjjjkkkllmmmmnnnjkjjkkllmmmmnmnmkkkjkllllmnnnoonjlkkkllmnnnnnnmnklllllmmmmonnnnpknlllmmnnnpoooqokmmklnnmnnopoqonkihhiijjjkkkkkkkhddfghiijjkkkkkliddefghhiiijjjjjhfefgghhiiiijjjkggfgghhhiiiijjjjghgghhhhiiijjjjkgighhhhiiiijjjjjgihhhhiiiijjjjjkgjhhhiiiijjjjjkkhjiiiiiiiijjjjkkhjiiiiiijjjjjkkkhkiiiijjjjjjkkkkhkjiiijjjjjjkkkkhkjjjjjjjjjkkkkkhkjjjjjjjkkkkkkkhljjjjjjkkkkkkkkhhgggggggggghhhhdaddedfefdeefefff";
    var HBITS = "lFAshGIDgShGIChgrIgQcUOAhgQIB2UDoxKhAQxhAKKExAFMxxQUDLINEQgCDBYkDwWAg4YJBwDAEGBAKAYBABwYSDALUhAJAxzFDgcBiYiHg0FAIGhQgFgKAIMBAIAQAgA9ScHgfRSjA7sggQCnmJFBQEWOJDAgBDggMBAYAUULiMPAwEWZAwSCoYDlkjxUQBQEwMOGiwiC4FwkA4oJiELwbBYCQDD4WCkGgKgUAUAYcGgoCwQAYAoAQSEAcCAEAIAIAHFGCIQioPrQogERYUs5pIeD4oCmSyY7GwSDAKRkI+Og8CAHAUcGhACYIgPAgBwcMEhoOAkBABCwgMBgGAMAgAnQQlInEwa9ZJcgNBcXWcVHhQOio8wkOBwKgNLExIQCQKUER8dEQaCAIbGCw8KA4EAENhgQDAMAwCAFTipEMxcI4qDQIgNAQwLAFYBNoYTHxoWCEPhgIAYA+BGAsAceaXJB2MRNEEOhQDwKANgQgKgCBYoSj0cCeJIgBWEwHAJQNAPgGQBxGQHg5GESw5BbDYJINwKQMAGoBcAYHQ2MhgEwRguhUCaDoE8DoEoBiAUgCIvFonCUHMLwWgnhFBTBHAyAdgJgCQAPEgRBwF8LgVQWwWgVgSQJoEEBmAWABWAFQrFA8FgbhOCQCuCcB6BcA2ASgDwAUACAahkKQlBYDsGwFEEICYA5ANgCUASACcAFhGEIPg5BUCkCQBQAvAdAG4BUAWADQATAAWBqDILgmBGA8AzAkAbgGgEQAuAGwAcACQAHBECADgE4GIEsB4BoAYAFAA0ADgASABEACQAFAtAqBEBAAcAMgDEAtAHwBMAMAB4AFAAcABgADAYALgKAJwEgCMAagCoAgABcAGgAoADAABAAQAAgEADwCIA2AMgCgAdACwAiADAAQAAgAACAACAAAAAH5JqvTD4bCyPY2B3DWFEHoB/tg2uSHpmVEYaCmIIUg7BJOL2FKI7MCggDITg+CgDgELrjKtOfm5dJg7F0SA2CWDIDrRZUoQzkvk8kDkWRFDEIQLgNpqVGhHRoWyUPhgJ4fhaB8CgCY+oDw4Mi4TiCNxXEcMwkgzBGAeNpqYl4sEshD0LYkhwFQQAWAVAZLRWUk0kj8cC4JohBeEMGAGoEgChHIiGPB0MRYEwQw1BHBsCYCcBcA8bRqMxeLQpB0HIYBIByCkC4DYD4AkVhUKBKIwgBoFYRgbgqAyA6AkAWALDsIgeDcMguCUEEGIJwMAQAWANAHABwthYE4TBED8GgLQPgaAOAJgHAEACQAYPYPAdA1BeCsEAFgJQGAEQDAB4AoAIACCOCUEQHgOAUAiA0AqAgAUAMAIADAAgAFTiwlD8bhdFYJURQeQcIYYXgItDChGPhqLxTEsRA7hkhrDPCTzS5MQx0M4tChEgP4dQ3BohnBAtKk5FIA5DGK4nhGB+BqBjhgwtoNEskIhBHMZRZikE2IQHsHEGLC/BagSQh4djgZhcitEJEcH6HQGQDCBegb0EBvGw0GQXAshQCFEBD0DkDZDAhbgssChiGAtiwKUTolBBQ+Ay4Y0LoF8BvIN0AgVRUFET4nBHiCB8hqwyIYgL+FrhZIWIA4mhMEkRogxAA9Q1QZYMUGAC3ws4WMFgAWIsQIhh9D3DpDlDbDEhc4XCFoA3UG5A24CB5h4DsHMOMN8MYF1BcwXAFohZAWEDfBtADBlBwBvBtBsBhQwQX0LYDeAbsLDBuAbUGwACBdYaYaQaAXIL2FvBaYWUDY4NzBtoNsBsGDYQBBeQuIZguwtYLSCzBY4WKDYgbGBs4NggbMDZAABgUDgsFAiBYEgNAYAoA4BQBgBA/26hJQZ8Nk1SnVGqJTagVAgsdlZo8E9NhosZR1ZT9KUXKr7UyokA8N1nsJbKonaTodJUZ5caGfXRuMxfLJRU3SVDyEnIiw7+7ODSZC8WBQ0yR1Dg6DwoF+d3JrMpgLRVU9S1GUGGPl7eXVxa7OYa5VtSk0SNEEECmzc29tabLYi7WFTE5SpG0Jl9EWrajQZrJYK6WKpUBL0eQxAReRBT2OxV+vVqrlNUFMUhRNBJey5hanFwt1mr1YUtOkwSJFUJF/LqW4KUYrSrVCkT5NUrR9FEHQCXcuBagZRChJ4nCZpckiOIagqAC8FyLYWcETYliUJMkCNIihSAy+F2LiW0tJZQJAlGEWRJC0IQMvxei6FvLWWgsxZAArKEyI8aLEhwwQHBQMBOqFYUgjjMAcIME";
    var DWIN = [0,-1,-1,-1,-1,-1,-1,-2,-2,-2,-2,-3,-3,-4,-4,-5,-5,-6,-7,-7,-8,-9,-10,-11,-13,-14,-16,-17,-19,-21,-24,-26,-29,-31,-35,-38,-41,-45,-49,-53,-58,-63,-68,-73,-79,-85,-91,-97,-104,-111,-117,-125,-132,-139,-147,-154,-161,-169,-176,-183,-190,-196,-202,-208,213,218,222,225,227,228,228,227,224,221,215,208,200,189,177,163,146,127,106,83,57,29,-2,-36,-72,-111,-153,-197,-244,-294,-347,-401,-459,-519,-581,-645,-711,-779,-848,-919,-991,-1064,-1137,-1210,-1283,-1356,-1428,-1498,-1567,-1634,-1698,-1759,-1817,-1870,-1919,-1962,-2001,-2032,-2057,-2075,-2085,-2087,-2080,-2063,2037,2000,1952,1893,1822,1739,1644,1535,1414,1280,1131,970,794,605,402,185,-45,-288,-545,-814,-1095,-1388,-1692,-2006,-2330,-2663,-3004,-3351,-3705,-4063,-4425,-4788,-5153,-5517,-5879,-6237,-6589,-6935,-7271,-7597,-7910,-8209,-8491,-8755,-8998,-9219,-9416,-9585,-9727,-9838,-9916,-9959,-9966,-9935,-9863,-9750,-9592,-9389,-9139,-8840,-8492,-8092,-7640,-7134,6574,5959,5288,4561,3776,2935,2037,1082,70,-998,-2122,-3300,-4533,-5818,-7154,-8540,-9975,-11455,-12980,-14548,-16155,-17799,-19478,-21189,-22929,-24694,-26482,-28289,-30112,-31947,-33791,-35640,-37489,-39336,-41176,-43006,-44821,-46617,-48390,-50137,-51853,-53534,-55178,-56778,-58333,-59838,-61289,-62684,-64019,-65290,-66494,-67629,-68692,-69679,-70590,-71420,-72169,-72835,-73415,-73908,-74313,-74630,-74856,-74992,75038];
    var PI = Math.PI, ORDER = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 24, 32];
    var XLEN = { 1: 2, 2: 3, 3: 3, 5: 4, 6: 4, 7: 6, 8: 6, 9: 6, 10: 8, 11: 8, 12: 8, 13: 16, 15: 16, 16: 16, 24: 16, 32: 4 };
    /* the Huffman codes, unpacked once: HL[t] lengths, HC[t] codes, indexed x·xlen+y (table 32: the quadruple vwxy) */
    var HL = [], HC = [];
    (function () {
      var raw = atob(HBITS), at = 0, li = 0;
      function bit() { var b = (raw.charCodeAt(at >> 3) >> (7 - (at & 7))) & 1; at++; return b; }
      ORDER.forEach(function (t) {
        var n = t === 32 ? 16 : XLEN[t] * XLEN[t], L = new Uint8Array(n), C = new Uint32Array(n);
        for (var i = 0; i < n; i++) { var l = HLEN.charCodeAt(li++) - 96, c = 0; for (var k = 0; k < l; k++) c = (c << 1) | bit(); L[i] = l; C[i] = c; }
        HL[t] = L; HC[t] = C;
      });
    })();
    var LB16 = [1, 2, 3, 4, 6, 8, 10, 13], LB24 = [4, 5, 6, 7, 8, 9, 11, 13];
    function base(t) { return t < 16 ? t : t < 24 ? 16 : 24; }
    function linb(t) { return t < 16 ? 0 : t < 24 ? LB16[t - 16] : LB24[t - 24]; }
    var SFB = { 44100: [0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 52, 62, 74, 90, 110, 134, 162, 196, 238, 288, 342, 418, 576],
      48000: [0, 4, 8, 12, 16, 20, 24, 30, 36, 42, 50, 60, 72, 88, 106, 128, 156, 190, 230, 276, 330, 384, 576],
      32000: [0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 54, 66, 82, 102, 126, 156, 194, 240, 296, 364, 448, 550, 576] };
    var SRI = { 44100: 0, 48000: 1, 32000: 2 }, BRS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
    var SLEN = [[0, 0], [0, 1], [0, 2], [0, 3], [3, 0], [1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3], [4, 2], [4, 3]];
    /* the analysis window C = D/32, D kept as D·65536 for i = 0…256 (D[512−i] = −D[i], except at multiples of 64) */
    var CW = new Float64Array(512), i, k, n;
    for (i = 0; i < 512; i++) { var j0 = i <= 256 ? i : 512 - i, d0 = DWIN[j0]; if (i > 256 && i % 64) d0 = -d0; CW[i] = d0 / 65536 / 32; }
    /* the 32-band matrixing, S[k] = Σ V[m]·cos((2k+1)mπ/64), is a DCT-III: done the quick way, even and odd halves */
    var SCR = {};
    [32, 16, 8, 4, 2].forEach(function (n) { var h = n >> 1, c = new Float64Array(h); for (var k = 0; k < h; k++) c[k] = 1 / (2 * Math.cos(PI * (2 * k + 1) / (2 * n)));
      SCR[n] = { e: new Float64Array(h), o: new Float64Array(h), E: new Float64Array(h), O: new Float64Array(h), c: c }; });
    function dct3(v, out, n) {
      if (n === 1) { out[0] = v[0]; return; }
      var S = SCR[n], h = n >> 1, e = S.e, o = S.o, E = S.E, O = S.O, c = S.c, j;
      for (j = 0; j < h; j++) { e[j] = v[2 * j]; o[j] = v[2 * j + 1] + (j ? v[2 * j - 1] : 0); }
      dct3(e, E, h); dct3(o, O, h);
      for (j = 0; j < h; j++) { var ok = O[j] * c[j]; out[j] = E[j] + ok; out[n - 1 - j] = E[j] - ok; }
    }
    /* the long-block MDCT, folded to an 18-point DCT-IV: the sine window (and 1/9, so the standard decoder gives back the input) */
    var MDW = new Float64Array(36), MD = new Float64Array(18 * 18);
    for (n = 0; n < 36; n++) MDW[n] = Math.sin(PI / 36 * (n + 0.5)) / 9;
    for (k = 0; k < 18; k++) for (n = 0; n < 18; n++) MD[k * 18 + n] = Math.cos(PI / 18 * (n + 0.5) * (k + 0.5));
    var CI = [-0.6, -0.535, -0.33, -0.185, -0.095, -0.041, -0.0142, -0.0037], CS = CI.map(function (c) { return 1 / Math.sqrt(1 + c * c); }), CA = CI.map(function (c, i) { return c * CS[i]; });

    function Bits(cap) { this.b = new Uint8Array(cap); this.n = 0; }
    Bits.prototype.put = function (v, len) {
      while (len > 0) {
        var byte = this.n >> 3, free = 8 - (this.n & 7), take = len < free ? len : free;
        if (byte >= this.b.length) { var nb = new Uint8Array(this.b.length * 2); nb.set(this.b); this.b = nb; }
        this.b[byte] |= ((v >>> (len - take)) & ((1 << take) - 1)) << (free - take); this.n += take; len -= take;
      }
    };
    function encoder(sr, kbps) {
      var sfb = SFB[sr], bri = BRS.indexOf(kbps);
      if (!sfb || bri < 1) throw new Error("unsupported");
      /* each line's band; the threshold in quiet per band (a full-scale sine taken as 100 dB SPL) */
      var band = new Uint8Array(576), ath = new Float64Array(22);
      for (var s = 0; s < 22; s++) {
        for (var i = sfb[s]; i < sfb[s + 1]; i++) band[i] = s;
        var lo = sfb[s] * sr / 1152, hi = sfb[s + 1] * sr / 1152, mn = 1e9;
        for (var f = Math.max(lo, 20); f <= hi; f += Math.max(1, (hi - lo) / 8)) {
          var kf = f / 1000, a = 3.64 * Math.pow(kf, -0.8) - 6.5 * Math.exp(-0.6 * (kf - 3.3) * (kf - 3.3)) + 1e-3 * Math.pow(kf, 4);
          if (a < mn) mn = a;
        }
        ath[s] = Math.pow(10, (Math.min(mn, 60) - 100) / 10);
      }
      return { sfb: sfb, band: band, ath: ath, bri: bri, sri: SRI[sr] };
    }

    /* ── counting Huffman bits ── */
    function cands(mx) {
      if (mx === 0) return [0];
      if (mx <= 1) return [1, 2, 3];
      if (mx <= 2) return [2, 3, 5, 6];
      if (mx <= 3) return [5, 6, 7, 8, 9];
      if (mx <= 5) return [7, 8, 9, 10, 11, 12];
      if (mx <= 7) return [10, 11, 12, 13, 15];
      if (mx <= 15) return [13, 15];
      var need = 0, e = mx - 15, o = [], i; while ((1 << need) <= e) need++;
      for (i = 0; i < 8; i++) if (LB16[i] >= need) { o.push(16 + i); break; }
      for (i = 0; i < 8; i++) if (LB24[i] >= need) { o.push(24 + i); break; }
      return o;
    }
    function pairCost(t, ix, lo, hi) {
      if (t === 0) return 0;
      var b = base(t), L = HL[b], xl = XLEN[b], lb = linb(t), c = 0;
      for (var i = lo; i < hi; i += 2) {
        var x = ix[i], y = ix[i + 1];
        if (lb) c += L[(x > 14 ? 15 : x) * 16 + (y > 14 ? 15 : y)] + (x > 14 ? lb : 0) + (y > 14 ? lb : 0);
        else c += L[x * xl + y];
        if (x) c++; if (y) c++;
      }
      return c;
    }
    function regionMax(ix, lo, hi) { var m = 0; for (var i = lo; i < hi; i++) if (ix[i] > m) m = ix[i]; return m; }
    /* the 576 lines: big values (pairs), then count1 (quadruples of 0 and ±1), then zeros */
    function shape(ix) {
      var i = 576; while (i > 1 && ix[i - 1] === 0 && ix[i - 2] === 0) i -= 2;
      var c1end = i;
      while (i > 3 && ix[i - 1] <= 1 && ix[i - 2] <= 1 && ix[i - 3] <= 1 && ix[i - 4] <= 1) i -= 4;
      return { bigv: i >> 1, c1: (c1end - i) >> 2 };
    }
    function count1Cost(ix, lo, n) {
      var a = 0, b = 0, LA = HL[32];
      for (var q = 0, i = lo; q < n; q++, i += 4) { var v = ix[i], w = ix[i + 1], x = ix[i + 2], y = ix[i + 3], sg = v + w + x + y; a += LA[v * 8 + w * 4 + x * 2 + y] + sg; b += 4 + sg; }
      return a <= b ? [0, a] : [1, b];
    }
    /* the side information for the lines: the best split of the big values into three regions, each with its best table */
    function layout(sfb, ix) {
      var sh = shape(ix), b2 = sh.bigv * 2, c1 = count1Cost(ix, b2, sh.c1), best = null;
      if (b2 === 0) return { bigv: 0, c1: sh.c1, c1sel: c1[0], tab: [0, 0, 0], r0: 0, r1: 0, bits: c1[1] };
      var NS = 0; while (sfb[NS] < b2) NS++;
      var smax = new Int32Array(NS), pre = {}, k, k0, k1;
      for (k = 0; k < NS; k++) smax[k] = regionMax(ix, sfb[k], Math.min(sfb[k + 1], b2));
      function preOf(t) {   /* each band's bits with table t, summed up front; a band the table cannot hold counts a billion, so sums across it stay exact */
        var p = pre[t]; if (p) return p;
        p = pre[t] = new Float64Array(NS + 1);
        var lim = t < 16 ? XLEN[t] - 1 : 15 + (1 << linb(t)) - 1;
        for (var k = 0; k < NS; k++) p[k + 1] = p[k] + (smax[k] > lim ? 1e9 : pairCost(t, ix, sfb[k], Math.min(sfb[k + 1], b2)));
        return p;
      }
      var mxT = new Int32Array((NS + 1) * (NS + 1)), RT = 0;
      for (k0 = 0; k0 < NS; k0++) { var mm = 0; for (k1 = k0 + 1; k1 <= NS; k1++) { if (smax[k1 - 1] > mm) mm = smax[k1 - 1]; mxT[k0 * (NS + 1) + k1] = mm; } }
      function region(a, z) {   /* bands a…z−1: its bits returned, its table in RT */
        RT = 0; if (z <= a) return 0;
        var mx = mxT[a * (NS + 1) + z]; if (!mx) return 0;
        var c = cands(mx), bc = Infinity;
        for (var i = 0; i < c.length; i++) { var p = preOf(c[i]), v = p[z] - p[a]; if (v < bc) { bc = v; RT = c[i]; } }
        return bc;
      }
      for (var r0 = 0; r0 < 16; r0++) {
        var e0 = Math.min(r0 + 1, NS), A = region(0, e0), tA = RT;
        for (var r1 = 0; r1 < 8; r1++) {
          var e1 = Math.min(r0 + r1 + 2, NS), B = region(e0, e1), tB = RT, C = region(e1, NS), tC = RT, tot = A + B + C;
          if (!best || tot < best.hb) best = { hb: tot, r0: r0, r1: r1, tab: [tA, tB, tC] };
          if (e1 >= NS) break;
        }
        if (e0 >= NS) break;
      }
      return { bigv: sh.bigv, c1: sh.c1, c1sel: c1[0], tab: best.tab, r0: best.r0, r1: best.r1, bits: best.hb + c1[1] };
    }
    /* the quick count used while searching: the smallest group of tables that fits, a fixed split, nothing allocated */
    var G1 = [1], G2 = [2, 3], G3 = [5, 6], G5 = [7, 8, 9], G7 = [10, 11, 12], G15 = [13, 15], GE = [0, 0];
    function quickGroup(mx) {
      if (mx <= 1) return G1; if (mx <= 2) return G2; if (mx <= 3) return G3; if (mx <= 5) return G5; if (mx <= 7) return G7; if (mx <= 15) return G15;
      var need = 0, e = mx - 15, a = 7, b = 7, i; while ((1 << need) <= e) need++;
      for (i = 0; i < 8; i++) if (LB16[i] >= need) { a = i; break; } for (i = 0; i < 8; i++) if (LB24[i] >= need) { b = i; break; }
      GE[0] = 16 + a; GE[1] = 24 + b; return GE;
    }
    function quickRegion(ix, lo, hi) {
      if (hi <= lo) return 0;
      var mx = regionMax(ix, lo, hi); if (mx === 0) return 0;
      var g = quickGroup(mx), bc = 1e9;
      for (var k = 0; k < g.length; k++) { var v = pairCost(g[k], ix, lo, hi); if (v < bc) bc = v; }
      return bc;
    }
    function quickBits(sfb, ix) {
      var i = 576; while (i > 1 && ix[i - 1] === 0 && ix[i - 2] === 0) i -= 2;
      var c1end = i; while (i > 3 && ix[i - 1] <= 1 && ix[i - 2] <= 1 && ix[i - 3] <= 1 && ix[i - 4] <= 1) i -= 4;
      var b2 = i, a = 0, b = 0, LA = HL[32];
      for (var j = b2; j < c1end; j += 4) { var v = ix[j], w = ix[j + 1], x = ix[j + 2], y = ix[j + 3], sg = v + w + x + y; a += LA[v * 8 + w * 4 + x * 2 + y] + sg; b += 4 + sg; }
      var bits = a < b ? a : b; if (b2 === 0) return bits;
      var ns = 0; while (ns < 22 && sfb[ns + 1] < b2) ns++;
      var r0 = Math.max(1, Math.min(16, Math.round((ns + 1) * 0.36))), r1 = Math.max(r0 + 1, Math.min(r0 + 8, Math.round((ns + 1) * 0.7)));
      var e0 = Math.min(sfb[r0], b2), e1 = Math.min(sfb[r1], b2);
      return bits + quickRegion(ix, 0, e0) + quickRegion(ix, e0, e1) + quickRegion(ix, e1, b2);
    }

    /* ── quantizing one granule of one channel ── */
    var POW43 = new Float64Array(8207); for (i = 0; i < 8207; i++) POW43[i] = Math.pow(i, 4 / 3);
    var SPR = new Float64Array(22 * 22);
    for (var s0 = 0; s0 < 22; s0++) for (var t0 = 0; t0 < 22; t0++) { var dd = s0 - t0; SPR[s0 * 22 + t0] = dd >= 0 ? Math.pow(10, -1.5 * dd) : Math.pow(10, 2.5 * dd); }
    var FSE = 1.24;   /* the energy one granule of a full-scale sine has after the filterbank and the MDCT (measured) */
    var GX = { xr34: new Float64Array(576), amp: new Float64Array(576), ix: new Int32Array(576), en: new Float64Array(22), xmin: new Float64Array(22), bamp: new Float64Array(22) };
    function part2Of(sf) {
      var m1 = 0, m2 = 0, s; for (s = 0; s < 11; s++) if (sf[s] > m1) m1 = sf[s]; for (s = 11; s < 21; s++) if (sf[s] > m2) m2 = sf[s];
      var best = -1, bits = 1e9;
      for (var c = 0; c < 16; c++) if ((1 << SLEN[c][0]) > m1 && (1 << SLEN[c][1]) > m2) { var b = 11 * SLEN[c][0] + 10 * SLEN[c][1]; if (b < bits) { bits = b; best = c; } }
      return best < 0 ? null : { sc: best, bits: bits };
    }
    function granule(E, xr, budget, g0) {
      var sfb = E.sfb, band = E.band, xr34 = GX.xr34, en = GX.en, xmin = GX.xmin, amp = GX.amp, ix = GX.ix, bamp = GX.bamp, any = false, i, s;
      en.fill(0);
      for (i = 0; i < 576; i++) { var a = xr[i] < 0 ? -xr[i] : xr[i]; xr34[i] = Math.sqrt(a * Math.sqrt(a)); en[band[i]] += a * a; if (a > 1e-12) any = true; }
      var sf = new Int32Array(21), ixb = new Int32Array(576);
      if (!any) return { ix: ixb, gg: 0, sf: sf, sc: 0, part2: 0, lay: layout(sfb, ixb) };
      /* the noise each band may have: its energy spread to its neighbours, 20 dB down, never under the threshold in quiet */
      for (s = 0; s < 22; s++) { var m = 0, row = s * 22; for (var j = 0; j < 22; j++) m += en[j] * SPR[row + j]; xmin[s] = Math.max(m * 0.01, E.ath[s] * FSE); }
      var best = null, gPrev = g0 > 0 ? g0 : 180;
      function quant(gg) {
        var q = Math.pow(2, -0.1875 * (gg - 210)), mx = 0;
        for (var i = 0; i < 576; i++) { var v = Math.floor(xr34[i] * amp[i] * q + 0.4054); ix[i] = v; if (v > mx) mx = v; }
        return mx;
      }
      /* the finest step whose lines fit the bits (starting from the last step found, which is nearly always close) */
      function inner(avail) {
        var mxx = 0; for (var i = 0; i < 576; i++) { var v = xr34[i] * amp[i]; if (v > mxx) mxx = v; }
        var lo = Math.max(0, Math.ceil(210 + Math.log2(mxx / 8206.5) / 0.1875));
        function fits(g) { return quant(g) <= 8206 && quickBits(sfb, ix) <= avail; }
        var g = Math.max(lo, Math.min(255, gPrev));
        if (fits(g)) { while (g > lo && fits(g - 1)) g--; }
        else {
          var step = 1, okg = -1, bad = g;
          while (bad < 255) { var t = Math.min(255, bad + step); if (fits(t)) { okg = t; break; } bad = t; step *= 2; }
          if (okg < 0) g = 255;
          else { while (okg - bad > 1) { var mid = (okg + bad) >> 1; if (fits(mid)) okg = mid; else bad = mid; } g = okg; }
        }
        quant(g); gPrev = g;
        return g;
      }
      for (var it = 0; it < 10; it++) {
        for (s = 0; s < 22; s++) bamp[s] = s < 21 ? Math.pow(2, 0.375 * sf[s]) : 1;
        for (i = 0; i < 576; i++) amp[i] = bamp[band[i]];
        var p2 = part2Of(sf); if (!p2) break;
        var gg = inner(budget - p2.bits), step0 = Math.pow(2, (gg - 210) / 4), over = 0, overDb = 0, ob = [];
        for (s = 0; s < 22; s++) {
          var nz = 0, st = step0 / (s < 21 ? Math.pow(2, 0.5 * sf[s]) : 1);
          for (i = sfb[s]; i < sfb[s + 1]; i++) { var r = POW43[ix[i] > 8206 ? 8206 : ix[i]] * st, dx = (xr[i] < 0 ? -xr[i] : xr[i]) - r; nz += dx * dx; }
          if (nz > xmin[s]) { over++; overDb += 10 * Math.log10(nz / xmin[s]); ob.push(s); }
        }
        if (!best || over < best.over || (over === best.over && overDb < best.overDb)) { ixb.set(ix); best = { over: over, overDb: overDb, gg: gg, sf: Int32Array.from(sf), sc: p2.sc, part2: p2.bits, it: it }; }
        if (!over || it - best.it >= 2) break;   /* every band's noise masked, or two tries in a row no better */
        var amped = 0, stop = false;
        for (var q = 0; q < ob.length; q++) { s = ob[q]; if (s >= 21) continue; sf[s]++; amped++; if (sf[s] > (s < 11 ? 15 : 7)) stop = true; }
        if (!amped || stop) break;
        var all = true; for (s = 0; s < 21; s++) if (!sf[s]) { all = false; break; }
        if (all) break;
      }
      var lay = layout(sfb, ixb);
      /* never more than the budget (at the coarsest step lines come off the top until it fits; practically never) */
      for (var cut = 574; best.part2 + lay.bits > budget && cut >= 0; cut -= 2) { if (ixb[cut] || ixb[cut + 1]) { ixb[cut] = 0; ixb[cut + 1] = 0; lay = layout(sfb, ixb); } }
      return { ix: ixb, gg: best.gg, sf: best.sf, sc: best.sc, part2: best.part2, lay: lay };
    }
    /* ── one granule's main data: scalefactors, then the lines ── */
    function writeMain(W, E, g) {
      var sl = SLEN[g.sc], s;
      for (s = 0; s < 11; s++) W.put(g.sf[s], sl[0]);
      for (s = 11; s < 21; s++) W.put(g.sf[s], sl[1]);
      var ix = g.ix, sg = g.sign, L = g.lay, b2 = L.bigv * 2, sfb = E.sfb;
      var a = Math.min(sfb[L.r0 + 1], b2), bnd = Math.min(sfb[L.r0 + L.r1 + 2], b2);
      for (var i = 0; i < b2; i += 2) {
        var t = i < a ? L.tab[0] : i < bnd ? L.tab[1] : L.tab[2];
        if (t === 0) continue;
        var b = base(t), lb = linb(t), x = ix[i], y = ix[i + 1];
        if (lb) {
          var xx = x > 14 ? 15 : x, yy = y > 14 ? 15 : y;
          W.put(HC[b][xx * 16 + yy], HL[b][xx * 16 + yy]);
          if (x > 14) W.put(x - 15, lb); if (x) W.put(sg[i], 1);
          if (y > 14) W.put(y - 15, lb); if (y) W.put(sg[i + 1], 1);
        } else {
          var xl = XLEN[b];
          W.put(HC[b][x * xl + y], HL[b][x * xl + y]);
          if (x) W.put(sg[i], 1); if (y) W.put(sg[i + 1], 1);
        }
      }
      for (var q = 0, j = b2; q < L.c1; q++, j += 4) {
        var v = ix[j], w = ix[j + 1], x2 = ix[j + 2], y2 = ix[j + 3], idx = v * 8 + w * 4 + x2 * 2 + y2;
        if (L.c1sel) W.put(15 - idx, 4); else W.put(HC[32][idx], HL[32][idx]);
        if (v) W.put(sg[j], 1); if (w) W.put(sg[j + 1], 1); if (x2) W.put(sg[j + 2], 1); if (y2) W.put(sg[j + 3], 1);
      }
    }
    /* ── a stretch of the song: PCM in, frames out ──
       o: {L, R (starting at sample s0 of the song), s0, n (the song's length), sr, kbps, gain, fFrom (first frame worked),
           fKeep (first frame kept: the reservoir starts empty there), fEnd (one past the last)}. The frames before fKeep only
       bring the filterbank to where it would be, so stretches made side by side join seamlessly. */
    var DELAY = 1057;   /* samples from the input to the standard decoder's output: 528 here, 529 in the decoder (measured) */
    function encodeRange(o, progress) {
      var E = encoder(o.sr, o.kbps), L = o.L, R = o.R, s0 = o.s0, n = o.n, gain = o.gain, slot = 144 * o.kbps * 1000 / o.sr;
      var X = [new Float64Array(512), new Float64Array(512)], off = [0, 0], prev = [new Float64Array(576), new Float64Array(576)], cur = [new Float64Array(576), new Float64Array(576)];
      var Y = new Float64Array(64), V = new Float64Array(32), SB = new Float64Array(32), z = new Float64Array(36), fu = new Float64Array(18), xr = new Float64Array(576);
      var c, k, sb, pos = o.fFrom * 1152;
      function analyse(c, sub, tIdx, t0) {
        var buf = X[c], A = c ? R : L, bo = off[c] = (off[c] - 32) & 511;
        for (var j = 0; j < 32; j++) { var t = t0 + j, ii = t - s0; buf[(bo + 31 - j) & 511] = t < n && ii >= 0 && ii < A.length ? A[ii] * gain : 0; }
        for (var a = 0; a < 64; a++) { var sum = 0; for (var b = 0; b < 8; b++) { var q = a + 64 * b; sum += CW[q] * buf[(bo + q) & 511]; } Y[a] = sum; }
        V[0] = Y[16];
        for (var m = 1; m <= 16; m++) V[m] = Y[16 + m] + Y[16 - m];
        for (m = 17; m < 32; m++) V[m] = Y[16 + m] - Y[80 - m];
        dct3(V, SB, 32);
        for (var s = 0; s < 32; s++) sub[s * 18 + tIdx] = (s & 1) && (tIdx & 1) ? -SB[s] : SB[s];
      }
      var nF = o.fEnd - o.fFrom, flat = new Uint8Array(Math.ceil(nF * slot) + 8192), P = 0, Eend = 0, frames = [], lastG = [0, 0], W = new Bits(8192);
      for (var fr = o.fFrom; fr < o.fEnd; fr++) {
        /* this frame's size (1044 or 1045 bytes at 44.1 kHz): the padding bit keeps the average exact, counted from the song's start */
        var fbytes = Math.floor((fr + 1) * slot + 1e-9) - Math.floor(fr * slot + 1e-9), pad = fbytes > Math.floor(slot) ? 1 : 0, cap = fbytes - 36;
        if (fr === o.fKeep) Eend = P;
        var S = Math.max(Eend, P - 511), grs = [[], []];   /* where this frame's main data starts: at most 511 bytes back */
        var budgetAll = (P + cap - S) * 8, used = 0, mean = Math.floor(cap * 2);
        for (var gr = 0; gr < 2; gr++) {
          for (c = 0; c < 2; c++) for (var tt = 0; tt < 18; tt++) analyse(c, cur[c], tt, pos + tt * 32);
          pos += 576;
          for (c = 0; c < 2; c++) {
            var pv = prev[c], cu = cur[c];
            for (sb = 0; sb < 32; sb++) {
              var o18 = sb * 18;
              for (k = 0; k < 18; k++) { z[k] = pv[o18 + k] * MDW[k]; z[k + 18] = cu[o18 + k] * MDW[k + 18]; }
              for (k = 0; k < 9; k++) { fu[k] = -z[26 - k] - z[27 + k]; fu[k + 9] = z[k] - z[17 - k]; }
              for (k = 0; k < 18; k++) { var acc = 0, row = k * 18; for (var nn = 0; nn < 18; nn++) acc += MD[row + nn] * fu[nn]; xr[o18 + k] = acc; }
            }
            for (sb = 1; sb < 32; sb++) for (k = 0; k < 8; k++) {   /* the alias-reduction butterflies, as the decoder undoes them */
              var up = (sb - 1) * 18 + 17 - k, dn = sb * 18 + k, bu = xr[up], bd = xr[dn];
              xr[up] = bu * CS[k] + bd * CA[k]; xr[dn] = bd * CS[k] - bu * CA[k];
            }
            prev[c] = cu; cur[c] = pv;
            /* this granule's bits: its share, and half of what the reservoir holds beyond the shares still to come */
            var left = budgetAll - used, slotsLeft = (2 - gr) * 2 - c, extra = Math.max(0, left - mean * slotsLeft);
            var g = granule(E, xr, Math.min(4095, mean + Math.floor(extra * 0.5)), lastG[c]); lastG[c] = g.gg;
            var sg = g.sign = new Uint8Array(576); for (k = 0; k < 576; k++) if (xr[k] < 0) sg[k] = 1;
            g.p23 = g.part2 + g.lay.bits; used += g.p23; grs[gr][c] = g;
          }
        }
        W.b.fill(0); W.n = 0;
        for (gr = 0; gr < 2; gr++) for (c = 0; c < 2; c++) writeMain(W, E, grs[gr][c]);
        if (W.n !== used) throw new Error("bit count");
        var mainBytes = (W.n + 7) >> 3;
        if (S + mainBytes > P + cap) throw new Error("overflow");
        flat.set(W.b.subarray(0, mainBytes), S); Eend = S + mainBytes;
        if (fr >= o.fKeep) {
          var H = new Bits(36);   /* the header (MPEG-1 Layer III, no CRC, stereo, original), then the side information */
          H.put(0xFFF, 12); H.put(1, 1); H.put(1, 2); H.put(1, 1); H.put(E.bri, 4); H.put(E.sri, 2); H.put(pad, 1); H.put(0, 1);
          H.put(0, 2); H.put(0, 2); H.put(0, 1); H.put(1, 1); H.put(0, 2);
          H.put(P - S, 9); H.put(0, 3); H.put(0, 4); H.put(0, 4);
          for (gr = 0; gr < 2; gr++) for (c = 0; c < 2; c++) {
            var q = grs[gr][c], la = q.lay;
            H.put(q.p23, 12); H.put(la.bigv, 9); H.put(q.gg, 8); H.put(q.sc, 4); H.put(0, 1);
            H.put(la.tab[0], 5); H.put(la.tab[1], 5); H.put(la.tab[2], 5); H.put(la.r0, 4); H.put(la.r1, 3);
            H.put(0, 1); H.put(0, 1); H.put(la.c1sel, 1);
          }
          frames.push({ head: H.b, P: P, cap: cap });
        }
        P += cap;
        if (progress && (fr & 15) === 15) progress((fr - o.fFrom + 1) / nF);
      }
      var total = 0; frames.forEach(function (f) { total += 36 + f.cap; });
      var all = new Uint8Array(total), at = 0;
      frames.forEach(function (f) { all.set(f.head, at); all.set(flat.subarray(f.P, f.P + f.cap), at + 36); at += 36 + f.cap; });
      return all;
    }

    /* ── the true peak, 4× oversampled as ITU-R BS.1770 asks: a 49-tap Kaiser-windowed sinc in four phases ── */
    var TPK = (function () {
      var N = 49, M = 24, h = [], out = [], n;
      function I0(v) { var s = 1, q = 1; for (var k = 1; k < 30; k++) { q *= (v / 2 / k) * (v / 2 / k); s += q; } return s; }
      for (n = 0; n < N; n++) { var x = (n - M) / 4, r = (n - M) / M; h.push((x === 0 ? 1 : Math.sin(PI * x) / (PI * x)) * I0(6 * Math.sqrt(Math.max(0, 1 - r * r))) / I0(6)); }
      for (var p = 1; p < 4; p++) { var kk = []; for (n = p; n < N; n += 4) kk.push(h[n]); var sm = kk.reduce(function (a, b) { return a + b; }, 0); out.push(Float64Array.from(kk.map(function (v) { return v / sm; }))); }
      return out;
    })();
    var TPSUM = Math.max.apply(null, TPK.map(function (k) { return k.reduce(function (a, b) { return a + Math.abs(b); }, 0); }));
    function truePeak(chs) {
      var tp = 0, B = 256, K = TPK[0].length;
      chs.forEach(function (x) {
        var n = x.length, nb = Math.ceil(n / B), bm = new Float32Array(nb), i, j, b;
        for (b = 0; b < nb; b++) { var m = 0, e = Math.min(n, (b + 1) * B); for (i = b * B; i < e; i++) { var a = x[i] < 0 ? -x[i] : x[i]; if (a > m) m = a; } bm[b] = m; if (m > tp) tp = m; }
        for (b = 0; b < nb; b++) {
          if (Math.max(bm[b], b > 0 ? bm[b - 1] : 0) * TPSUM <= tp) continue;   /* nothing in here can pass what is found already */
          var e2 = Math.min(n, (b + 1) * B);
          for (j = b * B; j < e2; j++) for (var p = 0; p < 3; p++) {
            var hk = TPK[p], s = 0; for (var k = 0; k < K; k++) { var q = j - k; if (q >= 0) s += hk[k] * x[q]; }
            if (s < 0) s = -s; if (s > tp) tp = s;
          }
        }
      });
      return tp;
    }
    /* CRC-16 (0x8005, reflected), as the LAME-style info tag uses */
    var C16 = new Uint16Array(256);
    for (var cc = 0; cc < 256; cc++) { var rr = cc; for (var kb = 0; kb < 8; kb++) rr = rr & 1 ? (rr >>> 1) ^ 0xA001 : rr >>> 1; C16[cc] = rr; }
    function crc16(u, crc) { crc = crc || 0; for (var i = 0; i < u.length; i++) crc = (crc >>> 8) ^ C16[(crc ^ u[i]) & 255]; return crc; }
    /* where a decoded sound lines up with the song: ref is a loud stretch of the song, dec the decoded sound from the same
       place on; the lag with the best normalised match wins */
    function lag(ref, dec, max) {
      var N = ref.length, best = -1, bl = 0, rr = 0, i;
      for (i = 0; i < N; i++) rr += ref[i] * ref[i];
      var dd = 0; for (i = 0; i < N; i++) dd += dec[i] * dec[i];
      for (var l = 0; l <= max; l++) {
        if (l > 0) { var a = dec[l - 1], b = dec[l + N - 1] || 0; dd += b * b - a * a; }
        var s = 0; for (i = 0; i < N; i++) s += ref[i] * dec[i + l];
        var c = dd > 1e-12 ? s / Math.sqrt(rr * dd) : 0;
        if (c > best) { best = c; bl = l; }
      }
      return { lag: bl, corr: best };
    }

    var api = { encodeRange: encodeRange, truePeak: truePeak, crc16: crc16, lag: lag, DELAY: DELAY, _t: { layout: layout, quickBits: quickBits } };
    G.aogMp3 = api;
    if (typeof G.document === "undefined" && typeof G.importScripts === "function") {   /* as a Worker: one job a message */
      G.onmessage = function (e) {
        var d = e.data;
        try {
          if (d.op === "mp3") { var out = encodeRange(d, function (f) { G.postMessage({ id: d.id, progress: f }); }); G.postMessage({ id: d.id, v: out }, [out.buffer]); }
          else if (d.op === "tp") G.postMessage({ id: d.id, v: truePeak(d.chs) });
          else if (d.op === "crc") G.postMessage({ id: d.id, v: crc16(d.u) });
          else if (d.op === "lag") G.postMessage({ id: d.id, v: lag(d.ref, d.dec, d.max) });
        } catch (x) { G.postMessage({ id: d.id, err: String(x && x.message || x) }); }
      };
    }
    return api;
  }

  /* ══════════ words ══════════ */
  var W = {
    making: { m4a: ["Making your M4A file…", "Haciendo tu archivo M4A…"], mp3: ["Making your MP3 file…", "Haciendo tu archivo MP3…"] },
    live: ["Making your M4A file. It takes as long as the song.", "Haciendo tu archivo M4A. Tarda lo mismo que la canción."],
    noM4a: ["This device can't make M4A files, so here is an MP3. It plays everywhere too.", "Este aparato no puede hacer archivos M4A, así que aquí tienes un MP3. También se oye en todas partes."],
    failed: ["The {k} file did not work, so here is a WAV.", "El archivo {k} no funcionó, así que aquí tienes un WAV."],
    fmt: { m4a: ["M4A · 256 kb/s", "M4A · 256 kb/s"], mp3: ["MP3 · 320 kb/s", "MP3 · 320 kb/s"] },
    me: ["Me", "Yo"], mySong: ["My song", "Mi canción"],
    album: "Architecture of Grace Studio", made: ["Made in the Recording Studio at architectureofgrace.com", "Hecha en el estudio de grabación de architectureofgrace.com"]
  };
  function pick(a, es) { return a[es ? 1 : 0]; }
  var KEYS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  var NOTES = { en: ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"], es: ["Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "La♭", "La", "Si♭", "Si"] };

  /* ══════════ the tags ══════════ */
  function tagsOf(o) {
    o = o || {};
    var es = !!o.es, g = null, artist = o.artist;
    try { g = window.AOGSong && AOGSong.get(); } catch (e) {}
    if (artist == null) { try { artist = localStorage.getItem("aog.studio.artist.v1"); } catch (e) {} }
    artist = String(artist || "").replace(/\s+/g, " ").trim().slice(0, 80) || pick(W.me, es);
    var t = { title: String(o.title || "").replace(/\s+/g, " ").trim().slice(0, 120) || pick(W.mySong, es), artist: artist, album: W.album, year: String(new Date().getFullYear()),
      bpm: g && g.hasBpm ? Math.round(g.bpm) : 0, key: null, cover: o.cover || null, made: pick(W.made, es), es: es };
    if (g && g.hasKey) t.key = { short: KEYS[g.key] + (g.minor ? "m" : ""), words: NOTES[es ? "es" : "en"][g.key] + " " + (es ? (g.minor ? "menor" : "mayor") : (g.minor ? "minor" : "major")) };
    var parts = []; if (t.bpm) parts.push(t.bpm + " BPM"); if (t.key) parts.push(t.key.words);
    t.comment = parts.join(" · ");
    return t;
  }
  var TE = new TextEncoder();
  function cat(list) {
    var n = 0, i; for (i = 0; i < list.length; i++) n += list[i].length;
    var o = new Uint8Array(n), at = 0; for (i = 0; i < list.length; i++) { o.set(list[i], at); at += list[i].length; } return o;
  }
  function u32(n) { return [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255]; }
  function u16(n) { return [n >>> 8 & 255, n & 255]; }
  function le32(n) { return [n & 255, n >>> 8 & 255, n >>> 16 & 255, n >>> 24 & 255]; }
  function str(s) { var o = []; for (var i = 0; i < s.length; i++) o.push(s.charCodeAt(i) & 255); return o; }
  function U(a) { return a instanceof Uint8Array ? a : new Uint8Array(a); }
  /* WAV: LIST INFO, words in UTF-8, each zero-ended and padded to an even length */
  function wavInfo(t) {
    var sub = [];
    function add(id, s) { if (!s) return; var b = TE.encode(s), len = b.length + 1; sub.push(U(str(id).concat(le32(len))), b, new Uint8Array(len & 1 ? 2 : 1)); }
    add("INAM", t.title); add("IART", t.artist); add("IPRD", t.album); add("ICRD", t.year);
    add("ICMT", (t.comment ? t.comment + " · " : "") + t.made); add("ISFT", W.album);
    var body = cat([U(str("INFO"))].concat(sub));
    return cat([U(str("LIST").concat(le32(body.length))), body]);
  }
  /* the desk's .wav with the LIST chunk after its sound: the sound's bytes are not copied, only the RIFF size changes */
  async function wavFile(blob, t, name) {
    var head = new Uint8Array(await blob.slice(0, 12).arrayBuffer()), list = wavInfo(t);
    if (String.fromCharCode.apply(null, head.subarray(0, 4)) !== "RIFF") return blob;
    var riff = (head[4] | head[5] << 8 | head[6] << 16 | head[7] << 24) >>> 0, odd = blob.size & 1 ? new Uint8Array(1) : new Uint8Array(0);
    var size = riff + odd.length + list.length;
    return new File([head.subarray(0, 4), U(le32(size)), blob.slice(8), odd, list], name || blob.name || "song.wav", { type: "audio/wav" });
  }
  /* MP3: ID3v2.3. Words in ISO-8859-1 when they fit, else UTF-16 with its byte-order mark */
  function id3(t, smpb) {
    function wide(s) { for (var i = 0; i < s.length; i++) if (s.charCodeAt(i) > 255) return true; return false; }
    function enc(s, e, term) {   /* e 0: ISO-8859-1; e 1: UTF-16 with its byte-order mark */
      if (!e) return U(str(s).concat(term ? [0] : []));
      var o = [0xFF, 0xFE]; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); o.push(c & 255, c >> 8); } if (term) o.push(0, 0);
      return U(o);
    }
    function frame(id, body) { return cat([U(str(id).concat(u32(body.length), [0, 0])), body]); }
    function text(id, s) { if (!s) return null; var e = wide(s) ? 1 : 0; return frame(id, cat([U([e]), enc(s, e, false)])); }
    function comm(desc, s) { var e = wide(desc + s) ? 1 : 0; return frame("COMM", cat([U([e].concat(str("eng"))), enc(desc, e, true), enc(s, e, false)])); }
    var fr = [text("TIT2", t.title), text("TPE1", t.artist), text("TALB", t.album), text("TYER", t.year),
      t.bpm ? text("TBPM", String(t.bpm)) : null, t.key ? text("TKEY", t.key.short) : null,
      comm("", (t.comment ? t.comment + " · " : "") + t.made), text("TSSE", W.album)];
    if (smpb) fr.push(comm("iTunSMPB", smpb));
    if (t.cover && t.cover.bytes) fr.push(frame("APIC", cat([U([0].concat(str(t.cover.mime || "image/jpeg"), [0, 3, 0])), U(t.cover.bytes)])));
    var body = cat(fr.filter(Boolean)), n = body.length;
    return cat([U(str("ID3").concat([3, 0, 0], [n >> 21 & 127, n >> 14 & 127, n >> 7 & 127, n & 127])), body]);
  }
  /* M4A: the iTunes-style list, moov/udta/meta/ilst */
  function box(t) { var parts = [].slice.call(arguments, 1).map(U), body = cat(parts); return cat([U(u32(body.length + 8).concat(str(t))), body]); }
  function full(t, v, f) { return box.apply(null, [t, [v, f >> 16 & 255, f >> 8 & 255, f & 255]].concat([].slice.call(arguments, 3))); }
  function ilst(t, smpb) {
    function item(name, type, payload) { return box(name, box("data", u32(type), u32(0), payload)); }
    function txt(name, s) { return s ? item(name, 1, TE.encode(s)) : null; }
    function free(name, s) { return box("----", full("mean", 0, 0, str("com.apple.iTunes")), full("name", 0, 0, str(name)), box("data", u32(1), u32(0), TE.encode(s))); }
    var items = [txt("©nam", t.title), txt("©ART", t.artist), txt("©alb", t.album), txt("©day", t.year), txt("©cmt", (t.comment ? t.comment + " · " : "") + t.made), txt("©too", W.album)];
    if (t.bpm) items.push(item("tmpo", 21, u16(t.bpm)));
    if (t.key) items.push(free("initialkey", t.key.short));
    if (smpb) items.push(free("iTunSMPB", smpb));   /* the priming, the padding and the song's length, as Apple's players read them */
    if (t.cover && t.cover.bytes) items.push(item("covr", /png/.test(t.cover.mime || "") ? 14 : 13, U(t.cover.bytes)));
    return box("udta", full("meta", 0, 0, full("hdlr", 0, 0, u32(0), str("mdir"), str("appl"), u32(0), u32(0), [0]), box.apply(null, ["ilst"].concat(items.filter(Boolean)))));
  }

  /* ══════════ our MP4 writer: AAC or Opus frames, an edit list that trims to the song, the tags ══════════
     m: {kind: "aac"|"opus", rate (the media's clock), inRate, ch, sizes, durs, data, asc, br, prime (samples to skip at the
     start: the AAC encoder's priming, or Opus's pre-skip), keep (the song's length in the media's clock), tags} */
  var MATRIX = [].concat(u32(0x10000), u32(0), u32(0), u32(0), u32(0x10000), u32(0), u32(0), u32(0), u32(0x40000000));
  function mp4(m) {
    var count = m.sizes.length, total = 0, i;
    for (i = 0; i < count; i++) total += m.durs[i];
    var stts = [], run = null;
    for (i = 0; i < count; i++) { if (run && run[1] === m.durs[i]) run[0]++; else { run = [1, m.durs[i]]; stts.push(run); } }
    var entryHead = [0, 0, 0, 0, 0, 0].concat(u16(1), u32(0), u32(0), u16(m.ch), u16(16), u16(0), u16(0), u32(m.rate * 65536));
    var entry;
    if (m.kind === "aac") {
      var dsi = [0x05, m.asc.length].concat([].slice.call(m.asc)), dcd = [0x04, 13 + dsi.length, 0x40, 0x15, 0, 0, 0].concat(u32(m.br), u32(m.br), dsi);
      entry = box("mp4a", entryHead, full("esds", 0, 0, [0x03, 3 + dcd.length + 3, 0, 1, 0].concat(dcd, [0x06, 1, 0x02])));
    } else entry = box("Opus", entryHead, box("dOps", [0, m.ch].concat(u16(m.prime), u32(m.inRate), u16(0), [0])));
    var prime = Math.max(0, m.prime | 0), media = Math.max(0, total - prime), shown = m.keep > 0 ? Math.min(m.keep, media) : media;
    var edts = prime > 0 || shown < total ? box("edts", full("elst", 0, 0, u32(1), u32(shown), u32(prime), u16(1), u16(0))) : new Uint8Array(0);
    var ftyp = m.kind === "aac" ? box("ftyp", str("M4A "), u32(0), str("M4A "), str("isom"), str("mp42")) : box("ftyp", str("isom"), u32(512), str("isom"), str("iso2"), str("mp41"), str("Opus"));
    var udta = m.tags ? ilst(m.tags, m.kind === "aac" ? " 00000000 " + hex(prime, 8) + " " + hex(Math.max(0, total - prime - shown), 8) + " " + hex(shown, 16) + new Array(9).join(" 00000000") : "") : new Uint8Array(0);
    function moov(off) {
      var szs = []; for (var j = 0; j < count; j++) szs.push.apply(szs, u32(m.sizes[j]));
      var tt = []; stts.forEach(function (r) { tt.push.apply(tt, u32(r[0]).concat(u32(r[1]))); });
      var stbl = box("stbl", full("stsd", 0, 0, u32(1), entry), full("stts", 0, 0, u32(stts.length), tt), full("stsc", 0, 0, u32(1), u32(1), u32(count), u32(1)),
        full("stsz", 0, 0, u32(0), u32(count), szs), full("stco", 0, 0, u32(1), u32(off)));
      var minf = box("minf", full("smhd", 0, 0, u16(0), u16(0)), box("dinf", full("dref", 0, 0, u32(1), full("url ", 0, 1))), stbl);
      var mdia = box("mdia", full("mdhd", 0, 0, u32(0), u32(0), u32(m.rate), u32(total), u16(0x55c4), u16(0)),
        full("hdlr", 0, 0, u32(0), str("soun"), u32(0), u32(0), u32(0), str("SoundHandler"), [0]), minf);
      var tkhd = full("tkhd", 0, 3, u32(0), u32(0), u32(1), u32(0), u32(shown), u32(0), u32(0), u16(0), u16(0), u16(0x0100), u16(0), MATRIX, u32(0), u32(0));
      var mvhd = full("mvhd", 0, 0, u32(0), u32(0), u32(m.rate), u32(shown), u32(0x10000), u16(0x0100), u16(0), u32(0), u32(0), MATRIX, new Array(24).fill(0), u32(2));
      return box("moov", mvhd, box("trak", tkhd, edts, mdia), udta);
    }
    var off = ftyp.length + moov(0).length + 8;
    return new Blob([ftyp, moov(off), U(u32(m.data.length + 8).concat(str("mdat"))), m.data], { type: "audio/mp4" });
  }
  /* reading an MP4 (what MediaRecorder hands back, plain or in fragments): the AAC frames, the AudioSpecificConfig, the clock */
  function demux(u) {
    var dv = new DataView(u.buffer, u.byteOffset, u.byteLength), out = { frames: [], asc: null, rate: 0, ch: 2, shift: 0, codec: "" };
    function kids(a, b, cb) { var p = a; while (p + 8 <= b) { var sz = dv.getUint32(p), ty = String.fromCharCode(u[p + 4], u[p + 5], u[p + 6], u[p + 7]), h = 8; if (sz === 1) { sz = dv.getUint32(p + 8) * 4294967296 + dv.getUint32(p + 12); h = 16; } else if (sz === 0) sz = b - p; if (sz < h || p + sz > b) break; cb(ty, p + h, p + sz, p); p += sz; } }
    var sizes = [], offs = [], stsc = [], chunkOff = [], moofs = [], dflt = 0;
    function esds(a) {   /* walk the descriptors to tag 5 */
      var p = a + 4;
      function len() { var n = 0, c; do { c = u[p++]; n = (n << 7) | (c & 127); } while (c & 128); return n; }
      while (p < u.length) { var tag = u[p++], l = len(); if (tag === 3) p += 3; else if (tag === 4) p += 13; else if (tag === 5) { out.asc = u.slice(p, p + l); return; } else p += l; }
    }
    function walk(a, b) {
      kids(a, b, function (ty, s, e) {
        if (/^(moov|trak|mdia|minf|stbl|edts|moof|traf|mvex)$/.test(ty)) walk(s, e);
        else if (ty === "mdhd") out.rate = u[s] === 1 ? dv.getUint32(s + 20) : dv.getUint32(s + 12);
        else if (ty === "elst") { var n = dv.getUint32(s + 4); if (n) out.shift = u[s] === 1 ? dv.getUint32(s + 20) : dv.getInt32(s + 12); }
        else if (ty === "stsd") kids(s + 8, e, function (t2, s2, e2) { out.codec = t2; if (t2 === "mp4a") { out.ch = dv.getUint16(s2 + 16); kids(s2 + 28, e2, function (t3, s3) { if (t3 === "esds") esds(s3); }); } });
        else if (ty === "stsz") { var ss = dv.getUint32(s + 4), cnt = dv.getUint32(s + 8); for (var i = 0; i < cnt; i++) sizes.push(ss || dv.getUint32(s + 12 + 4 * i)); }
        else if (ty === "stco") { var c = dv.getUint32(s + 4); for (i = 0; i < c; i++) chunkOff.push(dv.getUint32(s + 8 + 4 * i)); }
        else if (ty === "co64") { c = dv.getUint32(s + 4); for (i = 0; i < c; i++) chunkOff.push(dv.getUint32(s + 8 + 8 * i) * 4294967296 + dv.getUint32(s + 12 + 8 * i)); }
        else if (ty === "stsc") { c = dv.getUint32(s + 4); for (i = 0; i < c; i++) stsc.push([dv.getUint32(s + 8 + 12 * i), dv.getUint32(s + 12 + 12 * i)]); }
        else if (ty === "trex") dflt = dv.getUint32(s + 16);
        else if (ty === "tfhd" || ty === "trun") moofs.push([ty, s, e]);
      });
    }
    var moofAt = [];
    kids(0, u.length, function (ty, s, e, p) { if (ty === "moof") { moofAt.push(p); moofs.push(["moof", p, e]); walk(s, e); } else if (ty === "moov") walk(s, e); });
    if (sizes.length && chunkOff.length) {   /* plain: chunks from stco, samples per chunk from stsc */
      var si = 0;
      for (var ci = 0; ci < chunkOff.length && si < sizes.length; ci++) {
        var per = 1; for (var k = 0; k < stsc.length; k++) if (stsc[k][0] <= ci + 1) per = stsc[k][1];
        var o = chunkOff[ci]; for (var q = 0; q < per && si < sizes.length; q++) { out.frames.push(u.subarray(o, o + sizes[si])); o += sizes[si]; si++; }
      }
    }
    var mb = 0, bdo = 0, dsz = dflt;   /* fragments: each trun's samples from its moof (default-base-is-moof) or its tfhd's base */
    moofs.forEach(function (x) {
      var s = x[1];
      if (x[0] === "moof") { mb = s; bdo = s; dsz = dflt; return; }
      var fl = dv.getUint32(s) & 0xffffff, p = s + 4;
      if (x[0] === "tfhd") { p += 4; bdo = mb; if (fl & 1) { bdo = dv.getUint32(p) * 4294967296 + dv.getUint32(p + 4); p += 8; } if (fl & 2) p += 4; if (fl & 8) p += 4; if (fl & 16) { dsz = dv.getUint32(p); p += 4; } return; }
      var cnt = dv.getUint32(p); p += 4; var at = bdo; if (fl & 1) { at = bdo + dv.getInt32(p); p += 4; } if (fl & 4) p += 4;
      for (var i = 0; i < cnt; i++) { if (fl & 0x100) p += 4; var sz = dsz; if (fl & 0x200) { sz = dv.getUint32(p); p += 4; } if (fl & 0x400) p += 4; if (fl & 0x800) p += 4; out.frames.push(u.subarray(at, at + sz)); at += sz; }
    });
    return out;
  }

  /* ══════════ Workers, made from this file's own text, only while a file is made ══════════ */
  var WURL = null, seq = 0;
  function spawn() {
    if (!WURL) WURL = URL.createObjectURL(new Blob(["(" + core.toString() + ")(self);"], { type: "text/javascript" }));
    var w = new Worker(WURL), wait = {};
    w.onmessage = function (e) { var d = e.data, j = wait[d.id]; if (!j) return; if (d.progress != null) { if (j.p) j.p(d.progress); return; } delete wait[d.id]; if (d.err) j.no(new Error(d.err)); else j.ok(d.v); };
    w.onerror = function (e) { Object.keys(wait).forEach(function (k) { wait[k].no(new Error(e.message || "worker")); }); wait = {}; };
    return { run: function (msg, tr, prog) { return new Promise(function (ok, no) { var id = ++seq; wait[id] = { ok: ok, no: no, p: prog }; msg.id = id; w.postMessage(msg, tr || []); }); }, end: function () { w.terminate(); } };
  }
  function cores() { var h = navigator.hardwareConcurrency || 2; return Math.max(1, Math.min(4, h - 1)); }
  function db(x) { return 20 * Math.log10(Math.max(x, 1e-9)); }
  function dbGain(d) { return Math.pow(10, d / 20); }
  async function truePeakW(chs) { var w = spawn(); try { return await w.run({ op: "tp", chs: chs.map(function (c) { return Float32Array.from(c); }) }); } finally { w.end(); } }
  async function decodeFile(blob, sr) {
    var O = window.OfflineAudioContext || window.webkitOfflineAudioContext, ab = await blob.arrayBuffer();
    var buf = await new Promise(function (ok, no) { var c = new O(2, 1, sr), p = c.decodeAudioData(ab, ok, no); if (p && p.then) p.then(ok, no); });
    return [buf.getChannelData(0), buf.numberOfChannels > 1 ? buf.getChannelData(1) : buf.getChannelData(0)];
  }
  var CEIL_PRE = -1.5, CEIL_FILE = -1.0, LIVE_PRE = -2.0;
  var NOTE_PCT = 5;

  /* ══════════ MP3 ══════════ */
  var DELAY = 1057, SPF = 1152;
  function infoFrame(sr, kbps, frames, audioBytes, musicCrc, encDelay, endPad) {
    var bri = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320].indexOf(kbps), sri = { 44100: 0, 48000: 1, 32000: 2 }[sr];
    var size = Math.floor(144 * kbps * 1000 / sr), f = new Uint8Array(size), dv = new DataView(f.buffer), total = size + audioBytes;
    f[0] = 0xFF; f[1] = 0xFB; f[2] = (bri << 4) | (sri << 2); f[3] = 0x04;
    f.set(str("Info"), 36); dv.setUint32(40, 0x0F); dv.setUint32(44, frames); dv.setUint32(48, total);
    for (var i = 0; i < 100; i++) f[52 + i] = Math.floor(i * 256 / 100);
    dv.setUint32(152, 0);
    f.set(str("LAMEAoG01"), 156);   /* the LAME-style tag's layout, so players trim the start and end; "AoG01" says who made it */
    f[165] = 0x01; f[176] = Math.min(255, kbps);
    f[177] = encDelay >> 4; f[178] = ((encDelay & 15) << 4) | (endPad >> 8); f[179] = endPad & 255;
    dv.setUint32(184, total); dv.setUint16(188, musicCrc);
    dv.setUint16(190, crc16(f.subarray(0, 190)));
    return f;
  }
  var C16 = null;
  function crc16(u) { if (!C16) { C16 = new Uint16Array(256); for (var c = 0; c < 256; c++) { var r = c; for (var k = 0; k < 8; k++) r = r & 1 ? (r >>> 1) ^ 0xA001 : r >>> 1; C16[c] = r; } } var crc = 0; for (var i = 0; i < u.length; i++) crc = (crc >>> 8) ^ C16[(crc ^ u[i]) & 255]; return crc; }
  function hex(n, w) { var s = n.toString(16).toUpperCase(); while (s.length < w) s = "0" + s; return s; }
  async function mp3Frames(L, R, sr, gain, kbps, prog) {
    var n = L.length, frames = Math.ceil((n + DELAY) / SPF), nw = Math.max(1, Math.min(cores(), Math.ceil(frames / 250))), PRE = 2;
    var per = Math.ceil(frames / nw), jobs = [], done = new Float64Array(nw), ws = [];
    try {
      for (var k = 0; k < nw; k++) {
        var a = k * per, b = Math.min(frames, a + per); if (a >= b) break;
        var from = Math.max(0, a - PRE), s0 = from * SPF, s1 = Math.min(n, b * SPF);
        var Ls = L.slice(Math.min(s0, n), s1), Rs = R.slice(Math.min(s0, n), s1), w = spawn(); ws.push(w);
        jobs.push((function (k, w, msg) { return w.run(msg, [msg.L.buffer, msg.R.buffer], function (f) { done[k] = f * (msg.fEnd - msg.fKeep); if (prog) { var s = 0; for (var i = 0; i < nw; i++) s += done[i]; prog(s / frames); } }); })(k, w,
          { op: "mp3", L: Ls, R: Rs, s0: s0, n: n, sr: sr, kbps: kbps, gain: gain, fFrom: from, fKeep: a, fEnd: b }));
      }
      var parts = await Promise.all(jobs);
      return { data: cat(parts), frames: frames, n: n };
    } finally { ws.forEach(function (w) { w.end(); }); }
  }
  async function mp3File(L, R, sr, gain, t, kbps, prog) {
    var r = await mp3Frames(L, R, sr, gain, kbps, prog), w = spawn(), crc;
    try { crc = await w.run({ op: "crc", u: r.data }); } finally { w.end(); }
    var endPad = r.frames * SPF - (DELAY - 529) - r.n;
    var info = infoFrame(sr, kbps, r.frames, r.data.length, crc, DELAY - 529, Math.min(4095, endPad));
    var smpb = " 00000000 " + hex(DELAY, 8) + " " + hex(r.frames * SPF - DELAY - r.n, 8) + " " + hex(r.n, 16) + new Array(9).join(" 00000000");
    return new Blob([id3(t, smpb), info, r.data], { type: "audio/mpeg" });
  }

  /* ══════════ AAC (and Opus, for Send to a friend) ══════════ */
  function u8(d) { if (!d) return null; if (d instanceof ArrayBuffer) return new Uint8Array(d.slice(0)); return new Uint8Array(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength)); }
  function breath() { return new Promise(function (r) { try { var c = new MessageChannel(); c.port1.onmessage = function () { c.port1.close(); r(); }; c.port2.postMessage(0); } catch (e) { setTimeout(r, 0); } }); }
  async function resample(L, R, sr, to) {
    var O = window.OfflineAudioContext || window.webkitOfflineAudioContext, n = Math.ceil(L.length * to / sr), off = new O(2, n, to);
    var b = off.createBuffer(2, L.length, sr); b.copyToChannel(L, 0); b.copyToChannel(R, 1);
    var s = off.createBufferSource(); s.buffer = b; s.connect(off.destination); s.start(0);
    var out = await off.startRendering(); return [out.getChannelData(0), out.getChannelData(1)];
  }
  async function pickCodec(sr, kinds, kbps) {
    if (!window.AudioEncoder || !window.AudioData || !AudioEncoder.isConfigSupported) return null;
    for (var i = 0; i < kinds.length; i++) for (var rates = [sr, 48000, 44100], j = 0; j < rates.length; j++) {
      var c = kinds[i] === "aac" ? { codec: "mp4a.40.2", sampleRate: rates[j], numberOfChannels: 2, bitrate: kbps * 1000, aac: { format: "aac" } }
        : { codec: "opus", sampleRate: rates[j], numberOfChannels: 2, bitrate: Math.min(kbps, 160) * 1000, opus: { frameDuration: 20000 } };
      try { var r = await AudioEncoder.isConfigSupported(c); if (r && r.supported) return { kind: kinds[i], cfg: c }; } catch (e) {}
    }
    return null;
  }
  /* WebCodecs: PCM in, frames out (the page only feeds it, a second at a time, resting between) */
  async function encodeWC(pick, L, R, gain, prog) {
    var rate = pick.cfg.sampleRate, chunks = [], desc = null, err = null;
    var enc = new AudioEncoder({ output: function (c, meta) {
      var b = new Uint8Array(c.byteLength); c.copyTo(b); chunks.push({ d: b, dur: c.duration });
      if (!desc && meta && meta.decoderConfig && meta.decoderConfig.description) desc = u8(meta.decoderConfig.description);
    }, error: function (e) { err = e; } });
    enc.configure(pick.cfg);
    var n = L.length, F = Math.min(rate, 24000), t0 = performance.now(), lastP = -1;
    for (var i = 0; i < n && !err; i += F) {
      var m = Math.min(F, n - i), plane = new Float32Array(m * 2);
      for (var k = 0; k < m; k++) { plane[k] = L[i + k] * gain; plane[m + k] = R[i + k] * gain; }
      var ad = new AudioData({ format: "f32-planar", sampleRate: rate, numberOfFrames: m, numberOfChannels: 2, timestamp: Math.round(i / rate * 1e6), data: plane });
      enc.encode(ad); ad.close();
      while (enc.encodeQueueSize > 3 && !err) await new Promise(function (ok) { if ("ondequeue" in enc) enc.addEventListener("dequeue", ok, { once: true }); else setTimeout(ok, 8); });
      if (performance.now() - t0 > 8) { await breath(); t0 = performance.now(); }
      if (prog) { var p = Math.floor(i / n * 100); if (p - lastP >= NOTE_PCT) { lastP = p; prog(i / n); } }
    }
    await enc.flush(); try { enc.close(); } catch (e) {}
    if (err || !chunks.length) throw err || new Error("no frames");
    var frames = [], durs = [];
    if (pick.kind === "aac") {
      chunks.forEach(function (c) { var d = c.d; if (d.length > 7 && d[0] === 0xff && (d[1] & 0xf6) === 0xf0) d = d.subarray(d[1] & 1 ? 7 : 9); frames.push(d); durs.push(1024); });
      var FREQS = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000];
      var asc = desc && desc.length >= 2 && desc.length < 64 ? desc : null;
      if (!asc) { var fi = Math.max(0, FREQS.indexOf(rate)); asc = new Uint8Array([(2 << 3) | (fi >> 1), ((fi & 1) << 7) | (2 << 3)]); }
      return { kind: "aac", rate: rate, frames: frames, durs: durs, asc: asc };
    }
    var pre = 312;
    if (desc && desc.length >= 19 && String.fromCharCode.apply(null, desc.subarray(0, 8)) === "OpusHead") pre = desc[10] | (desc[11] << 8);
    chunks.forEach(function (c) { frames.push(c.d); durs.push(c.dur > 0 ? Math.round(c.dur * 48000 / 1e6) : 960); });
    return { kind: "opus", rate: 48000, inRate: rate, frames: frames, durs: durs, pre: pre };
  }
  /* decoding the frames themselves (WebCodecs AudioDecoder): the sound as the file will play it, priming and all */
  async function decodeWC(e) {
    if (!window.AudioDecoder || e.kind !== "aac") return null;
    var cfg = { codec: "mp4a.40.2", sampleRate: e.rate, numberOfChannels: 2, description: e.asc };
    try { var s = await AudioDecoder.isConfigSupported(cfg); if (!s || !s.supported) return null; } catch (x) { return null; }
    var outs = [], err = null, dec = new AudioDecoder({ output: function (ad) {
      var n = ad.numberOfFrames, L = new Float32Array(n), R = new Float32Array(n);
      try { ad.copyTo(L, { planeIndex: 0, format: "f32-planar" }); ad.copyTo(R, { planeIndex: ad.numberOfChannels > 1 ? 1 : 0, format: "f32-planar" }); }
      catch (x) { var tmp = new Float32Array(n * ad.numberOfChannels); ad.copyTo(tmp, { planeIndex: 0, format: "f32" }); for (var i = 0; i < n; i++) { L[i] = tmp[i * ad.numberOfChannels]; R[i] = tmp[i * ad.numberOfChannels + (ad.numberOfChannels > 1 ? 1 : 0)]; } }
      outs.push([L, R]); ad.close();
    }, error: function (x) { err = x; } });
    dec.configure(cfg);
    var ts = 0, t0 = performance.now();
    for (var i = 0; i < e.frames.length && !err; i++) {
      dec.decode(new EncodedAudioChunk({ type: "key", timestamp: Math.round(ts * 1e6 / e.rate), duration: Math.round(1024 * 1e6 / e.rate), data: e.frames[i] })); ts += 1024;
      if (performance.now() - t0 > 8) { await breath(); t0 = performance.now(); }
    }
    await dec.flush(); try { dec.close(); } catch (x) {}
    if (err) return null;
    var n = 0; outs.forEach(function (o) { n += o[0].length; });
    var L = new Float32Array(n), R = new Float32Array(n), at = 0; outs.forEach(function (o) { L.set(o[0], at); R.set(o[1], at); at += o[0].length; });
    return [L, R];
  }
  /* the AAC encoder's priming: where the decoded sound lines up with the song (a loud stretch, matched in a Worker) */
  async function primingOf(L, R, dec, rate, max) {   /* max: how far to look (AAC priming is 1024 to 2112; a real-time recording also starts a little late) */
    var n = L.length, N = 4096, best = 0, bi = 0, lim = Math.min(n - N, rate * 30);
    for (var b = 0; b + N <= lim; b += N) { var e = 0; for (var i = b; i < b + N; i += 4) { var v = L[i] + R[i]; e += v * v; } if (e > best) { best = e; bi = b; } }
    if (!(best > 0) || dec[0].length < bi + N + max) return { lag: 0, corr: 0 };
    var ref = new Float32Array(N), dm = new Float32Array(N + max);
    for (i = 0; i < N; i++) ref[i] = L[bi + i] + R[bi + i];
    for (i = 0; i < N + max; i++) dm[i] = dec[0][bi + i] + dec[1][bi + i];
    var w = spawn(); try { return await w.run({ op: "lag", ref: ref, dec: dm, max: max }, [ref.buffer, dm.buffer]); } finally { w.end(); }
  }
  /* MediaRecorder, for a device whose WebCodecs has no AAC: the song played into a recorder (never to the speakers), in real time */
  var LIVE_MIME = "audio/mp4;codecs=mp4a.40.2";
  function liveCan() { try { return !!(window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(LIVE_MIME) && (window.AudioContext || window.webkitAudioContext)); } catch (e) { return false; } }
  async function encodeLive(L, R, sr, gain, kbps, prog) {
    var AC = window.AudioContext || window.webkitAudioContext, ctx;
    try { ctx = new AC({ sampleRate: sr }); } catch (e) { ctx = new AC(); }
    try { if (window.AOGVU && AOGVU.own) AOGVU.own(ctx); } catch (e) {}
    try {
      try { await Promise.race([ctx.resume(), new Promise(function (r) { setTimeout(r, 1500); })]); } catch (e) {}
      if (ctx.state !== "running") return null;
      var n = L.length, tail = Math.round(0.4 * ctx.sampleRate), b = ctx.createBuffer(2, Math.ceil(n * ctx.sampleRate / sr) + tail, ctx.sampleRate);
      var Ls = L, Rs = R; if (ctx.sampleRate !== sr) { var rs = await resample(L, R, sr, ctx.sampleRate); Ls = rs[0]; Rs = rs[1]; }
      var l = b.getChannelData(0), r = b.getChannelData(1); for (var i = 0; i < Ls.length; i++) { l[i] = Ls[i] * gain; r[i] = Rs[i] * gain; }
      var src = ctx.createBufferSource(), dst = ctx.createMediaStreamDestination(); src.buffer = b; src.connect(dst);
      var rec = new MediaRecorder(dst.stream, { mimeType: LIVE_MIME, audioBitsPerSecond: kbps * 1000 }), parts = [];
      rec.ondataavailable = function (e) { if (e.data && e.data.size) parts.push(e.data); };
      var stopped = new Promise(function (ok) { rec.onstop = ok; });
      var ended = new Promise(function (ok) { src.onended = ok; });
      rec.start(); src.start(); var t0 = ctx.currentTime, dur = b.duration, tick = setInterval(function () { if (prog) prog(Math.min(1, (ctx.currentTime - t0) / dur)); }, 1000);
      await ended; clearInterval(tick); rec.stop(); await stopped;
      var u = new Uint8Array(await new Blob(parts).arrayBuffer()), dm = demux(u);
      if (dm.codec !== "mp4a" || !dm.frames.length || !dm.asc) return null;
      return { kind: "aac", rate: dm.rate || ctx.sampleRate, frames: dm.frames, durs: dm.frames.map(function () { return 1024; }), asc: dm.asc, srcSr: ctx.sampleRate, live: true };
    } finally { try { ctx.close(); } catch (e) {} }
  }
  /* one lossy file, made, decoded and measured, made lower again if its decoded true peak passes −1 dBTP */
  async function lossy(type, L, R, sr, gain, t, o) {
    o = o || {};
    var tpIn = o.tpDb != null && isFinite(o.tpDb) ? o.tpDb : db(await truePeakW([L, R])) + db(gain);
    var g = gain * Math.min(1, dbGain((o.live ? LIVE_PRE : CEIL_PRE) - tpIn)), res = null;
    for (var pass = 0; pass < 3; pass++) {
      var blob, dec, prime = 0, e = null;
      if (type === "mp3") { blob = await mp3File(L, R, sr, g, t, o.kbps || 320, o.prog); dec = await decodeFile(blob, sr); }
      else {
        if (!o.pick && !o.live) return null;
        var Ls = L, Rs = R, rate = o.pick ? o.pick.cfg.sampleRate : sr;
        if (o.pick && rate !== sr) { var rs = await resample(L, R, sr, rate); Ls = rs[0]; Rs = rs[1]; }
        e = o.pick ? await encodeWC(o.pick, Ls, Rs, g, o.prog) : await encodeLive(L, R, sr, g, o.kbps, o.prog);
        if (!e) return null;
        var keep = Math.round(L.length * e.rate / sr);
        if (e.kind === "opus") {
          blob = mp4({ kind: "opus", rate: 48000, inRate: e.inRate, ch: 2, sizes: e.frames.map(function (f) { return f.length; }), durs: e.durs, data: cat(e.frames), prime: e.pre, keep: keep, tags: t });
          dec = await decodeFile(blob, sr);
        } else {
          var raw = await decodeWC(e);
          if (!raw) raw = await decodeFile(mp4({ kind: "aac", rate: e.rate, ch: 2, sizes: e.frames.map(function (f) { return f.length; }), durs: e.durs, data: cat(e.frames), asc: e.asc, br: (o.kbps || 256) * 1000, prime: 0, keep: 0 }), e.rate);
          var ref = e.rate === sr ? [L, R] : await resample(L, R, sr, e.rate), lg = await primingOf(ref[0], ref[1], raw, e.rate, e.live ? 22050 : 4096);
          prime = lg.corr > 0.5 ? lg.lag : (e.live ? 0 : 2112);
          dec = raw;
          blob = mp4({ kind: "aac", rate: e.rate, ch: 2, sizes: e.frames.map(function (f) { return f.length; }), durs: e.durs, data: cat(e.frames), asc: e.asc, br: (o.kbps || 256) * 1000, prime: prime, keep: keep, tags: t });
        }
      }
      var tp = db(await truePeakW(dec));
      res = { blob: blob, gain: g, tpDb: tp, kind: e ? e.kind : "mp3", prime: prime, passes: pass + 1 };
      if (tp <= CEIL_FILE) break;
      g *= dbGain(CEIL_PRE - tp);   /* over −1 dBTP once decoded: lower by what it passed, to −1.5, and make it again */
    }
    return res;
  }

  /* ══════════ what the pages call ══════════ */
  function swap(o, f) { try { if (o.url) URL.revokeObjectURL(o.url); } catch (e) {} o.file = f; o.url = URL.createObjectURL(f); }
  /* the Mixing Desk's Send it out: o is the file just made (OUT.song), x {Lc, Rc, sr, type, title, lang, line, cover} */
  async function desk(o, x) {
    var es = x.lang === "es", type = x.type === "m4a" || x.type === "mp3" ? x.type : "wav", t = tagsOf({ title: x.title, es: es, cover: x.cover });
    var base = String(o.file.name || "song.wav").replace(/\.wav$/i, ""), line = x.line, last = "";
    function say(s) { if (line && s !== last) { last = s; line.textContent = s; } }
    LAST = { type: type };
    if (type === "wav") { swap(o, await wavFile(o.file, t, o.file.name)); o.fmt = null; LAST.tags = t; return o; }
    var note = "", res = null, kind = type;
    try {
      if (type === "m4a") {
        var pk = await pickCodec(x.sr, ["aac"], 256), live = !pk && liveCan();
        if (pk || live) {
          say(live ? pick(W.live, es) : pick(W.making.m4a, es));
          res = await lossy("m4a", x.Lc, x.Rc, x.sr, o.g, t, { kbps: 256, tpDb: o.tpDb, pick: pk, live: live,
            prog: function (f) { say((live ? pick(W.live, es) : pick(W.making.m4a, es)) + " " + Math.floor(f * 100) + (es ? " %" : "%")); } });
        }
        if (!res) { note = pick(W.noM4a, es); kind = "mp3"; }
      }
      if (kind === "mp3") {
        say(pick(W.making.mp3, es));
        res = await lossy("mp3", x.Lc, x.Rc, x.sr, o.g, t, { kbps: 320, tpDb: o.tpDb, prog: function (f) { var p = Math.floor(f * 100 / NOTE_PCT) * NOTE_PCT; say(pick(W.making.mp3, es) + " " + p + (es ? " %" : "%")); } });
      }
    } catch (e) { res = null; note = pick(W.failed, es).replace("{k}", kind.toUpperCase()); }
    if (!res) { swap(o, await wavFile(o.file, t, o.file.name)); o.fmt = null; say(note || pick(W.failed, es).replace("{k}", kind.toUpperCase())); LAST.fell = true; return o; }
    swap(o, new File([res.blob], base + "." + kind, { type: kind === "mp3" ? "audio/mpeg" : "audio/mp4" }));
    o.fmt = { en: W.fmt[kind][0], es: W.fmt[kind][1] }; o.gFile = res.gain; o.kind = kind;
    if (isFinite(o.lufs)) o.lufs += db(res.gain / o.g);
    o.tpDb = res.tpDb;
    if (o.why === "aim" && o.lufs < -14.05) o.why = "peak";
    say(note);
    LAST = { type: kind, asked: type, tags: t, tpDb: res.tpDb, gain: res.gain, g: o.g, prime: res.prime, passes: res.passes, codec: res.kind };
    return o;
  }
  /* ✉ Send to a friend: a small file (AAC 128 kb/s, else Opus 96 kb/s, in an .m4a) with the same ceiling and tags; null when
     the browser has neither (the caller then sends the .wav, tagged with wav()) */
  async function small(L, R, sr, gain, o) {
    o = o || {};
    var t = tagsOf({ title: o.title, artist: o.artist, es: o.es, cover: o.cover }), pk = await pickCodec(sr, ["aac", "opus"], 128);
    if (!pk) return null;
    var res = await lossy("m4a", L, R, sr, gain, t, { kbps: pk.kind === "aac" ? 128 : 96, tpDb: o.tpDb, pick: pk });
    LAST = { type: "small", codec: res && res.kind, tpDb: res && res.tpDb, gain: res && res.gain, tags: t };
    return res ? { blob: res.blob, kind: res.kind, tpDb: res.tpDb, gain: res.gain } : null;
  }
  async function wav(blob, name, o) { return wavFile(blob, tagsOf(o || {}), name); }
  var LAST = null;
  window.AOGExport = { desk: desk, small: small, wav: wav, tags: tagsOf,
    /* for the tests (music-handoff/tests/studio/export.js) and nothing else */
    _t: { core: core, mp4: mp4, demux: demux, id3: id3, ilst: ilst, wavInfo: wavInfo, infoFrame: infoFrame, mp3File: mp3File, lossy: lossy, DELAY: DELAY, last: function () { return LAST; } } };
})();
