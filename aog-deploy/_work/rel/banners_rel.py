"""AOG-REL-V1 — the 12 drawn unit banners for the World Religions course, merged from
the illustrator module banners_rel_a (units 1–12).
It exposes BANNERS (n → svg) and CREDITS (n → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_rel_a", "banners_rel_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
