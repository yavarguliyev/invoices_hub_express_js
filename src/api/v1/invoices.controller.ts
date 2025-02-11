import { JsonController, Get, Authorized, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { IInvoiceService } from 'application/services/invoice.service';
import { ContainerHelper } from 'application/ioc/helpers/container.helper';
import { ContainerItems } from 'application/ioc/static/container-items';
import { Roles } from 'domain/enums/roles.enum';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';

@JsonController(createVersionedRoute('/invoices', 'v1'))
export class InvoicesController {
  private invoiceService: IInvoiceService;

  constructor () {
    this.invoiceService = ContainerHelper.get<IInvoiceService>(ContainerItems.IInvoiceService);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Get('/')
  @OpenAPI(swaggerSchemas.invoices.getInvoicesList)
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.invoiceService.get(query);
  }
}
