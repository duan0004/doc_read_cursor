import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import DarkModeToggle from '../components/DarkModeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '文献智能解读模块',
  description: '基于AI的学术文献智能分析系统，支持PDF上传、自动摘要、关键词提取和交互式问答',
  keywords: ['AI', '文献分析', 'PDF', '学术论文', '智能摘要', '问答系统'],
  authors: [{ name: 'AI Superman' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gradient-to-br from-[#f6f7fa] to-[#e9ebf1] min-h-screen font-sfpro antialiased transition-colors duration-300`} style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
        <div className="min-h-screen">
          {/* 深色模式切换按钮，右上角浮动 */}
          <DarkModeToggle />
          {/* 顶部毛玻璃导航栏容器，具体内容由各页面Header决定 */}
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)'
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}