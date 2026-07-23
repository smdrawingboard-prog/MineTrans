# MineTrans Advanced Mining Insurance Blueprint — Training Course

An interactive internal training course for MineTrans advisors and mining
finance teams. Covers the 12-step Business Interruption methodology and the
18-category mining underwriting questionnaire, built to match the master
[`Advanced_Mining_Insurance_Blueprint`](../) document — including Roger's
21 July 2026 content additions.

**Status:** internal tool, not yet published. Requires Key Individual
sign-off under GCOC s14 before advisors are given access, per the standard
MineTrans compliance process.

---

## What's in this repo (plain-language map)

| File / folder | What it does |
|---|---|
| `src/App.jsx` | The whole course — all the content and the interactive UI live here |
| `src/main.jsx` | Tiny file that boots the app into the browser |
| `index.html` | The page shell — also where SEO/social-share tags live |
| `public/robots.txt` | Tells search engines "don't index this" (see SEO note below) |
| `public/sitemap.xml`, `public/llms.txt` | SEO/AI-search scaffolding, currently inert (see below) |
| `.github/workflows/deploy.yml` | **Automation** — auto-builds and publishes the site every time you push to `main` |
| `package.json` | List of dependencies + the three commands you'll actually run (below) |

## Why it's set to "noindex" (SEO note)

This course contains MineTrans's proprietary underwriting methodology, so
it's currently blocked from Google/AI-search indexing on purpose
(`robots.txt` + a `noindex` tag in `index.html`). All the SEO
infrastructure — meta tags, Open Graph tags, `Course` structured data,
sitemap — is already built and correct. If you ever want to publish a
public version (e.g. a marketing/thought-leadership cut of this content),
you only need to:
1. Remove the `noindex` line in `index.html`
2. Change `Disallow: /` to `Allow: /` in `public/robots.txt`
3. Update the URLs in the structured data and `sitemap.xml`

That's it — everything else is already SEO/AI-visibility-ready.

---

## Running it on your own computer

You need [Node.js](https://nodejs.org) installed first (the free
"LTS" version is fine). Then, from a terminal, inside this folder:

```bash
npm install     # downloads the few libraries this needs (one-time)
npm run dev     # starts a local preview at http://localhost:5173
```

Edit anything in `src/App.jsx`, save, and the browser updates automatically.

To build the final, optimised version (what actually gets published):

```bash
npm run build   # creates a "dist" folder — this is the real, deployable site
npm run preview # lets you check the built version locally before publishing
```

---

## Publishing it (GitHub Pages — free hosting)

This repo already includes an **automation** (`.github/workflows/deploy.yml`)
that builds and publishes the site automatically every time you push to the
`main` branch. You only need to turn it on once:

1. On GitHub, go to your repo → **Settings → Pages**
2. Under "Build and deployment", set **Source** to **GitHub Actions**
3. Push any change to `main` (or just re-run the workflow from the
   **Actions** tab) — within a minute or two, the site is live at:
   `https://<your-github-username>.github.io/MineTrans-Training-Course/`

After that, you never have to manually build or upload anything again —
every push to `main` re-publishes automatically.

If you'd rather host this on a MineTrans subdomain (e.g.
`training.minetrans.co.za`) instead of the default GitHub Pages address,
that's a DNS change on the domain — flag it and we'll set that up next.

---

## Brand & compliance

- Palette: Onyx `#0A0A0B` · Graphite `#1E1D20` · Platinum `#C9CACE` ·
  Copper `#AD6A3D` · Bone `#F7F5F1`
- Fonts: Playfair Display (headings) · Jost (labels) · Inter (body)
- MineTrans Insurance Brokers is a Juristic Representative of Donaldson
  Group (Pty) Ltd — FSP No. 53166.
- All figures in the course content are illustrative only and do not
  constitute financial advice under the FAIS Act.
