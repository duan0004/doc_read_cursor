'use client';

import React, { useState } from 'react';
import { FiSearch, FiLoader, FiFileText, FiTarget } from 'react-icons/fi';
import axios from 'axios';

interface SearchResult {
  document: {
    file_id: string;
    original_name: string;
    upload_time: string;
  };
  chunk: {
    id: string;
    page_number: number;
    chunk_index: number;
  };
  similarity: number;
  snippet: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    results: SearchResult[];
    total: number;
    stats: {
      totalDocuments: number;
      totalChunks: number;
    };
  };
}

export const VectorSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ totalDocuments: number; totalChunks: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<SearchResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/search`,
        {
          params: { q: query, limit: 20 }
        }
      );
      
      if (response.data.success) {
        setResults(response.data.data.results);
        setStats(response.data.data.stats);
      } else {
        setError('搜索失败');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatSnippet = (snippet: string) => {
    // 将**text**格式转换为高亮
    return snippet.replace(/\*\*(.*?)\*\*/g, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <FiSearch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          智能文档搜索
        </h3>
        {stats && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({stats.totalDocuments} 文档, {stats.totalChunks} 分块)
          </span>
        )}
      </div>

      {/* 搜索输入 */}
      <div className="flex space-x-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入搜索关键词，如：机器学习、深度学习、神经网络..."
            className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiSearch className="w-4 h-4" />
          )}
          <span>{loading ? '搜索中...' : '搜索'}</span>
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 搜索结果 */}
      {results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">
              搜索结果 ({results.length} 条)
            </h4>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FiFileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <h5 className="font-medium text-gray-900 dark:text-white truncate">
                      {result.document.original_name}
                    </h5>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>第{result.chunk.page_number}页</span>
                    <div className="flex items-center space-x-1">
                      <FiTarget className="w-3 h-3" />
                      <span>{(result.similarity * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatSnippet(result.snippet) }}
                />
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  上传时间: {new Date(result.document.upload_time).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : query && !loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FiSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>没有找到相关内容</p>
          <p className="text-sm mt-1">尝试使用不同的关键词</p>
        </div>
      )}

      {!query && !loading && results.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FiSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>输入关键词开始搜索文档内容</p>
          <p className="text-sm mt-1">支持中英文搜索，智能匹配相关段落</p>
        </div>
      )}
    </div>
  );
};