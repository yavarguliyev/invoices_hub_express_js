import { EventMessage } from 'domain/interfaces/events.interface';

export type EventDecoratorOptions = {
  queueName: (args: EventMessage[]) => string,
  prepareMessage?: (result: unknown, args: unknown[]) => unknown | unknown[];
}
