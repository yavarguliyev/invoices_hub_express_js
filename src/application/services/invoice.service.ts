import { Container } from 'typedi';

import { InvoiceRepository } from 'domain/repositories/invoice.repository';
import { RedisDecorator } from 'core/decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'core/types/decorator.types';
import { InvoiceDto } from 'domain/dto/invoice.dto';
import { ResultMessage } from 'domain/enums/result-message.enum';
import { ResponseResults } from 'core/types/response-results.type';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { queryResults } from 'application/helpers/utility-functions.helper';

export interface IInvoiceService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<InvoiceDto>>;
}

export class InvoiceService implements IInvoiceService {
  private invoiceRepository: InvoiceRepository;

  constructor () {
    this.invoiceRepository = Container.get(InvoiceRepository);
  }

  @RedisDecorator<InvoiceDto>({ keyTemplate: REDIS_CACHE_KEYS.ORDER_INVOICE_GET_LIST })
  async get (query: GetQueryResultsArgs) {
    const { payloads, total } = await queryResults({ repository: this.invoiceRepository, query, dtoClass: InvoiceDto });

    return { payloads, total, result: ResultMessage.SUCCEED };
  }
}
