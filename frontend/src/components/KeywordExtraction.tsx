'use client';

import React, { useState } from 'react';
import { FiTag, FiLoader, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

interface KeywordExtractionProps {
  fileId: string;
  initialKeywords?: string[];
}

export const KeywordExtraction: React.FC<KeywordExtractionProps> = ({
  fileId,
  initialKeywords = []
}) => {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractKeywords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/keywords`,
        { file_id: fileId }
      );
      
      if (response.data.success) {
        setKeywords(response.data.data.keywords);
      } else {
        setError(response.data.message || '关键词提取失败');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiTag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            关键词提取
          </h3>
        </div>
        
        <button
          onClick={extractKeywords}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          {loading ? (
            <FiLoader className="w-4 h-4 animate-spin" />
          ) : (
            <FiTag className="w-4 h-4" />
          )}
          <span>{loading ? '提取中...' : '提取关键词'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <FiAlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {keywords.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            已提取 {keywords.length} 个关键词：
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FiTag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>点击"提取关键词"按钮开始分析文档关键词</p>
        </div>
      )}
    </div>
  );
};