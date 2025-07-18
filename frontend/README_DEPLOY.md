# Next.js 前端 Railway 部署说明

## 1. 环境变量
- `NEXT_PUBLIC_API_URL`：后端 API 地址（如 https://your-backend.up.railway.app/api）

## 2. 构建命令
```
npm install
npm run build
```

## 3. 启动命令
```
npm start
```

## 4. Docker 部署
```
docker build -t doc-read-frontend .
docker run -p 3000:3000 --env NEXT_PUBLIC_API_URL=xxx doc-read-frontend
```

## 5. Railway 配置建议
- 端口：3000
- 环境变量：NEXT_PUBLIC_API_URL
- 推荐与后端服务分开部署 