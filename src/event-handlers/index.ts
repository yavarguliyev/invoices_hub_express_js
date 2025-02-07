import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { EVENTS } from 'common/enums/events.enum';
import { handleNewUserCreated, handleUserUpdated, handleUserPasswordUpdated, handleUserDeleted } from 'event-handlers/user.event';
import { handleNewOrderCreated, handleOrderApprove, handleOrderCancel } from 'event-handlers/order.event';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';

export const initializeSubscribers = async () => {
  try {
    await Promise.all([
      RabbitMQInfrastructure.subscribe(EVENTS.USER_CREATED, handleNewUserCreated),
      RabbitMQInfrastructure.subscribe(EVENTS.USER_UPDATED, handleUserUpdated),
      RabbitMQInfrastructure.subscribe(EVENTS.USER_PASSWORD_UPDATED, handleUserPasswordUpdated),
      RabbitMQInfrastructure.subscribe(EVENTS.USER_DELETED, handleUserDeleted),
      RabbitMQInfrastructure.subscribe(EVENTS.ORDER_CREATED, handleNewOrderCreated),
      RabbitMQInfrastructure.subscribe(EVENTS.ORDER_APPROVED, handleOrderApprove),
      RabbitMQInfrastructure.subscribe(EVENTS.ORDER_CANCELED, handleOrderCancel)
    ]);
  } catch (error) {
    LoggerTracerInfrastructure.log(`Error initializing subscriptions: ${error}`, 'error');
  }
};
