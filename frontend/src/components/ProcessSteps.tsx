import React from 'react';
import { Upload, Brain, MessageCircle, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: '上传 PDF 文献',
    description: '拖拽或点击上传您的学术论文PDF文件，支持多文件批量处理',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
  },
  {
    icon: Brain,
    title: 'AI 智能分析',
    description: '系统自动提取摘要、关键词和核心观点，深度理解文献内容',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
  },
  {
    icon: MessageCircle,
    title: '交互式问答',
    description: '基于文献内容进行智能问答和深度讨论，获得更多见解',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
  }
];

export const ProcessSteps: React.FC = () => {
  return (
    <div className="relative">
      {/* 连接线 */}
      <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
        <div className="flex justify-between items-center px-32">
          <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-600" />
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-12">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative group"
          >
            <div className={`relative bg-gradient-to-br ${step.bgColor} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 group-hover:-translate-y-2`}>
              {/* 步骤编号 */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {index + 1}
              </div>
              
              {/* 图标 */}
              <div className="flex justify-center mb-8">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              
              {/* 内容 */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  {step.description}
                </p>
              </div>
              
              {/* 装饰性元素 */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-white/30 dark:bg-gray-700/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
