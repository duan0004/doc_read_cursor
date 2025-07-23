'use client';

import React, { useState, useEffect } from 'react';
import { FiPlay, FiLoader, FiCheck, FiX, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

interface BatchJob {
  id: string;
  type: 'summarize' | 'keywords' | 'qa' | 'index';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  results: any[];
  errors: string[];
  created_at: string;
  updated_at: string;
}

interface BatchProcessorProps {
  selectedDocuments: string[];
  onJobComplete?: (job: BatchJob) => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
  selectedDocuments,
  onJobComplete
}) => {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>(['']);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000); // 每2秒刷新一次
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/batch/jobs`
      );
      if (response.data.success) {
        setJobs(response.data.data.jobs);
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
    }
  };

  const createBatchJob = async (type: 'summarize' | 'keywords' | 'qa' | 'index') => {
    if (selectedDocuments.length === 0) {
      alert('请先选择要处理的文档');
      return;
    }

    setLoading(true);
    try {
      let endpoint = `/api/batch/${type}`;
      let payload: any = { file_ids: selectedDocuments };

      if (type === 'qa') {
        const validQuestions = questions.filter(q => q.trim());
        if (validQuestions.length === 0) {
          alert('请输入至少一个问题');
          setLoading(false);
          return;
        }
        payload.questions = validQuestions;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${endpoint}`,
        payload
      );

      if (response.data.success) {
        fetchJobs(); // 刷新任务列表
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '创建任务失败');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/batch/job/${jobId}`
      );
      if (response.data.success) {
        fetchJobs();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '删除任务失败');
    }
  };

  const getStatusIcon = (status: BatchJob['status']) => {
    switch (status) {
      case 'pending':
        return <FiLoader className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <FiCheck className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <FiX className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BatchJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'processing':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getTypeLabel = (type: BatchJob['type']) => {
    switch (type) {
      case 'summarize':
        return '批量摘要';
      case 'keywords':
        return '批量关键词';
      case 'qa':
        return '批量问答';
      case 'index':
        return '批量索引';
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          批量处理
        </h3>
        <button
          onClick={fetchJobs}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 选中的文档 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          已选择 {selectedDocuments.length} 个文档
        </p>
        {selectedDocuments.length === 0 && (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            请先在文档列表中选择要处理的文档
          </p>
        )}
      </div>

      {/* 批量操作按钮 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => createBatchJob('summarize')}
          disabled={loading || selectedDocuments.length === 0}
          className="btn-secondary flex items-center justify-center space-x-2"
        >
          <FiPlay className="w-4 h-4" />
          <span>批量摘要</span>
        </button>
        
        <button
          onClick={() => createBatchJob('keywords')}
          disabled={loading || selectedDocuments.length === 0}
          className="btn-secondary flex items-center justify-center space-x-2"
        >
          <FiPlay className="w-4 h-4" />
          <span>批量关键词</span>
        </button>
        
        <button
          onClick={() => createBatchJob('index')}
          disabled={loading || selectedDocuments.length === 0}
          className="btn-secondary flex items-center justify-center space-x-2"
        >
          <FiPlay className="w-4 h-4" />
          <span>批量索引</span>
        </button>
        
        <button
          onClick={() => createBatchJob('qa')}
          disabled={loading || selectedDocuments.length === 0}
          className="btn-secondary flex items-center justify-center space-x-2"
        >
          <FiPlay className="w-4 h-4" />
          <span>批量问答</span>
        </button>
      </div>

      {/* 问答问题设置 */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">批量问答设置</h4>
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder={`问题 ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addQuestion}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          + 添加问题
        </button>
      </div>

      {/* 任务列表 */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">任务列表</h4>
        {jobs.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`p-4 border rounded-lg ${getStatusColor(job.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {getTypeLabel(job.type)}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {job.progress}/{job.total}
                    </span>
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(job.progress / job.total) * 100}%` }}
                  />
                </div>
                
                {/* 错误信息 */}
                {job.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">错误:</p>
                    <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                      {job.errors.slice(0, 3).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {job.errors.length > 3 && (
                        <li>... 还有 {job.errors.length - 3} 个错误</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>暂无批量处理任务</p>
          </div>
        )}
      </div>
    </div>
  );
};