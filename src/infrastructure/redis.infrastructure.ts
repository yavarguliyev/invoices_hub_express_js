import { createClient, RedisClientType } from 'redis';

import { LoggerHelper } from 'helpers/logger.helper';
import { safelyInitializeService, getEnvVariable, ensureInitialized } from 'helpers/utility-functions.helper';
import { Variables } from 'value-objects/enums/variables.enum';

export default class RedisInfrastructure {
  private static client: RedisClientType | null = null;

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

  static async get<T = string> (key: string): Promise<T | null> {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);
    const value = await client.get(key);

    return value ? (JSON.parse(value) as T) : null;
  }

  static async set (key: string, value: string, ttl?: number): Promise<void> {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);

    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }
  }

  static async delete (key: string): Promise<void> {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);

    await client.del(key);
  }

  static async disconnect (): Promise<void> {
    if (!RedisInfrastructure.client) {
      LoggerHelper.log('Redis is already disconnected', 'info');
      return;
    }

    try {
      await RedisInfrastructure.client.disconnect();
      LoggerHelper.log('Disconnected from Redis', 'info');
      RedisInfrastructure.client = null;
    } catch (err: any) {
      LoggerHelper.log(`Error during Redis shutdown: ${err?.message || 'An unknown error occurred'}`, 'error');
    }
  }

  static async isConnected (): Promise<boolean> {
    return RedisInfrastructure.client ? RedisInfrastructure.client.isOpen : false;
  }

  static async mget (keys: string[]): Promise<Record<string, string | null>> {
    const client = ensureInitialized(RedisInfrastructure.client, Variables.REDIS_SERVICE);
    const values = await client.mGet(keys);

    return keys.reduce((acc, key, i) => {
      acc[key] = values[i] || null;
      return acc;
    }, {} as Record<string, string | null>);
  }
}
