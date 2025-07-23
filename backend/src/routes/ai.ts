import { Router, Request, Response } from 'express';
import { documentService } from '../services/documentService';
import axios from 'axios';

const router = Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-chat';

async function callDeepSeek(messages: any[], max_tokens = 512, temperature = 0.2): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    console.error('DEEPSEEK_API_KEY not configured');
    return 'AI服务未配置，请检查API Key设置。';
  }
  
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: MODEL,
        messages,
        max_tokens,
        temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    return response.data.choices?.[0]?.message?.content || '';
  } catch (err: any) {
    console.error('DeepSeek API error:', err?.response?.data || err.message);
    return 'AI服务暂不可用，请检查API Key或网络连接。';
  }
}

// 智能问答接口（调用DeepSeek）
router.post('/ask', async (req: Request, res: Response): Promise<void> => {
  try {
    const { file_id, question } = req.body;
    if (!file_id || !question) {
      res.status(400).json({ success: false, message: '文件ID和问题不能为空' });
      return;
    }
    const document = await documentService.getDocument(file_id);
    if (!document) {
      res.status(404).json({ success: false, message: '文档不存在' });
      return;
    }
    // 调用DeepSeek
    const answer = await callDeepSeek([
      { role: 'system', content: '你是一个专业的学术助手，请根据文档内容回答用户问题。' },
      { role: 'user', content: `文档内容：${document.text_content}\n\n问题：${question}` }
    ]);
    
    // 保存问答记录
    await documentService.saveQA(file_id, question, answer);
    
    res.json({
      success: true,
      message: '问答成功',
      data: { file_id, question, answer, answered_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('问答错误:', error);
    res.status(500).json({ success: false, message: '问答失败' });
  }
});

// 生成摘要接口（调用DeepSeek）
router.post('/summarize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { file_id } = req.body;
    if (!file_id) {
      res.status(400).json({ success: false, message: '文件ID不能为空' });
      return;
    }
    const document = await documentService.getDocument(file_id);
    if (!document) {
      res.status(404).json({ success: false, message: '文档不存在' });
      return;
    }
    // 调用DeepSeek，要求返回严格JSON
    const prompt = `请你作为专业论文分析助手，根据以下PDF文献段落，输出结构化总结，返回格式为严格的JSON，不要有多余解释。字段包括：\n{\n  "purpose": "研究目的",\n  "method": "方法概述",\n  "finding": "关键发现",\n  "conclusion": "结论总结",\n  "keywords": "关键词1, 关键词2, ..."\n}\n文献段落如下：${document.text_content.substring(0, 3000)}`;
    const aiResponse = await callDeepSeek([
      { role: 'system', content: '你是一个专业的论文分析助手，请严格按照用户要求返回结构化JSON。' },
      { role: 'user', content: prompt }
    ], 1024, 0.2);

    // 尝试解析AI返回内容为JSON
    let summaryJson: any = null;
    try {
      // 先直接尝试JSON.parse
      summaryJson = JSON.parse(aiResponse);
    } catch (e) {
      // 如果AI返回内容不是严格JSON，尝试用正则提取JSON部分
      const match = aiResponse.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          summaryJson = JSON.parse(match[0]);
        } catch (e2) {
          summaryJson = null;
        }
      }
    }

    if (!summaryJson) {
      res.json({
        success: false,
        message: 'AI返回内容无法解析为结构化JSON',
        data: { file_id, raw: aiResponse }
      });
      return;
    }

    // 保存摘要到数据库
    await documentService.updateDocumentSummary(file_id, summaryJson);
    
    res.json({
      success: true,
      message: '摘要生成成功',
      data: {
        file_id,
        ...summaryJson,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('摘要生成错误:', error);
    res.status(500).json({ success: false, message: '摘要生成失败' });
  }
});

// 关键词提取接口
router.post('/keywords', async (req: Request, res: Response): Promise<void> => {
  try {
    const { file_id } = req.body;
    if (!file_id) {
      res.status(400).json({ success: false, message: '文件ID不能为空' });
      return;
    }
    const document = await documentService.getDocument(file_id);
    if (!document) {
      res.status(404).json({ success: false, message: '文档不存在' });
      return;
    }
    
    // 调用DeepSeek提取关键词
    const prompt = `请从以下学术文献中提取10-15个最重要的关键词，包括专业术语、核心概念、研究方法等。请以JSON数组格式返回，例如：["关键词1", "关键词2", "关键词3"]。\n\n文献内容：${document.text_content.substring(0, 2000)}`;
    const aiResponse = await callDeepSeek([
      { role: 'system', content: '你是一个专业的学术文献分析助手，擅长提取关键词和核心概念。' },
      { role: 'user', content: prompt }
    ], 512, 0.3);

    // 尝试解析关键词数组
    let keywords: string[] = [];
    try {
      // 尝试直接解析JSON数组
      keywords = JSON.parse(aiResponse);
    } catch (e) {
      // 如果不是标准JSON，尝试提取数组部分
      const match = aiResponse.match(/\[[\s\S]*?\]/);
      if (match) {
        try {
          keywords = JSON.parse(match[0]);
        } catch (e2) {
          // 如果还是失败，尝试从文本中提取关键词
          const lines = aiResponse.split('\n');
          keywords = lines
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
            .filter(keyword => keyword.length > 0 && keyword.length < 50)
            .slice(0, 15);
        }
      }
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      res.json({
        success: false,
        message: '关键词提取失败',
        data: { file_id, raw: aiResponse }
      });
      return;
    }

    // 保存关键词到数据库
    await documentService.updateDocumentKeywords(file_id, keywords);
    
    res.json({
      success: true,
      message: '关键词提取成功',
      data: {
        file_id,
        keywords,
        extracted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('关键词提取错误:', error);
    res.status(500).json({ success: false, message: '关键词提取失败' });
  }
});

export default router;
