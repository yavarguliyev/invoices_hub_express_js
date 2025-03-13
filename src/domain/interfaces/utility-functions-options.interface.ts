import { Constructable } from 'typedi';
import { ObjectLiteral, Repository } from 'typeorm';

import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { Version } from 'core/types/version-control.type';

export interface ServiceInitializationOptions {
  serviceName: string;
  initializeFn: () => Promise<void>;
}

export interface HandleProcessSignalsOptions<Args extends unknown[]> {
  shutdownCallback: (...args: Args) => Promise<void>;
  callbackArgs: Args;
}

export interface RegisterServiceOptions<T> {
  id: string;
  service: Constructable<T>;
  isSingleton?: boolean;
}

export interface GenerateCacheKeyOptions {
  keyTemplate: string;
  args: unknown[];
}

export interface QueryResultsOptions<T extends ObjectLiteral, DTO, RelatedDTO = unknown> {
  repository: Repository<T>;
  query: GetQueryResultsArgs;
  dtoClass: new () => DTO;
  relatedEntity?: {
    RelatedDtoClass: new () => RelatedDTO;
    relationField: keyof T;
  };
}

export interface CreateVersionedRouteOptions {
  controllerPath: string;
  version: Version;
}

export interface GeneratePasswordOptions {
  length?: number;
}

export interface RetryOptions {
  serviceName: string;
  maxRetries: number;
  retryDelay: number;
  onRetry?: (attempt: number) => void;
  onFailure?: (error: Error, attempt: number) => void;
}

export interface Task<P extends object, R> {
  execute(payload: P): R;
}
