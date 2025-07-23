import { Pool, PoolClient } from 'pg';

class DatabaseService {
  private pool: Pool | null = null;
  private isConnected = false;

  constructor() {
    this.initializePool();
  }

  private initializePool() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.log('💡 数据库未配置，将使用内存存储');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: databaseUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('error', (err) => {
        console.error('数据库连接池错误:', err);
        this.isConnected = false;
      });

      this.testConnection();
    } catch (error) {
      console.error('数据库初始化失败:', error);
    }
  }

  private async testConnection() {
    if (!this.pool) return;

    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      this.isConnected = false;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool || !this.isConnected) {
      throw new Error('数据库未连接');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool || !this.isConnected) {
      throw new Error('数据库未连接');
    }
    return this.pool.connect();
  }

  isAvailable(): boolean {
    return this.isConnected && this.pool !== null;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('数据库连接已关闭');
    }
  }
}

export const db = new DatabaseService();