FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境
FROM node:18-alpine AS runner

WORKDIR /app

# 设置为生产环境
ENV NODE_ENV=production

# 复制 package.json 和 package-lock.json
COPY --from=builder /app/package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制构建产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]