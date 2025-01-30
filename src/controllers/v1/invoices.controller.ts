import { JsonController, Get, Authorized } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { IInvoiceService } from 'services/invoice.service';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { Roles } from 'value-objects/enums/roles.enum';

@JsonController(createVersionedRoute('/invoices', 'v1'))
export class InvoicesController {
  private invoiceService: IInvoiceService;

  constructor () {
    this.invoiceService = ContainerHelper.get<IInvoiceService>(ContainerItems.IInvoiceService);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Get('/')
  async get () {
    return await this.invoiceService.get();
  }
}
