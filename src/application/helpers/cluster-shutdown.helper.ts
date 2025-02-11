import http from 'http';
import cluster from 'cluster';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import RedisInfrastructure from 'infrastructure/redis.infrastructure';
import RabbitMQInfrastructure from 'infrastructure/rabbitmq.infrastructure';
import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';
import { WorkerThreadsInfrastructure } from 'infrastructure/worker-threads.infrastructure';
import { RetryHelper } from 'application/helpers/retry.helper';

export class ClusterShutdownHelper {
  private static readonly shutdownTimeout = Number(process.env.SHUT_DOWN_TIMER);
  private static readonly maxRetries = Number(process.env.SHUTDOWN_RETRIES);
  private static readonly retryDelay = Number(process.env.SHUTDOWN_RETRY_DELAY);

  static async shutDown (httpServer: http.Server): Promise<void> {
    let shutdownTimer;

    try {
      if (httpServer.listening) {
        await new Promise<void>((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve())));
      }

      await this.disconnectServices();

      if (cluster.isPrimary) {
        await this.shutdownWorkers();
      } else {
        WorkerThreadsInfrastructure.shutdownWorkers();
      }

      shutdownTimer = this.startShutdownTimer();
    } catch (err: any) {
      LoggerTracerInfrastructure.log(`Error during shutdown: ${err?.message || 'Unknown error occurred'}`, 'error');
    } finally {
      if (shutdownTimer) {
        clearTimeout(shutdownTimer);
      }

      process.exit(0);
    }
  }

  static async shutdownWorkers (): Promise<void> {
    const workers = Object.values(cluster.workers || {});

    for (const worker of workers) {
      try {
        worker?.kill('SIGINT');
      } catch (err) {
        LoggerTracerInfrastructure.log(`Error while shutting down worker: ${err}`, 'error');
      }
    }
  }

  private static async disconnectServices (): Promise<void> {
    const disconnectPromises = [
      RetryHelper.executeWithRetry(() => RedisInfrastructure.disconnect(), 'Redis', this.maxRetries, this.retryDelay),
      RetryHelper.executeWithRetry(() => RabbitMQInfrastructure.disconnect(), 'RabbitMQ', this.maxRetries, this.retryDelay),
      RetryHelper.executeWithRetry(() => DbConnectionInfrastructure.disconnect(), 'Database', this.maxRetries, this.retryDelay)
    ];

    try {
      await Promise.all(disconnectPromises);
    } catch (err) {
      LoggerTracerInfrastructure.log(`Service disconnection failed: ${err}`, 'error');
      throw err;
    }
  }

  static startShutdownTimer () {
    return setTimeout(() => {
      LoggerTracerInfrastructure.log('Shutdown timeout reached, forcing process exit', 'error');
      process.exit(1);
    }, this.shutdownTimeout);
  }
}
