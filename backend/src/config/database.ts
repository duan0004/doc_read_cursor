import { Pool } from 'pg';

let pool: Pool | null = null;

export async function connectDatabase() {
  try {
    if (pool) {
      return pool;
    }

    // 如果没有配置数据库URL，跳过数据库连接
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  未配置数据库，使用内存存储');
      return null;
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // 测试连接
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    return pool;
  } catch (error) {
    console.error('数据库连接失败:', error);
    // 在开发环境中，如果数据库连接失败，继续使用内存存储
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  数据库连接失败，使用内存存储');
      return null;
    }
    throw error;
  }
}

export function getDatabase() {
  return pool;
}