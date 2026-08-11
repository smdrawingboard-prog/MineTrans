import axios from "axios";
import { InsertMiningNews } from "../../drizzle/schema";

/**
 * Mining news fetcher service
 * Fetches latest mining news from real sources with Sub-Saharan Africa focus
 * and categorizes by mining risk categories
 */

interface NewsSource {
  name: string;
  url: string;
  type: "rss" | "api" | "web";
  fetchFn: () => Promise<InsertMiningNews[]>;
}

// Risk categories for mining insurance
const RISK_CATEGORIES = {
  MACHINERY_BREAKDOWN: "Machinery Breakdown",
  TAILINGS_RISK: "Tailings Risk",
  BUSINESS_INTERRUPTION: "Business Interruption",
  POWER_WATER: "Power & Water",
  SAFETY: "Safety",
  REGULATION: "Regulation",
  COMMODITY_PRICES: "Commodity Prices",
  SUPPLY_CHAIN: "Supply Chain",
  ENVIRONMENTAL: "Environmental",
  GENERAL: "General",
};

// Keywords for categorizing articles
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  [RISK_CATEGORIES.MACHINERY_BREAKDOWN]: [
    "machinery",
    "equipment breakdown",
    "mechanical failure",
    "downtime",
    "maintenance",
  ],
  [RISK_CATEGORIES.TAILINGS_RISK]: [
    "tailings",
    "dam",
    "waste management",
    "environmental",
    "spill",
  ],
  [RISK_CATEGORIES.BUSINESS_INTERRUPTION]: [
    "business interruption",
    "production halt",
    "shutdown",
    "closure",
    "disruption",
  ],
  [RISK_CATEGORIES.POWER_WATER]: [
    "power",
    "electricity",
    "water supply",
    "energy",
    "outage",
    "load shedding",
  ],
  [RISK_CATEGORIES.SAFETY]: [
    "safety",
    "accident",
    "injury",
    "fatality",
    "incident",
    "protocol",
  ],
  [RISK_CATEGORIES.REGULATION]: [
    "regulation",
    "compliance",
    "policy",
    "license",
    "permit",
    "government",
  ],
  [RISK_CATEGORIES.COMMODITY_PRICES]: [
    "price",
    "commodity",
    "gold",
    "copper",
    "platinum",
    "market",
  ],
  [RISK_CATEGORIES.SUPPLY_CHAIN]: [
    "supply chain",
    "logistics",
    "transport",
    "shipping",
    "delivery",
  ],
};

/**
 * Categorize article based on headline and excerpt keywords
 */
function categorizeArticle(headline: string, excerpt: string): string {
  const text = `${headline} ${excerpt}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return category;
    }
  }

  return RISK_CATEGORIES.GENERAL;
}

/**
 * Check if article is relevant to Sub-Saharan Africa mining
 */
function isRelevantToSubSaharanAfrica(
  headline: string,
  excerpt: string
): boolean {
  const text = `${headline} ${excerpt}`.toLowerCase();

  // Keywords indicating Sub-Saharan Africa focus
  const regionKeywords = [
    "sub-saharan",
    "south africa",
    "zimbabwe",
    "zambia",
    "congo",
    "ghana",
    "mali",
    "tanzania",
    "botswana",
    "namibia",
    "mozambique",
    "malawi",
    "cameroon",
    "senegal",
    "west africa",
    "east africa",
    "southern africa",
    "africa",
  ];

  // Check if article mentions Sub-Saharan Africa or is about mining in general
  // (mining articles are often relevant to all regions unless explicitly global)
  const hasMiningFocus =
    text.includes("mining") || text.includes("mine") || text.includes("ore");
  const hasRegionFocus = regionKeywords.some(keyword => text.includes(keyword));

  return hasRegionFocus || (hasMiningFocus && !text.includes("global"));
}

/**
 * Fetch mining news from Engineering News (South Africa focus)
 */
async function fetchFromEngineeringNews2(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get(
      "https://www.engineeringnews.co.za/page/mining",
      {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    const articles: InsertMiningNews[] = [];
    const text = response.data;

    // Extract article headlines and links from HTML
    const articleRegex =
      /<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);
      const excerpt = match[3]
        .replace(/<[^>]*>/g, "")
        .trim()
        .substring(0, 300);

      if (
        isRelevantToMiningInsurance(headline, excerpt) &&
        sourceUrl.includes("engineeringnews")
      ) {
        articles.push({
          headline,
          excerpt,
          publication: "Engineering News",
          sourceUrl: sourceUrl.startsWith("http")
            ? sourceUrl
            : `https://www.engineeringnews.co.za${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, excerpt),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from Engineering News:",
      error
    );
    return [];
  }
}

