import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { HealthcheckResponse } from 'core/types/healthcheck-response.type';
// import { WorkerThreadsInfrastructure } from 'infrastructure/worker-threads.infrastructure';
// import { WorkerThreadsOperations } from 'domain/enums/worker-threads-operations.enum';
// import appConfig from 'core/configs/app.config';

export interface IHealthcheckService {
  healthcheck (): Promise<HealthcheckResponse>;
}

export class HealthcheckService implements IHealthcheckService {
  async healthcheck (): Promise<HealthcheckResponse> {
    const services = {
      db: DbConnectionInfrastructure.isConnected(),
      redis: await RedisInfrastructure.isConnected(),
      rabbitMQ: RabbitMQInfrastructure.isConnected()
    };

    // const results = await WorkerThreadsInfrastructure.executeHeavyTask({ name: WorkerThreadsOperations.DATA_TRANSFORMATION, params: services });
    // await WorkerThreadsInfrastructure.executeHeavyTask({ name: WorkerThreadsOperations.HEAVY_COMPUTATION, params: { iterations: Number(appConfig.HEAVY_COMPUTATION_TOTAL) } });

    return {
      message: 'OK',
      uptime: process.uptime(),
      timestamp: Date.now(),
      workerId: process.pid,
      ...Object.fromEntries(Object.entries(services).map(([key, value]) => [key, value ? 'healthy' : 'unhealthy']))
    } as HealthcheckResponse;
  }
}
