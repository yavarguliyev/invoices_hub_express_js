import { Container } from 'typedi';

import { EVENTS } from 'domain/enums/events.enum';
import { OrderFailedEvent } from 'domain/interfaces/events.interface';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

export interface INotificationRabbitMQSubscriber {
  initialize(): Promise<void>;
}

export class NotificationRabbitMQSubscriber implements INotificationRabbitMQSubscriber {
  private _rabbitMQ?: RabbitMQInfrastructure;
  private isInitialized = false;

  private get rabbitMQ (): RabbitMQInfrastructure {
    if (!this._rabbitMQ) {
      this._rabbitMQ = Container.get(RabbitMQInfrastructure);
    }

    return this._rabbitMQ;
  }

  async initialize (): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const subscriptions = [
      {
        queueName: EVENTS.ORDER_FAILED,
        handler: this.handleOrderFailed.bind(this)
      }
    ];

    for (const { queueName, handler } of subscriptions) {
      await this.rabbitMQ.subscribe(queueName, handler);
    }

    this.isInitialized = true;
  }

  private async handleOrderFailed (messageStr: string): Promise<void> {
    const message = JSON.parse(messageStr) as OrderFailedEvent;

    LoggerTracerInfrastructure.log(JSON.stringify({
      event: EVENTS.ORDER_FAILED,
      orderId: message.orderId,
      userId: message.userId,
      reason: message.reason,
      totalAmount: message.totalAmount
    }));
  }
}
