import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('错误详情:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // 默认错误响应
  let statusCode = 500;
  let message = '服务器内部错误';

  // 处理特定类型的错误
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '请求参数验证失败';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权访问';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    if (error.message.includes('File too large')) {
      message = '文件大小超出限制';
    } else if (error.message.includes('Unexpected field')) {
      message = '文件字段名不正确';
    } else {
      message = '文件上传错误';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
}