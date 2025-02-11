import { createClient, RedisClientType } from 'redis';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { safelyInitializeService, getEnvVariable, ensureInitialized } from 'helpers/utility-functions.helper';
import { Variables } from 'common/enums/variables.enum';

export default class RedisInfrastructure {
  private static client: RedisClientType | undefined = undefined;

  static async initialize (): Promise<void> {
    await safelyInitializeService(Variables.REDIS, async () => {
      if (!RedisInfrastructure.client) {
        const port = getEnvVariable(Variables.REDIS_PORT);

        RedisInfrastructure.client = createClient({
          socket: { host: getEnvVariable(Variables.REDIS_HOST), port: parseInt(port, 10) },
          password: getEnvVariable(Variables.REDIS_PASSWORD)
        });

        await RedisInfrastructure.client.connect();
      }
    });
  }

  static async get<T = string> (key: string): Promise<T | undefined> {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);
    const value = await client?.get(key);

    return value ? (JSON.parse(value) as T) : undefined;
  }

  static async getHashKeys (key: string): Promise<string[]> {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);
    const keys = await client?.sMembers(key);

    return keys || [];
  }

  static async set (key: string, value: string, ttl?: number): Promise<void> {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);

    if (ttl) {
      await client?.setEx(key, ttl, value);
    } else {
      await client?.set(key, value);
    }
  }

  static async setHashKeys (key: string, cacheKey: string) {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);

    await client?.sAdd(key, cacheKey);
  }

  static async delete (key: string): Promise<void> {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);

    await client?.del(key);
  }

  static async deletekeys (keys: string[]) {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);

    if (keys.length) {
      await client.del(keys);
    }
  }

  static async disconnect (): Promise<void> {
    if (!RedisInfrastructure.client || !RedisInfrastructure.client.isOpen) {
      return;
    }

    try {
      await RedisInfrastructure.client.disconnect();
      delete RedisInfrastructure?.client;
    } catch (err: any) {
      LoggerTracerInfrastructure.log(`Error during Redis shutdown: ${err?.message || 'An unknown error occurred'}`, 'error');
    }
  }

  static async isConnected (): Promise<boolean> {
    return RedisInfrastructure.client ? RedisInfrastructure.client.isOpen : false;
  }
}
