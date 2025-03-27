import { RedisCacheKey } from 'core/types/redis-cache-keys.type';
import { EVENTS } from 'domain/enums/events.enum';

export type EventDecoratorOption = { keyTemplate: RedisCacheKey; event?: EVENTS }
