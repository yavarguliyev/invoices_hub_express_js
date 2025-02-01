import { JsonController, Get, Authorized, QueryParams, CurrentUser, Post, Patch, Body, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { IOrderService } from 'services/order.service';
import { Roles } from 'common/enums/roles.enum';
import { GetQueryResultsArgs } from 'common/inputs/get-query-results.args';
import { swaggerSchemas } from 'helpers/swagger-schemas.helper';
import { UserDto } from 'common/dto/user.dto';
import { CreateOrderArgs } from 'common/inputs/create-order.args';

@JsonController(createVersionedRoute('/orders', 'v1'))
export class OrdersController {
  private orderService: IOrderService;

  constructor () {
    this.orderService = ContainerHelper.get<IOrderService>(ContainerItems.IOrderService);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
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

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Patch('/:id/approve')
  @OpenAPI(swaggerSchemas.orders.approveOrder)
  async approveOrder (@CurrentUser() currentUser: UserDto, @Param('id') orderId: number) {
    return await this.orderService.approveOrder(currentUser, orderId);
  }

  @Authorized([Roles.GlobalAdmin, Roles.Admin])
  @Patch('/:id/cancel')
  async cancelOrder (@CurrentUser() currentUser: UserDto, @Param('id') orderId: number) {
    return await this.orderService.cancelOrder(currentUser, orderId);
  }
}
