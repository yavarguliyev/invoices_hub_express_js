import { JsonController, Get, Authorized, QueryParams, CurrentUser, Post, Body } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { BaseController } from 'api/base-controller';
import { swaggerSchemas } from 'application/helpers/swagger-schemas.helper';
import { createVersionedRoute } from 'application/helpers/utility-functions.helper';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { CreateOrderArgs } from 'core/inputs/create-order.args';
import { Roles } from 'domain/enums/roles.enum';
import { UserDto } from 'domain/dto/user.dto';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute({ controllerPath: '/orders', version: 'v1' }))
export class OrdersController extends BaseController {
  @Get('/')
  @OpenAPI(swaggerSchemas.orders.getOrdersList)
  async get (@QueryParams() query: GetQueryResultsArgs) {
    return await this.orderService.get(query);
  }

  @Authorized([Roles.Standard])
  @Post('/')
  @OpenAPI(swaggerSchemas.orders.createOrder)
  async createOrder (@CurrentUser() currentUser: UserDto, @Body() args: CreateOrderArgs) {
    return await this.orderService.createOrder(currentUser, args);
  }
}
