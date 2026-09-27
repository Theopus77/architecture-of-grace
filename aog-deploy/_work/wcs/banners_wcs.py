"""AOG-WCS-V1 — the drawn unit banners for the World Cultures course, merged from
the illustrator module banners_wcs_a (units 1–N).
It exposes BANNERS (n → svg) and CREDITS (n → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_wcs_a", "banners_wcs_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
