import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function connectRedis() {
  try {
    if (redisClient) {
      return redisClient;
    }

    // 如果没有配置Redis URL，跳过Redis连接
    if (!process.env.REDIS_URL) {
      console.log('⚠️  未配置Redis，跳过缓存功能');
      return null;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err: any) => {
      console.error('Redis连接错误:', err);
    });

    await redisClient.connect();
    
    // 测试连接
    await redisClient.ping();

    return redisClient;
  } catch (error) {
    console.error('Redis连接失败:', error);
    // 在开发环境中，如果Redis连接失败，继续运行
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Redis连接失败，跳过缓存功能');
      return null;
    }
    throw error;
  }
}

export function getRedis() {
  return redisClient;
}