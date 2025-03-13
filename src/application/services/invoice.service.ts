import { Container } from 'typedi';

import { queryResults } from 'application/helpers/utility-functions.helper';
import { RedisDecorator } from 'core/decorators/redis.decorator';
import { ResponseResults } from 'core/types/response-results.type';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { redisCacheConfig } from 'core/configs/redis.config';
import { InvoiceRepository } from 'domain/repositories/invoice.repository';
import { InvoiceDto } from 'domain/dto/invoice.dto';
import { ResultMessage } from 'domain/enums/result-message.enum';

export interface IInvoiceService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<InvoiceDto>>;
}

export class InvoiceService implements IInvoiceService {
  private _invoiceRepository?: InvoiceRepository;

  private get invoiceRepository (): InvoiceRepository {
    if (!this._invoiceRepository) {
      this._invoiceRepository = Container.get(InvoiceRepository);
    }

    return this._invoiceRepository;
  }

  @RedisDecorator(redisCacheConfig.INVOICE_LIST)
  async get (query: GetQueryResultsArgs) {
    const { payloads, total } = await queryResults({ repository: this.invoiceRepository, query, dtoClass: InvoiceDto });

    return { payloads, total, result: ResultMessage.SUCCEED };
  }
}
