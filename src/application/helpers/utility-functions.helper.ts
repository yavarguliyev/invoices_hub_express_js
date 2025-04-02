import crypto from 'crypto';
import { plainToInstance } from 'class-transformer';
import { ObjectLiteral } from 'typeorm';

import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { appConfig } from 'core/configs/app.config';
import { passwordConfig } from 'core/configs/password.config';
import { RedisCacheKeys } from 'core/types/redis-cache-keys.type';
import {
  ServiceInitializationOptions,
  HandleProcessSignalsOptions,
  RegisterServiceOptions,
  GenerateCacheKeyOptions,
  QueryResultsOptions,
  CreateVersionedRouteOptions,
  GeneratePasswordOptions
} from 'domain/interfaces/utility-functions-options.interface';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

export const safelyInitializeService = async ({ serviceName, initializeFn }: ServiceInitializationOptions): Promise<void> => {
  try {
    await initializeFn();
  } catch (error) {
    LoggerTracerInfrastructure.log(`${serviceName} initialization failed: ${getErrorMessage(error)}`, 'error');
    throw error;
  }
};

export const handleProcessSignals = <Args extends unknown[]> ({ shutdownCallback, callbackArgs }: HandleProcessSignalsOptions<Args>): void => {
  ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach(signal => process.on(signal, async () => await shutdownCallback(...callbackArgs)));
};

export const registerService = <T> ({ id, service, isSingleton = true }: RegisterServiceOptions<T>): void => {
  isSingleton ? ContainerHelper.addSingleton<T>(id, service) : ContainerHelper.addTransient<T>(id, service);
};

export const generateCacheKey = ({ keyTemplate, args }: GenerateCacheKeyOptions): RedisCacheKeys => {
  const ttl = appConfig.REDIS_DEFAULT_CACHE_TTL;
  const argsHash = crypto.createHash('md5').update(JSON.stringify(args)).digest('hex');
  const cacheKey = `${keyTemplate}:${argsHash}`;

  return { cacheKey, ttl };
};

export const queryResults = async <T extends ObjectLiteral, DTO, RelatedDTO = unknown> (
  { repository, query, dtoClass, relatedEntity }: QueryResultsOptions<T, DTO, RelatedDTO>
): Promise<{ payloads: DTO[]; total: number }> => {
  const { page = 1, limit = 10, filters = {}, order = {} } = query;
  const [orderField, orderDirection] = Object.entries(order)[0] ?? ['id', 'DESC'];

  const offset = (page - 1) * limit;
  const queryBuilder = repository.createQueryBuilder('entity');

  if (Object.keys(filters).length) {
    queryBuilder.where(Object.entries(filters).map(([key]) => `entity.${key} = :${key}`).join(' AND '), filters);
  }

  queryBuilder.addOrderBy(`entity.${orderField}`, orderDirection).take(limit).skip(offset);

  let relationAlias: string | undefined;
  if (relatedEntity?.relationField) {
    relationAlias = `__${String(relatedEntity.relationField)}__`;
    queryBuilder.leftJoinAndSelect(`entity.${String(relatedEntity.relationField)}`, relationAlias);
  }

  const [items, total] = await queryBuilder.getManyAndCount();

  const dtos: DTO[] = items.map((item) => {
    const dto = plainToInstance(dtoClass, item, { excludeExtraneousValues: true }) as DTO;

    if (relatedEntity?.relationField && relationAlias && item[relationAlias]) {
      Object.assign(dto as Record<string, unknown>, {
        [String(relatedEntity.relationField)]: plainToInstance(relatedEntity.RelatedDtoClass, item[relationAlias], { excludeExtraneousValues: true })
      });
    }

    return dto;
  });

  return { payloads: dtos, total };
};

export const createVersionedRoute = ({ controllerPath, version }: CreateVersionedRouteOptions) => {
  return `/api/${version}${controllerPath}`;
};

export const generateStrongPassword = ({ length = passwordConfig.PASSWORD_LENGTH }: GeneratePasswordOptions): string => {
  const uppercase = passwordConfig.PASSWORD_UPPERCASE;
  const lowercase = passwordConfig.PASSWORD_LOWERCASE;
  const numbers = passwordConfig.PASSWORD_NUMBERS;
  const specialChars = passwordConfig.PASSWORD_SPECIAL;

  const allChars = uppercase + lowercase + numbers + specialChars;
  const getRandomChar = (charset: string) => charset[Math.floor(Math.random() * charset.length)];
  let password = [getRandomChar(uppercase), getRandomChar(lowercase), getRandomChar(numbers), getRandomChar(specialChars)];

  for (let i = 4; i < length; i++) {
    password.push(getRandomChar(allChars));
  }

  password = password.sort(() => Math.random() - 0.5);

  return password.join('');
};

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};
