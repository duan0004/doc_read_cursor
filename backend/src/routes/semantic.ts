import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

// Semantic Scholar API 配置
const SEMANTIC_API_BASE = 'https://api.semanticscholar.org/graph/v1';
const SEMANTIC_API_KEY = process.env.SEMANTIC_API_KEY || ''; // 可选，有API key可以增加请求限制

// 设置请求头
const getHeaders = () => {
  const headers: any = {
    'Content-Type': 'application/json',
    'User-Agent': 'DocReadCursor/1.0 (https://github.com/your-repo; mailto:your-email@example.com)'
  };
  if (SEMANTIC_API_KEY) {
    headers['x-api-key'] = SEMANTIC_API_KEY;
  }
  return headers;
};

// 论文搜索
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query, limit = 20, offset = 0, year, fields } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: '请提供搜索查询词' 
      });
    }

    // 构建查询参数
    const params: any = {
      query: query.trim(),
      limit: Math.min(100, Math.max(1, Number(limit) || 20)),
      offset: Math.max(0, Number(offset) || 0),
      fields: fields || 'paperId,title,abstract,authors,year,venue,url,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,publicationDate,publicationTypes,publicationVenue,referenceCount,fieldsOfStudy'
    };

    // 添加年份过滤
    if (year && !isNaN(Number(year))) {
      params.year = Number(year);
    }

    const response = await axios.get(`${SEMANTIC_API_BASE}/paper/search`, {
      params,
      headers: getHeaders(),
      timeout: 30000
    });

    const papers = response.data.data || [];
    
    // 格式化返回数据
    const formattedPapers = papers.map((paper: any) => ({
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors?.map((author: any) => ({
        id: author.authorId,
        name: author.name
      })) || [],
      year: paper.year,
      venue: paper.venue,
      url: paper.url,
      citationCount: paper.citationCount || 0,
      influentialCitationCount: paper.influentialCitationCount || 0,
      isOpenAccess: paper.isOpenAccess || false,
      openAccessPdf: paper.openAccessPdf?.url,
      publicationDate: paper.publicationDate,
      publicationTypes: paper.publicationTypes || [],
      publicationVenue: paper.publicationVenue,
      referenceCount: paper.referenceCount || 0,
      fieldsOfStudy: paper.fieldsOfStudy || []
    }));

    return res.json({
      success: true,
      data: {
        papers: formattedPapers,
        total: response.data.total || 0,
        offset: params.offset,
        limit: params.limit
      }
    });

  } catch (error: any) {
    console.error('Semantic Scholar search error:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Semantic Scholar 搜索失败', 
      error: error.response?.data?.message || error.message 
    });
  }
});

// 获取论文详情
router.get('/paper/:paperId', async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const { fields } = req.query;

    if (!paperId) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供论文ID' 
      });
    }

    const params: any = {
      fields: fields || 'paperId,title,abstract,authors,year,venue,url,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,publicationDate,publicationTypes,publicationVenue,referenceCount,fieldsOfStudy,embedding,references,citations'
    };

    const response = await axios.get(`${SEMANTIC_API_BASE}/paper/${paperId}`, {
      params,
      headers: getHeaders(),
      timeout: 30000
    });

    const paper = response.data;
    
    // 格式化返回数据
    const formattedPaper = {
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors?.map((author: any) => ({
        id: author.authorId,
        name: author.name
      })) || [],
      year: paper.year,
      venue: paper.venue,
      url: paper.url,
      citationCount: paper.citationCount || 0,
      influentialCitationCount: paper.influentialCitationCount || 0,
      isOpenAccess: paper.isOpenAccess || false,
      openAccessPdf: paper.openAccessPdf?.url,
      publicationDate: paper.publicationDate,
      publicationTypes: paper.publicationTypes || [],
      publicationVenue: paper.publicationVenue,
      referenceCount: paper.referenceCount || 0,
      fieldsOfStudy: paper.fieldsOfStudy || [],
      references: paper.references || [],
      citations: paper.citations || []
    };

    return res.json({
      success: true,
      data: formattedPaper
    });

  } catch (error: any) {
    console.error('Semantic Scholar paper detail error:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: '获取论文详情失败', 
      error: error.response?.data?.message || error.message 
    });
  }
});

// 获取作者信息
router.get('/author/:authorId', async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const { fields } = req.query;

    if (!authorId) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供作者ID' 
      });
    }

    const params: any = {
      fields: fields || 'authorId,name,url,affiliations,homepage,paperCount,citationCount,hIndex,affiliation,paper.paperId,paper.title,paper.year,paper.venue'
    };

    const response = await axios.get(`${SEMANTIC_API_BASE}/author/${authorId}`, {
      params,
      headers: getHeaders(),
      timeout: 30000
    });

    const author = response.data;
    
    // 格式化返回数据
    const formattedAuthor = {
      id: author.authorId,
      name: author.name,
      url: author.url,
      affiliations: author.affiliations || [],
      homepage: author.homepage,
      paperCount: author.paperCount || 0,
      citationCount: author.citationCount || 0,
      hIndex: author.hIndex || 0,
      affiliation: author.affiliation,
      papers: author.papers || []
    };

    return res.json({
      success: true,
      data: formattedAuthor
    });

  } catch (error: any) {
    console.error('Semantic Scholar author error:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: '获取作者信息失败', 
      error: error.response?.data?.message || error.message 
    });
  }
});

// 获取论文推荐
router.get('/paper/:paperId/recommendations', async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const { limit = 10, fields } = req.query;

    if (!paperId) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供论文ID' 
      });
    }

    const params: any = {
      limit: Math.min(100, Math.max(1, Number(limit) || 10)),
      fields: fields || 'paperId,title,abstract,authors,year,venue,url,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,publicationDate,publicationTypes,publicationVenue,referenceCount,fieldsOfStudy'
    };

    const response = await axios.get(`${SEMANTIC_API_BASE}/paper/${paperId}/recommendations`, {
      params,
      headers: getHeaders(),
      timeout: 30000
    });

    const papers = response.data || [];
    
    // 格式化返回数据
    const formattedPapers = papers.map((paper: any) => ({
      id: paper.paperId,
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors?.map((author: any) => ({
        id: author.authorId,
        name: author.name
      })) || [],
      year: paper.year,
      venue: paper.venue,
      url: paper.url,
      citationCount: paper.citationCount || 0,
      influentialCitationCount: paper.influentialCitationCount || 0,
      isOpenAccess: paper.isOpenAccess || false,
      openAccessPdf: paper.openAccessPdf?.url,
      publicationDate: paper.publicationDate,
      publicationTypes: paper.publicationTypes || [],
      publicationVenue: paper.publicationVenue,
      referenceCount: paper.referenceCount || 0,
      fieldsOfStudy: paper.fieldsOfStudy || []
    }));

    return res.json({
      success: true,
      data: formattedPapers
    });

  } catch (error: any) {
    console.error('Semantic Scholar recommendations error:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: '获取论文推荐失败', 
      error: error.response?.data?.message || error.message 
    });
  }
});

export default router; 