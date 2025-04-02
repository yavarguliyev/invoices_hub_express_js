import { INotificationRabbitMQSubscriber } from 'application/rabbitMQ/notification-rabbitMQ.subscriber';
import { ContainerItems } from 'application/ioc/static/container-items';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';

export interface INotificationService {
  initialize(): Promise<void>;
}

export class NotificationService implements INotificationService {
  private _rabbit?: INotificationRabbitMQSubscriber;

  private get rabbit (): INotificationRabbitMQSubscriber {
    if (!this._rabbit) {
      this._rabbit = ContainerHelper.get<INotificationRabbitMQSubscriber>(ContainerItems.INotificationRabbitMQSubscriber);
    }

    return this._rabbit;
  }

  async initialize (): Promise<void> {
    await this.rabbit.initialize();
  }
}