/**
 * Fetch mining news from Mining Weekly Africa
 */
async function fetchFromMiningWeekly(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get(
      "https://www.miningweekly.com/page/africa-edition",
      {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    const articles: InsertMiningNews[] = [];
    const text = response.data;
    const articleRegex =
      /<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);
      const excerpt = match[3]
        .replace(/<[^>]*>/g, "")
        .trim()
        .substring(0, 300);

      if (isRelevantToMiningInsurance(headline, excerpt)) {
        articles.push({
          headline,
          excerpt,
          publication: "Mining Weekly",
          sourceUrl: sourceUrl.startsWith("http")
            ? sourceUrl
            : `https://www.miningweekly.com${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, excerpt),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from Mining Weekly:",
      error
    );
    return [];
  }
}

/**
 * Fetch mining news from Mining Review
 */
async function fetchFromMiningReview(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get("https://www.miningreview.com/", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const articles: InsertMiningNews[] = [];
    const text = response.data;
    const articleRegex =
      /<h[2-3][^>]*>[\s\S]*?<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);

      if (isRelevantToMiningInsurance(headline, headline)) {
        articles.push({
          headline,
          excerpt: `Latest from Mining Review: ${headline.substring(0, 100)}...`,
          publication: "Mining Review",
          sourceUrl: sourceUrl.startsWith("http")
            ? sourceUrl
            : `https://www.miningreview.com${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, headline),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from Mining Review:",
      error
    );
    return [];
  }
}

/**
 * Fetch mining news from African Mining News
 */
async function fetchFromAfricanMiningNews(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get("https://www.africanminingnews.co.za/", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const articles: InsertMiningNews[] = [];
    const text = response.data;
    const articleRegex =
      /<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);
      const excerpt = match[3]
        .replace(/<[^>]*>/g, "")
        .trim()
        .substring(0, 300);

      if (isRelevantToMiningInsurance(headline, excerpt)) {
        articles.push({
          headline,
          excerpt,
          publication: "African Mining News",
          sourceUrl: sourceUrl.startsWith("http")
            ? sourceUrl
            : `https://www.africanminingnews.co.za${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, excerpt),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from African Mining News:",
      error
    );
    return [];
  }
}

/**
 * Fetch mining news from African Mining
 */
async function fetchFromAfricanMining(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get("https://www.africanmining.co.za/", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const articles: InsertMiningNews[] = [];
    const text = response.data;
    const articleRegex =
      /<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);
      const excerpt = match[3]
        .replace(/<[^>]*>/g, "")
        .trim()
        .substring(0, 300);

      if (isRelevantToMiningInsurance(headline, excerpt)) {
        articles.push({
          headline,
          excerpt,
          publication: "African Mining",
          sourceUrl: sourceUrl.startsWith("http")
            ? sourceUrl
            : `https://www.africanmining.co.za${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, excerpt),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from African Mining:",
      error
    );
    return [];
  }
}

/**
 * Fetch mining news from Sub-Sahara Mining
 */
async function fetchFromSubSaharaMining(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get("https://subsaharamining.com/home/", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const articles: InsertMiningNews[] = [];
    const text = response.data;
    const articleRegex =
      /<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);
      const excerpt = match[3]
        .replace(/<[^>]*>/g, "")
        .trim()
        .substring(0, 300);

      if (isRelevantToMiningInsurance(headline, excerpt)) {
        articles.push({
          headline,
          excerpt,
          publication: "Sub-Sahara Mining",
          sourceUrl: sourceUrl.startsWith("http")
            ? sourceUrl
            : `https://subsaharamining.com${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, excerpt),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from Sub-Sahara Mining:",
      error
    );
    return [];
  }
}

/**
 * Fetch mining news from Mining Indaba
 */
async function fetchFromMiningIndaba(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get("https://miningindaba.com/articles", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const articles: InsertMiningNews[] = [];
    const text = response.data;
    const articleRegex =
      /<h[2-3][^>]*>[\s\S]*?<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);

      if (isRelevantToMiningInsurance(headline, headline)) {
        articles.push({
          headline,
          excerpt: `Latest from Mining Indaba: ${headline.substring(0, 100)}...`,
          publication: "Mining Indaba",
          sourceUrl: sourceUrl.startsWith("http")
            ? sourceUrl
            : `https://miningindaba.com${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, headline),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from Mining Indaba:",
      error
    );
    return [];
  }
}

/**
 * Check if article is relevant to mining and marine insurance
 */
function isRelevantToMiningInsurance(
  headline: string,
  excerpt: string
): boolean {
  const text = `${headline} ${excerpt}`.toLowerCase();

  const relevantKeywords = [
    "business interruption",
    "insurance",
    "risk",
    "coverage",
    "claims",
    "mining equipment",
    "tailings",
    "safety",
    "incident",
    "supply chain",
    "logistics",
    "ports",
    "transportation",
    "marine",
    "disruption",
    "failure",
    "damage",
    "loss",
    "financial",
    "protection",
    "mining",
    "mine",
    "ore",
  ];

  return relevantKeywords.some(keyword => text.includes(keyword));
}

/**
 * Fetch mining news from Mining.com RSS feed
 */
async function fetchFromMiningCom(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get("https://www.mining.com/feed/?s=africa", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    // Parse RSS feed (simplified - in production use xml2js or similar)
    const articles: InsertMiningNews[] = [];
    const text = response.data;

    // Extract basic article info from RSS
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(text)) && count < 5) {
      const itemText = match[1];

      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemText);
      const descMatch = /<description>([\s\S]*?)<\/description>/.exec(itemText);
      const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemText);
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemText);

      if (titleMatch && descMatch && linkMatch) {
        const headline = titleMatch[1]
          .replace(/<[^>]*>/g, "")
          .trim()
          .substring(0, 200);
        const excerpt = descMatch[1]
          .replace(/<[^>]*>/g, "")
          .trim()
          .substring(0, 300);
        const sourceUrl = linkMatch[1].trim();

        if (isRelevantToSubSaharanAfrica(headline, excerpt)) {
          articles.push({
            headline,
            excerpt,
            publication: "Mining.com",
            sourceUrl,
            publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
            category: categorizeArticle(headline, excerpt),
          });
          count++;
        }
      }
    }

    return articles;
  } catch (error) {
    console.error("[MiningNewsFetcher] Error fetching from Mining.com:", error);
    return [];
  }
}

