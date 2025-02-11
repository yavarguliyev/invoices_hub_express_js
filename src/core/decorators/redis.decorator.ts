import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import { RedisDecoratorOption } from 'core/types/decorator.types';
import { compareValues, generateCacheKey } from 'application/helpers/utility-functions.helper';

export function RedisDecorator<T> (options: RedisDecoratorOption<T>) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const { keyTemplate, sortBy = 'id', sortOrder = 'desc' } = options;
      const { cacheKey, ttl } = generateCacheKey(keyTemplate, args);

      const cachedValue = await RedisInfrastructure.get(cacheKey);
      if (cachedValue) {
        return typeof cachedValue === 'string' ? JSON.parse(cachedValue) : cachedValue;
      }

      const result = await originalMethod.apply(this, args);
      if (sortBy && Array.isArray(result.payloads)) {
        result.payloads.sort((a: T, b: T) => compareValues(a, b, sortBy as keyof T, sortOrder));
      }

      await RedisInfrastructure.set(cacheKey, JSON.stringify(result), ttl);
      await RedisInfrastructure.setHashKeys(keyTemplate, cacheKey);

      return result;
    };

    return descriptor;
  };
}
