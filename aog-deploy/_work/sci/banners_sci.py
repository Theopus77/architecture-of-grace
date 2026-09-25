"""AOG-SCI-V1 — the 27 drawn unit banners for the science course, merged from
two illustrator modules (banners_sci_a: units 1–14, banners_sci_b: units 15–27).
Each exposes BANNERS (n → svg) and CREDITS (n → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_sci_a", "banners_sci_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
