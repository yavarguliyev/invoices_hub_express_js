import { EVENTS } from 'value-objects/enums/events.enum';
import { LoggerHelper } from 'helpers/logger.helper';

export const handleNewUserCreated = async (message: any) => {
  LoggerHelper.log(`Handling ${EVENTS.USER_CREATED} event: ${JSON.stringify(message)}`);
};
