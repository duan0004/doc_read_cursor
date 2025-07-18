"use client";
import { useState } from "react";

interface Paper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  link: string;
}

export default function ArxivSearch() {
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);
    setPapers([]);
    if (!keywords.trim()) {
      setError("请输入3-5个英文关键词，用逗号分隔");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/arxiv/search?keywords=${encodeURIComponent(keywords)}`);
      const data = await res.json();
      if (data.success) {
        setPapers(data.data);
        if (data.data.length === 0) setError("未找到相关文献");
      } else {
        setError(data.message || "检索失败");
      }
    } catch (e) {
      setError("检索失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-10 animate-fade-in">
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <input
          className="input-field text-lg flex-1"
          placeholder="输入3-5个英文关键词，用逗号分隔，如: LLM, vision, transformer"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <button
          className="btn-primary px-8 py-2 text-lg"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "检索中..." : "arXiv智能检索"}
        </button>
      </div>
      {error && <div className="text-red-500 mb-4 text-base">{error}</div>}
      <div className="space-y-6">
        {papers.map(paper => (
          <div key={paper.id} className="rounded-2xl bg-white/80 dark:bg-darkglass border border-gray-100 dark:border-gray-800 p-6 shadow animate-fade-in">
            <a href={paper.link} target="_blank" rel="noopener noreferrer" className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {paper.title}
            </a>
            <div className="text-gray-500 dark:text-gray-300 text-sm mb-2 mt-1 flex flex-wrap gap-2">
              <span>作者: {paper.authors.join(", ")}</span>
              <span>发表: {paper.published.slice(0, 10)}</span>
            </div>
            <div className="text-gray-700 dark:text-gray-100 text-base line-clamp-4 mb-1">
              {paper.summary}
            </div>
            <a href={paper.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-300 text-sm hover:underline">arXiv原文</a>
          </div>
        ))}
      </div>
    </div>
  );
} 