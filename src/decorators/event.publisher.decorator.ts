import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { EventDecoratorOption } from 'common/types/decorator.types';

export function EventPublisherDecorator (options: EventDecoratorOption) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const { keyTemplate, event } = options;

      const result = await originalMethod.apply(this, args);

      if (event) {
        await RabbitMQInfrastructure.publish(event, JSON.stringify(result));
      }

      const redisCacheKeys = await RedisInfrastructure.getHashKeys(keyTemplate);
      if (redisCacheKeys.length) {
        await RedisInfrastructure.deletekeys(redisCacheKeys);
      }

      return result;
    };

    return descriptor;
  };
}
