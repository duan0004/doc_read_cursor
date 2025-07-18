# 📖 使用指南

## 快速开始

### 1. 环境准备

确保您的系统已安装：
- Node.js 18+ 
- Git

### 2. 获取代码并启动

```bash
# 克隆项目（如果需要）
git clone <repository-url>
cd doc-read-ai

# 一键启动（推荐）
./start-dev.sh
```

### 3. 配置API密钥

首次运行后，编辑 `backend/.env` 文件：

```bash
# 必需配置 - OpenAI API密钥
OPENAI_API_KEY=sk-your-openai-api-key-here

# 可选配置
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### 4. 访问应用

- 🌐 前端应用: http://localhost:3000
- 🔧 后端API: http://localhost:5000
- 🧪 系统测试: http://localhost:3000/test

## 功能使用

### 📄 上传PDF文档

1. 访问首页 http://localhost:3000
2. 拖拽或点击上传PDF文件（最大50MB）
3. 等待上传完成
4. 点击"查看详情"进入文档分析页面

### 🤖 AI智能分析

在文档详情页面可以：

1. **生成摘要**: 点击"生成摘要"按钮，AI会自动分析文档内容
2. **提取关键词**: 点击"提取"按钮，获取文档核心关键词
3. **智能问答**: 在问答框中输入问题，基于文档内容获得答案

### 📚 文档管理

- 访问 http://localhost:3000/documents 查看所有上传的文档
- 可以查看、删除文档
- 查看文档的分析状态（是否已生成摘要、关键词等）

## 系统测试

访问 http://localhost:3000/test 进行系统功能测试：

- 后端服务健康检查
- API接口连通性测试
- 功能模块验证

## 常见问题

### Q: 上传文件失败？
A: 检查文件格式（仅支持PDF）和大小（最大50MB）

### Q: AI功能不工作？
A: 确保已正确配置 `OPENAI_API_KEY` 环境变量

### Q: 端口冲突？
A: 修改 `backend/.env` 中的 `PORT` 配置

### Q: 如何重置系统？
A: 删除 `backend/uploads` 目录下的文件即可清空所有文档

## 高级配置

### 数据库配置（可选）

如需持久化存储，配置PostgreSQL：

```bash
# 在 backend/.env 中添加
DATABASE_URL=postgresql://username:password@localhost:5432/doc_read_ai
```

### Redis缓存（可选）

提升性能，配置Redis：

```bash
# 在 backend/.env 中添加
REDIS_URL=redis://localhost:6379
```

## 开发说明

### 项目结构

```
├── frontend/          # Next.js前端应用
├── backend/           # Node.js后端API
├── database/          # 数据库初始化脚本
├── start-dev.sh       # 开发环境启动脚本
└── README.md          # 项目说明
```

### 开发命令

```bash
# 启动开发环境
npm run dev

# 分别启动前后端
npm run dev:frontend
npm run dev:backend

# 构建生产版本
npm run build

# 清理依赖
npm run clean
```

## 技术支持

如遇问题，请检查：

1. Node.js版本是否 >= 18
2. 网络连接是否正常
3. API密钥是否正确配置
4. 控制台错误信息

---

🎉 现在您可以开始使用文献智能解读系统了！