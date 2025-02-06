import { Container } from 'typedi';

import { InvoiceRepository } from 'repositories/invoice.repository';
import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'common/types/decorator.types';
import { InvoiceDto } from 'common/dto/invoice.dto';
import { ResultMessage } from 'common/enums/result-message.enum';
import { ResponseResults } from 'common/types/response-results.type';
import { GetQueryResultsArgs } from 'common/inputs/get-query-results.args';
import { queryResults } from 'helpers/utility-functions.helper';

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
    const { payloads, total } = await queryResults(this.invoiceRepository, query, InvoiceDto);

    return { payloads, total, result: ResultMessage.SUCCEED };
  }
}
