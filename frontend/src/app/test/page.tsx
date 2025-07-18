'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export default function TestPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.duration = duration;
        return [...prev];
      } else {
        return [...prev, { name, status, message, duration }];
      }
    });
  };

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    const startTime = Date.now();
    updateTest(name, 'pending');
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTest(name, 'success', '测试通过', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest(name, 'error', error instanceof Error ? error.message : '测试失败', duration);
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setTests([]);

    // 测试后端健康检查
    await runTest('后端健康检查', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.status !== 'ok') {
        throw new Error('后端状态异常');
      }
    });

    // 测试文档列表API
    await runTest('文档列表API', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'API返回失败');
      }
    });

    // 测试AI摘要API（模拟请求）
    await runTest('AI摘要API', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_id: 'test-file-id' }),
      });
      
      // 这个测试预期会失败（因为文件不存在），但我们检查是否返回了正确的错误格式
      const data = await response.json();
      if (response.status === 404 && data.message === '文档不存在') {
        // 这是预期的错误，说明API正常工作
        return;
      } else if (response.ok && data.success) {
        // 如果成功也是正常的
        return;
      } else {
        throw new Error(`意外的响应: ${JSON.stringify(data)}`);
      }
    });

    // 测试AI问答API（模拟请求）
    await runTest('AI问答API', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          file_id: 'test-file-id',
          question: '这是一个测试问题'
        }),
      });
      
      const data = await response.json();
      if (response.status === 404 && data.message === '文档不存在') {
        // 这是预期的错误，说明API正常工作
        return;
      } else if (response.ok && data.success) {
        // 如果成功也是正常的
        return;
      } else {
        throw new Error(`意外的响应: ${JSON.stringify(data)}`);
      }
    });

    // 测试关键词提取API（模拟请求）
    await runTest('关键词提取API', async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/keywords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file_id: 'test-file-id' }),
      });
      
      const data = await response.json();
      if (response.status === 404 && data.message === '文档不存在') {
        // 这是预期的错误，说明API正常工作
        return;
      } else if (response.ok && data.success) {
        // 如果成功也是正常的
        return;
      } else {
        throw new Error(`意外的响应: ${JSON.stringify(data)}`);
      }
    });

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <FiLoader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FiX className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">系统测试</h1>
                <p className="text-gray-600 mt-1">测试后端API接口是否正常工作</p>
              </div>
              <button
                onClick={runAllTests}
                disabled={running}
                className="btn-primary"
              >
                {running ? '测试中...' : '开始测试'}
              </button>
            </div>

            {tests.length > 0 && (
              <div className="space-y-3">
                {tests.map((test, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getStatusColor(test.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">{test.name}</h3>
                          {test.message && (
                            <p className={`text-sm mt-1 ${
                              test.status === 'error' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {test.message}
                            </p>
                          )}
                        </div>
                      </div>
                      {test.duration && (
                        <span className="text-sm text-gray-500">
                          {test.duration}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tests.length === 0 && !running && (
              <div className="text-center py-12 text-gray-500">
                <p>点击"开始测试"按钮来测试系统功能</p>
              </div>
            )}

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">测试说明</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 后端健康检查：验证后端服务是否正常运行</li>
                <li>• 文档列表API：测试获取文档列表功能</li>
                <li>• AI相关API：测试AI功能接口（使用模拟数据）</li>
                <li>• 注意：AI API测试使用不存在的文件ID，预期返回404错误</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}