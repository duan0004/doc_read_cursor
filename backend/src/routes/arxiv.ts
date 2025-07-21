import { Router, Request, Response } from 'express';
import axios from 'axios';
import { Parser } from 'xml2js';
import { promisify } from 'util';

const router = Router();

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-431f809401274d7ea71b59bf7a4ee6d5';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

// 工具函数：获取N天前的ISO时间字符串
function getNDaysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// 调用 DeepSeek 进行语义 rerank
async function rerankWithDeepSeek(query: string, papers: any[]): Promise<number[]> {
  // 构造 prompt
  const context = papers.map((p: any, i: number) => `【${i+1}】标题: ${p.title}\n摘要: ${p.summary}`).join('\n\n');
  const prompt = `你是学术论文推荐专家。请根据用户的检索意图，对下列论文按相关性打分（0-10分，10分最相关），只返回一个JSON数组，顺序与原论文一致。例如: [8, 6, 2, ...]\n\n用户检索意图: ${query}\n\n候选论文如下:\n${context}`;
  const messages = [
    { role: 'system', content: '你是学术论文推荐专家，只返回JSON数组，不要多余解释。' },
    { role: 'user', content: prompt }
  ];
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: DEEPSEEK_MODEL,
        messages,
        max_tokens: 128,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    // 解析大模型返回的JSON数组
    const content = response.data.choices?.[0]?.message?.content || '';
    const arr = JSON.parse(content.match(/\[.*\]/s)?.[0] || '[]');
    if (Array.isArray(arr) && arr.length === papers.length) {
      return arr.map((v: any) => (typeof v === 'number' ? v : 0));
    }
    return papers.map(() => 0);
  } catch (e: any) {
    console.error('DeepSeek rerank error:', e?.response?.data || e.message);
    return papers.map(() => 0);
  }
}

// /api/arxiv/search?keywords=xxx,yyy,zzz&days=21
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { keywords, days } = req.query;
    if (!keywords || typeof keywords !== 'string') {
      return res.status(400).json({ success: false, message: '请提供关键词（英文逗号分隔）' });
    }
    const keywordArr = keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    if (keywordArr.length < 1) {
      return res.status(400).json({ success: false, message: '请至少输入1个关键词' });
    }
    // 解析天数参数，默认21天，最大90天
    let daysNum = 21;
    if (days && !isNaN(Number(days))) {
      daysNum = Math.max(1, Math.min(90, Number(days)));
    }
    // 构造 arXiv 查询
    const searchQuery = keywordArr.map(k => `all:${encodeURIComponent(k)}`).join('+AND+');
    const url = `https://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=50&sortBy=submittedDate&sortOrder=descending`;
    const xml = (await axios.get(url)).data;
    // 解析 Atom XML，使用 Promise 包装 parseString，避免类型和参数问题
    const parser = new Parser({ explicitArray: false });
    const result: any = await new Promise((resolve, reject) => {
      parser.parseString(xml, (err: any, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    const entries = result.feed.entry ? (Array.isArray(result.feed.entry) ? result.feed.entry : [result.feed.entry]) : [];
    const nDaysAgo = getNDaysAgoISO(daysNum);
    let papers = entries.filter((item: any) => item.published >= nDaysAgo)
      .map((item: any) => ({
        id: item.id,
        title: item.title?.replace(/\s+/g, ' ').trim(),
        summary: item.summary?.replace(/\s+/g, ' ').trim(),
        authors: Array.isArray(item.author) ? item.author.map((a: any) => a.name) : [item.author?.name],
        published: item.published,
        link: Array.isArray(item.link) ? (item.link.find((l: any) => l.$.type === 'text/html')?.$.href || item.id) : item.id
      }));
    // 只对前20篇用大模型 rerank
    const topN = 20;
    if (papers.length > 1) {
      const rerankScores = await rerankWithDeepSeek(keywordArr.join(', '), papers.slice(0, topN));
      papers = [
        ...papers.slice(0, topN).map((p: any, i: number) => ({ ...p, semantic_score: rerankScores[i] || 0 })),
        ...papers.slice(topN)
      ];
      papers = papers.sort((a: any, b: any) => (b.semantic_score || 0) - (a.semantic_score || 0));
    }
    res.json({ success: true, data: papers });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: 'arXiv检索失败', error: (error as Error).message });
    return;
  }
});

export default router; 