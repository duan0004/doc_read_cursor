#!/bin/bash

# 带数据库的完整启动脚本

echo "🚀 启动文献智能解读模块（含数据库）..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查端口占用
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口8000被占用，正在清理..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口3000被占用，正在清理..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 启动数据库
echo "🗄️  启动PostgreSQL数据库..."
docker-compose up -d postgres

# 等待数据库启动
echo "⏳ 等待数据库启动..."
timeout=60
while ! docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
    timeout=$((timeout - 2))
    if [ $timeout -le 0 ]; then
        echo "❌ 数据库启动超时"
        exit 1
    fi
done

echo "✅ 数据库启动成功"

# 更新环境变量以使用数据库
if [ -f "backend/.env" ]; then
    # 确保数据库URL配置正确
    if ! grep -q "DATABASE_URL=postgresql://postgres:password@localhost:5432/doc_read_ai" backend/.env; then
        echo "📝 更新数据库配置..."
        sed -i.bak 's|^DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:password@localhost:5432/doc_read_ai|' backend/.env
    fi
fi

# 创建上传目录
mkdir -p backend/uploads

echo "🔧 启动后端服务..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 5

echo "🎨 启动前端服务..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动完成！"
echo "   - 数据库: PostgreSQL (localhost:5432)"
echo "   - 后端API: http://localhost:8000"
echo "   - 前端应用: http://localhost:3000"
echo "   - 系统测试: http://localhost:3000/test"
echo "   - 文档管理: http://localhost:3000/documents"
echo ""
echo "💡 数据将持久化保存到PostgreSQL数据库"
echo "💡 查看日志: tail -f backend.log 或 tail -f frontend.log"
echo "💡 按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down; exit" INT

# 保持脚本运行
wait