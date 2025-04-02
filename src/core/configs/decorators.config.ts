import { EventDecoratorOptions } from 'core/types/event-publisher-keys.type';
import { REDIS_CACHE_KEYS, RedisDecoratorOption } from 'core/types/redis-cache-keys.type';

const EVENT_PUBLISHER_OPERATION: EventDecoratorOptions = {
  queueName: (args) => args[0].queueName,
  prepareMessage: (data) => data
};

const REDIS_ROLE_LIST: RedisDecoratorOption = { keyTemplate: REDIS_CACHE_KEYS.ROLE_GET_LIST };
const REDIS_USER_LIST: RedisDecoratorOption = { keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST };
const REDIS_INVOICE_LIST: RedisDecoratorOption = { keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST };
const REDIS_ORDER_LIST: RedisDecoratorOption = { keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST };

export {
  EVENT_PUBLISHER_OPERATION,
  REDIS_ROLE_LIST,
  REDIS_USER_LIST,
  REDIS_INVOICE_LIST,
  REDIS_ORDER_LIST
};
