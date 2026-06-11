#!/usr/bin/env python3
SRC = "index_final.html"
OUT = "index_v3.html"
with open(SRC, "r", encoding="utf-8") as fh:
    s = fh.read()

def replace_once(hay, old, new, label):
    n = hay.count(old)
    if n != 1:
        raise SystemExit(f"[FAIL] {label}: expected 1 match, found {n}")
    return hay.replace(old, new, 1)

# ===========================================================================
# 1) WELCOME HERO: surface "Calm & Regulation Tools" as a third CTA
# ===========================================================================
HERO_OLD = """          <a href="#" class="hyb-cta hyb-cta-secondary" onclick="event.preventDefault(); if(typeof startChoose==='function'){startChoose();}">
            <span data-i18n="hyb_cta_checkin">Take the Check-In</span> <span aria-hidden="true">&rarr;</span>
          </a>
        </div>"""
HERO_NEW = """          <a href="#" class="hyb-cta hyb-cta-secondary" onclick="event.preventDefault(); if(typeof startChoose==='function'){startChoose();}">
            <span data-i18n="hyb_cta_checkin">Take the Check-In</span> <span aria-hidden="true">&rarr;</span>
          </a>
          <a href="#" class="hyb-cta hyb-cta-secondary" onclick="event.preventDefault(); if(typeof showScreen==='function'){showScreen('screen-teacher-tools');}">
            <span data-i18n="hyb_cta_tools">Calm &amp; Regulation Tools</span> <span aria-hidden="true">&rarr;</span>
          </a>
        </div>"""
s = replace_once(s, HERO_OLD, HERO_NEW, "hero tools CTA")

# ===========================================================================
# 2) CHOOSE: merge the two grown-up doors into ONE (-> workplace flow)
#    a) replace the "grown-ups" door with the merged door
#    b) delete the standalone "Workplaces & teams" door
# ===========================================================================
GROWN_OLD = """          <a href="#" class="aog-door secondary choose-card choose-adult" onclick="event.preventDefault(); startAdult();">
            <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/><path d="M4 8h14a4 4 0 0 1 0 8h-1"/><path d="M4 8v9a4 4 0 0 0 4 4h5a4 4 0 0 0 4-4V8z"/></svg></span>
            <div>
              <div class="t" data-i18n="ad_door_t">A check-in for grown-ups</div>
              <div class="s" data-i18n="ad_door_s">For the grown-ups doing the work &mdash; a private few minutes, just for you.</div>
            </div>
            <span class="arr">&rarr;</span>
          </a>"""
GROWN_NEW = """          <a href="#" class="aog-door secondary choose-card choose-adult" onclick="event.preventDefault(); openWorkplace();">
            <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
            <div>
              <div class="t" data-i18n="ch_grown_t">For grown-ups &amp; teams</div>
              <div class="s" data-i18n="ch_grown_s">For everyone who holds others &mdash; educators, nurses, leaders, parents, caregivers. Take it for yourself or your team. You can&rsquo;t co-regulate from an empty cup.</div>
            </div>
            <span class="arr">&rarr;</span>
          </a>"""
s = replace_once(s, GROWN_OLD, GROWN_NEW, "merge grown-up door")

WORK_DOOR = """          <a href="#" class="aog-door secondary choose-card choose-adult" onclick="event.preventDefault(); openWorkplace();">
            <span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></span>
            <div>
              <div class="t" data-i18n="wp_card_t">Workplaces &amp; teams</div>
              <div class="s" data-i18n="wp_card_s">For the people who hold others &mdash; educators, nurses, leaders, caregivers. You can&rsquo;t co-regulate from an empty cup.</div>
            </div>
            <span class="arr">&rarr;</span>
          </a>
"""
# delete the standalone workplace door (and its trailing newline+indent)
s = replace_once(s, WORK_DOOR, "", "remove standalone workplace door")

# ===========================================================================
# 3) CHOOSE: rename "Classroom Aide Tools" -> universal + i18n
# ===========================================================================
TOOLS_OLD = """              <div class="t" style="color:var(--navy);">Classroom Aide Tools</div>
              <div class="s" style="color:var(--ink-soft);">De-regulation tools, PECS cards, breathing guides &mdash; everything an aide needs in the moment.</div>"""
TOOLS_NEW = """              <div class="t" style="color:var(--navy);" data-i18n="ch_tools_t">Calm &amp; Regulation Tools</div>
              <div class="s" style="color:var(--ink-soft);" data-i18n="ch_tools_s">De-regulation tools, PECS cards, breathing guides &mdash; for anyone who needs a calm moment: students, teachers, aides, and families.</div>"""
s = replace_once(s, TOOLS_OLD, TOOLS_NEW, "rename tools door")

# ===========================================================================
# 4) WORKPLACE: surface a personal check-in near the top of the page
# ===========================================================================
WP_ANCHOR = """    <div class="wp-skip">"""
WP_NEW = """    <div class="wp-personal-cta">
      <div class="wp-personal-tx">
        <div class="wp-personal-t" data-i18n="wp_personal_t">Just checking in on yourself?</div>
        <div class="wp-personal-s" data-i18n="wp_personal_s">Take the private adult check-in &mdash; just for you, not your team.</div>
      </div>
      <a href="#" class="btn btn-secondary wp-personal-btn" onclick="event.preventDefault(); startAdult();" data-i18n="wp_personal_btn">Personal check-in &rarr;</a>
    </div>

    <div class="wp-skip">"""
s = replace_once(s, WP_ANCHOR, WP_NEW, "workplace personal cta")

# ===========================================================================
# 5) CSS for the workplace personal CTA
# ===========================================================================
CSS = """<style id="aog-jun11-doors">
.wp-personal-cta{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;max-width:760px;margin:18px auto 4px;padding:16px 20px;background:var(--cream-deep);border:1px solid var(--rule);border-left:4px solid var(--gold);border-radius:var(--radius-lg);}
.wp-personal-t{font-family:var(--font-serif);font-size:18px;color:var(--navy);font-weight:600;}
.wp-personal-s{font-size:13.5px;color:var(--ink-soft);line-height:1.5;margin-top:2px;}
.wp-personal-btn{white-space:nowrap;flex:0 0 auto;}
:root[data-theme="dark"] .wp-personal-cta{background:var(--navy-soft);}
@media(max-width:560px){.wp-personal-cta{flex-direction:column;align-items:flex-start;}.wp-personal-btn{width:100%;text-align:center;}}
</style>
</head>"""
s = replace_once(s, "</head>", CSS, "doors css")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(s)
print("[OK] wrote", OUT)