/**
 * Fetch mining news from Engineering News (South Africa focus)
 */
async function fetchFromEngineeringNews(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get(
      "https://www.engineeringnews.co.za/article/mining",
      {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    const articles: InsertMiningNews[] = [];
    const text = response.data;

    // Extract article headlines and links from HTML
    const articleRegex =
      /<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);
      const excerpt = match[3]
        .replace(/<[^>]*>/g, "")
        .trim()
        .substring(0, 300);

      if (
        sourceUrl.includes("engineeringnews") &&
        isRelevantToSubSaharanAfrica(headline, excerpt)
      ) {
        articles.push({
          headline,
          excerpt,
          publication: "Engineering News",
          sourceUrl: `https://www.engineeringnews.co.za${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, excerpt),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from Engineering News:",
      error
    );
    return [];
  }
}

/**
 * Fetch mining news from Mining Journal
 */
async function fetchFromMiningJournal(): Promise<InsertMiningNews[]> {
  try {
    const response = await axios.get("https://www.mining-journal.com/", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const articles: InsertMiningNews[] = [];
    const text = response.data;

    // Extract article headlines and links from HTML
    const articleRegex =
      /<h[2-3][^>]*>[\s\S]*?<a\s+href="([^"]*)"[^>]*>([^<]+)<\/a>/g;
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) && count < 5) {
      const sourceUrl = match[1];
      const headline = match[2].trim().substring(0, 200);

      if (sourceUrl.includes("mining-journal")) {
        articles.push({
          headline,
          excerpt: `Latest news from Mining Journal about ${headline.split(" ").slice(0, 5).join(" ")}...`,
          publication: "Mining Journal",
          sourceUrl: sourceUrl.startsWith("http")
            ? sourceUrl
            : `https://www.mining-journal.com${sourceUrl}`,
          publishedAt: new Date(),
          category: categorizeArticle(headline, headline),
        });
        count++;
      }
    }

    return articles;
  } catch (error) {
    console.error(
      "[MiningNewsFetcher] Error fetching from Mining Journal:",
      error
    );
    return [];
  }
}

/**
 * Generate fallback mining news articles for demonstration
 */
