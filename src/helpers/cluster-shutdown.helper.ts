import http from 'http';
import cluster from 'cluster';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';

export class ClusterShutdownHelper {
  static async shutDown (httpServer: http.Server): Promise<void> {
    try {
      if (httpServer.listening) {
        await new Promise<void>((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve())));
      }

      await this.disconnectServices();

      if (cluster.isPrimary) {
        await this.shutDownWorkers();
      }
    } catch (err: any) {
      LoggerTracerInfrastructure.log(`Error during shutdown: ${err?.message || 'Unknown error occurred'}`, 'error');
    } finally {
      process.exit(0);
    }
  }

  static async shutDownWorkers (): Promise<void> {
    const workers = Object.values(cluster.workers || {});

    for (const worker of workers) {
      worker?.kill('SIGINT');
    }
  }

  private static async disconnectServices (): Promise<void> {
    await Promise.allSettled([
      RedisInfrastructure.disconnect(),
      RabbitMQInfrastructure.disconnect(),
      DbConnectionInfrastructure.disconnect()
    ]);
  }
}
