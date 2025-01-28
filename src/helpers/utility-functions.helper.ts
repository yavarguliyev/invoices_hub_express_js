import { Constructable } from 'typedi';
import crypto from 'crypto';
import winston from 'winston';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { RedisCacheKeys } from 'value-objects/types/redis/redis-decorator.types';
import { Version } from 'value-objects/types/controllers/version-control.type';

export const safelyInitializeService = async (serviceName: string, initializeFn: () => Promise<void>): Promise<void> => {
  try {
    await initializeFn();
    LoggerTracerInfrastructure.log(`${serviceName} initialized successfully`, 'info');
  } catch (err: any) {
    LoggerTracerInfrastructure.log(`${serviceName} initialization failed: ${err?.message || 'An unknown error occurred'}`, 'error');
    throw err;
  }
};

export const ensureInitialized = <T> (connection: T | null, serviceName: string): T => {
  if (!connection) {
    throw new Error(`${serviceName} is not initialized. Call initialize() first.`);
  }

  return connection;
};

export const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }

  return value;
};

export const handleProcessSignals = (shutdownCallback: (...args: any[]) => Promise<void>, ...callbackArgs: any[]): void => {
  ['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, async () => await shutdownCallback(...callbackArgs)));
};

export const logWorkerStatus = (message: string, pid: number): void => {
  LoggerTracerInfrastructure.log(`${message}: ${pid}`, 'info');
};

export const registerService = <T> (id: string, service: Constructable<T>, isSingleton: boolean = true): void => {
  if (isSingleton) {
    ContainerHelper.addSingleton<T>(id, service);
  } else {
    ContainerHelper.addTransient<T>(id, service);
  }
};

export const generateCacheKey = (keyTemplate: string): RedisCacheKeys => {
  const ttl = Number(process.env.REDIS_DEFAULT_CACHE_TTL);
  const funcHash = crypto.createHash('md5').update(keyTemplate.toString()).digest('hex');
  const cacheKey = `${keyTemplate}:${funcHash}:${keyTemplate}`;

  return { cacheKey, ttl };
};

export const createVersionedRoute = (controllerPath: string, version: Version) => {
  return `/api/${version}${controllerPath}`;
};

export const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`)
  ),
  transports: [new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) })]
});
