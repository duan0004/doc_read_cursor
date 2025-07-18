import { Router, Request, Response } from 'express';

const router = Router();

// 内存中的文档存储
interface Document {
  file_id: string;
  original_name: string;
  file_size: number;
  page_count: number;
  text_content: string;
  upload_time: string;
  file_path: string;
  summary?: string;
  keywords?: string[];
}

const documents: Map<string, Document> = new Map();

// 获取文档列表
router.get('/', (req: Request, res: Response): void => {
  try {
    const documentList = Array.from(documents.values()).map(doc => ({
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
    res.status(500).json({ success: false, message: '获取文档列表失败' });
  }
});

// 获取文档详情
router.get('/:file_id', (req: Request, res: Response): void => {
  try {
    const file_id = req.params.file_id;
    if (!file_id) {
      res.status(400).json({ success: false, message: '文件ID不能为空' });
      return;
    }
    const document = documents.get(file_id);
    
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
    res.status(500).json({ success: false, message: '获取文档详情失败' });
  }
});

export { documents };
export default router;
 