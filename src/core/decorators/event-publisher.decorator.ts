import { Container } from 'typedi';

import { EventDecoratorOptions } from 'core/types/event-publisher-keys.type';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';

export function EventPublisherDecorator<T extends (...args: unknown[]) => Promise<unknown>>(options: EventDecoratorOptions) {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as T;

    descriptor.value = async function (...args: Parameters<T>): Promise<ReturnType<T>> {
      const { prepareMessage } = options;

      const rabbitMQ = Container.get(RabbitMQInfrastructure);

      const result = await originalMethod.apply(this, args);
      const payload = prepareMessage ? prepareMessage(result, args) : result;

      if (payload && typeof payload === 'object' && 'queueName' in payload && 'message' in payload) {
        await rabbitMQ.publish(payload.queueName as string, JSON.stringify(payload.message));
      }

      return result as ReturnType<T>;
    };

    return descriptor;
  };
}
