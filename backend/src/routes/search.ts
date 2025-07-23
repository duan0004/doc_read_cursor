import { Router, Request, Response } from 'express';
import { vectorSearchService } from '../services/vectorSearchService';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// 向量搜索接口
router.get('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        message: '搜索查询不能为空'
      });
      return;
    }
    
    const limitNum = Math.min(Math.max(parseInt(limit as string) || 10, 1), 50);
    
    const results = await vectorSearchService.searchSimilarChunks(query, limitNum);
    
    res.json({
      success: true,
      message: '搜索完成',
      data: {
        query,
        results: results.map(result => ({
          document: {
            file_id: result.document.file_id,
            original_name: result.document.original_name,
            upload_time: result.document.upload_time
          },
          chunk: {
            id: result.chunk.id,
            page_number: result.chunk.page_number,
            chunk_index: result.chunk.chunk_index
          },
          similarity: result.similarity,
          snippet: result.snippet
        })),
        total: results.length,
        stats: vectorSearchService.getIndexStats()
      }
    });
  } catch (error) {
    console.error('向量搜索失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败'
    });
  }
});

// 重建索引接口
router.post('/reindex', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    await vectorSearchService.rebuildIndex();
    
    res.json({
      success: true,
      message: '索引重建成功',
      data: vectorSearchService.getIndexStats()
    });
  } catch (error) {
    console.error('重建索引失败:', error);
    res.status(500).json({
      success: false,
      message: '重建索引失败'
    });
  }
});

// 获取索引统计信息
router.get('/stats', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = vectorSearchService.getIndexStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取索引统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取索引统计失败'
    });
  }
});

export default router;