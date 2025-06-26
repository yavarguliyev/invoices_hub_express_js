import { JsonController, Get, Authorized, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { BaseController } from 'api/base.controller';
import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';
import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { Roles } from 'domain/enums/roles.enum';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute({ controllerPath: '/invoices', version: 'v1' }))
export class InvoicesController extends BaseController {
  @Get('/')
  @OpenAPI(swaggerSchemas.invoices.getInvoicesList)
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.invoiceService.get(query);
  }
}
