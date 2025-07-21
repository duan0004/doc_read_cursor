import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color }) => {
  return (
    <div className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
      {/* 背景渐变效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-700/30 dark:to-gray-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      
      <div className="relative z-10">
        {/* 图标容器 */}
        <div className="flex items-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* 内容 */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            {description}
          </p>
        </div>
      </div>
      
      {/* 装饰性元素 */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-gray-600/30 dark:to-gray-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};