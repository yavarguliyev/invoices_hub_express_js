import { connect, Channel, Connection, ConsumeMessage } from 'amqplib';

import { safelyInitializeService, getEnvVariable, ensureInitialized } from 'helpers/utility-functions.helper';
import { Variables } from 'common/enums/variables.enum';

export default class RabbitMQInfrastructure {
  private static channel?: Channel;
  private static connection?: Connection;

  static async initialize (): Promise<void> {
    await safelyInitializeService(Variables.RABBIT_MQ, async () => {
      const connection = await connect(getEnvVariable(Variables.RABBITMQ_URL));
      RabbitMQInfrastructure.connection = connection;
      RabbitMQInfrastructure.channel = await connection.createChannel();
    });
  }

  private static async ensureQueueExists (queueName: string): Promise<void> {
    const channel = ensureInitialized(RabbitMQInfrastructure.channel, Variables.RABBIT_MQ_SERVICE);
    await channel?.assertQueue(queueName, { durable: true });
  }

  static async publish (queueName: string, message: string): Promise<void> {
    await RabbitMQInfrastructure.ensureQueueExists(queueName);
    const channel = ensureInitialized(RabbitMQInfrastructure.channel, Variables.RABBIT_MQ_SERVICE);
    channel?.sendToQueue(queueName, Buffer.from(message));
  }

  static async subscribe (queueName: string, callback: (message: string) => void): Promise<void> {
    await RabbitMQInfrastructure.ensureQueueExists(queueName);
    const channel = ensureInitialized(RabbitMQInfrastructure.channel, Variables.RABBIT_MQ_SERVICE);

    channel?.consume(queueName, (msg: ConsumeMessage | null) => {
      if (msg) {
        callback(msg.content.toString());
        channel?.ack(msg);
      }
    });
  }

  static async disconnect (): Promise<void> {
    const channel = RabbitMQInfrastructure?.channel;
    const connection = RabbitMQInfrastructure?.connection;

    if (connection) {
      connection.on('error', (err) => console.log('Connection error:', err));
      connection.on('close', () => console.log('Connection closed'));
    }

    if (channel) {
      channel.on('error', (err) => console.log('Channel error:', err));
      channel.on('close', () => console.log('Channel closed'));
    }

    if (RabbitMQInfrastructure?.connection) {
      delete RabbitMQInfrastructure.connection;
    }

    if (RabbitMQInfrastructure?.channel) {
      delete RabbitMQInfrastructure.channel;
    }
  }

  static isConnected (): boolean {
    return !!RabbitMQInfrastructure.channel && !!RabbitMQInfrastructure.connection;
  }
}
