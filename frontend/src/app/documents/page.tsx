'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiFileText, FiEye, FiTrash2, FiUpload, FiSearch, FiCheckSquare, FiSquare } from 'react-icons/fi';
import axios from 'axios';
import { BatchProcessor } from '@/components/BatchProcessor';

interface DocumentInfo {
  file_id: string;
  original_name: string;
  file_size: number;
  page_count: number;
  upload_time: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showBatchProcessor, setShowBatchProcessor] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents`
      );
      if (response.data.success) {
        setDocuments(response.data.data.documents);
      }
    } catch (error) {
      console.error('获取文档列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (fileId: string, fileName: string) => {
    if (!confirm(`确定要删除文档"${fileName}"吗？此操作不可恢复。`)) return;
    
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/${fileId}`
      );
      if (response.data.success) {
        setDocuments(prev => prev.filter(doc => doc.file_id !== fileId));
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

  const filteredDocuments = documents.filter(doc =>
    doc.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDocumentSelection = (fileId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.file_id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载文档列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              文档管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              管理您上传的PDF文档，查看分析结果
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-4">
            <button
              onClick={() => setShowBatchProcessor(!showBatchProcessor)}
              className={`btn-secondary flex items-center space-x-2 ${showBatchProcessor ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
            >
              <FiCheckSquare className="w-4 h-4" />
              <span>批量处理</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary flex items-center space-x-2"
            >
              <FiUpload className="w-4 h-4" />
              <span>上传新文档</span>
            </button>
          </div>
        </div>

        {/* 搜索栏和批量操作 */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索文档名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          {filteredDocuments.length > 0 && (
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSelectAll}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {selectedDocuments.length === filteredDocuments.length ? (
                  <FiCheckSquare className="w-4 h-4" />
                ) : (
                  <FiSquare className="w-4 h-4" />
                )}
                <span>全选 ({selectedDocuments.length}/{filteredDocuments.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* 批量处理面板 */}
        {showBatchProcessor && (
          <div className="mb-6">
            <BatchProcessor 
              selectedDocuments={selectedDocuments}
              onJobComplete={() => {
                // 可以在这里处理任务完成后的逻辑
              }}
            />
          </div>
        )}

        {/* 文档列表 */}
        {filteredDocuments.length > 0 ? (
          <div className="grid gap-4">
            {filteredDocuments.map((document) => (
              <div
                key={document.file_id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* 选择框 */}
                    <button
                      onClick={() => toggleDocumentSelection(document.file_id)}
                      className="flex-shrink-0 p-1"
                    >
                      {selectedDocuments.includes(document.file_id) ? (
                        <FiCheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <FiSquare className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </button>
                    
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <FiFileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {document.original_name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>•</span>
                        <span>{document.page_count} 页</span>
                        <span>•</span>
                        <span>{new Date(document.upload_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/document/${document.file_id}`)}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>查看</span>
                    </button>
                    
                    <button
                      onClick={() => deleteDocument(document.file_id, document.original_name)}
                      className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>删除</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? '没有找到匹配的文档' : '还没有上传任何文档'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? '尝试使用不同的搜索词' : '上传您的第一个PDF文档开始分析'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/')}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <FiUpload className="w-4 h-4" />
                <span>上传文档</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}