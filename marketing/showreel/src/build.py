"""Inline the Playfair Display fonts into reel.src.html -> ../minetrans-showreel.html."""
import base64, pathlib, sys

here = pathlib.Path(__file__).resolve().parent
try:
    src = (here / "reel.src.html").read_text(encoding="utf-8")
    for key, name in [("{{PF_N}}", "pf-normal.woff2"), ("{{PF_I}}", "pf-italic.woff2")]:
        src = src.replace(key, base64.b64encode((here / "fonts" / name).read_bytes()).decode())
    (here.parent / "minetrans-showreel.html").write_text(src, encoding="utf-8")
except OSError as e:
    sys.exit(f"build failed: {e}")
print("built minetrans-showreel.html")
