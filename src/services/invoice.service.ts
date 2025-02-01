import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { InvoiceRepository } from 'repositories/invoice.repository';
import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'common/types/decorator.types';
import { InvoiceDto } from 'common/dto/invoice.dto';
import { ResultMessage } from 'common/enums/result-message.enum';
import { ResponseResults } from 'common/types/response-results.type';
import { GetQueryResultsArgs } from 'common/inputs/get-query-results.args';
import { queryResults } from 'helpers/utility-functions.helper';
import { CreateInvoiceArgs } from 'common/inputs/create-invoice.args';
import { InvoiceStatus } from 'common/enums/invoice-status.enum';
import Order from 'entities/order.entity';
import User from 'entities/user.entity';
import { EventPublisherDecorator } from 'decorators/event.publisher.decorator';
import { EVENTS } from 'common/enums/events.enum';

export interface IInvoiceService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<InvoiceDto>>;
  create (args: CreateInvoiceArgs): Promise<ResponseResults<InvoiceDto>>;
}

export class InvoiceService implements IInvoiceService {
  private invoiceRepository: InvoiceRepository;

  constructor () {
    this.invoiceRepository = Container.get(InvoiceRepository);
  }

  @RedisDecorator<InvoiceDto>({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST })
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<InvoiceDto>> {
    const { payloads, total } = await queryResults(this.invoiceRepository, query, InvoiceDto);

    return { payloads, total, result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST, event: EVENTS.INVOICE_CREATED })
  async create (args: CreateInvoiceArgs): Promise<ResponseResults<InvoiceDto>> {
    const { order, user, status } = args;

    const invoice = this.invoiceRepository.create(this.createInvoice(order, user, status));
    const newInvoice = await this.invoiceRepository.save(invoice);
    const userDto = plainToInstance(InvoiceDto, newInvoice, { excludeExtraneousValues: true });

    return { payload: userDto, result: ResultMessage.SUCCEED };
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
}
