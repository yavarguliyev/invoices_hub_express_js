import { connect, Channel, ConsumeMessage } from 'amqplib';

import { safelyInitializeService, getEnvVariable, ensureInitialized } from 'helpers/utility-functions.helper';
import { Variables } from 'value-objects/enums/variables.enum';

export default class RabbitMQInfrastructure {
  private static channel: Channel | null = null;

  static async initialize (): Promise<void> {
    await safelyInitializeService(Variables.RABBIT_MQ, async () => {
      const connection = await connect(getEnvVariable(Variables.RABBITMQ_URL));
      RabbitMQInfrastructure.channel = await connection.createChannel();
    });
  }

  private static async ensureQueueExists (queueName: string): Promise<void> {
    const channel = ensureInitialized(RabbitMQInfrastructure.channel, Variables.RABBIT_MQ_SERVICE);
    await channel.assertQueue(queueName, { durable: true });
  }

  static async publish (queueName: string, message: string): Promise<void> {
    await RabbitMQInfrastructure.ensureQueueExists(queueName);
    const channel = ensureInitialized(RabbitMQInfrastructure.channel, Variables.RABBIT_MQ_SERVICE);
    channel.sendToQueue(queueName, Buffer.from(message));
  }

  static async subscribe (queueName: string, callback: (message: string) => void): Promise<void> {
    await RabbitMQInfrastructure.ensureQueueExists(queueName);
    const channel = ensureInitialized(RabbitMQInfrastructure.channel, Variables.RABBIT_MQ_SERVICE);

    channel.consume(queueName, (msg: ConsumeMessage | null) => {
      if (msg) {
        callback(msg.content.toString());
        channel.ack(msg);
      }
    });
  }

  static async disconnect (): Promise<void> {
    const channel = RabbitMQInfrastructure.channel;

    if (channel) {
      await channel.close();
    }

    RabbitMQInfrastructure.channel = null;
  }
}
