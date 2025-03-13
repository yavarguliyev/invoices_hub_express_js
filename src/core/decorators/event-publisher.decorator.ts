import { Container } from 'typedi';

import { EventDecoratorOption } from 'core/types/event-publisher-keys.type';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { RedisInfrastructure } from 'infrastructure/redis/redis.infrastructure';

export function EventPublisherDecorator<T extends (...args: unknown[]) => Promise<unknown>>(options: EventDecoratorOption) {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as T;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const { keyTemplate, event } = options;

      const result = await originalMethod.apply(this, args);

      if (event) {
        const rabbitMQ = Container.get(RabbitMQInfrastructure);
        await rabbitMQ.publish(event, JSON.stringify(result));
      }

      const redis = Container.get(RedisInfrastructure);
      const redisCacheKeys = await redis.getHashKeys(keyTemplate);
      if (redisCacheKeys.length) {
        await redis.deleteKeys(redisCacheKeys);
      }

      return result as ReturnType<T>;
    };

    return descriptor;
  };
}
