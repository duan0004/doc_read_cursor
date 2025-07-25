# 📚 Semantic Scholar 文献检索功能指南

## 🎯 功能概述

Semantic Scholar 是一个由艾伦人工智能研究所开发的免费学术搜索引擎，提供超过2亿篇学术论文的检索服务。我们的系统集成了 Semantic Scholar API，为您提供强大的文献检索功能。

## ✨ 主要特性

### 🔍 智能搜索
- **关键词搜索**: 支持标题、摘要、作者、关键词等多维度搜索
- **年份过滤**: 可按发表年份筛选文献
- **结果数量控制**: 支持10-100篇结果数量调节
- **实时搜索**: 毫秒级响应，快速获取结果

### 📊 丰富信息
- **论文详情**: 标题、摘要、作者、发表年份、期刊/会议
- **引用分析**: 引用次数、高影响力引用次数
- **开放获取**: 自动识别并提供PDF下载链接
- **研究领域**: 智能标签化研究领域分类
- **参考文献**: 论文引用和参考文献列表

### 🎨 用户体验
- **美观界面**: Apple风格设计，支持深色模式
- **响应式布局**: 完美适配桌面和移动设备
- **交互式详情**: 点击论文查看详细信息
- **一键下载**: 支持开放获取论文直接下载

## 🚀 使用方法

### 1. 访问搜索页面

有两种方式访问 Semantic Scholar 搜索：

**方式一：主页集成**
- 访问首页 `http://localhost:3000`
- 在"智能文献检索"模块中点击"Semantic Scholar"标签页

**方式二：独立页面**
- 直接访问 `http://localhost:3000/semantic`
- 或点击导航栏中的"文献检索"链接

### 2. 执行搜索

1. **输入搜索词**
   - 在搜索框中输入关键词、论文标题或作者姓名
   - 支持英文和中文搜索
   - 示例：`machine learning`, `深度学习`, `Yann LeCun`

2. **设置过滤条件**（可选）
   - **年份**: 选择特定年份或年份范围
   - **结果数量**: 选择返回10、20、50或100篇论文

3. **点击搜索**
   - 点击"搜索文献"按钮开始检索
   - 系统会显示加载动画，等待结果返回

### 3. 查看结果

搜索结果按相关性排序，每个论文条目显示：

- **标题**: 论文完整标题
- **作者**: 所有作者姓名
- **年份**: 发表年份
- **期刊/会议**: 发表场所
- **摘要**: 论文摘要（前3行）
- **引用信息**: 引用次数和高影响力引用
- **开放获取标识**: 绿色下载图标表示可下载PDF

### 4. 查看详情

点击任意论文条目，弹出详情模态框，包含：

- **完整信息**: 标题、作者、年份、期刊
- **详细摘要**: 完整论文摘要
- **统计数据**: 引用次数、高影响力引用、参考文献数量、研究领域数量
- **研究领域标签**: 相关研究领域分类
- **操作按钮**: 查看论文链接、下载PDF（如果可用）

## 🔧 API 配置

### 获取 API Key（可选）

虽然 Semantic Scholar API 支持无密钥访问，但获取 API Key 可以获得更高的请求限制：

1. 访问 [Semantic Scholar API](https://www.semanticscholar.org/product/api)
2. 注册账号并申请 API Key
3. 在 `backend/.env` 文件中配置：
   ```bash
   SEMANTIC_API_KEY=your_api_key_here
   ```

### API 限制

- **无密钥**: 100 requests/minute
- **有密钥**: 1000 requests/minute
- **请求超时**: 30秒

## 📋 API 端点

### 论文搜索
```http
GET /api/semantic/search?query=search_term&year=2023&limit=20
```

### 论文详情
```http
GET /api/semantic/paper/:paperId
```

### 作者信息
```http
GET /api/semantic/author/:authorId
```

### 论文推荐
```http
GET /api/semantic/paper/:paperId/recommendations
```

## 💡 使用技巧

### 搜索技巧
1. **使用精确关键词**: 避免过于宽泛的词汇
2. **组合搜索**: 使用多个相关关键词
3. **作者搜索**: 直接搜索知名学者姓名
4. **年份筛选**: 关注最新研究进展

### 结果分析
1. **引用数量**: 高引用论文通常更具影响力
2. **开放获取**: 优先选择可下载的论文
3. **研究领域**: 通过标签了解论文分类
4. **作者信息**: 点击作者查看其其他作品

### 效率提升
1. **批量下载**: 对于开放获取论文，可直接下载PDF
2. **详情对比**: 使用详情模态框对比不同论文
3. **相关推荐**: 查看论文推荐列表发现相关研究

## 🐛 常见问题

### Q: 搜索无结果怎么办？
A: 
- 检查关键词拼写是否正确
- 尝试使用更宽泛的关键词
- 移除年份限制
- 确认网络连接正常

### Q: 为什么有些论文没有PDF下载？
A: 
- 只有开放获取（Open Access）论文提供PDF下载
- 其他论文需要通过期刊网站或机构访问

### Q: 如何提高搜索准确性？
A: 
- 使用更具体的关键词
- 结合年份和期刊信息
- 利用作者姓名进行精确搜索

### Q: API 请求失败怎么办？
A: 
- 检查网络连接
- 确认API Key配置正确（如果使用）
- 等待一段时间后重试（可能达到请求限制）

## 🔗 相关链接

- [Semantic Scholar 官网](https://www.semanticscholar.org/)
- [API 文档](https://www.semanticscholar.org/product/api/tutorial)
- [API 限制说明](https://www.semanticscholar.org/product/api#Rate-Limiting)

---

📧 如有问题，请提交 Issue 或联系开发团队 