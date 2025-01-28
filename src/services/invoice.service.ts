import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { InvoiceRepository } from 'repositories/invoice.repository';
import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'value-objects/types/redis/redis-decorator.types';
import { InvoiceResultsDto } from 'value-objects/dto/invoice/invoice-results.dto';
import { InvoiceDto } from 'value-objects/dto/invoice/invoice.dto';
import { ResultMessage } from 'value-objects/enums/result-message.enum';

export interface IInvoiceService {
  get (): Promise<InvoiceResultsDto>;
}

export class InvoiceService implements IInvoiceService {
  private invoiceRepository: InvoiceRepository;

  constructor () {
    this.invoiceRepository = Container.get(InvoiceRepository);
  }

  @RedisDecorator({ keyTemplate: REDIS_CACHE_KEYS.INVOICE_GET_LIST })
  async get (): Promise<InvoiceResultsDto> {
    const invoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.approvedByRole', 'role')
      .getMany();

    const invoiceDtos = invoices.map((invoice) =>
      plainToInstance(InvoiceDto, invoice, { excludeExtraneousValues: true })
    );

    return { invoices: invoiceDtos, result: ResultMessage.SUCCEED };
  }
}
