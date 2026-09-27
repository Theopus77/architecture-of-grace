"""AOG-MED-V1 — the drawn unit banners for the Medicine and Health course, merged from
the illustrator module banners_med_a (units 1–N).
It exposes BANNERS (n → svg) and CREDITS (n → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_med_a", "banners_med_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
