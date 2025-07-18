import { Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `路由 ${req.originalUrl} 不存在`,
    timestamp: new Date().toISOString()
  });
}