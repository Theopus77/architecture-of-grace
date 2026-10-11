
/* ═══ REMOVE ONE STUDENT, OR ONE RECORD ══════════════════════════════════════
   Until now the only delete in this product was "Delete everything on this
   device". That button is honest and correct, and useless in the two
   situations that actually happen:

     · a student asks to be taken out, and taking them out must not cost you
       every other student's work;
     · a code was typed as a test — "happy", "Mr. Ramsden" — and now sits in
       the reports forever.

   ONE implementation, mounted TWICE, because the two surfaces hold different
   things under different names:

     device — pseudonymous CODES: self-reflections, check-ins, queued rows,
              your private note, class-list membership. A copy may also be in
              the school's Sheet, which this cannot reach.
     iep    — real NAMES: goals with their data points, and meeting paperwork.
              Never synced anywhere, so this device is the only copy.

   They are deliberately NOT one list. Putting a code and a legal name in the
   same dropdown quietly joins them, which is the one thing the code scheme
   exists to prevent.

   Four rules both instances keep:
   1. NOTHING GOES THAT WAS NOT NAMED — every item listed, with its date.
   2. A BACKUP OF EXACTLY WHAT IS LEAVING is one click away.
   3. IT RE-READS BEFORE IT WRITES, and refuses on any drift (see fp()).
   4. IT SAYS WHAT IT CANNOT DO — the Google Sheet is not ours to clear.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var K = {
    results:  "aogScreener.v2.results",   /* self-reflections, plain array    */
    checkins: "aog.checkin.student.v1",   /* { logs: { CODE: { day: [ ] } } } */
    queue:    "aog.checkin.queue",        /* rows that never reached a Sheet  */
    remote:   "aog.checkin.remote",       /* rows pulled back from a Sheet    */
    priv:     "aog.pop.private.v1",       /* device-only note, keyed by CODE  */
    pop:      "aog.population.v1",        /* class lists (membership only)    */
    iep:      "aog.iep.v1",               /* { goals:{id:g}, data:{id:[pts]} }*/
    iepdocs:  "aog.iepdocs.v1",           /* { docs:{id:d}, goalMeta:{id:m} } */
    /* ⚠ ADDED WITH THE HOME↔SCHOOL LAYER. A goal that has been connected to
       home has a config here and a family's observations under its opaque
       key. Both must LEAVE WITH THE GOAL and both must be IN THE BACKUP that
       leaves with it — see [[aog-backup-symmetry]], the most serious defect
       this product has had. If you add another store keyed by goal id, add
       it here in the same three places: items(), its data payload, apply(). */
    iephome:  "aog.iep.home.v1"           /* { cfg:{id:c}, obs:{key:[o]} }   */
  };

  function rd(k, dflt) {
    try { var v = JSON.parse(localStorage.getItem(k)); return (v === null || v === undefined) ? dflt : v; }
    catch (e) { return dflt; }
  }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function code(s) { return String(s === null || s === undefined ? "" : s).trim().toUpperCase(); }
  function esc(s) {
    return String(s === null || s === undefined ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function arr(v) { return Object.prototype.toString.call(v) === "[object Array]" ? v : []; }
  function keysOf(o) { return (o && typeof o === "object") ? Object.keys(o) : []; }

  /* ⚠ A KEY MUST IDENTIFY THE ROW, NOT JUST ITS POSITION.
     Keys used to be store+index. An index is not an identity: if anything
     inserts a row while the list sits open, position 0 silently becomes a
     different child's answer, and a presence check waves it through because
     the KEY still exists. Every key now carries a fingerprint of the row's
     own content, so a shifted or edited row simply stops matching. */
  function fp(v) {
    var s = "", i, h = 5381;
    try { s = JSON.stringify(v); } catch (e) { s = String(v); }
    for (i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; }
    return h.toString(36) + "." + s.length.toString(36);
  }
  function when(ts) {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts || "");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " +
           d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  function dayLabel(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return String(iso || "");
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  /* ⚠ MATCH LOOSELY, DISPLAY EXACTLY.
     Codes are typed by children, so "Hope" and "hope" are one student and must
     match case-insensitively. But the list has to show it the way it was
     entered — a teacher hunting for "Mr. Ramsden" and shown "MR. RAMSDEN" is
     being asked to trust those are the same row, on the one screen whose only
     job is deleting the right one. Key folded, label as stored. */
  function roster(collectors) {
    var seen = {}, order = [];
    function add(c) {
      var raw = String(c === null || c === undefined ? "" : c).trim();
      var k = code(raw);
      if (!k || seen[k]) return;
      seen[k] = raw || k; order.push(k);
    }
    collectors.forEach(function (fn) { fn(add); });
    return order.sort(function (a, b) {
      return String(seen[a]).toLowerCase() < String(seen[b]).toLowerCase() ? -1 : 1;
    }).map(function (k) { return { key: k, label: seen[k] }; });
  }

  /* ══════════════════════════════════════════ SOURCE 1 · this device, by code */
  /* the science pull, read the same way everywhere on this dashboard */
  function pracRows() {
    try {
      var a = JSON.parse(localStorage.getItem("aog.practice.remote") || "[]");
      return Object.prototype.toString.call(a) === "[object Array]" ? a : [];
    } catch (e) { return []; }
  }
  function pracKey(r) {
    try { return window.aogPracticeDel.keyOf(r); } catch (e) { return ""; }
  }

  var DEVICE = {
    id: "aogRm",
    title: "Remove one student, or one day",
    sub: "Pick a code, tick only what should go, and nothing else on this device is touched. " +
         "Take a backup first if there is any doubt — this cannot be undone.",
    whoLabel: "Student code",
    button: "Remove one student, or one day…",
    foot: '<strong>This clears this device only.</strong> ' +
      "If self-reflections or check-ins were synced, the row is still in your school's Google Sheet — and a later " +
      '"Pull from sheet" would bring it back. To remove it there: open the Sheet, sort or filter by the ' +
      "student code, select those rows, right-click, Delete rows. The Sheet is the record of truth; this is a copy.",

    students: function () {
      return roster([
        function (add) { arr(rd(K.results, [])).forEach(function (r) { if (r) add(r.studentId); }); },
        function (add) { keysOf((rd(K.checkins, {}) || {}).logs).forEach(add); },
        function (add) { arr(rd(K.queue, [])).forEach(function (r) { if (r) add(r.studentId); }); },
        function (add) { arr(rd(K.remote, [])).forEach(function (r) { if (r) add(r.studentId); }); },
        function (add) { keysOf(rd(K.priv, {})).forEach(add); },
        function (add) { arr((rd(K.pop, {}) || {}).classes).forEach(function (cl) { arr(cl && cl.members).forEach(add); }); },
        /* ⚠ the science pull. A student who exists ONLY as probe rows — a test
           student, above all — was invisible to this picker until now. */
        function (add) { arr(pracRows()).forEach(function (r) { if (r) add(r.studentId); }); }
      ]);
    },

    items: function (sid) {
      sid = code(sid);
      var items = [];
      if (!sid) return items;

      arr(rd(K.results, [])).forEach(function (r, i) {
        if (!r || code(r.studentId) !== sid) return;
        items.push({ key: "results|" + i + "|" + fp(r), store: "results", i: i, data: r,
          group: "Self-reflections",
          label: "Self-reflection" + (r.window ? " · " + r.window : "") +
                 (r.grade != null && r.grade !== "" ? " · grade " + r.grade : ""),
          sub: when(r.timestamp) });
      });

      var mine = ((rd(K.checkins, {}) || {}).logs || {})[sid] || {};
      Object.keys(mine).sort().reverse().forEach(function (day) {
        arr(mine[day]).forEach(function (e, i) {
          e = e || {};
          var bits = [];
          if (e.period) bits.push(e.period);
          if (e.readiness != null) bits.push("ready " + e.readiness);
          items.push({ key: "checkin|" + day + "|" + i + "|" + fp(e), store: "checkin", day: day, i: i, data: e,
            group: "Daily check-ins",
            label: "Check-in · " + dayLabel(day),
            sub: bits.join(" · ") || when(e.timestamp) });
        });
      });

      [["queue", K.queue, "Not yet sent to the Sheet"], ["remote", K.remote, "Pulled back from the Sheet"]]
        .forEach(function (spec) {
          arr(rd(spec[1], [])).forEach(function (r, i) {
            if (!r || code(r.studentId) !== sid) return;
            items.push({ key: spec[0] + "|" + i + "|" + fp(r), store: spec[0], i: i, data: r,
              group: spec[2],
              label: (spec[0] === "queue" ? "Queued row" : "Copy of a Sheet row") + (r.date ? " · " + dayLabel(r.date) : ""),
              sub: r.period || when(r.timestamp) });
          });
        });

      /* ══ THE SCIENCE PULL ═══════════════════════════════════════════
         Probe rows the activity pages sent back. ⚠ Keyed by what the SHEET
         carries — student, activity, date, set — never by array index, so
         the tombstone still matches after the next pull re-orders them. */
      pracRows().forEach(function (r) {
        if (!r || code(r.studentId) !== sid) return;
        var bits = [];
        if (r.itemsTotal != null) bits.push(r.independent + " of " + r.itemsTotal + " with no hint");
        if (r.setNo != null) bits.push("set " + r.setNo);
        items.push({ key: "practice|" + pracKey(r), store: "practice", rkey: pracKey(r), data: r,
          group: "Practice probes",
          label: (r.activityName || r.activityId || "Practice") +
                 (r.date ? " · " + dayLabel(r.date) : ""),
          sub: bits.join(" · ") || when(r.timestamp) });
      });

      var priv = rd(K.priv, {}) || {};
      if (Object.prototype.hasOwnProperty.call(priv, sid)) {
        items.push({ key: "priv|" + fp(priv[sid]), store: "priv", data: priv[sid],
          group: "Your private note",
          label: "Private note (this device only, never synced)",
          sub: String(priv[sid] || "").slice(0, 60) });
      }

      arr((rd(K.pop, {}) || {}).classes).forEach(function (cl, ci) {
        if (!cl || arr(cl.members).map(code).indexOf(sid) < 0) return;
        items.push({ key: "member|" + ci + "|" + fp(cl.members), store: "member", i: ci, data: cl.id,
          group: "Class lists",
          label: "Listed in " + (cl.period || cl.course || cl.classId || "a class"),
          sub: "Removing this takes the code off the list — it deletes no answers" });
      });

      return items;
    },

    apply: function (sid, targets) {
      var kill = { results: {}, checkin: {}, queue: {}, remote: {}, priv: false, member: {} }, removed = 0;
      var killPrac = [];
      targets.forEach(function (it) {
        if (it.store === "checkin") {
          kill.checkin[it.day] = kill.checkin[it.day] || {};
          kill.checkin[it.day][it.i] = 1;
        } else if (it.store === "priv") { kill.priv = true; }
        else if (it.store === "practice") { killPrac.push(it.rkey); }
        else if (kill[it.store]) { kill[it.store][it.i] = 1; }
      });
      /* ⚠ THROUGH THE MODULE, NEVER STRAIGHT INTO THE STORE. It is what
         writes the tombstone, and a delete with no tombstone is undone by
         the next Pull from sheet. */
      if (killPrac.length) {
        try { removed += (window.aogPracticeDel.remove(killPrac) || []).length; } catch (ePr) {}
      }

      var res = arr(rd(K.results, []));
      var keptRes = res.filter(function (r, idx) { if (kill.results[idx]) { removed++; return false; } return true; });
      if (keptRes.length !== res.length) wr(K.results, keptRes);

      var store = rd(K.checkins, {}) || {}, logs = store.logs || {}, mine = logs[sid];
      if (mine) {
        Object.keys(mine).forEach(function (day) {
          var dead = kill.checkin[day];
          if (!dead) return;
          var kept = arr(mine[day]).filter(function (e, idx) { if (dead[idx]) { removed++; return false; } return true; });
          if (kept.length) mine[day] = kept; else delete mine[day];
        });
        if (!Object.keys(mine).length) delete logs[sid];
        store.logs = logs; wr(K.checkins, store);
      }

      [["queue", K.queue], ["remote", K.remote]].forEach(function (spec) {
        var rows = arr(rd(spec[1], []));
        var kept = rows.filter(function (r, idx) { if (kill[spec[0]][idx]) { removed++; return false; } return true; });
        if (kept.length !== rows.length) wr(spec[1], kept);
      });

      if (kill.priv) {
        var priv = rd(K.priv, {}) || {};
        if (Object.prototype.hasOwnProperty.call(priv, sid)) { delete priv[sid]; removed++; wr(K.priv, priv); }
      }

      var pop = rd(K.pop, null);
      if (pop && arr(pop.classes).length) {
        var touched = false;
        pop.classes.forEach(function (cl, ci) {
          if (!kill.member[ci] || !cl) return;
          var before = arr(cl.members).length;
          cl.members = arr(cl.members).filter(function (m) { return code(m) !== sid; });
          if (cl.members.length !== before) { removed++; touched = true; }
        });
        if (touched) wr(K.pop, pop);
      }

      /* The in-memory copy of rows pulled from the Sheet is not localStorage,
         so it survives the writes above and would repopulate the report. */
      try {
        if (typeof REMOTE_RECORDS !== "undefined" && REMOTE_RECORDS && REMOTE_RECORDS.length) {
          REMOTE_RECORDS = REMOTE_RECORDS.filter(function (r) { return code(r && r.studentId) !== sid; });
        }
      } catch (e) {}

      return removed;
    },

    after: function () {
      try { if (typeof window.refreshAdmin === "function") window.refreshAdmin(); } catch (e) {}
      try { if (window.AOGPop && typeof window.AOGPop.render === "function") window.AOGPop.render(); } catch (e) {}
    },

    mount: function (panel, button) {
      var acts = document.querySelector(".pv-actions");
      if (!acts) return false;
      /* Deliberately BEFORE the red button: the gentler tool should be the one
         a hurried teacher reaches first. */
      acts.insertBefore(button, acts.querySelector(".pv-danger") || null);
      acts.parentNode.insertBefore(panel, acts.nextSibling);
      return true;
    }
  };

  /* ═══════════════════════════════════════════ SOURCE 2 · IEP work, by name */
  var IEP = {
    id: "aogRmIep",
    title: "Remove one student's IEP records",
    subtitle: "goals, data points and paperwork",
    sub: "Pick a student, tick only what should go, and every other student's goals stay exactly as they are. " +
         "Removing a goal removes its data points with it.",
    whoLabel: "Student",
    button: "Remove one student's IEP records…",
    foot: '<strong>This device holds the only copy.</strong> ' +
      "IEP goals, data points and meeting paperwork are never synced anywhere — there is no Sheet, no server and " +
      "no backup but the one you download. Deleting here deletes them for good. If this is a student record you " +
      "are required to retain, export the report or the paperwork first.",

    students: function () {
      var iep = rd(K.iep, {}) || {}, docs = (rd(K.iepdocs, {}) || {}).docs || {};
      return roster([
        function (add) { keysOf(iep.goals).forEach(function (id) { add((iep.goals[id] || {}).student); }); },
        function (add) { keysOf(docs).forEach(function (id) { add((docs[id] || {}).student); }); }
      ]);
    },

    items: function (sid) {
      sid = code(sid);
      var items = [];
      if (!sid) return items;
      var iep = rd(K.iep, {}) || {}, goals = iep.goals || {}, data = iep.data || {};

      keysOf(goals).forEach(function (id) {
        var g = goals[id] || {};
        if (code(g.student) !== sid) return;
        var pts = arr(data[id]).length;
        var hm = rd(K.iephome, {}) || {};
        var hc = (hm.cfg || {})[id] || null;
        var ho = (hc && hc.key) ? arr((hm.obs || {})[hc.key]) : [];
        items.push({ key: "goal|" + id + "|" + fp(g), store: "goal", i: id,
          data: { goal: g, points: data[id] || [], home: hc ? { cfg: hc, observations: ho } : null },
          group: g.archived ? "Archived goals" : "IEP goals",
          label: (g.area ? String(g.area).replace(/^./, function (c) { return c.toUpperCase(); }) + " · " : "") +
                 String(g.title || "Untitled goal").slice(0, 78),
          sub: pts + " data point" + (pts === 1 ? "" : "s") +
               (g.baseline && g.baseline.date ? " · since " + dayLabel(g.baseline.date) : "") +
               (ho.length ? (" · " + ho.length + " home observation" + (ho.length === 1 ? "" : "s")) : "") +
               " — the goal and its data go together" });
      });

      var docs = (rd(K.iepdocs, {}) || {}).docs || {};
      keysOf(docs).forEach(function (id) {
        var d = docs[id] || {};
        if (code(d.student) !== sid) return;
        items.push({ key: "doc|" + id + "|" + fp(d), store: "doc", i: id, data: d,
          group: "Meeting paperwork",
          label: (d.typeLabel || d.type || "Document"),
          sub: d.updated ? when(d.updated) : "" });
      });

      return items;
    },

    apply: function (sid, targets) {
      var removed = 0, killGoal = {}, killDoc = {};
      targets.forEach(function (it) {
        if (it.store === "goal") killGoal[it.i] = 1;
        else if (it.store === "doc") killDoc[it.i] = 1;
      });

      if (keysOf(killGoal).length) {
        var iep = rd(K.iep, {}) || {};
        iep.goals = iep.goals || {}; iep.data = iep.data || {};
        keysOf(killGoal).forEach(function (id) {
          if (Object.prototype.hasOwnProperty.call(iep.goals, id)) { delete iep.goals[id]; removed++; }
          /* The data points are not a separate tick. A goal with no goal is
             an orphan nobody can read, chart, or delete afterwards. */
          if (Object.prototype.hasOwnProperty.call(iep.data, id)) { delete iep.data[id]; }
        });
        wr(K.iep, iep);

        /* The home side of the same goal. Not a separate tick for the same
           reason the data points are not one: a family's observations under a
           key whose goal is gone are an orphan nobody can read or delete. */
        var hm = rd(K.iephome, {}) || {};
        hm.cfg = hm.cfg || {}; hm.obs = hm.obs || {};
        keysOf(killGoal).forEach(function (id) {
          var c = hm.cfg[id];
          if (c && c.key && Object.prototype.hasOwnProperty.call(hm.obs, c.key)) { delete hm.obs[c.key]; }
          if (Object.prototype.hasOwnProperty.call(hm.cfg, id)) { delete hm.cfg[id]; }
        });
        wr(K.iephome, hm);
      }

      if (keysOf(killDoc).length) {
        var st = rd(K.iepdocs, {}) || {};
        st.docs = st.docs || {}; st.goalMeta = st.goalMeta || {};
        keysOf(killDoc).forEach(function (id) {
          if (Object.prototype.hasOwnProperty.call(st.docs, id)) { delete st.docs[id]; removed++; }
          if (Object.prototype.hasOwnProperty.call(st.goalMeta, id)) { delete st.goalMeta[id]; }
        });
        wr(K.iepdocs, st);
      }
      return removed;
    },

    after: function () {
      try { if (typeof window.aogIepRender === "function") window.aogIepRender(); } catch (e) {}
      try { if (typeof window.refreshAdmin === "function") window.refreshAdmin(); } catch (e) {}
    },

    mount: function (panel, button) {
      var host = document.getElementById("panel-iep");
      if (!host) return false;
      var body = document.getElementById("aogIepBody");
      var bar = document.createElement("div");
      bar.className = "rm-bar";
      bar.appendChild(button);
      /* Above the charts, not buried under them: on this page the records are
         the whole screen, so the control belongs where the screen begins. */
      if (body) { host.insertBefore(bar, body); host.insertBefore(panel, body); }
      else { host.appendChild(bar); host.appendChild(panel); }
      return true;
    }
  };

  /* ═══════════════════════════════════════════════════ shared removal engine */
  function removeKeys(src, sid, keys) {
    sid = code(sid);
    if (!keys || !keys.length) return { removed: 0 };

    /* ⚠ STALE-LIST GUARD. Re-read everything and resolve each ticked key back
       to a live item. A key that no longer resolves means the stores moved
       under us — refuse the whole operation rather than delete something that
       is no longer what the teacher looked at. */
    var fresh = src.items(sid), byKey = {}, targets = [], i;
    fresh.forEach(function (it) { byKey[it.key] = it; });
    for (i = 0; i < keys.length; i++) {
      var hit = byKey[keys[i]];
      if (!hit) return { stale: true, removed: 0 };
      targets.push(hit);
    }
    return { removed: src.apply(sid, targets) };
  }

  function backup(src, sid, label, items) {
    var payload = {
      what: "Architecture of Grace — records removed from this device",
      surface: src.id === "aogRmIep" ? "IEP progress monitor" : "self-reflections and check-ins",
      student: label || sid,
      exportedAt: new Date().toISOString(),
      note: "This is your only copy of what was removed. Keep it somewhere safe or delete it deliberately.",
      items: items.map(function (it) { return { kind: it.group, label: it.label, when: it.sub, data: it.data }; })
    };
    try {
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "AoG_removed_" + String(label || sid).replace(/[^A-Za-z0-9]+/g, "_") + ".json";
      document.body.appendChild(a); a.click();
      setTimeout(function () { try { URL.revokeObjectURL(a.href); a.remove(); } catch (e) {} }, 1500);
      return true;
    } catch (e) { return false; }
  }

  /* ═════════════════════════════════════════════════════════ shared panel UI */
  var CSS = [
    ".aog-rm-panel{display:none;margin-top:14px;border:1px solid var(--rule);border-radius:12px;padding:16px;background:var(--paper);}",
    ".aog-rm-panel.on{display:block;}",
    ".aog-rm-panel h4{margin:0 0 4px;font-size:16px;}",
    ".aog-rm-panel .rm-sub{font-size:12.5px;color:var(--ink-faint);line-height:1.5;margin-bottom:12px;}",
    ".aog-rm-panel label.rm-who{display:block;font-size:12px;font-weight:600;margin-bottom:5px;}",
    ".aog-rm-panel select{width:100%;max-width:340px;padding:9px 10px;border:1px solid var(--rule);border-radius:8px;background:var(--card);color:var(--ink);font-size:14px;}",
    ".aog-rm-list{margin-top:14px;}",
    ".aog-rm-list .rm-grp{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);font-weight:700;margin:14px 0 6px;}",
    ".aog-rm-list .rm-row{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border:1px solid var(--rule);border-radius:8px;margin-bottom:6px;background:var(--card);}",
    ".aog-rm-list .rm-row input{margin-top:3px;width:17px;height:17px;flex:0 0 auto;}",
    ".aog-rm-list .rm-lab{font-size:13.5px;line-height:1.35;display:block;}",
    ".aog-rm-list .rm-when{font-size:11.5px;color:var(--ink-faint);margin-top:1px;display:block;}",
    ".aog-rm-panel .rm-all{font-size:12.5px;margin-top:10px;display:inline-flex;gap:7px;align-items:center;}",
    ".aog-rm-panel .rm-acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}",
    ".aog-rm-panel .rm-foot{margin-top:14px;font-size:12px;line-height:1.55;color:var(--ink-faint);border-top:1px solid var(--rule);padding-top:12px;}",
    ".aog-rm-said{margin-top:12px;font-size:13px;line-height:1.5;}",
    ".rm-bar{display:flex;justify-content:flex-end;margin:0 0 10px;}",
    "@media print{.aog-rm-panel,.rm-bar{display:none !important;}}"
  ].join("\n");

  function styleOnce() {
    if (document.getElementById("aog-remove-records-css")) return;
    var st = document.createElement("style");
    st.id = "aog-remove-records-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function makeRemover(src) {
    var P = src.id, cur = { sid: "", label: "", items: [] };
    function el(id) { return document.getElementById(id); }
    function say(m) { var s = el(P + "Said"); if (s) s.textContent = m || ""; }

    function drawList() {
      var host = el(P + "List"); if (!host) return;
      cur.items = src.items(cur.sid);
      if (!cur.sid) { host.innerHTML = ""; say(""); return; }
      if (!cur.items.length) { host.innerHTML = '<p class="rm-sub">Nothing is stored on this device under that name.</p>'; return; }
      var html = "", last = "";
      cur.items.forEach(function (it) {
        if (it.group !== last) { html += '<div class="rm-grp">' + esc(it.group) + "</div>"; last = it.group; }
        html += '<label class="rm-row"><input type="checkbox" data-rm="' + esc(it.key) + '">' +
                '<span><span class="rm-lab">' + esc(it.label) + "</span>" +
                (it.sub ? '<span class="rm-when">' + esc(it.sub) + "</span>" : "") + "</span></label>";
      });
      html += '<label class="rm-all"><input type="checkbox" id="' + P + 'All">' +
              "Everything for " + esc(cur.label || cur.sid) + " (" + cur.items.length + " item" +
              (cur.items.length === 1 ? "" : "s") + ")</label>";
      host.innerHTML = html;
      var all = el(P + "All");
      if (all) all.addEventListener("change", function () {
        var on = all.checked;
        host.querySelectorAll("input[data-rm]").forEach(function (b) { b.checked = on; });
      });
      say("");
    }
    function chosen() {
      var host = el(P + "List"); if (!host) return [];
      var out = [];
      host.querySelectorAll("input[data-rm]").forEach(function (b) { if (b.checked) out.push(b.getAttribute("data-rm")); });
      return out;
    }
    function chosenItems(keys) {
      var want = {}; keys.forEach(function (k) { want[k] = 1; });
      return cur.items.filter(function (it) { return want[it.key]; });
    }
    function open() {
      var p = el(P + "Panel"); if (!p) return;
      p.classList.add("on");
      var sel = el(P + "Who");
      if (sel) {
        var list = src.students();
        sel.innerHTML = '<option value="">Choose…</option>' +
          list.map(function (c) { return '<option value="' + esc(c.key) + '">' + esc(c.label) + "</option>"; }).join("");
        if (!list.length) sel.innerHTML = '<option value="">Nothing stored on this device yet</option>';
        try { sel.focus(); } catch (e) {}
      }
      cur.sid = ""; cur.label = ""; cur.items = [];
      var host = el(P + "List"); if (host) host.innerHTML = "";
      say("");
    }
    function close() { var p = el(P + "Panel"); if (p) p.classList.remove("on"); }

    function build() {
      if (el(P + "Panel")) return true;
      styleOnce();

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-secondary";
      btn.id = P + "Open";
      btn.textContent = src.button;

      var panel = document.createElement("div");
      panel.id = P + "Panel";
      panel.className = "aog-rm-panel";
      panel.innerHTML =
        "<h4>" + esc(src.title) + "</h4>" +
        '<div class="rm-sub">' + esc(src.sub) + "</div>" +
        '<label class="rm-who" for="' + P + 'Who">' + esc(src.whoLabel) + "</label>" +
        '<select id="' + P + 'Who"><option value="">Choose…</option></select>' +
        '<div id="' + P + 'List" class="aog-rm-list"></div>' +
        '<div class="rm-acts">' +
          '<button type="button" class="btn btn-secondary" id="' + P + 'Backup">Download a backup of the ticked items</button>' +
          '<button type="button" class="btn pv-danger" id="' + P + 'Go">Remove the ticked items</button>' +
          '<button type="button" class="btn btn-secondary" id="' + P + 'Close">Close</button>' +
        "</div>" +
        '<div id="' + P + 'Said" class="aog-rm-said" role="status" aria-live="polite"></div>' +
        '<div class="rm-foot">' + src.foot + "</div>";

      if (!src.mount(panel, btn)) return false;

      btn.addEventListener("click", open);
      el(P + "Close").addEventListener("click", close);
      el(P + "Who").addEventListener("change", function (e) {
        cur.sid = code(e.target.value);
        var opt = e.target.options[e.target.selectedIndex];
        cur.label = opt ? opt.textContent : cur.sid;
        drawList();
      });
      el(P + "Backup").addEventListener("click", function () {
        var keys = chosen();
        if (!keys.length) { say("Tick something first — a backup of nothing is not much use."); return; }
        var items = chosenItems(keys);
        say(backup(src, cur.sid, cur.label, items)
          ? "Backup saved to your downloads — " + items.length + " item" + (items.length === 1 ? "" : "s") +
            ". Nothing has been removed yet."
          : "The backup could not be saved, so nothing was removed. Try again before deleting.");
      });
      el(P + "Go").addEventListener("click", function () {
        var keys = chosen();
        if (!keys.length) { say("Nothing is ticked."); return; }
        var items = chosenItems(keys);
        var msg = "Remove " + items.length + " item" + (items.length === 1 ? "" : "s") + " for " +
          (cur.label || cur.sid) + "?\n\n" +
          items.slice(0, 8).map(function (it) { return "· " + it.label; }).join("\n") +
          (items.length > 8 ? "\n· …and " + (items.length - 8) + " more" : "") +
          "\n\nThis cannot be undone on this device.";
        if (!window.confirm(msg)) return;
        var r = removeKeys(src, cur.sid, keys);
        if (r.stale) {
          drawList();
          say("Something else changed this data while the list was open, so nothing was removed. " +
              "The list has been refreshed — please tick again.");
          return;
        }
        drawList();
        say("Removed " + r.removed + " item" + (r.removed === 1 ? "" : "s") + " for " + (cur.label || cur.sid) +
            " from this device. Everything else is untouched." +
            (src.id === "aogRmIep" ? "" : " If those were synced, delete the matching rows in your Sheet too."));
        try { src.after(); } catch (e) {}
      });
      return true;
    }

    return {
      mount: build,
      open: function () { build(); open(); },
      students: src.students,
      itemsFor: src.items,
      remove: function (sid, keys) { return removeKeys(src, sid, keys); }
    };
  }

  var device = makeRemover(DEVICE), iep = makeRemover(IEP);
  window.AOGRemove = device;
  window.AOGRemoveIep = iep;

  function mountAll() { try { device.mount(); } catch (e) {} try { iep.mount(); } catch (e) {} }
  /* The IEP panel is a dashboard tab that may not exist until the dashboard is
     opened, so try again on the clicks that reveal it. */
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest && e.target.closest('.tab[data-tab="iep"], .dmode, .tab');
    if (t) setTimeout(mountAll, 150);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(mountAll, 400); });
  else setTimeout(mountAll, 400);
})();
