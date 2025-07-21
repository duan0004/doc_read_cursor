'use client';

import React, { useState } from 'react';
import { Search, Calendar, Users, ExternalLink, Download, Eye, Star, BookOpen } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: Array<{ id: string; name: string }>;
  year: number;
  venue: string;
  url: string;
  citationCount: number;
  influentialCitationCount: number;
  isOpenAccess: boolean;
  openAccessPdf: string;
  publicationDate: string;
  publicationTypes: string[];
  publicationVenue: string;
  referenceCount: number;
  fieldsOfStudy: string[];
}

interface SearchResult {
  papers: Paper[];
  total: number;
  offset: number;
  limit: number;
}

const SemanticSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [limit, setLimit] = useState('20');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('请输入搜索关键词');
      return;
    }

    setLoading(true);
    setError('');
    setSelectedPaper(null);

    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: limit
      });
      
      if (year) {
        params.append('year', year);
      }

      const response = await fetch(`/api/semantic/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.message || '搜索失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Semantic Scholar search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperClick = (paper: Paper) => {
    setSelectedPaper(paper);
  };

  const formatAuthors = (authors: Array<{ name: string }>) => {
    return authors.map(author => author.name).join(', ');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* 搜索表单 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
          Semantic Scholar 文献搜索
        </h2>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入关键词、标题或作者..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="年份 (可选)"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="10">10 篇</option>
                <option value="20">20 篇</option>
                <option value="50">50 篇</option>
                <option value="100">100 篇</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                搜索文献
              </>
            )}
          </button>
        </form>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 搜索结果 */}
      {results && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              找到 {results.total} 篇相关文献
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              显示第 {results.offset + 1} - {results.offset + results.papers.length} 篇
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {results.papers.map((paper, index) => (
              <div
                key={paper.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                onClick={() => handlePaperClick(paper)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {paper.title}
                    </h4>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3 space-x-4">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {formatAuthors(paper.authors)}
                      </span>
                      {paper.year && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {paper.year}
                        </span>
                      )}
                      {paper.venue && (
                        <span className="text-blue-600 dark:text-blue-400">
                          {paper.venue}
                        </span>
                      )}
                    </div>
                    
                    {paper.abstract && (
                      <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                        {paper.abstract}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <Star className="w-4 h-4 mr-1" />
                        {paper.citationCount} 引用
                      </span>
                      {paper.influentialCitationCount > 0 && (
                        <span className="flex items-center text-orange-600 dark:text-orange-400">
                          <Star className="w-4 h-4 mr-1" />
                          {paper.influentialCitationCount} 高影响力引用
                        </span>
                      )}
                      {paper.isOpenAccess && (
                        <span className="flex items-center text-blue-600 dark:text-blue-400">
                          <Download className="w-4 h-4 mr-1" />
                          开放获取
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                    {paper.openAccessPdf && (
                      <a
                        href={paper.openAccessPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 论文详情模态框 */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  论文详情
                </h3>
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedPaper.title}
                </h4>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4 space-x-4">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {formatAuthors(selectedPaper.authors)}
                  </span>
                  {selectedPaper.year && (
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {selectedPaper.year}
                    </span>
                  )}
                  {selectedPaper.publicationDate && (
                    <span>
                      发布日期: {formatDate(selectedPaper.publicationDate)}
                    </span>
                  )}
                </div>
                
                {selectedPaper.venue && (
                  <p className="text-blue-600 dark:text-blue-400 mb-4">
                    <strong>发表期刊/会议:</strong> {selectedPaper.venue}
                  </p>
                )}
                
                {selectedPaper.abstract && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">摘要</h5>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedPaper.abstract}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedPaper.citationCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">引用次数</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {selectedPaper.influentialCitationCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">高影响力引用</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedPaper.referenceCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">参考文献</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {selectedPaper.fieldsOfStudy?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">研究领域</div>
                  </div>
                </div>
                
                {selectedPaper.fieldsOfStudy && selectedPaper.fieldsOfStudy.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">研究领域</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedPaper.fieldsOfStudy.map((field, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-4">
                  {selectedPaper.url && (
                    <a
                      href={selectedPaper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      查看论文
                    </a>
                  )}
                  {selectedPaper.openAccessPdf && (
                    <a
                      href={selectedPaper.openAccessPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemanticSearch; 