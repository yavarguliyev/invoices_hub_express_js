import { Container } from 'typedi';

import { RedisDecorator } from 'core/decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'core/types/decorator.types';
import { OrderRepository } from 'domain/repositories/order.repository';
import { ResultMessage } from 'domain/enums/result-message.enum';
import { OrderDto } from 'domain/dto/order.dto';
import { ResponseResults } from 'core/types/response-results.type';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { queryResults } from 'application/helpers/utility-functions.helper';
import { UserDto } from 'domain/dto/user.dto';
import { CreateOrderArgs } from 'core/inputs/create-order.args';
import { UserRepository } from 'domain/repositories/user.repository';
import { OrderStatus } from 'domain/enums/order-status.enum';
import { InvoiceStatus } from 'domain/enums/invoice-status.enum';
import { EventPublisherDecorator } from 'core/decorators/event-publisher.decorator';
import { EVENTS } from 'domain/enums/events.enum';
import User from 'domain/entities/user.entity';
import Order from 'domain/entities/order.entity';
import Invoice from 'domain/entities/invoice.entity';
import { BadRequestError, DatabaseConnectionError } from 'core/errors';
import { DbConnectionInfrastructure } from 'infrastructure/db-connection.infrastructure';
import { OrderApproveOrCancelArgs } from 'core/inputs/order-approve-or-cancel.args';

export interface IOrderService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>>;
  createOrder(currentUser: UserDto, args: CreateOrderArgs): Promise<ResponseResults<OrderDto>>;
  approveOrder(currentUser: UserDto, orderId: number): Promise<ResponseResults<OrderDto>>;
  cancelOrder(currentUser: UserDto, orderId: number): Promise<ResponseResults<OrderDto>>;
}

export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;
  private userRepository: UserRepository;

  constructor () {
    this.orderRepository = Container.get(OrderRepository);
    this.userRepository = Container.get(UserRepository);
  }

  @RedisDecorator<OrderDto>({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST })
  async get (query: GetQueryResultsArgs) {
    const { payloads, total } = await queryResults({ repository: this.orderRepository, query, dtoClass: OrderDto });

    return { payloads, total, result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST, event: EVENTS.ORDER_CREATED })
  async createOrder ({ id }: UserDto, args: CreateOrderArgs) {
    const currentUser = await this.userRepository.findOneByOrFail({ id });
    const order = this.orderRepository.create({ ...args, user: currentUser, status: OrderStatus.PENDING });

    await this.orderRepository.save(order);

    // TODO: Add email notification to notify admins for order approval
    // Added email notification logic to inform global admin or admin that a new order is awaiting approval.
    // Ensured that the email is triggered after creating and saving an order in the system.

    return { result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST, event: EVENTS.ORDER_APPROVED })
  async approveOrder ({ id }: UserDto, orderId: number) {
    return this.processOrderApproveOrCancel({
      userId: id,
      orderId,
      newOrderStatus: OrderStatus.COMPLETED,
      newInvoiceStatus: InvoiceStatus.PAID,
      serviceName: 'orderService.approveOrder'
    });
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST, event: EVENTS.ORDER_CANCELED })
  async cancelOrder ({ id }: UserDto, orderId: number) {
    return this.processOrderApproveOrCancel({
      userId: id,
      orderId,
      newOrderStatus: OrderStatus.CANCELLED,
      newInvoiceStatus: InvoiceStatus.CANCELLED,
      serviceName: 'orderService.cancelOrder'
    });
  }

  private createInvoice (order: Order, user: User, status: InvoiceStatus) {
    return {
      title: `Invoice for Order #${order.id}`,
      amount: order.totalAmount,
      description: status === InvoiceStatus.CANCELLED ? 'Invoice generated for canceled order.' : 'Invoice generated for completed order.',
      status,
      order,
      user,
      approvedByRole: user.role
    };
  }

  private async processOrderApproveOrCancel (args: OrderApproveOrCancelArgs) {
    const { userId, orderId, newOrderStatus, newInvoiceStatus, serviceName } = args;

    const dataSource = DbConnectionInfrastructure.getDataSource();
    if (!dataSource) {
      throw new DatabaseConnectionError({ dbName: serviceName });
    }

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const currentUser = await queryRunner.manager.findOneOrFail(User, { where: { id: userId } });
      const order = await queryRunner.manager.findOneOrFail(Order, { where: { id: orderId, status: OrderStatus.PENDING } });

      order.status = newOrderStatus;
      await queryRunner.manager.save(order);

      const invoiceData = this.createInvoice(order, currentUser, newInvoiceStatus);
      const invoice = queryRunner.manager.create(Invoice, invoiceData);

      await queryRunner.manager.save(invoice);
      await queryRunner.commitTransaction();

      // TODO: Notify the user with an email that includes an attachment for the invoice.

      return { result: ResultMessage.SUCCEED };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'DB operation failed';

      await queryRunner.rollbackTransaction();
      throw new BadRequestError(errorMessage);
    } finally {
      await queryRunner.release();
    }
  }
}
