# Node.js/Express 后端 Railway 部署说明

## 1. 环境变量
- `PORT`：服务端口，Railway 推荐 8000
- 其他如数据库、AI Key、CORS、REDIS 等

## 2. 构建命令
```
npm install
npm run build
```

## 3. 启动命令
```
npm run start
```

## 4. Docker 部署
```
docker build -t doc-read-backend .
docker run -p 8000:8000 --env PORT=8000 doc-read-backend
```

## 5. Railway 配置建议
- 端口：8000
- 环境变量：PORT、数据库、AI Key、CORS、REDIS 等
- 推荐与前端服务分开部署 