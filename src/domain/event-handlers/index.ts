import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { EVENTS } from 'domain/enums/events.enum';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';

export const handleEvent = async <T> (event: EVENTS, message: T) => {
  LoggerTracerInfrastructure.log(`Handling ${event} event: ${JSON.stringify(message)}`);
};

export const initializeSubscribers = async () => {
  try {
    await Promise.all([
      RabbitMQInfrastructure.subscribe(EVENTS.USER_CREATED, (message) => handleEvent(EVENTS.USER_CREATED, message)),
      RabbitMQInfrastructure.subscribe(EVENTS.USER_UPDATED, (message) => handleEvent(EVENTS.USER_UPDATED, message)),
      RabbitMQInfrastructure.subscribe(EVENTS.USER_PASSWORD_UPDATED, (message) => handleEvent(EVENTS.USER_PASSWORD_UPDATED, message)),
      RabbitMQInfrastructure.subscribe(EVENTS.USER_DELETED, (message) => handleEvent(EVENTS.USER_DELETED, message)),
      RabbitMQInfrastructure.subscribe(EVENTS.ORDER_CREATED, (message) => handleEvent(EVENTS.ORDER_CREATED, message)),
      RabbitMQInfrastructure.subscribe(EVENTS.ORDER_APPROVED, (message) => handleEvent(EVENTS.ORDER_APPROVED, message)),
      RabbitMQInfrastructure.subscribe(EVENTS.ORDER_CANCELED, (message) => handleEvent(EVENTS.ORDER_CANCELED, message))
    ]);
  } catch (error) {
    LoggerTracerInfrastructure.log(`Error initializing subscriptions: ${error}`, 'error');
  }
};
