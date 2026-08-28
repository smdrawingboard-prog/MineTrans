import { google } from "googleapis";

export interface BlogPost {
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

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
}

const SHEETS_REQUEST_TIMEOUT_MS = 10_000;

function getBlogConfig(): { spreadsheetId: string; credentials: ServiceAccountCredentials } | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_BI_REVIEW_ID || process.env.GOOGLE_SHEETS_BLOG_ID;
  const rawCredentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!spreadsheetId || !rawCredentials) {
    console.warn("[Google Sheets] Blog integration is not configured");
    return null;
  }

  try {
    const parsed = JSON.parse(rawCredentials) as Partial<ServiceAccountCredentials>;
    if (!parsed.client_email || !parsed.private_key) throw new Error("missing credentials");
    return {
      spreadsheetId,
      credentials: {
        ...parsed,
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\\\n/g, "\\n"),
      },
    };
  } catch {
    console.error("[Google Sheets] Blog credentials could not be initialized");
    return null;
  }
}

/** Read published Blog rows from the same private management workbook. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const config = getBlogConfig();
  if (!config) return [];

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: config.credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const client = google.sheets({ version: "v4", auth });
    const response = await client.spreadsheets.values.get(
      {
        spreadsheetId: config.spreadsheetId,
        range: "Blog!A2:I500",
        majorDimension: "ROWS",
      },
      { timeout: SHEETS_REQUEST_TIMEOUT_MS }
    );

    return (response.data.values ?? [])
      .filter((row) => String(row[8] ?? "").toLowerCase() === "true")
      .map((row, index) => ({
        id: String(row[0] || `post-${index + 1}`),
        title: String(row[1] || ""),
        subtitle: String(row[2] || ""),
        content: String(row[3] || ""),
        author: String(row[4] || "MineTrans"),
        date: String(row[5] || ""),
        category: String(row[6] || "Insights"),
        image: String(row[7] || ""),
        published: true,
      }))
      .filter((post) => post.title)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("[Google Sheets] Blog read failed", {
      code: error && typeof error === "object" && "code" in error ? String(error.code) : undefined,
      timeoutMs: SHEETS_REQUEST_TIMEOUT_MS,
    });
    return [];
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.id === id) || null;
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((post) => post.category === category);
}

export async function getLatestBlogPosts(limit: number = 5): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.slice(0, limit);
}
