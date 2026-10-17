# MineTrans showreel

15-second, 1920×1080, 60fps brand showreel built from the site's own interface (the BI-failure cascade, the illustrative settlement chart and the review request form).

- `minetrans-showreel.mp4` — final video with soundtrack
- `minetrans-showreel.html` — the source page; `window.seek(t)` draws any moment, `window.renderAudio()` returns the WAV track
- `src/` — editable source and render tooling

Rebuild after editing `src/reel.src.html` (needs Python 3, Node with Playwright, and ffmpeg):

```bash
python3 src/build.py
node src/render.cjs stills   # one frame per beat in src/beats/ for review
node src/render.cjs          # full render
```

Figures shown are the site's illustrative examples, not client data (FAIS). Fonts: Playfair Display, SIL Open Font License.
