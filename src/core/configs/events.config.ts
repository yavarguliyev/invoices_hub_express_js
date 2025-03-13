import { EventDecoratorOption } from 'core/types/event-publisher-keys.type';
import { REDIS_CACHE_KEYS } from 'core/types/redis-cache-keys.type';
import { EVENTS } from 'domain/enums/events.enum';

export const eventPublisherConfig: Record<string, EventDecoratorOption> = {
  ORDER_CREATED: { keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST, event: EVENTS.ORDER_CREATED },
  ORDER_APPROVED: { keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST, event: EVENTS.ORDER_APPROVED },
  ORDER_CANCELED: { keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST, event: EVENTS.ORDER_CANCELED },
  USER_CREATED: { keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_CREATED },
  USER_UPDATED: { keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_UPDATED },
  USER_PASSWORD_UPDATED: { keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_PASSWORD_UPDATED },
  USER_DELETED: { keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_DELETED }
};
