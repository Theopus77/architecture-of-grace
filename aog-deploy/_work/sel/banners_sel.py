"""AOG-SEL-V1 — the 20 drawn unit banners for the five SEL rooms (four units
each), merged from two illustrator modules. Each exposes BANNERS
({"12-1": svg, …} keyed room-unit) and CREDITS (same keys → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_sel_a", "banners_sel_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(key):
    return BANNERS[key]
