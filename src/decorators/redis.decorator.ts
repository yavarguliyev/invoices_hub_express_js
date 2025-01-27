import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import { RedisDecoratorOption } from 'value-objects/types/redis/redis-decorator.types';
import { generateCacheKey } from 'helpers/utility-functions.helper';

export function RedisDecorator (options: RedisDecoratorOption) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const { keyTemplate } = options;
      const { cacheKey, ttl } = generateCacheKey(keyTemplate);

      const cachedValue = await RedisInfrastructure.get(cacheKey);
      if (cachedValue) {
        return typeof cachedValue === 'string' ? JSON.parse(cachedValue) : cachedValue;
      }

      const result = await originalMethod.apply(this, args);
      await RedisInfrastructure.set(cacheKey, JSON.stringify(result), ttl);

      return result;
    };

    return descriptor;
  };
}
