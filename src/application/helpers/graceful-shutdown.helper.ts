import { Container } from 'typedi';
import http from 'http';
import cluster from 'cluster';

import { RetryHelper } from 'application/helpers/retry.helper';
import { getErrorMessage } from 'application/helpers/utility-functions.helper';
import config from 'core/configs/app.config';
import { RedisInfrastructure } from 'infrastructure/redis/redis.infrastructure';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';
import { DbConnectionInfrastructure } from 'infrastructure/database/db-connection.infrastructure';
import { WorkerThreadsInfrastructure } from 'infrastructure/workers/worker-threads.infrastructure';

export class GracefulShutdownHelper {
  private readonly shutdownTimeout = config.SHUT_DOWN_TIMER;
  private readonly maxRetries = config.SHUTDOWN_RETRIES;
  private readonly retryDelay = config.SHUTDOWN_RETRY_DELAY;

  private rabbitMQ: RabbitMQInfrastructure;
  private redis: RedisInfrastructure;
  private db: DbConnectionInfrastructure;

  constructor () {
    this.rabbitMQ = Container.get(RabbitMQInfrastructure);
    this.redis = Container.get(RedisInfrastructure);
    this.db = Container.get(DbConnectionInfrastructure);
  }

  async shutDown (httpServer: http.Server): Promise<void> {
    let shutdownTimer;

    try {
      if (httpServer.listening) {
        await new Promise<void>((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve())));
      }

      await this.disconnectServices();

      if (cluster.isPrimary) {
        await this.shutdownWorkers();
      } else {
        const workers = Container.get(WorkerThreadsInfrastructure);

        workers.shutdownWorkers();
      }

      shutdownTimer = this.startShutdownTimer();
    } catch (error) {
      LoggerTracerInfrastructure.log(`Error during shutdown: ${getErrorMessage(error)}`, 'error');
    } finally {
      if (shutdownTimer) {
        clearTimeout(shutdownTimer);
      }

      process.exit(0);
    }
  }

  async shutdownWorkers (): Promise<void> {
    const workers = Object.values(cluster.workers || {});

    for (const worker of workers) {
      try {
        worker?.kill('SIGINT');
      } catch (err) {
        LoggerTracerInfrastructure.log(`Error while shutting down worker: ${err}`, 'error');
      }
    }
  }

  private async disconnectServices (): Promise<void> {
    const disconnectPromises = [
      RetryHelper.executeWithRetry(() => this.rabbitMQ.disconnect(), {
        serviceName: 'Redis',
        maxRetries: this.maxRetries,
        retryDelay: this.retryDelay,
        onRetry: (attempt) => {
          LoggerTracerInfrastructure.log(`Retrying Redis disconnect, attempt ${attempt}`);
        }
      }),
      RetryHelper.executeWithRetry(() => this.redis.disconnect(), {
        serviceName: 'RabbitMQ',
        maxRetries: this.maxRetries,
        retryDelay: this.retryDelay,
        onRetry: (attempt) => {
          LoggerTracerInfrastructure.log(`Retrying RabbitMQ disconnect, attempt ${attempt}`);
        }
      }),
      RetryHelper.executeWithRetry(() => this.db.disconnect(), {
        serviceName: 'Database',
        maxRetries: this.maxRetries,
        retryDelay: this.retryDelay,
        onRetry: (attempt) => {
          LoggerTracerInfrastructure.log(`Retrying Database disconnect, attempt ${attempt}`);
        }
      })
    ];

    try {
      await Promise.all(disconnectPromises);
    } catch (err) {
      LoggerTracerInfrastructure.log(`Service disconnection failed: ${err}`, 'error');
      throw err;
    }
  }

  startShutdownTimer () {
    return setTimeout(() => {
      LoggerTracerInfrastructure.log('Shutdown timeout reached, forcing process exit', 'error');
      process.exit(1);
    }, this.shutdownTimeout);
  }
}
