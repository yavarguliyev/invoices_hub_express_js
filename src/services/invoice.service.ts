import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { InvoiceRepository } from 'repositories/invoice.repository';
import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'value-objects/types/decorator/decorator.types';
import { InvoiceDto } from 'value-objects/dto/invoice/invoice.dto';
import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { ResponseResults } from 'value-objects/types/services/response-results.type';

export interface IInvoiceService {
  get (): Promise<ResponseResults<InvoiceDto>>;
}

export class InvoiceService implements IInvoiceService {
  private invoiceRepository: InvoiceRepository;

  constructor () {
    this.invoiceRepository = Container.get(InvoiceRepository);
  }

  @RedisDecorator<InvoiceDto>({ keyTemplate: REDIS_CACHE_KEYS.INVOICE_GET_LIST })
  async get (): Promise<ResponseResults<InvoiceDto>> {
    const invoices = await this.invoiceRepository.find();
    const invoiceDtos = invoices.map((invoice) => plainToInstance(InvoiceDto, invoice, { excludeExtraneousValues: true }));

    return { payloads: invoiceDtos, result: ResultMessage.SUCCEED };
  }
}
