import { JsonController, Get, Authorized, QueryParams } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { IInvoiceService } from 'services/invoice.service';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { Roles } from 'value-objects/enums/roles.enum';
import { GetQueryResultsArgs } from 'value-objects/inputs/query-results/get-query-results.args';

@JsonController(createVersionedRoute('/invoices', 'v1'))
export class InvoicesController {
  private invoiceService: IInvoiceService;

  constructor () {
    this.invoiceService = ContainerHelper.get<IInvoiceService>(ContainerItems.IInvoiceService);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Get('/')
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.invoiceService.get(query);
  }
}
