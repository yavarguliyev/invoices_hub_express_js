import { JsonController, Get, Authorized, QueryParams } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { IOrderService } from 'services/order.service';
import { Roles } from 'common/enums/roles.enum';
import { GetQueryResultsArgs } from 'common/inputs/get-query-results.args';
import { swaggerSchemas } from 'helpers/swagger-schemas.helper';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute('/orders', 'v1'))
export class OrdersController {
  private orderService: IOrderService;

  constructor () {
    this.orderService = ContainerHelper.get<IOrderService>(ContainerItems.IOrderService);
  }

  @Get('/')
  @OpenAPI(swaggerSchemas.orders.getOrdersList)
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.orderService.get(query);
  }
}
