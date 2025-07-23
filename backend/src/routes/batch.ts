import { Router, Request, Response } from 'express';
import { batchProcessService } from '../services/batchProcessService';
import { optionalAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// 创建批量摘要任务
router.post('/summarize', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      file_ids: z.array(z.string()).min(1, '至少需要一个文件ID')
    });
    
    const { file_ids } = schema.parse(req.body);
    
    const jobId = await batchProcessService.createBatchSummarizeJob(file_ids);
    
    res.json({
      success: true,
      message: '批量摘要任务已创建',
      data: {
        job_id: jobId,
        total: file_ids.length
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: error.errors
      });
      return;
    }
    
    console.error('创建批量摘要任务失败:', error);
    res.status(500).json({
      success: false,
      message: '创建批量摘要任务失败'
    });
  }
});

// 创建批量关键词提取任务
router.post('/keywords', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      file_ids: z.array(z.string()).min(1, '至少需要一个文件ID')
    });
    
    const { file_ids } = schema.parse(req.body);
    
    const jobId = await batchProcessService.createBatchKeywordsJob(file_ids);
    
    res.json({
      success: true,
      message: '批量关键词提取任务已创建',
      data: {
        job_id: jobId,
        total: file_ids.length
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: error.errors
      });
      return;
    }
    
    console.error('创建批量关键词提取任务失败:', error);
    res.status(500).json({
      success: false,
      message: '创建批量关键词提取任务失败'
    });
  }
});

// 创建批量问答任务
router.post('/qa', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      file_ids: z.array(z.string()).min(1, '至少需要一个文件ID'),
      questions: z.array(z.string()).min(1, '至少需要一个问题')
    });
    
    const { file_ids, questions } = schema.parse(req.body);
    
    const jobId = await batchProcessService.createBatchQAJob(file_ids, questions);
    
    res.json({
      success: true,
      message: '批量问答任务已创建',
      data: {
        job_id: jobId,
        total: file_ids.length * questions.length
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: error.errors
      });
      return;
    }
    
    console.error('创建批量问答任务失败:', error);
    res.status(500).json({
      success: false,
      message: '创建批量问答任务失败'
    });
  }
});

// 创建批量索引任务
router.post('/index', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      file_ids: z.array(z.string()).optional()
    });
    
    const { file_ids } = schema.parse(req.body);
    
    const jobId = await batchProcessService.createBatchIndexJob(file_ids);
    
    res.json({
      success: true,
      message: '批量索引任务已创建',
      data: {
        job_id: jobId
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: error.errors
      });
      return;
    }
    
    console.error('创建批量索引任务失败:', error);
    res.status(500).json({
      success: false,
      message: '创建批量索引任务失败'
    });
  }
});

// 获取任务状态
router.get('/job/:jobId', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      res.status(400).json({
        success: false,
        message: '任务ID不能为空'
      });
      return;
    }
    
    const job = batchProcessService.getJob(jobId);
    
    if (!job) {
      res.status(404).json({
        success: false,
        message: '任务不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('获取任务状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务状态失败'
    });
  }
});

// 获取所有任务
router.get('/jobs', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = batchProcessService.getAllJobs();
    
    res.json({
      success: true,
      data: {
        jobs,
        total: jobs.length
      }
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取任务列表失败'
    });
  }
});

// 删除任务
router.delete('/job/:jobId', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      res.status(400).json({
        success: false,
        message: '任务ID不能为空'
      });
      return;
    }
    
    const deleted = batchProcessService.deleteJob(jobId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: '任务不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '任务已删除'
    });
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({
      success: false,
      message: '删除任务失败'
    });
  }
});

// 清理完成的任务
router.post('/cleanup', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { hours = 24 } = req.body;
    
    const cleaned = batchProcessService.cleanupCompletedJobs(hours);
    
    res.json({
      success: true,
      message: `已清理 ${cleaned} 个完成的任务`,
      data: {
        cleaned_count: cleaned
      }
    });
  } catch (error) {
    console.error('清理任务失败:', error);
    res.status(500).json({
      success: false,
      message: '清理任务失败'
    });
  }
});

export default router;