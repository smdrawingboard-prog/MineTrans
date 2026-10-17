"""Inline fonts (and the diagram) into each reel source.

reel.src.html   -> ../minetrans-showreel.html
mine30.src.html -> ../minetrans-the-mine-30s.html
mine60.src.html -> ../minetrans-the-mine-60s.html
"""
import base64, pathlib, sys

here = pathlib.Path(__file__).resolve().parent
REELS = {"reel.src.html": "minetrans-showreel.html", "mine30.src.html": "minetrans-the-mine-30s.html",
         "mine60.src.html": "minetrans-the-mine-60s.html"}
ASSETS = {"{{PF_N}}": "fonts/pf-normal.woff2", "{{PF_I}}": "fonts/pf-italic.woff2", "{{IMG}}": "mine-risk-assessment.webp"}

try:
    data = {k: base64.b64encode((here / f).read_bytes()).decode() for k, f in ASSETS.items()}
    for src, out in REELS.items():
        s = (here / src).read_text(encoding="utf-8")
        for k, v in data.items():
            s = s.replace(k, v)
        (here.parent / out).write_text(s, encoding="utf-8")
        print("built", out)
except OSError as e:
    sys.exit(f"build failed: {e}")
