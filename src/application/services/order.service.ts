import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { queryResults } from 'application/helpers/utility-functions.helper';
import { IOrderRabbitMQSubscriber } from 'application/rabbitMQ/order-rabbitMQ.subscriber';
import { RedisDecorator } from 'core/decorators/redis.decorator';
import { ResponseResults } from 'core/types/response-results.type';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { CreateOrderArgs } from 'core/inputs/create-order.args';
import { REDIS_ORDER_LIST } from 'core/configs/decorators.config';
import { OrderRepository } from 'domain/repositories/order.repository';
import { ResultMessage } from 'domain/enums/result-message.enum';
import { OrderDto } from 'domain/dto/order.dto';
import { UserDto } from 'domain/dto/user.dto';
import { UserRepository } from 'domain/repositories/user.repository';
import { OrderStatus } from 'domain/enums/order-status.enum';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';

export interface IOrderService {
  initialize(): Promise<void>;
  get(query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>>;
  createOrder(currentUser: UserDto, args: CreateOrderArgs): Promise<ResponseResults<OrderDto>>;
}

export class OrderService implements IOrderService {
  private _rabbit?: IOrderRabbitMQSubscriber;
  private _orderRepository?: OrderRepository;
  private _userRepository?: UserRepository;

  private get rabbit (): IOrderRabbitMQSubscriber {
    if (!this._rabbit) {
      this._rabbit = ContainerHelper.get<IOrderRabbitMQSubscriber>(ContainerItems.IOrderRabbitMQSubscriber);
    }

    return this._rabbit;
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
    await this.rabbit.initialize();
  }

  @RedisDecorator(REDIS_ORDER_LIST)
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>> {
    const { payloads, total } = await queryResults({ repository: this.orderRepository, query, dtoClass: OrderDto });

    return { payloads, total, result: ResultMessage.SUCCESS };
  }

  async createOrder ({ id }: UserDto, args: CreateOrderArgs): Promise<ResponseResults<OrderDto>> {
    const currentUser = await this.userRepository.findOneByOrFail({ id });
    const newOrder = this.orderRepository.create({
      ...args,
      user: currentUser,
      status: OrderStatus.PENDING
    });

    await this.orderRepository.save(newOrder);

    if (args.totalAmount <= 0) {
      this.rabbit.handleOrderFail(newOrder, currentUser.id);
      return {
        payload: plainToInstance(OrderDto, newOrder, { excludeExtraneousValues: true }),
        result: ResultMessage.FAILED_ORDER_UPDATE_STATUS
      };
    }

    const updatedUser = await this.orderRepository.save({ ...newOrder, status: OrderStatus.COMPLETED });
    const orderDto = plainToInstance(OrderDto, updatedUser, { excludeExtraneousValues: true }) as OrderDto;

    this.rabbit.handleOrderApprovalStatus(updatedUser);
    this.rabbit.handleOrderApprovalInvoiceGenerate(updatedUser, currentUser.id);

    return { payload: orderDto, result: ResultMessage.SUCCESS };
  }
}
