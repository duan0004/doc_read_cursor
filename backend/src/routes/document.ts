import { Router, Request, Response } from 'express';
import { documentService } from '../services/documentService';

const router = Router();

// 获取文档列表
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await documentService.getAllDocuments();
    const documentList = documents.map(doc => ({
      file_id: doc.file_id,
      original_name: doc.original_name,
      file_size: doc.file_size,
      page_count: doc.page_count,
      upload_time: doc.upload_time
    }));

    res.json({
      success: true,
      data: { documents: documentList, total: documentList.length }
    });
  } catch (error) {
    console.error('获取文档列表失败:', error);
    res.status(500).json({ success: false, message: '获取文档列表失败' });
  }
});

// 获取文档详情
router.get('/:file_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const file_id = req.params.file_id;
    if (!file_id) {
      res.status(400).json({ success: false, message: '文件ID不能为空' });
      return;
    }
    
    const document = await documentService.getDocument(file_id);
    
    if (!document) {
      res.status(404).json({ success: false, message: '文档不存在' });
      return;
    }

    res.json({
      success: true,
      data: {
        file_id: document.file_id,
        original_name: document.original_name,
        file_size: document.file_size,
        page_count: document.page_count,
        upload_time: document.upload_time,
        summary: document.summary,
        keywords: document.keywords
      }
    });
  } catch (error) {
    console.error('获取文档详情失败:', error);
    res.status(500).json({ success: false, message: '获取文档详情失败' });
  }
});

// 删除文档
router.delete('/:file_id', async (req: Request, res: Response): Promise<void> => {
  try {
    const file_id = req.params.file_id;
    if (!file_id) {
      res.status(400).json({ success: false, message: '文件ID不能为空' });
      return;
    }
    
    const deleted = await documentService.deleteDocument(file_id);
    
    if (!deleted) {
      res.status(404).json({ success: false, message: '文档不存在' });
      return;
    }

    res.json({
      success: true,
      message: '文档删除成功'
    });
  } catch (error) {
    console.error('删除文档失败:', error);
    res.status(500).json({ success: false, message: '删除文档失败' });
  }
});

// 获取文档问答历史
router.get('/:file_id/qa', async (req: Request, res: Response): Promise<void> => {
  try {
    const file_id = req.params.file_id;
    if (!file_id) {
      res.status(400).json({ success: false, message: '文件ID不能为空' });
      return;
    }
    
    const qaHistory = await documentService.getQAHistory(file_id);
    
    res.json({
      success: true,
      data: qaHistory
    });
  } catch (error) {
    console.error('获取问答历史失败:', error);
    res.status(500).json({ success: false, message: '获取问答历史失败' });
  }
});

export default router;
 