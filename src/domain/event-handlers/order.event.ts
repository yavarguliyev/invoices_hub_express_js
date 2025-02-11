import { EVENTS } from 'domain/enums/events.enum';
import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';

export const handleNewOrderCreated = async (message: any) => {
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.ORDER_CREATED} event: ${JSON.stringify(message)}`);
};

export const handleOrderApprove = async (message: any) => {
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.ORDER_APPROVED} event: ${JSON.stringify(message)}`);
};

export const handleOrderCancel = async (message: any) => {
  LoggerTracerInfrastructure.log(`Handling ${EVENTS.ORDER_CANCELED} event: ${JSON.stringify(message)}`);
};
