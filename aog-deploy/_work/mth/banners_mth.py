"""AOG-MTH-V1 — the 27 drawn unit banners for the math course, merged from
two illustrator modules (banners_mth_a: units 1–14, banners_mth_b: units 15–27).
Each exposes BANNERS (n → svg) and CREDITS (n → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_mth_a", "banners_mth_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
