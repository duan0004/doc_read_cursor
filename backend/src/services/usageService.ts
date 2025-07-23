import { db } from './database';

interface UsageRecord {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: any;
  created_at: string;
}

interface DailyUsage {
  user_id: string;
  date: string;
  uploads: number;
  ai_requests: number;
  searches: number;
  document_count: number;
}

class UsageService {
  private memoryUsage = new Map<string, DailyUsage>();

  // 记录使用情况
  async recordUsage(userId: string, action: string, resourceType: string, resourceId?: string, metadata?: any): Promise<void> {
    const record: UsageRecord = {
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      created_at: new Date().toISOString()
    };

    if (db.isAvailable()) {
      try {
        await db.query(`
          INSERT INTO usage_logs (user_id, action, resource_type, resource_id, metadata, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [record.user_id, record.action, record.resource_type, record.resource_id, 
            record.metadata ? JSON.stringify(record.metadata) : null, record.created_at]);
      } catch (error) {
        console.error('记录使用情况失败:', error);
      }
    }

    // 更新内存中的每日使用统计
    await this.updateDailyUsage(userId, action);
  }

  // 更新每日使用统计
  private async updateDailyUsage(userId: string, action: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;
    
    let usage = this.memoryUsage.get(key);
    if (!usage) {
      usage = {
        user_id: userId,
        date: today,
        uploads: 0,
        ai_requests: 0,
        searches: 0,
        document_count: 0
      };
    }

    // 根据动作类型更新统计
    switch (action) {
      case 'upload_document':
        usage.uploads++;
        break;
      case 'ai_summarize':
      case 'ai_qa':
      case 'ai_keywords':
        usage.ai_requests++;
        break;
      case 'search_vector':
      case 'search_arxiv':
      case 'search_semantic':
        usage.searches++;
        break;
    }

    this.memoryUsage.set(key, usage);

    // 如果数据库可用，同步到数据库
    if (db.isAvailable()) {
      try {
        await db.query(`
          INSERT INTO daily_usage (user_id, date, uploads, ai_requests, searches, document_count)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (user_id, date) DO UPDATE SET
            uploads = EXCLUDED.uploads,
            ai_requests = EXCLUDED.ai_requests,
            searches = EXCLUDED.searches,
            document_count = EXCLUDED.document_count,
            updated_at = NOW()
        `, [usage.user_id, usage.date, usage.uploads, usage.ai_requests, usage.searches, usage.document_count]);
      } catch (error) {
        console.error('更新每日使用统计失败:', error);
      }
    }
  }

  // 获取用户今日使用情况
  async getTodayUsage(userId: string): Promise<DailyUsage> {
    const today = new Date().toISOString().split('T')[0];
    const key = `${userId}_${today}`;
    
    let usage = this.memoryUsage.get(key);
    
    if (!usage && db.isAvailable()) {
      try {
        const result = await db.query(
          'SELECT * FROM daily_usage WHERE user_id = $1 AND date = $2',
          [userId, today]
        );
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          usage = {
            user_id: row.user_id,
            date: row.date,
            uploads: row.uploads,
            ai_requests: row.ai_requests,
            searches: row.searches,
            document_count: row.document_count
          };
          this.memoryUsage.set(key, usage);
        }
      } catch (error) {
        console.error('获取今日使用情况失败:', error);
      }
    }

    if (!usage) {
      usage = {
        user_id: userId,
        date: today,
        uploads: 0,
        ai_requests: 0,
        searches: 0,
        document_count: 0
      };
    }

    return usage;
  }

  // 获取用户历史使用统计
  async getUserUsageHistory(userId: string, days: number = 30): Promise<DailyUsage[]> {
    if (!db.isAvailable()) {
      return [];
    }

    try {
      const result = await db.query(`
        SELECT * FROM daily_usage 
        WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY date DESC
      `, [userId]);
      
      return result.rows.map((row: any) => ({
        user_id: row.user_id,
        date: row.date,
        uploads: row.uploads,
        ai_requests: row.ai_requests,
        searches: row.searches,
        document_count: row.document_count
      }));
    } catch (error) {
      console.error('获取用户使用历史失败:', error);
      return [];
    }
  }

  // 获取系统整体使用统计
  async getSystemStats(): Promise<{
    total_users: number;
    total_documents: number;
    total_ai_requests: number;
    today_active_users: number;
    today_uploads: number;
    today_ai_requests: number;
  }> {
    const stats = {
      total_users: 0,
      total_documents: 0,
      total_ai_requests: 0,
      today_active_users: 0,
      today_uploads: 0,
      today_ai_requests: 0
    };

    if (!db.isAvailable()) {
      return stats;
    }

    try {
      // 总用户数
      const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
      stats.total_users = parseInt(usersResult.rows[0].count);

      // 总文档数
      const docsResult = await db.query('SELECT COUNT(*) as count FROM documents');
      stats.total_documents = parseInt(docsResult.rows[0].count);

      // 总AI请求数
      const aiResult = await db.query(`
        SELECT COUNT(*) as count FROM usage_logs 
        WHERE action IN ('ai_summarize', 'ai_qa', 'ai_keywords')
      `);
      stats.total_ai_requests = parseInt(aiResult.rows[0].count);

      // 今日活跃用户数
      const todayActiveResult = await db.query(`
        SELECT COUNT(DISTINCT user_id) as count FROM daily_usage 
        WHERE date = CURRENT_DATE
      `);
      stats.today_active_users = parseInt(todayActiveResult.rows[0].count);

      // 今日上传数
      const todayUploadsResult = await db.query(`
        SELECT COALESCE(SUM(uploads), 0) as count FROM daily_usage 
        WHERE date = CURRENT_DATE
      `);
      stats.today_uploads = parseInt(todayUploadsResult.rows[0].count);

      // 今日AI请求数
      const todayAiResult = await db.query(`
        SELECT COALESCE(SUM(ai_requests), 0) as count FROM daily_usage 
        WHERE date = CURRENT_DATE
      `);
      stats.today_ai_requests = parseInt(todayAiResult.rows[0].count);

    } catch (error) {
      console.error('获取系统统计失败:', error);
    }

    return stats;
  }

  // 获取用户文档数量
  async getUserDocumentCount(userId: string): Promise<number> {
    if (!db.isAvailable()) {
      return 0;
    }

    try {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM documents WHERE user_id = $1',
        [userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('获取用户文档数量失败:', error);
      return 0;
    }
  }

  // 清理旧的使用记录
  async cleanupOldRecords(daysToKeep: number = 90): Promise<number> {
    if (!db.isAvailable()) {
      return 0;
    }

    try {
      const result = await db.query(`
        DELETE FROM usage_logs 
        WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
      `);
      
      console.log(`清理了 ${result.rowCount} 条旧的使用记录`);
      return result.rowCount;
    } catch (error) {
      console.error('清理旧记录失败:', error);
      return 0;
    }
  }
}

export const usageService = new UsageService();