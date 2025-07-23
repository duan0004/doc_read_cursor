import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db } from './database';

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  role: string;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  nickname: string;
}

class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_here_change_in_production';
  private saltRounds = 10;

  async createUser(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);
    
    if (db.isAvailable()) {
      try {
        const result = await db.query(`
          INSERT INTO users (email, password, nickname, provider, role, created_at)
          VALUES ($1, $2, $3, 'local', 'user', NOW())
          RETURNING id, email, nickname, avatar, role, created_at
        `, [userData.email, hashedPassword, userData.nickname]);
        
        return result.rows[0];
      } catch (error: any) {
        if (error.code === '23505') { // 唯一约束违反
          throw new Error('邮箱已被注册');
        }
        throw error;
      }
    } else {
      throw new Error('数据库服务不可用');
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    if (!db.isAvailable()) {
      throw new Error('数据库服务不可用');
    }

    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1 AND provider = $2',
        [email, 'local']
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return null;
      }
      
      return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        created_at: user.created_at
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!db.isAvailable()) {
      return null;
    }

    try {
      const result = await db.query(
        'SELECT id, email, nickname, avatar, role, created_at FROM users WHERE id = $1',
        [userId]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<User, 'nickname' | 'avatar'>>): Promise<User | null> {
    if (!db.isAvailable()) {
      throw new Error('数据库服务不可用');
    }

    try {
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      if (updates.nickname) {
        setClause.push(`nickname = $${paramIndex++}`);
        values.push(updates.nickname);
      }
      
      if (updates.avatar) {
        setClause.push(`avatar = $${paramIndex++}`);
        values.push(updates.avatar);
      }

      if (setClause.length === 0) {
        return await this.getUserById(userId);
      }

      values.push(userId);
      
      const result = await db.query(`
        UPDATE users 
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING id, email, nickname, avatar, role, created_at
      `, values);
      
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();