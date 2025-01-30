import { Container } from 'typedi';

import { InvoiceRepository } from 'repositories/invoice.repository';
import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'value-objects/types/decorator/decorator.types';
import { InvoiceDto } from 'value-objects/dto/invoice/invoice.dto';
import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { ResponseResults } from 'value-objects/types/services/response-results.type';
import { GetQueryResultsArgs } from 'value-objects/inputs/query-results/get-query-results.args';
import { queryResults } from 'helpers/utility-functions.helper';

export interface IInvoiceService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<InvoiceDto>>;
}

export class InvoiceService implements IInvoiceService {
  private invoiceRepository: InvoiceRepository;

  constructor () {
    this.invoiceRepository = Container.get(InvoiceRepository);
  }

  @RedisDecorator<InvoiceDto>({ keyTemplate: REDIS_CACHE_KEYS.INVOICE_GET_LIST })
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<InvoiceDto>> {
    const { payloads, total } = await queryResults(this.invoiceRepository, query, InvoiceDto);

    return { payloads, total, result: ResultMessage.SUCCEED };
  }
}
