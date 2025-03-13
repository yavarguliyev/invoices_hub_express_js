import { Container } from 'typedi';

import { getErrorMessage, handleEvent } from 'application/helpers/utility-functions.helper';
import { EVENTS } from 'domain/enums/events.enum';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

export const initializeSubscribers = async () => {
  const rabbitMQ = Container.get(RabbitMQInfrastructure);

  try {
    await Promise.all([
      rabbitMQ.subscribe(EVENTS.USER_CREATED, (message) => handleEvent(EVENTS.USER_CREATED, message)),
      rabbitMQ.subscribe(EVENTS.USER_UPDATED, (message) => handleEvent(EVENTS.USER_UPDATED, message)),
      rabbitMQ.subscribe(EVENTS.USER_PASSWORD_UPDATED, (message) => handleEvent(EVENTS.USER_PASSWORD_UPDATED, message)),
      rabbitMQ.subscribe(EVENTS.USER_DELETED, (message) => handleEvent(EVENTS.USER_DELETED, message)),
      rabbitMQ.subscribe(EVENTS.ORDER_CREATED, (message) => handleEvent(EVENTS.ORDER_CREATED, message)),
      rabbitMQ.subscribe(EVENTS.ORDER_APPROVED, (message) => handleEvent(EVENTS.ORDER_APPROVED, message)),
      rabbitMQ.subscribe(EVENTS.ORDER_CANCELED, (message) => handleEvent(EVENTS.ORDER_CANCELED, message))
    ]);
  } catch (error) {
    LoggerTracerInfrastructure.log(`Error initializing subscriptions: ${getErrorMessage(error)}`, 'error');
  }
};
