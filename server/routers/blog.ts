import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  getBlogPosts,
  getBlogPostById,
  getBlogPostsByCategory,
  getLatestBlogPosts,
} from "../services/blogService";

export const blogRouter = router({
  /**
   * Get all published blog posts
   */
  getAllPosts: publicProcedure.query(async () => {
    return await getBlogPosts();
  }),

  /**
   * Get a single blog post by ID
   */
  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }: { input: { id: string } }) => {
      return await getBlogPostById(input.id);
    }),

  /**
   * Get blog posts by category
   */
  getPostsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }: { input: { category: string } }) => {
      return await getBlogPostsByCategory(input.category);
    }),

  /**
   * Get latest N blog posts
   */
  getLatestPosts: publicProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ input }: { input: { limit: number } }) => {
      return await getLatestBlogPosts(input.limit);
    }),
});
