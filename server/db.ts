import { eq, desc, lt, or, like, gte, lte, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertMiningNews,
  users,
  miningNews,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

/**
 * Get the latest mining news articles, ordered by publication date (newest first)
 * @param limit Maximum number of articles to return (default: 20)
 */
export async function getLatestMiningNews(limit: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get mining news: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(miningNews)
      .orderBy(desc(miningNews.publishedAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get mining news:", error);
    return [];
  }
}

/**
 * Insert a mining news article into the database
 */
export async function insertMiningNews(article: InsertMiningNews) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot insert mining news: database not available"
    );
    return null;
  }

  try {
    const result = await db.insert(miningNews).values(article);
    return result;
  } catch (error) {
    console.error("[Database] Failed to insert mining news:", error);
    throw error;
  }
}

/**
 * Batch insert multiple mining news articles
 */
export async function insertMiningNewsBatch(articles: InsertMiningNews[]) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot insert mining news: database not available"
    );
    return null;
  }

  try {
    const result = await db.insert(miningNews).values(articles);
    return result;
  } catch (error) {
    console.error("[Database] Failed to batch insert mining news:", error);
    throw error;
  }
}

/**
 * Delete old mining news articles (older than specified days)
 */
export async function deleteOldMiningNews(daysOld: number = 90) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot delete old mining news: database not available"
    );
    return null;
  }

  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const result = await db
      .delete(miningNews)
      .where(lt(miningNews.publishedAt, cutoffDate));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete old mining news:", error);
    throw error;
  }
}

// ============ NEWSLETTER SUBSCRIBERS ============

import {
  newsletterSubscribers,
  emailLog,
  pageViews,
  newsEngagement,
  InsertNewsletterSubscriber,
  InsertEmailLog,
  InsertPageView,
  InsertNewsEngagement,
} from "../drizzle/schema";

/**
 * Subscribe a user to the newsletter
 */
export async function subscribeToNewsletter(
  email: string,
  name?: string,
  categories?: string[]
) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot subscribe to newsletter: database not available"
    );
    return null;
  }

  try {
    const result = await db.insert(newsletterSubscribers).values({
      email,
      name: name || null,
      subscribed: "true",
      categories: categories ? JSON.stringify(categories) : null,
      unsubscribeToken: Math.random().toString(36).substring(2, 15),
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to subscribe to newsletter:", error);
    throw error;
  }
}

/**
 * Get all active newsletter subscribers
 */
export async function getActiveSubscribers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get subscribers: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.subscribed, "true"));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get subscribers:", error);
    return [];
  }
}

/**
 * Unsubscribe from newsletter using token
 */
export async function unsubscribeFromNewsletter(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot unsubscribe: database not available");
    return null;
  }

  try {
    const result = await db
      .update(newsletterSubscribers)
      .set({ subscribed: "false" })
      .where(eq(newsletterSubscribers.unsubscribeToken, token));
    return result;
  } catch (error) {
    console.error("[Database] Failed to unsubscribe:", error);
    throw error;
  }
}

/**
 * Log a sent email
 */
export async function logEmail(
  subscriberId: number,
  subject: string,
  articleCount: number,
  status: string = "sent",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log email: database not available");
    return null;
  }

  try {
    const result = await db.insert(emailLog).values({
      subscriberId,
      subject,
      articleCount,
      status,
      errorMessage: errorMessage || null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to log email:", error);
    throw error;
  }
}

// ============ NEWS SEARCH & FILTERING ============

/**
 * Search mining news by headline or excerpt
 */
export async function searchMiningNews(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot search mining news: database not available"
    );
    return [];
  }

  try {
    const searchTerm = `%${query}%`;
    const result = await db
      .select()
      .from(miningNews)
      .where(
        or(
          like(miningNews.headline, searchTerm),
          like(miningNews.excerpt, searchTerm)
        )
      )
      .orderBy(desc(miningNews.publishedAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to search mining news:", error);
    return [];
  }
}

/**
 * Filter mining news by category
 */
export async function getMiningNewsByCategory(
  category: string,
  limit: number = 20
) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get news by category: database not available"
    );
    return [];
  }

  try {
    const result = await db
      .select()
      .from(miningNews)
      .where(eq(miningNews.category, category))
      .orderBy(desc(miningNews.publishedAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get news by category:", error);
    return [];
  }
}

/**
 * Get mining news by date range
 */
export async function getMiningNewsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get news by date range: database not available"
    );
    return [];
  }

  try {
    const result = await db
      .select()
      .from(miningNews)
      .where(
        and(
          gte(miningNews.publishedAt, startDate),
          lte(miningNews.publishedAt, endDate)
        )
      )
      .orderBy(desc(miningNews.publishedAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get news by date range:", error);
    return [];
  }
}

/**
 * Get all unique categories
 */
export async function getAllCategories() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get categories: database not available");
    return [];
  }

  try {
    const result = await db
      .selectDistinct({ category: miningNews.category })
      .from(miningNews);
    return result.map(r => r.category).filter(c => c !== null);
  } catch (error) {
    console.error("[Database] Failed to get categories:", error);
    return [];
  }
}

// ============ ANALYTICS ============

/**
 * Log a page view
 */
export async function logPageView(
  page: string,
  referrer?: string,
  userAgent?: string,
  sessionId?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log page view: database not available");
    return null;
  }

  try {
    const result = await db.insert(pageViews).values({
      page,
      referrer: referrer || null,
      userAgent: userAgent || null,
      sessionId: sessionId || null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to log page view:", error);
    throw error;
  }
}

/**
 * Log news engagement (view, click, share)
 */
export async function logNewsEngagement(
  articleId: number,
  action: string,
  category?: string,
  sessionId?: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log engagement: database not available");
    return null;
  }

  try {
    const result = await db.insert(newsEngagement).values({
      articleId,
      action,
      category: category || null,
      sessionId: sessionId || null,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to log engagement:", error);
    throw error;
  }
}

/**
 * Get page view analytics for a specific page
 */
export async function getPageViewStats(page: string, days: number = 30) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get page stats: database not available");
    return { totalViews: 0, uniqueSessions: 0 };
  }

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const views = await db
      .select()
      .from(pageViews)
      .where(
        and(eq(pageViews.page, page), gte(pageViews.timestamp, startDate))
      );

    const uniqueSessions = new Set(views.map(v => v.sessionId)).size;
    return { totalViews: views.length, uniqueSessions };
  } catch (error) {
    console.error("[Database] Failed to get page stats:", error);
    return { totalViews: 0, uniqueSessions: 0 };
  }
}

/**
 * Get news engagement stats
 */
export async function getNewsEngagementStats(days: number = 30) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get engagement stats: database not available"
    );
    return [];
  }

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await db
      .select({
        articleId: newsEngagement.articleId,
        action: newsEngagement.action,
        count: newsEngagement.action,
      })
      .from(newsEngagement)
      .where(gte(newsEngagement.timestamp, startDate));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get engagement stats:", error);
    return [];
  }
}

/**
 * Get top performing categories
 */
export async function getTopCategories(days: number = 30, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn(
      "[Database] Cannot get top categories: database not available"
    );
    return [];
  }

  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await db
      .select({ category: newsEngagement.category })
      .from(newsEngagement)
      .where(gte(newsEngagement.timestamp, startDate))
      .limit(limit);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get top categories:", error);
    return [];
  }
}
