FROM node:18-alpine

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 创建上传目录
RUN mkdir -p uploads

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["npm", "start"]