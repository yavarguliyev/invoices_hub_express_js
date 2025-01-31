import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { EVENTS } from 'common/enums/events.enum';
import { handleNewUserCreated } from 'event-handlers/user.events';

export const initializeSubscribers = async () => {
  await RabbitMQInfrastructure.subscribe(EVENTS.USER_CREATED, handleNewUserCreated);
};
