import { EVENTS } from 'common/enums/events.enum';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';

export const handleNewUserCreated = async (message: any) => {
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_CREATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_UPDATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_PASSWORD_UPDATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_DELETED} event: ${JSON.stringify(message)}`);
};

export const handleUserUpdated = async (message: any) => {
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_CREATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_UPDATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_PASSWORD_UPDATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_DELETED} event: ${JSON.stringify(message)}`);
};

export const handleUserPasswordUpdated = async (message: any) => {
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_CREATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_UPDATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_PASSWORD_UPDATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_DELETED} event: ${JSON.stringify(message)}`);
};

export const handleUserDeleted = async (message: any) => {
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_CREATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_UPDATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_PASSWORD_UPDATED} event: ${JSON.stringify(message)}`);
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.USER_DELETED} event: ${JSON.stringify(message)}`);
};
