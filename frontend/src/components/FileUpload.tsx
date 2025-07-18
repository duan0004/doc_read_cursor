'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const FileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    setSelectedFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploadStatus('uploading');
    try {
      // 只支持单文件上传，取第一个文件
      const file = selectedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      // 彻底写死API路径，排除环境变量干扰
      const apiBase = 'http://localhost:8000';
      console.log('上传API路径:', `${apiBase}/api/upload/pdf`);
      const response = await fetch(`${apiBase}/api/upload/pdf`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || '上传失败');
      }
      setUploadStatus('success');
      toast.success('上传成功，正在分析...');
      setTimeout(() => {
        setUploadStatus('idle');
        setSelectedFiles([]);
        // 跳转到文档详情页
        router.push(`/document/${result.data.file_id}`);
      }, 1200);
    } catch (error: any) {
      setUploadStatus('error');
      toast.error(error?.message || '上传失败，请重试');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  return (
    <div className="w-full">
      {/* 主上传区域 */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-500 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-102 shadow-xl'
            : 'border-gray-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
        } bg-white/40 dark:bg-gray-600/40 backdrop-blur-sm shadow-md`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {/* 上传图标 */}
          <div className={`relative transition-all duration-500 ${
            isDragging ? 'scale-105' : 'hover:scale-102'
          }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isDragging 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 text-gray-600 dark:text-gray-300 shadow-md'
            }`}>
              <Upload className="w-8 h-8" />
            </div>
            {uploadStatus === 'success' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          {/* 文字说明 */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              上传 PDF 文献
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300">
              拖拽 PDF 文件到此处，或点击选择文件
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                支持 PDF 格式
              </span>
              <span>•</span>
              <span>最大 50MB</span>
              <span>•</span>
              <span>支持多文件</span>
            </div>
          </div>
        </div>

        {/* 上传状态指示器 */}
        {uploadStatus === 'uploading' && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">正在上传...</p>
            </div>
          </div>
        )}
      </div>

      {/* 已选择文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              已选择文件 ({selectedFiles.length})
            </h4>
            {uploadStatus === 'success' && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">上传成功</span>
              </div>
            )}
          </div>
          
          <div className="grid gap-3">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-600/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-500/50 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {file.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {/* 上传按钮 */}
          <button 
            onClick={handleUpload}
            disabled={uploadStatus === 'uploading'}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-base hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {uploadStatus === 'uploading' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>处理中...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>开始分析 ({selectedFiles.length} 个文件)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};