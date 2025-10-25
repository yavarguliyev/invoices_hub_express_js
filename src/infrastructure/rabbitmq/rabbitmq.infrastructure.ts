import * as amqp from 'amqplib';

import { safelyInitializeService } from 'application/helpers/utility-functions.helper';
import { rabitmqConfig } from 'core/configs/rabbitmq.config';
import { Variables } from 'domain/enums/variables.enum';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

export class RabbitMQInfrastructure {
  private channel?: amqp.Channel;
  private connection?: amqp.Connection;

  async initialize (): Promise<void> {
    await safelyInitializeService({
      serviceName: Variables.RABBIT_MQ,
      initializeFn: async () => {
        const connection = await amqp.connect(rabitmqConfig.RABBITMQ_URL);
        this.connection = connection as unknown as amqp.Connection;
        this.channel = await connection.createChannel();
      }
    });
  }

  private async ensureQueueExists (queueName: string): Promise<void> {
    const channel = this.channel;
    if (channel) {
      await channel.assertQueue(queueName, { durable: true });
    } else {
      throw new Error('Channel is not initialized');
    }
  }

  async publish (queueName: string, message: string): Promise<void> {
    await this.ensureQueueExists(queueName);

    const channel = this.channel;
    if (channel) {
      channel.sendToQueue(queueName, Buffer.from(message));
    } else {
      throw new Error('Channel is not initialized');
    }
  }

  async subscribe (queueName: string, callback: (message: string) => void): Promise<void> {
    await this.ensureQueueExists(queueName);

    const channel = this.channel;
    if (channel) {
      channel.consume(queueName, (msg: amqp.ConsumeMessage | null) => {
        if (msg) {
          callback(msg.content.toString());
          channel.ack(msg);
        }
      });
    } else {
      throw new Error('Channel is not initialized');
    }
  }

  async disconnect (): Promise<void> {
    const channel = this.channel;
    const connection = this.connection;

    if (connection) {
      connection.on('error', (err) => LoggerTracerInfrastructure.log(`Connection error: ${err}`, 'error'));
      connection.on('close', () => LoggerTracerInfrastructure.log('Connection closed'));
    }

    if (channel) {
      channel.on('error', (err) => LoggerTracerInfrastructure.log(`Channel error: ${err}`, 'error'));
      channel.on('close', () => LoggerTracerInfrastructure.log('Channel closed'));
    }

    if (this.connection) {
      delete this.connection;
    }

    if (this.channel) {
      delete this.channel;
    }
  }

  isConnected (): boolean {
    return !!this.channel && !!this.connection;
  }
}
