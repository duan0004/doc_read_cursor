import React, { useState } from 'react';
import { Search, Sparkles, Zap } from 'lucide-react';

export const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      console.log('Searching for:', searchQuery);
      
      // 模拟搜索过程
      setTimeout(() => {
        setIsSearching(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full">
      <div className="relative bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 p-3 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center space-x-4">
          {/* 搜索图标 */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
            <Search className="w-5 h-5 text-white" />
          </div>
          
          {/* 输入框 */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="输入关键词，如: LLM, vision, transformer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full text-base bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 py-3 px-2"
            />
            
            {/* 输入提示 */}
            {searchQuery.length === 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-gray-400 dark:text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs hidden sm:block">AI匹配</span>
              </div>
            )}
          </div>
          
          {/* 搜索按钮 */}
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:block">搜索中</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span className="hidden sm:block">检索</span>
                <span className="sm:hidden">搜索</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* 搜索建议 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['machine learning', 'deep learning', 'neural networks', 'computer vision', 'natural language processing'].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setSearchQuery(suggestion)}
            className="px-3 py-1.5 bg-white/40 dark:bg-gray-600/40 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200/50 dark:border-gray-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-200 text-xs font-medium"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};