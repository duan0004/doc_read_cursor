'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiFileText, FiMessageCircle, FiDownload, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { KeywordExtraction } from '@/components/KeywordExtraction';

interface DocumentInfo {
  file_id: string;
  original_name: string;
  file_size: number;
  page_count: number;
  upload_time: string;
  summary?: {
    purpose: string;
    method: string;
    finding: string;
    conclusion: string;
    keywords: string;
  };
  keywords?: string[];
}

interface QARecord {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.id as string;
  
  const [document, setDocument] = useState<DocumentInfo | null>(null);
  const [qaHistory, setQAHistory] = useState<QARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (fileId) {
      fetchDocumentDetail();
      fetchQAHistory();
    }
  }, [fileId]);

  const fetchDocumentDetail = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/${fileId}`
      );
      if (response.data.success) {
        setDocument(response.data.data);
      }
    } catch (error) {
      console.error('获取文档详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQAHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/${fileId}/qa`
      );
      if (response.data.success) {
        setQAHistory(response.data.data);
      }
    } catch (error) {
      console.error('获取问答历史失败:', error);
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/summarize`,
        { file_id: fileId }
      );
      if (response.data.success) {
        setDocument(prev => prev ? {
          ...prev,
          summary: {
            purpose: response.data.data.purpose,
            method: response.data.data.method,
            finding: response.data.data.finding,
            conclusion: response.data.data.conclusion,
            keywords: response.data.data.keywords
          }
        } : null);
      }
    } catch (error) {
      console.error('生成摘要失败:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setAskLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/ask`,
        { file_id: fileId, question }
      );
      if (response.data.success) {
        setQAHistory(prev => [{
          id: Date.now().toString(),
          question,
          answer: response.data.data.answer,
          created_at: new Date().toISOString()
        }, ...prev]);
        setQuestion('');
      }
    } catch (error) {
      console.error('问答失败:', error);
    } finally {
      setAskLoading(false);
    }
  };

  const deleteDocument = async () => {
    if (!confirm('确定要删除这个文档吗？此操作不可恢复。')) return;
    
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/${fileId}`
      );
      if (response.data.success) {
        router.push('/documents');
      }
    } catch (error) {
      console.error('删除文档失败:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载文档详情中...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">文档不存在</p>
          <button
            onClick={() => router.push('/documents')}
            className="mt-4 btn-primary"
          >
            返回文档列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 头部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/documents')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>返回列表</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {document.original_name}
            </h1>
          </div>
          
          <button
            onClick={deleteDocument}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>删除文档</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧：文档信息和摘要 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文档基本信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <FiFileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">文档信息</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">文件大小：</span>
                  <span className="text-gray-900 dark:text-white">{formatFileSize(document.file_size)}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">页数：</span>
                  <span className="text-gray-900 dark:text-white">{document.page_count} 页</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">上传时间：</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(document.upload_time).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">文档ID：</span>
                  <span className="text-gray-900 dark:text-white font-mono text-xs">{document.file_id}</span>
                </div>
              </div>
            </div>

            {/* 智能摘要 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">智能摘要</h2>
                <button
                  onClick={generateSummary}
                  disabled={summaryLoading}
                  className="btn-secondary"
                >
                  {summaryLoading ? '生成中...' : '生成摘要'}
                </button>
              </div>
              
              {document.summary ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">研究目的</h4>
                    <p className="text-gray-700 dark:text-gray-300">{document.summary.purpose}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">方法概述</h4>
                    <p className="text-gray-700 dark:text-gray-300">{document.summary.method}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">关键发现</h4>
                    <p className="text-gray-700 dark:text-gray-300">{document.summary.finding}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">结论总结</h4>
                    <p className="text-gray-700 dark:text-gray-300">{document.summary.conclusion}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>点击"生成摘要"按钮开始AI智能分析</p>
                </div>
              )}
            </div>

            {/* 关键词提取 */}
            <KeywordExtraction 
              fileId={fileId} 
              initialKeywords={document.keywords} 
            />
          </div>

          {/* 右侧：问答系统 */}
          <div className="space-y-6">
            {/* 问答输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <FiMessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">智能问答</h3>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="请输入您想了解的问题..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
                <button
                  onClick={askQuestion}
                  disabled={askLoading || !question.trim()}
                  className="w-full btn-primary"
                >
                  {askLoading ? '思考中...' : '提问'}
                </button>
              </div>
            </div>

            {/* 问答历史 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">问答历史</h3>
              
              {qaHistory.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {qaHistory.map((qa) => (
                    <div key={qa.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">Q: {qa.question}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(qa.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-gray-700 dark:text-gray-300">A: {qa.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FiMessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>还没有问答记录，开始提问吧！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}