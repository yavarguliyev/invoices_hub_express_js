import { Container } from 'typedi';

import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'value-objects/types/decorator/decorator.types';
import { OrderRepository } from 'repositories/order.repository';
import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { OrderDto } from 'value-objects/dto/order/order.dto';
import { ResponseResults } from 'value-objects/types/services/response-results.type';
import { GetQueryResultsArgs } from 'value-objects/inputs/query-results/get-query-results.args';
import { queryResults } from 'helpers/utility-functions.helper';

export interface IOrderService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>>;
}

export class OrderService implements IOrderService {
  private orderRepository: OrderRepository;

  constructor () {
    this.orderRepository = Container.get(OrderRepository);
  }

  @RedisDecorator<OrderDto>({ keyTemplate: REDIS_CACHE_KEYS.ORDER_GET_LIST })
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<OrderDto>> {
    const { payloads, total } = await queryResults(this.orderRepository, query, OrderDto);

    return { payloads, total, result: ResultMessage.SUCCEED };
  }
}
