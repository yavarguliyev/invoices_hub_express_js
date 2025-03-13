import { Container } from 'typedi';

import { generateCacheKey } from 'application/helpers/utility-functions.helper';
import { RedisDecoratorOption } from 'core/types/redis-cache-keys.type';
import { RedisInfrastructure } from 'infrastructure/redis/redis.infrastructure';

export function RedisDecorator (options: RedisDecoratorOption) {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<{ payloads: [] }>;

    descriptor.value = async function (...args: Parameters<typeof originalMethod>): Promise<{ payloads: [] }> {
      const { keyTemplate } = options;
      const { cacheKey, ttl } = generateCacheKey({ keyTemplate, args });

      const redis = Container.get(RedisInfrastructure);
      const cachedValue = await redis.get(cacheKey);
      if (cachedValue) {
        return typeof cachedValue === 'string' ? JSON.parse(cachedValue) : cachedValue;
      }

      const result = await originalMethod.apply(this, args);

      await redis.set(cacheKey, JSON.stringify(result), ttl);
      await redis.setHashKeys(keyTemplate, cacheKey);

      return result;
    };

    return descriptor;
  };
}
