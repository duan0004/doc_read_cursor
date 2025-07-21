'use client';

import React from 'react';
import { Header } from '@/components/Header';
import SemanticSearch from '@/components/SemanticSearch';
import { BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SemanticPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* 页面头部 */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>返回首页</span>
                </Link>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Semantic Scholar 文献搜索
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      基于AI的学术文献智能检索平台
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <main className="pt-8 pb-16">
          <SemanticSearch />
        </main>

        {/* 页脚 */}
        <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Powered by Semantic Scholar API • 文献智能解读模块
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 