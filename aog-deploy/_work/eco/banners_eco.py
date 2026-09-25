"""AOG-ECO-V1 — the 8 drawn unit banners for the Economics course, merged from
the illustrator module (banners_eco_a: units 1–8).
Each exposes BANNERS (n → svg) and CREDITS (n → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_eco_a", "banners_eco_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
