"""AOG-ECO-V1 — the 20 drawn unit banners for the Economics course, merged from
two illustrator modules (banners_eco_a: units 1–10, banners_eco_b: units 11–20).
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
