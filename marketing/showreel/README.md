# MineTrans showreels

| Video | Length | Built from |
|---|---|---|
| `minetrans-showreel.mp4` | 15s | The site's interface: BI-failure cascade, illustrative settlement chart, review request form |
| `minetrans-the-mine-30s.mp4` | 30s | `insurance-mine.html` and its risk-assessment diagram, sized for phones. Opens on the consequence (one mill failure stops everything downstream), then the connected exposures: assets, liability and business interruption, with cover wording qualified by the policy's trigger, terms and indemnity period |

All 1920×1080, 60fps, with a Web Audio soundtrack at 120 BPM.

- `*.mp4` — final videos
- `*.html` — the source pages; `window.seek(t)` draws any moment, `window.renderAudio()` returns the WAV track
- `src/` — editable sources (`reel.src.html`, `mine30.src.html`) and render tooling

Rebuild after editing a source in `src/` (needs Python 3, Node with Playwright, and ffmpeg):

```bash
python3 src/build.py
node src/render.cjs minetrans-the-mine-30s stills   # one frame per beat in src/beats/ for review
node src/render.cjs minetrans-the-mine-30s          # full render (omit the name for the 15s reel)
```

Figures shown are the site's illustrative examples, not client data (FAIS). Fonts: Playfair Display, SIL Open Font License.
