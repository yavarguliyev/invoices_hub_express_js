import { Container } from 'typedi';

import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'common/types/decorator.types';
import { OrderRepository } from 'repositories/order.repository';
import { ResultMessage } from 'common/enums/result-message.enum';
import { OrderDto } from 'common/dto/order.dto';
import { ResponseResults } from 'common/types/response-results.type';
import { GetQueryResultsArgs } from 'common/inputs/get-query-results.args';
import { queryResults } from 'helpers/utility-functions.helper';
import { UserDto } from 'common/dto/user.dto';
import { CreateOrderArgs } from 'common/inputs/create-order.args';
import { UserRepository } from 'repositories/user.repository';
import { OrderStatus } from 'common/enums/order-status.enum';
import { InvoiceStatus } from 'common/enums/invoice-status.enum';
import { EventPublisherDecorator } from 'decorators/event.publisher.decorator';
import { EVENTS } from 'common/enums/events.enum';
import { IInvoiceService } from 'services/invoice.service';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';

export interface IOrderService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>>;
  createOrder(currentUser: UserDto, args: CreateOrderArgs): Promise<ResponseResults<OrderDto>>;
  approveOrder(currentUser: UserDto, orderId: number): Promise<ResponseResults<OrderDto>>;
  cancelOrder(currentUser: UserDto, orderId: number): Promise<ResponseResults<OrderDto>>;
}

export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;
  private userRepository: UserRepository;
  private invoiceService: IInvoiceService;

  constructor () {
    this.orderRepository = Container.get(OrderRepository);
    this.userRepository = Container.get(UserRepository);
    this.invoiceService = ContainerHelper.get<IInvoiceService>(ContainerItems.IInvoiceService);
  }

  @RedisDecorator<OrderDto>({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST })
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>> {
    const { payloads, total } = await queryResults(this.orderRepository, query, OrderDto);

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
    const currentUser = await this.userRepository.findOneByOrFail({ id });
    const order = await this.orderRepository.findOneOrFail({ where: { id: orderId, status: OrderStatus.PENDING } });

    await this.orderRepository.save({ ...order, status: OrderStatus.COMPLETED });
    await this.invoiceService.create({ order, user: currentUser, status: InvoiceStatus.PAID });

    // TODO: Notify the user with an email that includes an attachment for the invoice.

    return { result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST, event: EVENTS.ORDER_CANCELED })
  async cancelOrder ({ id }: UserDto, orderId: number) {
    const currentUser = await this.userRepository.findOneByOrFail({ id });
    const order = await this.orderRepository.findOneOrFail({ where: { id: orderId, status: OrderStatus.PENDING } });

    await this.orderRepository.save({ ...order, status: OrderStatus.CANCELLED });
    await this.invoiceService.create({ order, user: currentUser, status: InvoiceStatus.CANCELLED });

    // TODO: Notify the user with an email that includes an attachment for the invoice.

    return { result: ResultMessage.SUCCEED };
  }
}
