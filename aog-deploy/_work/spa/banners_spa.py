"""AOG-SPA-V1 — the 20 drawn unit banners for the Spanish course, merged from
two illustrator modules (banners_spa_a: units 1–10, banners_spa_b: units 11–20).
Each exposes BANNERS (n → svg) and CREDITS (n → caption)."""
BANNERS, CREDITS = {}, {}
for mod in ("banners_spa_a", "banners_spa_b"):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
