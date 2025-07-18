FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "run", "start"] 