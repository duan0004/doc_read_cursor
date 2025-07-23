#!/bin/bash

# 文献智能解读模块 - 开发环境启动脚本

echo "🚀 启动文献智能解读模块开发环境..."

# 检查Node.js版本
if command -v node >/dev/null 2>&1; then
    node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        echo "❌ 需要Node.js 18或更高版本，当前版本: $(node -v)"
        exit 1
    fi
    echo "✅ Node.js版本检查通过: $(node -v)"
else
    echo "❌ 未找到Node.js，请先安装Node.js 18或更高版本"
    exit 1
fi

# 检查是否安装了依赖
echo "📦 检查依赖..."

if [ ! -d "node_modules" ]; then
    echo "安装根目录依赖..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "安装后端依赖..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "安装前端依赖..."
    cd frontend && npm install && cd ..
fi

# 检查环境变量文件
if [ ! -f "backend/.env" ]; then
    echo "⚠️  创建环境变量文件..."
    cp backend/.env.example backend/.env
    echo "📝 请编辑 backend/.env 文件配置您的API密钥"
fi

# 创建上传目录
mkdir -p backend/uploads

echo ""
echo "✅ 环境准备完成"
echo ""
echo "🔧 启动开发服务器..."
echo "   - 后端API: http://localhost:8000"
echo "   - 前端应用: http://localhost:3000"
echo "   - 系统测试: http://localhost:3000/test"
echo "   - 文档管理: http://localhost:3000/documents"
echo ""
echo "💡 提示："
echo "   - DeepSeek API已配置，可直接使用AI功能"
echo "   - 数据库和Redis为可选配置，不配置将使用内存存储"
echo "   - 支持用户注册登录功能"
echo "   - 按 Ctrl+C 停止服务"
echo ""

# 启动开发服务器
npm run dev