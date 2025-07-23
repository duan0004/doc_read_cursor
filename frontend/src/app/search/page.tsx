'use client';

import React, { useState } from 'react';
import { VectorSearch } from '@/components/VectorSearch';
import { ArxivSearch } from '@/components/ArxivSearch';
import { SemanticSearch } from '@/components/SemanticSearch';
import { FiSearch, FiDatabase, FiGlobe } from 'react-icons/fi';

type SearchTab = 'vector' | 'arxiv' | 'semantic';

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<SearchTab>('vector');

  const tabs = [
    {
      id: 'vector' as SearchTab,
      label: '文档搜索',
      icon: FiDatabase,
      description: '在已上传的文档中搜索'
    },
    {
      id: 'arxiv' as SearchTab,
      label: 'arXiv检索',
      icon: FiGlobe,
      description: '搜索arXiv学术论文'
    },
    {
      id: 'semantic' as SearchTab,
      label: 'Semantic Scholar',
      icon: FiGlobe,
      description: '搜索Semantic Scholar数据库'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiSearch className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            智能搜索中心
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            集成文档内容搜索与学术文献检索，一站式满足您的研究需求
          </p>
        </div>

        {/* 搜索标签页 */}
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 标签页描述 */}
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* 搜索内容 */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'vector' && <VectorSearch />}
            {activeTab === 'arxiv' && <ArxivSearch />}
            {activeTab === 'semantic' && <SemanticSearch />}
          </div>
        </div>

        {/* 搜索提示 */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              搜索技巧
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">文档搜索</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 支持中英文关键词</li>
                  <li>• 智能语义匹配</li>
                  <li>• 按相似度排序</li>
                  <li>• 高亮显示匹配内容</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">arXiv检索</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 最新学术论文</li>
                  <li>• AI语义重排序</li>
                  <li>• 可设置时间范围</li>
                  <li>• 支持多关键词组合</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Semantic Scholar</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 海量学术数据库</li>
                  <li>• 引用分析功能</li>
                  <li>• 开放获取识别</li>
                  <li>• 作者和期刊信息</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}