import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { FeatureCard } from './components/FeatureCard';
import { SearchBar } from './components/SearchBar';
import { ProcessSteps } from './components/ProcessSteps';
import { 
  Upload, 
  FileText, 
  Search, 
  MessageCircle, 
  Eye, 
  Zap,
  Sparkles,
  BookOpen,
  Heart,
  Brain,
  Target,
  Lightbulb
} from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const features = [
    {
      icon: Upload,
      title: 'PDF 文档上传',
      description: '支持拖拽上传，最大 50MB，自动识别文档结构和内容',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: '智能摘要生成',
      description: '基于AI自动提取研究目的、方法、发现和核心结论',
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      icon: Target,
      title: '关键词提取',
      description: '智能识别核心概念、专业术语和研究重点',
      color: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    {
      icon: MessageCircle,
      title: '交互式问答',
      description: '基于文献内容的智能对话系统，深度理解文档',
      color: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
      icon: Eye,
      title: '结构化展示',
      description: '美观的摘要和内容可视化界面，清晰易读',
      color: 'bg-gradient-to-br from-indigo-500 to-blue-600'
    },
    {
      icon: Zap,
      title: '快速处理',
      description: '基于先进AI模型，提供秒级响应和高效分析',
      color: 'bg-gradient-to-br from-amber-500 to-orange-500'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-700 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full blur-2xl" />
      </div>

      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="relative z-10 pt-20">
        {/* 主标题区域 */}
        <section className="text-center py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI学术助手
              </span>
              <br />
              <span className="text-3xl md:text-4xl font-semibold text-gray-700 dark:text-gray-300">
                智能文献分析与检索平台
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              集成文献解读与检索功能的一站式学术研究平台，支持PDF上传分析、arXiv智能检索、
              <br className="hidden md:block" />
              自动摘要生成和交互式问答，让学术研究更高效便捷
            </p>
          </div>
        </section>

        {/* 双模块并行区域 */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* 文献智能解读模块 */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    📘 文献智能解读
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    上传PDF文献，AI自动提取摘要、关键词和核心观点
                  </p>
                </div>
                
                <div className="mb-8">
                  <FileUpload />
                </div>
                
                {/* 解读功能特点 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>智能摘要生成</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span>关键词自动提取</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>交互式智能问答</span>
                  </div>
                </div>
              </div>
              
              {/* 智能文献检索模块 */}
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    🔍 智能文献检索
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    通过关键词快速发现相关学术文献，AI助力精准匹配
                  </p>
                </div>
                
                <div className="mb-8">
                  <SearchBar />
                </div>
                
                {/* 检索功能特点 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>arXiv智能检索</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span>AI智能匹配推荐</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>实时结果预览</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* 核心功能区域 */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                核心功能特性
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                强大的AI驱动功能集合，让文献分析变得简单高效
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 使用流程区域 */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/30 dark:to-gray-700/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                简单三步流程
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                轻松完成文献分析，从上传到获得深度见解
              </p>
            </div>
            
            <ProcessSteps />
          </div>
        </section>

        {/* 统计数据区域 */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">已处理文献</div>
              </div>
              <div className="text-center p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">95%</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">准确率</div>
              </div>
              <div className="text-center p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">3秒</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">平均处理时间</div>
              </div>
              <div className="text-center p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">全天候服务</div>
              </div>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <footer className="py-16 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                文献智能解读模块
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                让AI成为您的学术研究助手，提升研究效率，发现更多可能
              </p>
              <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                <span>© 2024 文献智能解读模块. Built with</span>
                <Heart className="w-4 h-4 mx-2 text-red-500" />
                <span>by AI Superman</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;