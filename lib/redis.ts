import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
redisClient.on('error', (err: any) => console.error('Redis Client Error', err));

let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
  return redisClient;
}

export default redisClient;