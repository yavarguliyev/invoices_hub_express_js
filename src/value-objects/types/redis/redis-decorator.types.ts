import { EVENTS } from 'value-objects/enums/events.enum';

export const REDIS_CACHE_KEYS = {
  INVOICE_GET_LIST: 'invoice:get:list',
  ROLE_GET_LIST: 'role:get:list',
  USER_GET_LIST: 'user:get:list'
} as const;

export type RedisCacheKeys = { cacheKey: string, ttl: number };
export type RedisCacheKey = typeof REDIS_CACHE_KEYS[keyof typeof REDIS_CACHE_KEYS];
export type RedisDecoratorOption = { keyTemplate: RedisCacheKey; event?: EVENTS };
