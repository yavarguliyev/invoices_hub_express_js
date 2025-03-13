import { Container } from 'typedi';

import { HealthcheckResponse } from 'core/types/healthcheck-response.type';
import { RedisInfrastructure } from 'infrastructure/redis/redis.infrastructure';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { DbConnectionInfrastructure } from 'infrastructure/database/db-connection.infrastructure';
import { WorkerThreadsInfrastructure } from 'infrastructure/workers/worker-threads.infrastructure';
import { WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';
import appConfig from 'core/configs/app.config';

export interface IHealthcheckService {
  healthcheck(): Promise<HealthcheckResponse>;
}

export class HealthcheckService implements IHealthcheckService {
  private _db?: DbConnectionInfrastructure;
  private _redis?: RedisInfrastructure;
  private _rabbitMQ?: RabbitMQInfrastructure;
  private _workers?: WorkerThreadsInfrastructure;

  private get redis (): RedisInfrastructure {
    if (!this._redis) {
      this._redis = Container.get(RedisInfrastructure);
    }

    return this._redis;
  }

  private get rabbitMQ (): RabbitMQInfrastructure {
    if (!this._rabbitMQ) {
      this._rabbitMQ = Container.get(RabbitMQInfrastructure);
    }

    return this._rabbitMQ;
  }

  private get db (): DbConnectionInfrastructure {
    if (!this._db) {
      this._db = Container.get(DbConnectionInfrastructure);
    }

    return this._db;
  }

  private get workers (): WorkerThreadsInfrastructure {
    if (!this._workers) {
      this._workers = Container.get(WorkerThreadsInfrastructure);
    }

    return this._workers;
  }

  async healthcheck (): Promise<HealthcheckResponse> {
    const services = { db: this.db.isConnected(), redis: await this.redis.isConnected(), rabbitMQ: this.rabbitMQ.isConnected() };

    return {
      message: 'OK',
      uptime: process.uptime(),
      timestamp: Date.now(),
      workerId: process.pid,
      ...Object.fromEntries(Object.entries(services).map(([key, value]) => [key, value ? 'healthy' : 'unhealthy']))
    } as HealthcheckResponse;
  }

  private async executeHeavyTask (services: object) {
    const results = await this.workers.executeHeavyTask({ name: WorkerThreadsOperations.DATA_TRANSFORMATION, params: { ...services } });
    await this.workers.executeHeavyTask({ name: WorkerThreadsOperations.HEAVY_COMPUTATION, params: { iterations: Number(appConfig.HEAVY_COMPUTATION_TOTAL) } });

    return results;
  }
}
