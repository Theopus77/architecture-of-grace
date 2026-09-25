"""The 24 drawn unit banners, merged from two illustrator modules."""
BANNERS, CREDITS = {}, {}
for mod in ('banners_ss_a', 'banners_ss_b'):
    try:
        m = __import__(mod)
        BANNERS.update(m.BANNERS); CREDITS.update(m.CREDITS)
    except Exception:
        pass
def banner(n):
    return BANNERS[n]
