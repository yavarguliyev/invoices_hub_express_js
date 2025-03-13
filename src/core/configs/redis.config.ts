import dotenv from 'dotenv';

import { REDIS_CACHE_KEYS, RedisCacheConfig } from 'core/types/redis-cache-keys.type';

dotenv.config();

export const redisConfig = {
  REDIS_PORT: Number(process.env.REDIS_PORT!),
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DEFAULT_CACHE_TTL: Number(process.env.REDIS_DEFAULT_CACHE_TTL) || 3600
} as const;

export const redisCacheConfig: RedisCacheConfig = {
  ROLE_LIST: { keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST },
  USER_LIST: { keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST },
  INVOICE_LIST: { keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST },
  ORDER_LIST: { keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST }
};