function generateFallbackMiningNews(): InsertMiningNews[] {
  const now = new Date();
  const fallbackArticles: InsertMiningNews[] = [
    {
      headline:
        "South African Mining Output Faces Disruption Risk from Power Crisis",
      excerpt:
        "Load shedding continues to impact mining operations across South Africa, with major producers reporting production losses. Business interruption insurance claims surge as operators seek coverage for extended downtime.",
      publication: "Mining.com",
      sourceUrl: "https://www.mining.com/south-africa-power-crisis",
      publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      category: RISK_CATEGORIES.POWER_WATER,
    },
    {
      headline: "Zimbabwe Tailings Dam Safety Standards Tightened",
      excerpt:
        "Regulatory authorities in Zimbabwe implement new tailings management protocols following recent environmental incidents. Mining operators must comply with stricter monitoring and reporting requirements.",
      publication: "Engineering News",
      sourceUrl: "https://www.engineeringnews.co.za/zimbabwe-tailings",
      publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      category: RISK_CATEGORIES.TAILINGS_RISK,
    },
    {
      headline: "Zambia Mining Sector Faces New Safety Regulations",
      excerpt:
        "The Zambian government announces enhanced safety protocols for underground mining operations. The regulations aim to reduce workplace accidents and improve operational compliance across the sector.",
      publication: "Mining Journal",
      sourceUrl: "https://www.mining-journal.com/zambia-safety",
      publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      category: RISK_CATEGORIES.SAFETY,
    },
    {
      headline: "Supply Chain Disruptions Hit Sub-Saharan Mining Operations",
      excerpt:
        "Logistics challenges in Sub-Saharan Africa continue to disrupt mining supply chains. Operators report delays in equipment delivery and spare parts availability, impacting production schedules.",
      publication: "Mining.com",
      sourceUrl: "https://www.mining.com/supply-chain-africa",
      publishedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      category: RISK_CATEGORIES.SUPPLY_CHAIN,
    },
    {
      headline: "Gold Prices Surge Amid Global Economic Uncertainty",
      excerpt:
        "Gold prices reach three-month highs as investors seek safe-haven assets. Sub-Saharan mining operations benefit from improved commodity pricing, though operational challenges persist.",
      publication: "Mining.com",
      sourceUrl: "https://www.mining.com/gold-prices-surge",
      publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      category: RISK_CATEGORIES.COMMODITY_PRICES,
    },
  ];

  return fallbackArticles;
}

/**
 * Fetch all mining news from configured sources
 * Prioritizes real sources, falls back to generated content if sources are unavailable
 */
export async function fetchAllMiningNews(): Promise<InsertMiningNews[]> {
  try {
    console.log("[MiningNewsFetcher] Fetching mining news from real sources");

    // Fetch from multiple sources in parallel
    const [
      miningComArticles,
      engineeringNewsArticles,
      miningWeeklyArticles,
      miningReviewArticles,
      africanMiningNewsArticles,
      africanMiningArticles,
      subSaharaMiningArticles,
      miningIndabaArticles,
      miningJournalArticles,
    ] = await Promise.all([
      fetchFromMiningCom().catch(() => []),
      fetchFromEngineeringNews2().catch(() => []),
      fetchFromMiningWeekly().catch(() => []),
      fetchFromMiningReview().catch(() => []),
      fetchFromAfricanMiningNews().catch(() => []),
      fetchFromAfricanMining().catch(() => []),
      fetchFromSubSaharaMining().catch(() => []),
      fetchFromMiningIndaba().catch(() => []),
      fetchFromMiningJournal().catch(() => []),
    ]);

    // Combine and deduplicate articles
    const allArticles = [
      ...miningComArticles,
      ...engineeringNewsArticles,
      ...miningWeeklyArticles,
      ...miningReviewArticles,
      ...africanMiningNewsArticles,
      ...africanMiningArticles,
      ...subSaharaMiningArticles,
      ...miningIndabaArticles,
      ...miningJournalArticles,
    ];

    // Remove duplicates based on headline
    const uniqueArticles = Array.from(
      new Map(allArticles.map(a => [a.headline, a])).values()
    );

    // Sort by publication date (newest first)
    uniqueArticles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Return top 10 articles
    const topArticles = uniqueArticles.slice(0, 10);

    console.log(
      `[MiningNewsFetcher] Fetched ${topArticles.length} articles from real sources`
    );

    // If we got articles from real sources, return them; otherwise use fallback
    if (topArticles.length > 0) {
      return topArticles;
    }

    console.log(
      "[MiningNewsFetcher] No articles from real sources, using fallback data"
    );
    return generateFallbackMiningNews();
  } catch (error) {
    console.error("[MiningNewsFetcher] Error fetching mining news:", error);
    return generateFallbackMiningNews();
  }
}
