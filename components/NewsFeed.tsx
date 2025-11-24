import React, { useEffect, useState } from 'react';
import { fetchDisasterNews } from '../services/externalApiService';
import { NewsArticle } from '../types';
import { Newspaper, ExternalLink, RefreshCw, ChevronRight, ImageOff } from 'lucide-react';

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    setLoading(true);
    const articles = await fetchDisasterNews();
    setNews(articles);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-blue-600" /> Crisis Wire
        </h3>
        <button onClick={loadNews} className="text-slate-400 hover:text-blue-600">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {loading && (
             <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3 p-3 bg-white rounded-xl border border-slate-200">
                        <div className="w-24 h-24 bg-slate-200 rounded-lg"></div>
                        <div className="flex-1 py-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
             </div>
        )}

        {!loading && news.map((article) => (
            <a 
                key={article.id} 
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 hover:border-blue-400 hover:shadow-md transition-all group no-underline"
            >
                {/* Image Section */}
                <div className="flex-shrink-0 relative overflow-hidden rounded-lg w-full md:w-32 h-40 md:h-24 bg-slate-100">
                    {article.imageUrl ? (
                        <img 
                            src={article.imageUrl} 
                            alt={article.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                // Fallback if image fails
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    {/* Fallback Icon (Hidden by default, shown via onError or if no URL) */}
                    <div className={`absolute inset-0 flex items-center justify-center text-slate-300 ${article.imageUrl ? 'hidden' : ''}`}>
                        <Newspaper className="w-8 h-8" />
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-blue-100">{article.category}</span>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{article.timeAgo}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 mb-2">
                            {article.title}
                        </h4>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-50">
                        <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                            {article.source}
                        </span>
                        
                        <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Read Story <ChevronRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </a>
        ))}
      </div>
      
      <div className="text-center pt-2">
        <p className="text-[10px] text-slate-400">News curated from local East African sources.</p>
      </div>
    </div>
  );
};

export default NewsFeed;