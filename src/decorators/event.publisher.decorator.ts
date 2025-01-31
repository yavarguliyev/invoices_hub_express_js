import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { EventDecoratorOption } from 'common/types/decorator.types';
import { generateCacheKey } from 'helpers/utility-functions.helper';

export function EventPublisherDecorator (options: EventDecoratorOption) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const { keyTemplate, event } = options;

      const { cacheKey } = generateCacheKey(keyTemplate);
      const result = await originalMethod.apply(this, args);

      if (event) {
        await RabbitMQInfrastructure.publish(event, JSON.stringify(result));
        await RedisInfrastructure.delete(cacheKey);
      }

      return result;
    };

    return descriptor;
  };
}
