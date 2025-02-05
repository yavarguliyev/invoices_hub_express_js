import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { EventDecoratorOption } from 'common/types/decorator.types';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';

export function EventPublisherDecorator (options: EventDecoratorOption) {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const { keyTemplate, event } = options;

      const result = await originalMethod.apply(this, args);

      if (event) {
        try {
          await RabbitMQInfrastructure.publish(event, JSON.stringify(result));
        } catch (error) {
          LoggerTracerInfrastructure.log(`Failed to publish event ${event}: ${error}`, 'error');
        }
      }

      const redisCacheKeys = await RedisInfrastructure.getHashKeys(keyTemplate);
      if (redisCacheKeys.length) {
        try {
          await RedisInfrastructure.deletekeys(redisCacheKeys);
        } catch (error) {
          LoggerTracerInfrastructure.log(`Failed to delete Redis cache keys: ${error}`, 'error');
        }
      }

      return result;
    };

    return descriptor;
  };
}
