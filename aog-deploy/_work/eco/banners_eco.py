"""AOG-ECO-V1 — the drawn unit banners for the Economics course.
banners_eco_a was drawn when the high-school units were numbered 1–8; since
kindergarten became unit 1 they are units 11–18, so its keys are shifted by 10.
banners_eco_b holds units 1–10 (K–8). Exposes BANNERS (n → svg) and CREDITS."""
BANNERS, CREDITS = {}, {}
for mod, shift in (("banners_eco_a", 10), ("banners_eco_b", 0)):
    try:
        m = __import__(mod)
        BANNERS.update({k + shift: v for k, v in m.BANNERS.items()}); CREDITS.update({k + shift: v for k, v in m.CREDITS.items()})
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
