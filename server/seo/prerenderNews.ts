/**
 * Build-time pre-rendering for the static mining news page.
 *
 * news.html fills its article grid from news-data.json in the browser. Search
 * crawlers that skip JavaScript (and most AI answer-engine crawlers) therefore
 * saw an empty grid. At build time we write the same cards into the HTML so the
 * articles are in the page source; the client script still refreshes them.
 */

export type NewsArticle = {
  headline?: string;
  excerpt?: string;
  publication?: string;
  sourceUrl?: string;
  publishedAt?: string;
  category?: string;
};

export type NewsFeed = {
  updatedAt?: string;
  articles?: NewsArticle[];
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

// Feed text arrives partly HTML-encoded (e.g. "&hellip;", "&#8217;"), so decode
// it first and re-escape everything on output.
function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const text = (value: unknown) => escapeHtml(decodeEntities(String(value ?? "")).replace(/<[^>]*>/g, ""));

function formatDate(iso: string | undefined, options: Intl.DateTimeFormatOptions): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", ...options });
}

function safeUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

/** Renders the same card markup the browser script in news.html produces. */
export function renderNewsCards(articles: NewsArticle[]): string {
  return articles
    .map(a => {
      const url = safeUrl(a.sourceUrl);
      const published = formatDate(a.publishedAt, { year: "numeric", month: "short", day: "numeric" });
      return `
      <article class="ncard">
        <span class="nsrc">${text(a.publication || "Mining News")}</span>
        <span class="ncat" style="margin-left:8px;font-size:11px;color:var(--copper)">${text(a.category || "General")}</span>
        <h4>${text(a.headline)}</h4>
        <p>${text(a.excerpt)}</p>
        ${published ? `<div style="font-size:11px;color:var(--platinum);margin-top:8px"><time datetime="${escapeHtml(a.publishedAt!)}">${published}</time></div>` : ""}
        ${url ? `<a class="nlink" href="${escapeHtml(url)}" target="_blank" rel="noopener">Read article →</a>` : ""}
      </article>`;
    })
    .join("");
}

const GRID_EMPTY = '<div class="newsgrid" id="newsgrid"></div>';
const STATE_EMPTY = '<div class="newsstate" id="newsstate"></div>';

/**
 * Fills news.html's empty article grid (and status line) from the feed.
 * Returns the page unchanged when the feed has no articles or the page no
 * longer has the expected empty placeholders.
 */
export function injectNewsIntoPage(pageHtml: string, feed: NewsFeed): string {
  const articles = (feed.articles ?? []).filter(a => a.headline);
  if (!articles.length || !pageHtml.includes(GRID_EMPTY)) return pageHtml;

  const updated = formatDate(feed.updatedAt, { dateStyle: "medium", timeStyle: "short" }) || "recently";
  const state = `<div class="newsstate show" id="newsstate"><span>Last updated ${escapeHtml(updated)} · ${articles.length} articles</span></div>`;

  return pageHtml
    .replace(STATE_EMPTY, state)
    .replace(GRID_EMPTY, `<div class="newsgrid" id="newsgrid">${renderNewsCards(articles)}\n  </div>`);
}

/** Sets <lastmod> for one sitemap <loc> to the given YYYY-MM-DD date. */
export function setSitemapLastmod(sitemapXml: string, loc: string, isoDate: string | undefined): string {
  const date = isoDate ? new Date(isoDate) : null;
  if (!date || Number.isNaN(date.getTime())) return sitemapXml;
  const day = date.toISOString().slice(0, 10);
  const locTag = `<loc>${loc}</loc>`;
  return sitemapXml.replace(
    new RegExp(`(${locTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})<lastmod>[^<]*</lastmod>`),
    `$1<lastmod>${day}</lastmod>`
  );
}
