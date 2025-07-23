import { TfIdf, WordTokenizer } from 'natural';
import { documentService, DocumentInfo } from './documentService';

interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  page_number: number;
  chunk_index: number;
  vector?: number[];
}

interface SearchResult {
  document: DocumentInfo;
  chunk: DocumentChunk;
  similarity: number;
  snippet: string;
}

class VectorSearchService {
  private tfidf: TfIdf;
  private documentChunks: Map<string, DocumentChunk[]> = new Map();
  private allChunks: DocumentChunk[] = [];

  constructor() {
    this.tfidf = new TfIdf();
  }

  // 将文档分块
  private chunkDocument(document: DocumentInfo): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const text = document.text_content;
    const chunkSize = 500; // 每块500字符
    const overlap = 50; // 重叠50字符

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk: DocumentChunk = {
        id: `${document.file_id}_chunk_${chunks.length}`,
        document_id: document.file_id,
        content: text.slice(i, i + chunkSize),
        page_number: Math.floor(i / 2000) + 1, // 估算页码
        chunk_index: chunks.length,
      };
      chunks.push(chunk);
    }

    return chunks;
  }

  // 预处理文本
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中英文和数字
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 计算余弦相似度
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // 索引文档
  async indexDocument(document: DocumentInfo): Promise<void> {
    try {
      console.log(`开始索引文档: ${document.file_id}`);
      
      // 分块
      const chunks = this.chunkDocument(document);
      this.documentChunks.set(document.file_id, chunks);
      
      // 添加到TF-IDF
      chunks.forEach(chunk => {
        const processedText = this.preprocessText(chunk.content);
        this.tfidf.addDocument(processedText);
        this.allChunks.push(chunk);
      });

      console.log(`文档 ${document.file_id} 索引完成，共 ${chunks.length} 个分块`);
    } catch (error) {
      console.error('文档索引失败:', error);
      throw error;
    }
  }

  // 搜索相似文档块
  async searchSimilarChunks(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      if (this.allChunks.length === 0) {
        return [];
      }

      const processedQuery = this.preprocessText(query);
      const results: SearchResult[] = [];

      // 使用TF-IDF计算相似度
      this.tfidf.tfidfs(processedQuery, (i, measure) => {
        if (i < this.allChunks.length && measure > 0) {
          const chunk = this.allChunks[i];
          if (chunk) {
            results.push({
              document: null as any, // 稍后填充
              chunk,
              similarity: measure,
              snippet: this.generateSnippet(chunk.content, query)
            });
          }
        }
      });

      // 按相似度排序
      results.sort((a, b) => b.similarity - a.similarity);

      // 限制结果数量
      const limitedResults = results.slice(0, limit);

      // 填充文档信息
      for (const result of limitedResults) {
        const document = await documentService.getDocument(result.chunk.document_id);
        if (document) {
          result.document = document;
        }
      }

      return limitedResults.filter(r => r.document !== null);
    } catch (error) {
      console.error('向量搜索失败:', error);
      return [];
    }
  }

  // 生成搜索片段
  private generateSnippet(text: string, query: string, maxLength: number = 200): string {
    const queryWords = query.toLowerCase().split(/\s+/);
    const textLower = text.toLowerCase();
    
    // 找到第一个匹配的位置
    let bestStart = 0;
    let bestScore = 0;
    
    for (let i = 0; i < text.length - maxLength; i += 50) {
      const segment = textLower.slice(i, i + maxLength);
      const score = queryWords.reduce((acc, word) => {
        return acc + (segment.includes(word) ? 1 : 0);
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestStart = i;
      }
    }
    
    let snippet = text.slice(bestStart, bestStart + maxLength);
    
    // 高亮关键词
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      snippet = snippet.replace(regex, '**$1**');
    });
    
    return snippet + (bestStart + maxLength < text.length ? '...' : '');
  }

  // 重建索引
  async rebuildIndex(): Promise<void> {
    try {
      console.log('开始重建向量索引...');
      
      // 清空现有索引
      this.tfidf = new TfIdf();
      this.documentChunks.clear();
      this.allChunks = [];
      
      // 获取所有文档
      const documents = await documentService.getAllDocuments();
      
      // 重新索引所有文档
      for (const document of documents) {
        await this.indexDocument(document);
      }
      
      console.log(`索引重建完成，共索引 ${documents.length} 个文档`);
    } catch (error) {
      console.error('重建索引失败:', error);
      throw error;
    }
  }

  // 删除文档索引
  async removeDocumentIndex(fileId: string): Promise<void> {
    try {
      const chunks = this.documentChunks.get(fileId);
      if (chunks) {
        // 从allChunks中移除
        this.allChunks = this.allChunks.filter(chunk => chunk.document_id !== fileId);
        this.documentChunks.delete(fileId);
        
        // 重建TF-IDF索引
        this.tfidf = new TfIdf();
        this.allChunks.forEach(chunk => {
          const processedText = this.preprocessText(chunk.content);
          this.tfidf.addDocument(processedText);
        });
        
        console.log(`文档 ${fileId} 的索引已删除`);
      }
    } catch (error) {
      console.error('删除文档索引失败:', error);
      throw error;
    }
  }

  // 获取索引统计信息
  getIndexStats(): { totalDocuments: number; totalChunks: number } {
    return {
      totalDocuments: this.documentChunks.size,
      totalChunks: this.allChunks.length
    };
  }
}

export const vectorSearchService = new VectorSearchService();