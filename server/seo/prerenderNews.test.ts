import { describe, expect, it } from "vitest";
import { injectNewsIntoPage, renderNewsCards, setSitemapLastmod } from "./prerenderNews";

const PAGE = `<section>
  <div class="newsstate" id="newsstate"></div>
  <div class="newsgrid" id="newsgrid"></div>
</section>`;

describe("renderNewsCards", () => {
  it("decodes feed entities and re-escapes text", () => {
    const html = renderNewsCards([
      { headline: "Gold &amp; PGMs <b>rally</b>", excerpt: "A career shaped by&hellip; it&#8217;s here", sourceUrl: "https://example.com/a?x=1&y=2" },
    ]);
    expect(html).toContain("<h4>Gold &amp; PGMs rally</h4>");
    expect(html).toContain("<p>A career shaped by… it’s here</p>");
    expect(html).toContain('href="https://example.com/a?x=1&amp;y=2"');
  });

  it("drops non-http links and bad dates", () => {
    const html = renderNewsCards([{ headline: "X", sourceUrl: "javascript:alert(1)", publishedAt: "not a date" }]);
    expect(html).not.toContain("href=");
    expect(html).not.toContain("<time");
  });
});

describe("injectNewsIntoPage", () => {
  it("fills the empty grid and status line", () => {
    const out = injectNewsIntoPage(PAGE, {
      updatedAt: "2026-10-21T04:03:00.404Z",
      articles: [{ headline: "Mine stoppage", publishedAt: "2026-10-21T04:02:52.528Z", sourceUrl: "https://example.com/" }],
    });
    expect(out).toContain('<article class="ncard">');
    expect(out).toContain("Mine stoppage");
    expect(out).toContain('<time datetime="2026-10-21T04:02:52.528Z">');
    expect(out).toContain("1 articles");
    expect(out).not.toContain('<div class="newsgrid" id="newsgrid"></div>');
  });

  it("leaves the page alone when there are no articles", () => {
    expect(injectNewsIntoPage(PAGE, { articles: [] })).toBe(PAGE);
    expect(injectNewsIntoPage(PAGE, {})).toBe(PAGE);
  });

  it("skips articles without a headline and tolerates missing fields", () => {
    const out = injectNewsIntoPage(PAGE, {
      articles: [{ headline: "" }, { headline: undefined }, { headline: "Only one" }],
    });
    expect(out.match(/<article /g)).toHaveLength(1);
    expect(out).toContain('<span class="nsrc">Mining News</span>');
    expect(out).toContain("General");
    expect(out).toContain("Last updated recently · 1 articles");
  });

  it("renders every article in a larger feed", () => {
    const articles = Array.from({ length: 25 }, (_, i) => ({ headline: `Story ${i}` }));
    const out = injectNewsIntoPage(PAGE, { articles });
    expect(out.match(/<article /g)).toHaveLength(25);
  });

  it("leaves a page without the placeholder unchanged", () => {
    const filled = '<div class="newsgrid" id="newsgrid"><article></article></div>';
    expect(injectNewsIntoPage(filled, { articles: [{ headline: "X" }] })).toBe(filled);
  });
});

describe("setSitemapLastmod", () => {
  const xml = `<url><loc>https://www.minetrans.co.za/</loc><lastmod>2026-10-12</lastmod></url>
<url><loc>https://www.minetrans.co.za/news.html</loc><lastmod>2026-10-12</lastmod></url>`;

  it("updates only the matching url", () => {
    const out = setSitemapLastmod(xml, "https://www.minetrans.co.za/news.html", "2026-10-21T04:03:00Z");
    expect(out).toContain("<loc>https://www.minetrans.co.za/news.html</loc><lastmod>2026-10-21</lastmod>");
    expect(out).toContain("<loc>https://www.minetrans.co.za/</loc><lastmod>2026-10-12</lastmod>");
  });

  it("ignores an invalid date", () => {
    expect(setSitemapLastmod(xml, "https://www.minetrans.co.za/news.html", "nope")).toBe(xml);
  });
});
