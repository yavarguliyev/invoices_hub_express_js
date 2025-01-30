import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'value-objects/types/decorator/decorator.types';
import { OrderRepository } from 'repositories/order.repository';
import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { OrderDto } from 'value-objects/dto/order/order.dto';
import { ResponseResults } from 'value-objects/types/services/response-results.type';

export interface IOrderService {
  get (): Promise<ResponseResults<OrderDto>>;
}

export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;

  constructor () {
    this.orderRepository = Container.get(OrderRepository);
  }

  @RedisDecorator<OrderDto>({ keyTemplate: REDIS_CACHE_KEYS.ORDER_GET_LIST })
  async get (): Promise<ResponseResults<OrderDto>> {
    const orders = await this.orderRepository.find();
    const orderDtos = orders.map((order) => plainToInstance(OrderDto, order, { excludeExtraneousValues: true }));

    return { payloads: orderDtos, result: ResultMessage.SUCCEED };
  }
}
