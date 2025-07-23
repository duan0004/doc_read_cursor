import { documentService, DocumentInfo } from './documentService';
import { vectorSearchService } from './vectorSearchService';

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
  file_ids?: string[];
  questions?: string[];
}

class BatchProcessService {
  private jobs: Map<string, BatchJob> = new Map();
  private processingQueue: string[] = [];
  private isProcessing = false;

  // 创建批量摘要任务
  async createBatchSummarizeJob(fileIds: string[]): Promise<string> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BatchJob = {
      id: jobId,
      type: 'summarize',
      status: 'pending',
      progress: 0,
      total: fileIds.length,
      results: [],
      errors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_ids: fileIds
    };
    
    this.jobs.set(jobId, job);
    this.processingQueue.push(jobId);
    
    // 异步开始处理
    this.processQueue();
    
    return jobId;
  }

  // 创建批量关键词提取任务
  async createBatchKeywordsJob(fileIds: string[]): Promise<string> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BatchJob = {
      id: jobId,
      type: 'keywords',
      status: 'pending',
      progress: 0,
      total: fileIds.length,
      results: [],
      errors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_ids: fileIds
    };
    
    this.jobs.set(jobId, job);
    this.processingQueue.push(jobId);
    
    this.processQueue();
    
    return jobId;
  }

  // 创建批量问答任务
  async createBatchQAJob(fileIds: string[], questions: string[]): Promise<string> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: BatchJob = {
      id: jobId,
      type: 'qa',
      status: 'pending',
      progress: 0,
      total: fileIds.length * questions.length,
      results: [],
      errors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_ids: fileIds,
      questions
    };
    
    this.jobs.set(jobId, job);
    this.processingQueue.push(jobId);
    
    this.processQueue();
    
    return jobId;
  }

  // 创建批量索引任务
  async createBatchIndexJob(fileIds?: string[]): Promise<string> {
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 如果没有指定文件ID，则索引所有文档
    const targetFileIds = fileIds || (await documentService.getAllDocuments()).map(doc => doc.file_id);
    
    const job: BatchJob = {
      id: jobId,
      type: 'index',
      status: 'pending',
      progress: 0,
      total: targetFileIds.length,
      results: [],
      errors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file_ids: targetFileIds
    };
    
    this.jobs.set(jobId, job);
    this.processingQueue.push(jobId);
    
    this.processQueue();
    
    return jobId;
  }

  // 处理队列
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.processingQueue.length > 0) {
      const jobId = this.processingQueue.shift()!;
      const job = this.jobs.get(jobId);
      
      if (!job) continue;
      
      try {
        job.status = 'processing';
        job.updated_at = new Date().toISOString();
        
        await this.processJob(job);
        
        job.status = 'completed';
        job.updated_at = new Date().toISOString();
      } catch (error) {
        job.status = 'failed';
        job.errors.push(error instanceof Error ? error.message : '未知错误');
        job.updated_at = new Date().toISOString();
        console.error(`批量任务 ${jobId} 失败:`, error);
      }
    }
    
    this.isProcessing = false;
  }

  // 处理具体任务
  private async processJob(job: BatchJob): Promise<void> {
    switch (job.type) {
      case 'summarize':
        await this.processSummarizeJob(job);
        break;
      case 'keywords':
        await this.processKeywordsJob(job);
        break;
      case 'qa':
        await this.processQAJob(job);
        break;
      case 'index':
        await this.processIndexJob(job);
        break;
    }
  }

  // 处理摘要任务
  private async processSummarizeJob(job: BatchJob): Promise<void> {
    if (!job.file_ids) return;
    
    for (let i = 0; i < job.file_ids.length; i++) {
      const fileId = job.file_ids[i];
      
      if (!fileId) continue;
      
      try {
        const document = await documentService.getDocument(fileId);
        if (!document) {
          job.errors.push(`文档 ${fileId} 不存在`);
          continue;
        }
        
        // 调用AI生成摘要（这里需要实现AI调用逻辑）
        const summary = await this.generateSummary(document);
        
        // 保存摘要
        await documentService.updateDocumentSummary(fileId, summary);
        
        job.results.push({
          file_id: fileId,
          original_name: document.original_name,
          summary
        });
        
      } catch (error) {
        job.errors.push(`处理文档 ${fileId} 失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
      
      job.progress = i + 1;
      job.updated_at = new Date().toISOString();
    }
  }

  // 处理关键词任务
  private async processKeywordsJob(job: BatchJob): Promise<void> {
    if (!job.file_ids) return;
    
    for (let i = 0; i < job.file_ids.length; i++) {
      const fileId = job.file_ids[i];
      
      if (!fileId) continue;
      
      try {
        const document = await documentService.getDocument(fileId);
        if (!document) {
          job.errors.push(`文档 ${fileId} 不存在`);
          continue;
        }
        
        // 提取关键词
        const keywords = await this.extractKeywords(document);
        
        // 保存关键词
        await documentService.updateDocumentKeywords(fileId, keywords);
        
        job.results.push({
          file_id: fileId,
          original_name: document.original_name,
          keywords
        });
        
      } catch (error) {
        job.errors.push(`处理文档 ${fileId} 失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
      
      job.progress = i + 1;
      job.updated_at = new Date().toISOString();
    }
  }

  // 处理问答任务
  private async processQAJob(job: BatchJob): Promise<void> {
    if (!job.file_ids || !job.questions) return;
    
    let processed = 0;
    
    for (const fileId of job.file_ids) {
      const document = await documentService.getDocument(fileId);
      if (!document) {
        job.errors.push(`文档 ${fileId} 不存在`);
        processed += job.questions.length;
        continue;
      }
      
      for (const question of job.questions) {
        try {
          // 调用AI问答
          const answer = await this.askQuestion(document, question);
          
          // 保存问答记录
          await documentService.saveQA(fileId, question, answer);
          
          job.results.push({
            file_id: fileId,
            original_name: document.original_name,
            question,
            answer
          });
          
        } catch (error) {
          job.errors.push(`文档 ${fileId} 问题 "${question}" 处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
        
        processed++;
        job.progress = processed;
        job.updated_at = new Date().toISOString();
      }
    }
  }

  // 处理索引任务
  private async processIndexJob(job: BatchJob): Promise<void> {
    if (!job.file_ids) return;
    
    for (let i = 0; i < job.file_ids.length; i++) {
      const fileId = job.file_ids[i];
      
      if (!fileId) continue;
      
      try {
        const document = await documentService.getDocument(fileId);
        if (!document) {
          job.errors.push(`文档 ${fileId} 不存在`);
          continue;
        }
        
        // 建立向量索引
        await vectorSearchService.indexDocument(document);
        
        job.results.push({
          file_id: fileId,
          original_name: document.original_name,
          indexed: true
        });
        
      } catch (error) {
        job.errors.push(`索引文档 ${fileId} 失败: ${error instanceof Error ? error.message : '未知错误'}`);
      }
      
      job.progress = i + 1;
      job.updated_at = new Date().toISOString();
    }
  }

  // AI辅助方法（简化实现）
  private async generateSummary(document: DocumentInfo): Promise<any> {
    // 这里应该调用AI服务，简化实现
    return {
      purpose: "自动生成的研究目的",
      method: "自动生成的方法概述",
      finding: "自动生成的关键发现",
      conclusion: "自动生成的结论总结",
      keywords: "关键词1, 关键词2, 关键词3"
    };
  }

  private async extractKeywords(document: DocumentInfo): Promise<string[]> {
    // 简化的关键词提取
    const text = document.text_content.toLowerCase();
    const words = text.match(/\b\w{4,}\b/g) || [];
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private async askQuestion(document: DocumentInfo, question: string): Promise<string> {
    // 简化的问答实现
    return `基于文档"${document.original_name}"的回答：这是一个自动生成的答案。`;
  }

  // 获取任务状态
  getJob(jobId: string): BatchJob | null {
    return this.jobs.get(jobId) || null;
  }

  // 获取所有任务
  getAllJobs(): BatchJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // 删除任务
  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  // 清理完成的任务
  cleanupCompletedJobs(olderThanHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' && new Date(job.updated_at) < cutoffTime) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

export const batchProcessService = new BatchProcessService();