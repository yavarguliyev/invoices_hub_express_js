import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { RedisCacheInvalidateDecorator } from 'core/decorators/redis-cache-invalidate.decorator';
import { REDIS_INVOICE_LIST } from 'core/configs/decorators.config';
import { InvoiceRepository } from 'domain/repositories/invoice.repository';
import { InvoiceDto } from 'domain/dto/invoice.dto';
import { EVENTS } from 'domain/enums/events.enum';
import { OrderInvoiceGenerationEvent } from 'domain/interfaces/events.interface';
import { RabbitMQInfrastructure } from 'infrastructure/rabbitmq/rabbitmq.infrastructure';
import { LoggerTracerInfrastructure } from 'infrastructure/logging/logger-tracer.infrastructure';
import { InvoiceStatus } from 'domain/enums/invoice-status.enum';
import { OrderRepository } from 'domain/repositories/order.repository';
import { UserRepository } from 'domain/repositories/user.repository';

export interface IInvoiceRabbitMQSubscriber {
  initialize(): Promise<void>;
}

export class InvoiceRabbitMQSubscriber implements IInvoiceRabbitMQSubscriber {
  private _rabbitMQ?: RabbitMQInfrastructure;
  private _invoiceRepository?: InvoiceRepository;
  private _orderRepository?: OrderRepository;
  private _userRepository?: UserRepository;
  private isInitialized = false;

  private get rabbitMQ (): RabbitMQInfrastructure {
    if (!this._rabbitMQ) {
      this._rabbitMQ = Container.get(RabbitMQInfrastructure);
    }

    return this._rabbitMQ;
  }

  private get invoiceRepository (): InvoiceRepository {
    if (!this._invoiceRepository) {
      this._invoiceRepository = Container.get(InvoiceRepository);
    }

    return this._invoiceRepository;
  }

  private get orderRepository (): OrderRepository {
    if (!this._orderRepository) {
      this._orderRepository = Container.get(OrderRepository);
    }

    return this._orderRepository;
  }

  private get userRepository (): UserRepository {
    if (!this._userRepository) {
      this._userRepository = Container.get(UserRepository);
    }

    return this._userRepository;
  }

  async initialize (): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const subscriptions = [
      {
        queueName: EVENTS.ORDER_APPROVAL_STEP_INVOICE_GENERATE,
        handler: this.handleInvoiceGeneration.bind(this)
      }
    ];

    for (const { queueName, handler } of subscriptions) {
      await this.rabbitMQ.subscribe(queueName, handler);
    }

    this.isInitialized = true;
  }

  @RedisCacheInvalidateDecorator(REDIS_INVOICE_LIST)
  private async generateInvoice (orderId: number, userId: number, amount: number): Promise<InvoiceDto> {
    const order = await this.orderRepository.findOneByOrFail({ id: orderId });
    const user = await this.userRepository.findOneByOrFail({ id: userId });

    const invoice = this.invoiceRepository.create({
      title: `Invoice for Order #${orderId}`,
      amount,
      description: `Generated invoice for order #${orderId}`,
      status: InvoiceStatus.PAID,
      user,
      order
    });

    await this.invoiceRepository.save(invoice);
    return plainToInstance(InvoiceDto, invoice, { excludeExtraneousValues: true }) as InvoiceDto;
  }

  private async handleInvoiceGeneration (messageStr: string): Promise<void> {
    const message = JSON.parse(messageStr) as OrderInvoiceGenerationEvent;
    const { orderId, userId, totalAmount } = message;

    if (orderId && userId && totalAmount > 0) {
      const invoice = await this.generateInvoice(orderId, userId, totalAmount);
      LoggerTracerInfrastructure.log(JSON.stringify({
        event: EVENTS.ORDER_APPROVAL_STEP_INVOICE_GENERATE,
        invoiceId: invoice.id,
        orderId,
        userId,
        amount: totalAmount,
        status: invoice.status
      }));
    }
  }
}
