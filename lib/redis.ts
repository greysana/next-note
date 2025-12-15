import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
redisClient.on('error', (err: any) => console.error('Redis Client Error', err));

export async function getRedisClient() {
  // Check if already connected or connecting
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

export default redisClient;