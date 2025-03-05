import { EventDecoratorOption } from 'core/types/decorator.types';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';

export function EventPublisherDecorator<T extends (...args: unknown[]) => Promise<unknown>>(options: EventDecoratorOption) {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as T;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const { keyTemplate, event } = options;

      const result = await originalMethod.apply(this, args);

      if (event) {
        await RabbitMQInfrastructure.publish(event, JSON.stringify(result));
      }

      const redisCacheKeys = await RedisInfrastructure.getHashKeys(keyTemplate);
      if (redisCacheKeys.length) {
        await RedisInfrastructure.deletekeys(redisCacheKeys);
      }

      return result as ReturnType<T>;
    };

    return descriptor;
  };
}
