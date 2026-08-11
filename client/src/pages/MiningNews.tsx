import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Loader2, AlertCircle } from "lucide-react";

interface NewsArticle {
  id: number;
  headline: string;
  excerpt: string;
  publication: string;
  sourceUrl: string;
  publishedAt: Date | string;
  category?: string | null;
  addedAt?: Date | string;
}

export default function MiningNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest mining news from the backend
  const {
    data: newsData,
    isLoading,
    error: queryError,
  } = trpc.miningNews.getLatest.useQuery();

  // Refresh news mutation
  const refreshMutation = trpc.miningNews.refreshNews.useMutation();

  useEffect(() => {
    if (newsData) {
      setArticles(newsData as unknown as NewsArticle[]);
      setLoading(false);
    }
  }, [newsData]);

  useEffect(() => {
    if (queryError) {
      setError("Failed to load mining news. Please try again.");
      setLoading(false);
    }
  }, [queryError]);

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync();
      // Refetch the news after refresh
      window.location.reload();
    } catch (err) {
      setError("Failed to refresh news. Please try again.");
    }
  };

  const formatDate = (dateValue: Date | string) => {
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      "Commodity Prices": "bg-blue-900/20 text-blue-300",
      Regulation: "bg-purple-900/20 text-purple-300",
      Technology: "bg-green-900/20 text-green-300",
      Insurance: "bg-amber-900/20 text-amber-300",
      Safety: "bg-red-900/20 text-red-300",
      General: "bg-gray-700/20 text-gray-300",
    };
    return colors[category || "General"] || colors.General;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white py-16 px-4">
      <div className="max-width-container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Mining News</h1>
          <p className="text-lg text-gray-400 max-w-2xl mb-6">
            Weekly curated mining news from major publications, focused on
            business interruption, tailings, machinery, power, regulation, and
            safety in Sub-Saharan Africa.
          </p>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 rounded-lg transition-colors"
          >
            {refreshMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <span>↻</span>
                Refresh News
              </>
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-300">Error</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <span className="ml-3 text-gray-400">Loading mining news...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && articles.length === 0 && !error && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No mining news articles available yet.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back soon or click Refresh to fetch the latest news.
            </p>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map(article => (
              <article
                key={article.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-amber-600/50 transition-colors group"
              >
                {/* Category Badge */}
                {article.category && (
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(article.category)}`}
                  >
                    {article.category}
                  </div>
                )}

                {/* Headline */}
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                  {article.headline}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-amber-500">
                      {article.publication}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>

                  {/* Read More Link */}
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <span className="text-sm font-semibold">Read</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
