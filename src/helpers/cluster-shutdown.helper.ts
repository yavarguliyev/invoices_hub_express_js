import http from 'http';
import cluster from 'cluster';

import { LoggerHelper } from 'helpers/logger.helper';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';

export class ClusterShutdownHelper {
  static async shutDown (httpServer: http.Server): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve())));
    } catch (err: any) {
      LoggerHelper.log(`Error during shutdown: ${err?.message || 'Unknown error occurred'}`, 'error');
    } finally {
      try {
        await Promise.all([
          RedisInfrastructure.disconnect(),
          RabbitMQInfrastructure.disconnect(),
          DbConnectionInfrastructure.disconnect()
        ]);

        LoggerHelper.log('External services disconnected successfully', 'info');
      } catch (err: any) {
        LoggerHelper.log(`Error disconnecting external services: ${err?.message || 'Unknown error occurred'}`, 'error');
      }

      await ClusterShutdownHelper.shutDownWorkers();

      process.exit(0);
    }
  }

  static async shutDownWorkers (): Promise<void> {
    if (cluster.isPrimary) {
      LoggerHelper.log(`Master process shutting down workers. PID: ${process.pid}`, 'info');

      const workers = Object.values(cluster.workers || {});
      await Promise.all(workers.map(async (worker) => worker?.kill('SIGINT')));

      LoggerHelper.log('All worker processes shut down', 'info');
    }
  }
}
