import { db } from './database';
import { vectorSearchService } from './vectorSearchService';

export interface DocumentInfo {
  file_id: string;
  original_name: string;
  file_size: number;
  page_count: number;
  text_content: string;
  file_path: string;
  upload_time: string;
  summary?: any;
  keywords?: string[];
}

export interface QARecord {
  id: string;
  document_id: string;
  question: string;
  answer: string;
  created_at: string;
}

class DocumentService {
  // 内存存储作为后备
  private memoryDocuments = new Map<string, DocumentInfo>();
  private memoryQA = new Map<string, QARecord[]>();

  async saveDocument(doc: DocumentInfo): Promise<void> {
    if (db.isAvailable()) {
      try {
        await db.query(`
          INSERT INTO documents (file_id, original_name, file_size, page_count, text_content, file_path, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (file_id) DO UPDATE SET
            original_name = EXCLUDED.original_name,
            file_size = EXCLUDED.file_size,
            page_count = EXCLUDED.page_count,
            text_content = EXCLUDED.text_content,
            file_path = EXCLUDED.file_path,
            updated_at = NOW()
        `, [
          doc.file_id,
          doc.original_name,
          doc.file_size,
          doc.page_count,
          doc.text_content,
          doc.file_path,
          doc.upload_time
        ]);
        console.log(`✅ 文档 ${doc.file_id} 已保存到数据库`);
        
        // 异步建立向量索引
        vectorSearchService.indexDocument(doc).catch(error => {
          console.error('向量索引失败:', error);
        });
      } catch (error) {
        console.error('数据库保存失败，使用内存存储:', error);
        this.memoryDocuments.set(doc.file_id, doc);
        
        // 即使数据库失败，也尝试建立向量索引
        vectorSearchService.indexDocument(doc).catch(error => {
          console.error('向量索引失败:', error);
        });
      }
    } else {
      this.memoryDocuments.set(doc.file_id, doc);
      
      // 建立向量索引
      vectorSearchService.indexDocument(doc).catch(error => {
        console.error('向量索引失败:', error);
      });
    }
  }

  async getDocument(fileId: string): Promise<DocumentInfo | null> {
    if (db.isAvailable()) {
      try {
        const result = await db.query(
          'SELECT * FROM documents WHERE file_id = $1',
          [fileId]
        );
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          return {
            file_id: row.file_id,
            original_name: row.original_name,
            file_size: row.file_size,
            page_count: row.page_count,
            text_content: row.text_content,
            file_path: row.file_path,
            upload_time: row.created_at,
            summary: row.summary ? JSON.parse(row.summary) : undefined,
            keywords: row.keywords
          };
        }
      } catch (error) {
        console.error('数据库查询失败，使用内存存储:', error);
      }
    }
    
    return this.memoryDocuments.get(fileId) || null;
  }

  async getAllDocuments(): Promise<DocumentInfo[]> {
    if (db.isAvailable()) {
      try {
        const result = await db.query(
          'SELECT * FROM documents ORDER BY created_at DESC'
        );
        
        return result.rows.map((row: any) => ({
          file_id: row.file_id,
          original_name: row.original_name,
          file_size: row.file_size,
          page_count: row.page_count,
          text_content: row.text_content,
          file_path: row.file_path,
          upload_time: row.created_at,
          summary: row.summary ? JSON.parse(row.summary) : undefined,
          keywords: row.keywords
        }));
      } catch (error) {
        console.error('数据库查询失败，使用内存存储:', error);
      }
    }
    
    return Array.from(this.memoryDocuments.values());
  }

  async updateDocumentSummary(fileId: string, summary: any): Promise<void> {
    if (db.isAvailable()) {
      try {
        await db.query(
          'UPDATE documents SET summary = $1, updated_at = NOW() WHERE file_id = $2',
          [JSON.stringify(summary), fileId]
        );
      } catch (error) {
        console.error('数据库更新失败，使用内存存储:', error);
        const doc = this.memoryDocuments.get(fileId);
        if (doc) {
          doc.summary = summary;
          this.memoryDocuments.set(fileId, doc);
        }
      }
    } else {
      const doc = this.memoryDocuments.get(fileId);
      if (doc) {
        doc.summary = summary;
        this.memoryDocuments.set(fileId, doc);
      }
    }
  }

  async updateDocumentKeywords(fileId: string, keywords: string[]): Promise<void> {
    if (db.isAvailable()) {
      try {
        await db.query(
          'UPDATE documents SET keywords = $1, updated_at = NOW() WHERE file_id = $2',
          [keywords, fileId]
        );
      } catch (error) {
        console.error('数据库更新失败，使用内存存储:', error);
        const doc = this.memoryDocuments.get(fileId);
        if (doc) {
          doc.keywords = keywords;
          this.memoryDocuments.set(fileId, doc);
        }
      }
    } else {
      const doc = this.memoryDocuments.get(fileId);
      if (doc) {
        doc.keywords = keywords;
        this.memoryDocuments.set(fileId, doc);
      }
    }
  }

  async saveQA(fileId: string, question: string, answer: string): Promise<void> {
    const qaRecord: QARecord = {
      id: `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      document_id: fileId,
      question,
      answer,
      created_at: new Date().toISOString()
    };

    if (db.isAvailable()) {
      try {
        await db.query(`
          INSERT INTO qa_history (document_id, question, answer, created_at)
          VALUES ($1, $2, $3, $4)
        `, [fileId, question, answer, qaRecord.created_at]);
      } catch (error) {
        console.error('数据库保存QA失败，使用内存存储:', error);
        const qaList = this.memoryQA.get(fileId) || [];
        qaList.push(qaRecord);
        this.memoryQA.set(fileId, qaList);
      }
    } else {
      const qaList = this.memoryQA.get(fileId) || [];
      qaList.push(qaRecord);
      this.memoryQA.set(fileId, qaList);
    }
  }

  async getQAHistory(fileId: string): Promise<QARecord[]> {
    if (db.isAvailable()) {
      try {
        const result = await db.query(
          'SELECT * FROM qa_history WHERE document_id = $1 ORDER BY created_at DESC',
          [fileId]
        );
        
        return result.rows.map((row: any) => ({
          id: row.id,
          document_id: row.document_id,
          question: row.question,
          answer: row.answer,
          created_at: row.created_at
        }));
      } catch (error) {
        console.error('数据库查询QA失败，使用内存存储:', error);
      }
    }
    
    return this.memoryQA.get(fileId) || [];
  }

  async deleteDocument(fileId: string): Promise<boolean> {
    if (db.isAvailable()) {
      try {
        const result = await db.query(
          'DELETE FROM documents WHERE file_id = $1',
          [fileId]
        );
        
        if (result.rowCount > 0) {
          // 删除向量索引
          vectorSearchService.removeDocumentIndex(fileId).catch(error => {
            console.error('删除向量索引失败:', error);
          });
        }
        
        return result.rowCount > 0;
      } catch (error) {
        console.error('数据库删除失败，使用内存存储:', error);
        return this.memoryDocuments.delete(fileId);
      }
    } else {
      const deleted = this.memoryDocuments.delete(fileId);
      if (deleted) {
        // 删除向量索引
        vectorSearchService.removeDocumentIndex(fileId).catch(error => {
          console.error('删除向量索引失败:', error);
        });
      }
      return deleted;
    }
  }
}

export const documentService = new DocumentService();