"""AOG-BIB-V1 — the drawn unit banners for the The Bible course, merged from
the illustrator module banners_bib_a (units 1–N).
It exposes BANNERS (n → svg) and CREDITS (n → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_bib_a", "banners_bib_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
