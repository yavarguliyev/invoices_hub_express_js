import { Container } from 'typedi';

import { queryResults } from 'application/helpers/utility-functions.helper';
import { RedisDecorator } from 'core/decorators/redis.decorator';
import { ResponseResults } from 'core/types/response-results.type';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { REDIS_INVOICE_LIST } from 'core/configs/decorators.config';
import { InvoiceRepository } from 'domain/repositories/invoice.repository';
import { InvoiceDto } from 'domain/dto/invoice.dto';
import { ResultMessage } from 'domain/enums/result-message.enum';
import { IInvoiceRabbitMQSubscriber } from 'application/rabbitMQ/invoice-rabbitMQ.subscriber';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';

export interface IInvoiceService {
  initialize(): Promise<void>;
  get(query: GetQueryResultsArgs): Promise<ResponseResults<InvoiceDto>>;
}

export class InvoiceService implements IInvoiceService {
  private _rabbit?: IInvoiceRabbitMQSubscriber;
  private _invoiceRepository?: InvoiceRepository;

  private get rabbit (): IInvoiceRabbitMQSubscriber {
    if (!this._rabbit) {
      this._rabbit = ContainerHelper.get<IInvoiceRabbitMQSubscriber>(ContainerItems.IInvoiceRabbitMQSubscriber);
    }

    return this._rabbit;
  }

  private get invoiceRepository (): InvoiceRepository {
    if (!this._invoiceRepository) {
      this._invoiceRepository = Container.get(InvoiceRepository);
    }

    return this._invoiceRepository;
  }

  async initialize (): Promise<void> {
    await this.rabbit.initialize();
  }

  @RedisDecorator(REDIS_INVOICE_LIST)
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<InvoiceDto>> {
    const { payloads, total } = await queryResults({ repository: this.invoiceRepository, query, dtoClass: InvoiceDto });
    return { payloads, total, result: ResultMessage.SUCCESS };
  }
}
