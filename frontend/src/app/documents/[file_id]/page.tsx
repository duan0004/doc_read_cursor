"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiRefreshCw, FiSend } from "react-icons/fi";
import clsx from "clsx";

interface DocInfo {
  file_id: string;
  original_name: string;
  file_size: number;
  page_count: number;
  upload_time: string;
}

interface AnalysisResult {
  summary: string;
  generated_at: string;
}

export default function DocumentAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const file_id = params?.file_id as string;

  const [doc, setDoc] = useState<DocInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qaInput, setQaInput] = useState("");
  const [qaResult, setQaResult] = useState<string | null>(null);
  const [qaLoading, setQaLoading] = useState(false);

  // 获取文档信息
  useEffect(() => {
    if (!file_id) return;
    fetch(`/api/documents/${file_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDoc(data.data);
        else setError(data.message || "文档信息获取失败");
      })
      .catch(() => setError("文档信息获取失败"));
  }, [file_id]);

  // 获取AI结构化分析
  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setQaResult(null);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id }),
      });
      const data = await res.json();
      if (data.success) setAnalysis(data.data);
      else setError(data.message || "AI分析失败");
    } catch {
      setError("AI分析失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file_id) fetchAnalysis();
    // eslint-disable-next-line
  }, [file_id]);

  // 智能问答
  const handleAsk = async () => {
    if (!qaInput.trim()) return;
    setQaLoading(true);
    setQaResult(null);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id, question: qaInput }),
      });
      const data = await res.json();
      if (data.success) setQaResult(data.data.answer);
      else setQaResult(data.message || "AI问答失败");
    } catch {
      setQaResult("AI问答失败");
    } finally {
      setQaLoading(false);
    }
  };

  // 苹果风格配色
  const gradient = "bg-gradient-to-br from-[#f5f6fa] to-[#e5e9f2]";
  const card = "rounded-2xl shadow-xl bg-white/80 backdrop-blur border border-gray-200";
  const label = "text-gray-500 font-medium text-sm mb-1";
  const value = "text-gray-900 font-semibold text-lg";
  const tag = "inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold mr-2 mb-2";

  return (
    <div className={clsx("min-h-screen bg-gradient-to-br from-[#f6f7fa] to-[#e9ebf1] dark:from-darkbg dark:to-[#23232b] pb-20 pt-28 animate-fade-in")}>  
      <div className="max-w-3xl mx-auto pt-4 px-2 sm:px-4">
        {/* 顶部导航留白已由全局Header实现 */}
        {/* 文档信息卡片 */}
        {doc && (
          <div className={clsx(card, "p-8 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xl rounded-3xl bg-white/80 dark:bg-darkglass backdrop-blur-md border border-gray-100 dark:border-gray-800 animate-fade-in") + " transition-all"}>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                {doc.original_name}
              </h1>
              <div className="flex flex-wrap gap-6 text-gray-500 dark:text-gray-300 text-lg font-medium">
                <span>页数：{doc.page_count}</span>
                <span>大小：{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <span>上传时间：{doc.upload_time.slice(0, 19).replace('T', ' ')}</span>
              </div>
            </div>
            <button
              onClick={fetchAnalysis}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200 transition shadow-lg text-lg font-semibold active:scale-95"
              disabled={loading}
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              重新分析
            </button>
          </div>
        )}

        {/* 分析结果区块 */}
        <div className={clsx(card, "p-10 mb-10 min-h-[320px] flex flex-col justify-center items-center shadow-2xl rounded-3xl bg-white/80 dark:bg-darkglass backdrop-blur-md border border-gray-100 dark:border-gray-800 animate-fade-in") + " transition-all"}>
          {loading && <div className="text-gray-400 dark:text-gray-300 text-xl animate-pulse">AI分析中，请稍候…</div>}
          {error && <div className="text-red-500 text-xl font-semibold">{error}</div>}
          {!loading && !error && analysis && (
            <AnalysisBlock analysis={analysis} />
          )}
        </div>

        {/* 智能问答区块 */}
        <div className={clsx(card, "p-10 mb-10 shadow-2xl rounded-3xl bg-white/80 dark:bg-darkglass backdrop-blur-md border border-gray-100 dark:border-gray-800 animate-fade-in") + " transition-all"}>
          <div className="mb-6 text-gray-900 dark:text-white font-extrabold text-2xl flex items-center gap-2">🔎 智能问答</div>
          <div className="flex gap-3 mb-4">
            <input
              className="input-field text-lg font-medium"
              placeholder="请输入你的科研问题..."
              value={qaInput}
              onChange={e => setQaInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              disabled={qaLoading}
            />
            <button
              onClick={handleAsk}
              className="px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-200 transition shadow-lg text-lg font-semibold active:scale-95 flex items-center gap-2"
              disabled={qaLoading || !qaInput.trim()}
            >
              <FiSend />
              提问
            </button>
          </div>
          {qaLoading && <div className="text-gray-400 dark:text-gray-300 mt-2 text-base">AI思考中…</div>}
          {qaResult && <div className="mt-6 text-gray-900 dark:text-white whitespace-pre-line bg-gray-50 dark:bg-darkcard rounded-xl p-6 border border-gray-100 dark:border-gray-800 text-lg font-medium shadow-inner">{qaResult}</div>}
        </div>
      </div>
    </div>
  );
}

// 结构化摘要内容解析与展示
function AnalysisBlock({ analysis }: { analysis: any }) {
  if (!analysis) return <div>无分析内容</div>;
  const { purpose, method, finding, conclusion, keywords } = analysis;
  const keywordList = typeof keywords === 'string' ? keywords.split(/[，,、\s]+/).filter(Boolean) : Array.isArray(keywords) ? keywords : [];
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="text-gray-500 dark:text-gray-300 font-semibold text-lg mb-1">研究目的</div>
        <div className="text-gray-900 dark:text-white text-2xl font-bold mb-6 min-h-[32px]">{purpose || "-"}</div>
        <div className="text-gray-500 dark:text-gray-300 font-semibold text-lg mb-1">方法概述</div>
        <div className="text-gray-900 dark:text-white text-2xl font-bold mb-6 min-h-[32px]">{method || "-"}</div>
        <div className="text-gray-500 dark:text-gray-300 font-semibold text-lg mb-1">关键发现</div>
        <div className="text-gray-900 dark:text-white text-2xl font-bold mb-6 min-h-[32px]">{finding || "-"}</div>
        <div className="text-gray-500 dark:text-gray-300 font-semibold text-lg mb-1">结论总结</div>
        <div className="text-gray-900 dark:text-white text-2xl font-bold mb-6 min-h-[32px]">{conclusion || "-"}</div>
        <div className="text-gray-500 dark:text-gray-300 font-semibold text-lg mb-1">关键词</div>
        <div className="flex flex-wrap gap-3">
          {keywordList.length > 0 ? keywordList.map((kw: string, i: number) => (
            <span key={i} className="inline-block px-4 py-2 rounded-full bg-gray-100 dark:bg-darkcard text-gray-700 dark:text-gray-100 text-base font-semibold mr-2 mb-2 shadow-sm">{kw}</span>
          )) : <span className="text-gray-400 dark:text-gray-500">-</span>}
        </div>
      </div>
    </div>
  );
} 