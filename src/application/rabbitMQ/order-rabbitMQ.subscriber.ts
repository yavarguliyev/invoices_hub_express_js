import { Container } from 'typedi';

import { EventPublisherDecorator } from 'core/decorators/event-publisher.decorator';
import { EVENT_PUBLISHER_OPERATION } from 'core/configs/decorators.config';
import { OrderRepository } from 'domain/repositories/order.repository';
import { EVENTS } from 'domain/enums/events.enum';
import { OrderFailedEvent, OrderInvoiceGenerationEvent, OrderStatusUpdateEvent } from 'domain/interfaces/events.interface';
import Order from 'domain/entities/order.entity';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';

export interface IOrderRabbitMQSubscriber {
  initialize(): Promise<void>;
  handleOrderApprovalStatus(order: Order): { queueName: string, message: OrderStatusUpdateEvent};
  handleOrderFail(order: Order, userId: number): { queueName: string, message: OrderFailedEvent};
  handleOrderApprovalInvoiceGenerate(order: Order, userId: number): { queueName: string, message: OrderInvoiceGenerationEvent};
}

export class OrderRabbitMQSubscriber implements IOrderRabbitMQSubscriber {
  private _rabbitMQ?: RabbitMQInfrastructure;
  private _orderRepository?: OrderRepository;
  private isInitialized = false;

  private get rabbitMQ (): RabbitMQInfrastructure {
    if (!this._rabbitMQ) {
      this._rabbitMQ = Container.get(RabbitMQInfrastructure);
    }

    return this._rabbitMQ;
  }

  private get orderRepository (): OrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = Container.get(OrderRepository);
    }

    return this._orderRepository;
  }

  async initialize (): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const subscriptions = [
      {
        queueName: EVENTS.ORDER_APPROVAL_STEP_UPDATE_ORDER_STATUS,
        handler: this.handleUpdateOrderStatus.bind(this)
      }
    ];

    for (const { queueName, handler } of subscriptions) {
      await this.rabbitMQ.subscribe(queueName, handler);
    }

    this.isInitialized = true;
  }

  @EventPublisherDecorator(EVENT_PUBLISHER_OPERATION)
  handleOrderApprovalStatus (order: Order) {
    const statusUpdateEvent: OrderStatusUpdateEvent = {
      orderId: order.id,
      status: order.status
    };

    return {
      queueName: EVENTS.ORDER_APPROVAL_STEP_UPDATE_ORDER_STATUS,
      message: statusUpdateEvent
    };
  }

  @EventPublisherDecorator(EVENT_PUBLISHER_OPERATION)
  handleOrderFail (order: Order, userId: number) {
    const { id: orderId, totalAmount } = order;
    const failedEvent: OrderFailedEvent = { orderId, userId, totalAmount, reason: 'Invalid order amount' };

    LoggerTracerInfrastructure.log(JSON.stringify({ event: EVENTS.ORDER_FAILED, orderId, userId, reason: failedEvent.reason }));
    return {
      queueName: EVENTS.ORDER_FAILED,
      message: failedEvent
    };
  }

  @EventPublisherDecorator(EVENT_PUBLISHER_OPERATION)
  handleOrderApprovalInvoiceGenerate (order: Order, userId: number) {
    const { id: orderId, totalAmount } = order;
    const invoiceEvent: OrderInvoiceGenerationEvent = { orderId, userId, totalAmount, orderDate: new Date() };

    return {
      queueName: EVENTS.ORDER_APPROVAL_STEP_INVOICE_GENERATE,
      message: invoiceEvent
    };
  }

  private async updateOrderStatus (orderId: number): Promise<void> {
    const order = await this.orderRepository.findOneByOrFail({ id: orderId });
    await this.orderRepository.save(order);
  }

  private async handleUpdateOrderStatus (messageStr: string): Promise<void> {
    const message = JSON.parse(messageStr) as OrderStatusUpdateEvent;
    await this.updateOrderStatus(message.orderId);
  }
}
