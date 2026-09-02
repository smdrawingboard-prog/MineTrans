import { describe, it, expect } from "vitest";
import type { InsertMiningNews } from "../../drizzle/schema";
import { isExcludedBrokerArticle } from "./miningNewsFetcher";

// The client asked for news from nine competing brokers to be kept out of the
// feed: Marsh, AON, Lockton, GIB Insurance, Price Forbes, Compendium, Willis,
// Maksure and OLEA. These tests pin that rule down — that each name is caught,
// that every field the crawler stores is searched, and that the two names which
// double as ordinary mining vocabulary don't drop legitimate stories.

function article(overrides: Partial<InsertMiningNews> = {}): InsertMiningNews {
  return {
    headline: "Copper output rises at Kolwezi",
    excerpt: "Production climbed 12% quarter on quarter.",
    publication: "Mining Weekly",
    sourceUrl: "https://www.miningweekly.com/article/copper-output",
    publishedAt: new Date("2026-01-15T00:00:00Z"),
    ...overrides,
  };
}

const BROKERS = [
  ["Marsh", "Marsh warns of rising mine property rates"],
  ["AON", "AON publishes its mining risk outlook"],
  ["Lockton", "Lockton hires a new mining practice lead"],
  ["GIB Insurance", "GIB Insurance expands its African book"],
  ["Price Forbes", "Price Forbes places a large mining tower"],
  ["Compendium", "Compendium appoints a regional director"],
  ["Willis", "Willis Towers Watson reports on mining capacity"],
  ["Maksure", "Maksure launches a mining product"],
  ["OLEA", "OLEA opens a new African office"],
] as const;

describe("isExcludedBrokerArticle", () => {
  describe("excludes every broker on the client's list", () => {
    for (const [broker, headline] of BROKERS) {
      it(`excludes ${broker}`, () => {
        expect(isExcludedBrokerArticle(article({ headline }))).toBe(true);
      });
    }
  });

  describe("searches every stored field, not just the headline", () => {
    it("excludes a broker named only in the excerpt", () => {
      expect(
        isExcludedBrokerArticle(
          article({ excerpt: "The cover was placed by Lockton on behalf of the mine." })
        )
      ).toBe(true);
    });

    it("excludes a broker named only in the publication", () => {
      expect(
        isExcludedBrokerArticle(article({ publication: "Marsh Insights" }))
      ).toBe(true);
    });

    it("excludes a broker named only in the source URL", () => {
      expect(
        isExcludedBrokerArticle(
          article({ sourceUrl: "https://www.wtw.com/en-ZA/insights/mining-review" })
        )
      ).toBe(true);
    });
  });

  describe("matches on word boundaries", () => {
    it("does not exclude 'Marshall' as Marsh", () => {
      expect(
        isExcludedBrokerArticle(article({ headline: "Marshall Mining lists on the JSE" }))
      ).toBe(false);
    });

    it("does not exclude 'Aonla' as AON", () => {
      expect(
        isExcludedBrokerArticle(article({ headline: "Aonla smelter restarts output" }))
      ).toBe(false);
    });

    it("does not exclude 'oleaginous' as OLEA", () => {
      expect(
        isExcludedBrokerArticle(
          article({ excerpt: "Oleaginous residues were recovered from the tailings." })
        )
      ).toBe(false);
    });
  });

  describe("does not drop mining vocabulary that collides with a broker name", () => {
    const ALLOWED = [
      "Salt marsh restoration begins near the tailings dam",
      "Marshland downstream of the mine is recovering",
      "Marshy ground delays the haul road",
      "Marsh gas readings taken at the abandoned shaft",
      "Coastal marshes to be rehabilitated under the closure plan",
      "A compendium of Southern African ore grades is published",
    ];

    for (const headline of ALLOWED) {
      it(`keeps "${headline}"`, () => {
        expect(isExcludedBrokerArticle(article({ headline }))).toBe(false);
      });
    }

    it("still excludes Marsh when the same article also mentions a salt marsh", () => {
      expect(
        isExcludedBrokerArticle(
          article({
            headline: "Salt marsh survey commissioned",
            excerpt: "Marsh brokered the environmental liability cover.",
          })
        )
      ).toBe(true);
    });
  });

  it("keeps ordinary mining news", () => {
    expect(isExcludedBrokerArticle(article())).toBe(false);
  });

  it("tolerates missing optional fields", () => {
    expect(
      isExcludedBrokerArticle({
        headline: "Gold price steadies",
        excerpt: "",
        publication: "",
        sourceUrl: "",
        publishedAt: new Date("2026-01-15T00:00:00Z"),
      })
    ).toBe(false);
  });
});
