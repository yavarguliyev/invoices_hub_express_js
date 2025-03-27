import { EVENTS } from 'domain/enums/events.enum';

export const REDIS_CACHE_KEYS = {
  ORDER_INVOICE_GET_LIST: 'order:invoice:get:list',
  ROLE_GET_LIST: 'role:get:list',
  USER_GET_LIST: 'user:get:list'
};

export type RedisCacheKeys = { cacheKey: string, ttl: number }
export type RedisCacheKey = typeof REDIS_CACHE_KEYS[keyof typeof REDIS_CACHE_KEYS]
export type RedisDecoratorOption = { keyTemplate: RedisCacheKey; event?: EVENTS }

export type RedisCacheConfig = {
  ROLE_LIST: RedisDecoratorOption;
  USER_LIST: RedisDecoratorOption;
  INVOICE_LIST: RedisDecoratorOption;
  ORDER_LIST: RedisDecoratorOption;
}
