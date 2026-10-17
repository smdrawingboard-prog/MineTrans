# MineTrans showreels

| Video | Length | Built from |
|---|---|---|
| `minetrans-showreel.mp4` | 15s | The site's interface: BI-failure cascade, illustrative settlement chart, review request form |
| `minetrans-the-mine-60s.mp4` | 60s | The same story as the 30s cut at half pace, with motion drawn on the diagram itself: pulses run the circuit lines from the site into the MineTrans core and out to business interruption; the actuarial, technical and technology layers and each island's edge light in turn as cover locks in |
| `minetrans-the-mine-30s.mp4` | 30s | `insurance-mine.html` only, and its risk-assessment diagram cut into moving pieces: commercial assets, liability, business interruption, the diagram's three steps, then the cascade into cover |

All 1920×1080, 60fps, with a Web Audio soundtrack at 120 BPM.

- `*.mp4` — final videos
- `*.html` — the source pages; `window.seek(t)` draws any moment, `window.renderAudio()` returns the WAV track
- `src/` — editable sources (`reel.src.html`, `mine30.src.html`, `mine60.src.html`) and render tooling

Rebuild after editing a source in `src/` (needs Python 3, Node with Playwright, and ffmpeg):

```bash
python3 src/build.py
node src/render.cjs minetrans-the-mine-60s stills   # one frame per beat in src/beats/ for review
node src/render.cjs minetrans-the-mine-60s          # full render; use -30s for the short cut, no name for the 15s reel
```

Figures shown are the site's illustrative examples, not client data (FAIS). Fonts: Playfair Display, SIL Open Font License.
