import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// 注册验证模式
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称不能超过50字符')
});

// 登录验证模式
const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空')
});

// 用户注册
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const user = await authService.createUser(validatedData);
    const token = authService.generateToken(user);
    
    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role
        },
        token
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
    
    console.error('注册失败:', error);
    res.status(400).json({
      success: false,
      message: error.message || '注册失败'
    });
  }
});

// 用户登录
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    
    const user = await authService.authenticateUser(validatedData.email, validatedData.password);
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
      return;
    }
    
    const token = authService.generateToken(user);
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role
        },
        token
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
    
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 更新用户资料
router.put('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const updateSchema = z.object({
      nickname: z.string().min(1).max(50).optional(),
      avatar: z.string().url().optional()
    });
    
    const validatedData = updateSchema.parse(req.body);
    
    const user = await authService.updateUserProfile(req.user!.userId, validatedData);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在'
      });
      return;
    }
    
    res.json({
      success: true,
      message: '资料更新成功',
      data: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role
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
    
    console.error('更新用户资料失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户资料失败'
    });
  }
});

// 登出（客户端处理，服务端无需特殊处理）
router.post('/logout', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: '登出成功'
  });
});

export default router;