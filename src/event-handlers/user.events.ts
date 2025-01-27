import { EVENTS } from 'value-objects/enums/events.enum';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';

export const handleNewUserCreated = async (message: any) => {
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_CREATED} event: ${JSON.stringify(message)}`);
};
