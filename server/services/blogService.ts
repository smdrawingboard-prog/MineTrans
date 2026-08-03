import { google } from 'googleapis';

interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  date: string;
  category: string;
  image?: string;
  published: boolean;
}

// Initialize Google Sheets API
const sheets = google.sheets('v4');

// Configuration - set these in environment variables
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_BLOG_ID || '';
const GOOGLE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY || '';

/**
 * Fetch blog posts from Google Sheets
 * Expected sheet structure:
 * Column A: ID
 * Column B: Title
 * Column C: Subtitle
 * Column D: Content
 * Column E: Author
 * Column F: Date (YYYY-MM-DD)
 * Column G: Category
 * Column H: Image URL
 * Column I: Published (TRUE/FALSE)
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    if (!GOOGLE_SHEETS_ID || !GOOGLE_API_KEY) {
      console.warn('Google Sheets blog integration not configured');
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'Blog!A2:I100', // Skip header row
      key: GOOGLE_API_KEY,
    });

    const rows = response.data.values || [];
    const posts: BlogPost[] = rows
      .filter(row => row[8]?.toLowerCase() === 'true') // Filter published posts
      .map((row, index) => ({
        id: row[0] || `post-${index}`,
        title: row[1] || '',
        subtitle: row[2] || '',
        content: row[3] || '',
        author: row[4] || 'MineTrans',
        date: row[5] || new Date().toISOString().split('T')[0],
        category: row[6] || 'Insights',
        image: row[7] || '',
        published: row[8]?.toLowerCase() === 'true',
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts from Google Sheets:', error);
    return [];
  }
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find(post => post.id === id) || null;
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter(post => post.category === category);
}

/**
 * Get latest N blog posts
 */
export async function getLatestBlogPosts(limit: number = 5): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.slice(0, limit);
}
