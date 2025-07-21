import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { documents } from './document';
// @ts-ignore
import pdfParse from 'pdf-parse';

const router = Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${fileId}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('只支持PDF文件格式'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

// 上传PDF文件并自动解析
router.post('/pdf', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: '请选择要上传的PDF文件',
        data: null
      });
      return;
    }
    const file = req.file;
    const fileId = path.parse(file.filename).name;
    let pageCount = 0;
    let textContent = '';
    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      pageCount = pdfData.numpages;
      textContent = pdfData.text;
    } catch (err: any) {
      console.error('PDF解析失败:', err);
    }
    const documentInfo = {
      file_id: fileId,
      original_name: file.originalname,
      file_size: file.size,
      page_count: pageCount,
      text_content: textContent,
      upload_time: new Date().toISOString(),
      file_path: file.path
    };
    documents.set(documentInfo.file_id, documentInfo);
    res.json({
      success: true,
      message: 'PDF文件上传并解析成功',
      data: {
        file_id: documentInfo.file_id,
        original_name: documentInfo.original_name,
        page_count: documentInfo.page_count,
        file_size: documentInfo.file_size,
        upload_time: documentInfo.upload_time
      }
    });
  } catch (error) {
    console.error('PDF上传错误:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '文件上传失败',
      data: null
    });
  }
});

export default router;
