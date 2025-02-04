import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { HealthcheckResponse } from 'common/types/healthcheck-response.type';

export interface IHealthcheckService {
  healthcheck (): Promise<HealthcheckResponse>;
}

export class HealthcheckService implements IHealthcheckService {
  constructor () {}

  async healthcheck (): Promise<HealthcheckResponse> {
    const services = {
      db: DbConnectionInfrastructure.isConnected(),
      redis: await RedisInfrastructure.isConnected(),
      rabbitMQ: RabbitMQInfrastructure.isConnected()
    };

    return {
      message: 'OK',
      uptime: process.uptime(),
      timestamp: Date.now(),
      workerId: process.pid,
      ...Object.fromEntries(Object.entries(services).map(([key, value]) => [key, value ? 'healthy' : 'unhealthy']))
    } as HealthcheckResponse;
  }
}
