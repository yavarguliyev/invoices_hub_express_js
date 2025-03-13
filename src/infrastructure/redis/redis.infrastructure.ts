import { createClient, RedisClientType } from 'redis';

import { safelyInitializeService, getEnvVariable, getErrorMessage } from 'application/helpers/utility-functions.helper';
import { Variables } from 'domain/enums/variables.enum';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

export class RedisInfrastructure {
  private client?: RedisClientType;

  async initialize () {
    await safelyInitializeService({
      serviceName: Variables.REDIS,
      initializeFn: async () => {
        if (!this.client) {
          const port = getEnvVariable(Variables.REDIS_PORT);

          this.client = createClient({
            socket: { host: getEnvVariable(Variables.REDIS_HOST), port: parseInt(port, 10) },
            password: getEnvVariable(Variables.REDIS_PASSWORD)
          });

          await this.client.connect();
        }
      }
    });
  }

  async get<T = string> (key: string) {
    const client = await this.ensureInitialized();
    const value = await client?.get(key);
    return value ? (JSON.parse(value) as T) : undefined;
  }

  async getHashKeys (key: string) {
    const client = await this.ensureInitialized();
    const keys = await client?.sMembers(key);
    return keys || [];
  }

  async set (key: string, value: string, ttl?: number) {
    const client = await this.ensureInitialized();

    if (ttl) {
      await client?.setEx(key, ttl, value);
    } else {
      await client?.set(key, value);
    }
  }

  async setHashKeys (key: string, cacheKey: string) {
    const client = await this.ensureInitialized();
    await client?.sAdd(key, cacheKey);
  }

  async delete (key: string) {
    const client = await this.ensureInitialized();
    await client?.unlink(key);
  }

  async deleteKeys (keys: string[]) {
    const client = await this.ensureInitialized();
    if (keys.length) {
      await client.unlink(keys);
    }
  }

  async disconnect () {
    if (!this.client || !this.client.isOpen) {
      return;
    }

    try {
      await this.client.disconnect();
      this.client = undefined;
    } catch (error) {
      LoggerTracerInfrastructure.log(`Error during Redis shutdown: ${getErrorMessage(error)}`, 'error');
    }
  }

  async isConnected () {
    return this.client ? this.client.isOpen : false;
  }

  private async ensureInitialized () {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }

    return this.client;
  }
}
