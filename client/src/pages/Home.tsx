import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest news from the news.html page or API
    // For now, we'll display placeholder news
    const sampleNews = [
      {
        id: 1,
        title: "Tailings Dam Safety Standards Tightened",
        category: "TAILINGS RISK",
        description: "Regulatory bodies across Sub-Saharan Africa implement stricter tailings management protocols following recent incidents, impacting operational costs.",
        date: "21 Jul 2026",
        image: "https://via.placeholder.com/400x300?text=Tailings+Risk"
      },
      {
        id: 2,
        title: "Machinery Breakdown Coverage Expanded",
        category: "MACHINERY BREAKDOWN",
        description: "New insurance products now cover predictive maintenance failures and IoT-enabled equipment monitoring for mining operations.",
        date: "19 Jul 2026",
        image: "https://via.placeholder.com/400x300?text=Machinery"
      },
      {
        id: 3,
        title: "Business Interruption Claims Rise 15%",
        category: "BUSINESS INTERRUPTION",
        description: "Mining companies increasingly filing BI claims due to supply chain disruptions and regulatory compliance delays across the region.",
        date: "17 Jul 2026",
        image: "https://via.placeholder.com/400x300?text=Business+Interruption"
      }
    ];
    
    setNews(sampleNews);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header with Logo */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
          <img 
            src="/manus-storage/MineTranslogov3_642e9a0a.png" 
            alt="MineTrans" 
            className="w-12 h-12"
          />
          <div>
            <h1 className="text-2xl font-bold text-amber-600">MineTrans</h1>
            <p className="text-sm text-slate-400">Mining and Marine Insurance</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* CFO-Focused Intro Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Quantify Your <span className="text-amber-600">Mining Risk</span>
              </h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                As a CFO, you need precise visibility into business interruption exposure. MineTrans specializes in quantifying operational risk—from tailings management to machinery failure—so you can structure insurance that protects your balance sheet when the plant stops.
              </p>
              <p className="text-slate-400 mb-8">
                We map single points of failure, calculate downtime costs, and design cover that reflects your actual risk profile. No guesswork. Just data-driven protection.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3">
                  Request a BI Review
                </Button>
                <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-600/10 px-8 py-3">
                  Explore Mining Risk
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <Card className="bg-slate-800 border-slate-700 p-8">
                <div className="space-y-6">
                  <div className="border-l-4 border-amber-600 pl-4">
                    <p className="text-sm text-slate-400 uppercase tracking-wide">Business Interruption</p>
                    <p className="text-2xl font-bold text-amber-600 mt-2">12-Step Methodology</p>
                  </div>
                  <div className="border-l-4 border-amber-600 pl-4">
                    <p className="text-sm text-slate-400 uppercase tracking-wide">Underwriting Framework</p>
                    <p className="text-2xl font-bold text-amber-600 mt-2">18 Risk Categories</p>
                  </div>
                  <div className="border-l-4 border-amber-600 pl-4">
                    <p className="text-sm text-slate-400 uppercase tracking-wide">Coverage Areas</p>
                    <p className="text-2xl font-bold text-amber-600 mt-2">Sub-Saharan Africa</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section>
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">Latest News</h3>
            <p className="text-slate-400">Industry insights for mining CFOs and operations directors</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading news...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article) => (
                <Card key={article.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-amber-600/50 transition-colors">
                  <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <span className="text-slate-600 text-sm">Featured Image</span>
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-widest text-amber-600 font-semibold mb-3">
                      {article.category}
                    </p>
                    <h4 className="text-xl font-bold mb-3 leading-tight text-white">
                      {article.title}
                    </h4>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <span className="text-xs text-slate-500">{article.date}</span>
                      <a href="#" className="text-amber-600 hover:text-amber-500 text-sm font-semibold">
                        Read →
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Certification CTA */}
        <section className="mt-16 bg-gradient-to-r from-amber-600/10 to-amber-700/10 border border-amber-600/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">Professional Certification Available</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Enhance your team's expertise with our comprehensive Mining Insurance Certification Program. Learn the 12-step BI methodology and master 18 underwriting categories.
          </p>
          <Button className="bg-amber-600 hover:bg-amber-700">
            Explore Certification Program
          </Button>
        </section>
      </main>
    </div>
  );
}
