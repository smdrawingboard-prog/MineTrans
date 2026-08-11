import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  searchMiningNews,
  getMiningNewsByCategory,
  getMiningNewsByDateRange,
  getAllCategories,
  getLatestMiningNews,
} from "../db";

export const newsSearchRouter = router({
  /**
   * Search mining news by keyword
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await searchMiningNews(input.query, input.limit);
        return { success: true, results, count: results.length };
      } catch (error) {
        console.error("[NewsSearch] Search error:", error);
        return { success: false, results: [], count: 0 };
      }
    }),

  /**
   * Filter news by category
   */
  filterByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await getMiningNewsByCategory(
          input.category,
          input.limit
        );
        return { success: true, results, count: results.length };
      } catch (error) {
        console.error("[NewsSearch] Category filter error:", error);
        return { success: false, results: [], count: 0 };
      }
    }),

  /**
   * Filter news by date range
   */
  filterByDateRange: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().optional().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const results = await getMiningNewsByDateRange(
          input.startDate,
          input.endDate,
          input.limit
        );
        return { success: true, results, count: results.length };
      } catch (error) {
        console.error("[NewsSearch] Date range filter error:", error);
        return { success: false, results: [], count: 0 };
      }
    }),

  /**
   * Get all available categories
   */
  getCategories: publicProcedure.query(async () => {
    try {
      const categories = await getAllCategories();
      return { success: true, categories };
    } catch (error) {
      console.error("[NewsSearch] Get categories error:", error);
      return { success: false, categories: [] };
    }
  }),

  /**
   * Get latest news with optional filters
   */
  getLatest: publicProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let results;
        if (input.category) {
          results = await getMiningNewsByCategory(input.category, input.limit);
        } else {
          results = await getLatestMiningNews(input.limit);
        }
        return { success: true, results, count: results.length };
      } catch (error) {
        console.error("[NewsSearch] Get latest error:", error);
        return { success: false, results: [], count: 0 };
      }
    }),
});
