import { JsonController, Get, Authorized } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';
import { IOrderService } from 'services/order.service';
import { Roles } from 'value-objects/enums/roles.enum';

@Authorized([Roles.GlobalAdmin, Roles.Admin])
@JsonController(createVersionedRoute('/orders', 'v1'))
export class OrdersController {
  private orderService: IOrderService;

  constructor () {
    this.orderService = ContainerHelper.get<IOrderService>(ContainerItems.IOrderService);
  }

  @Get('/')
  async get () {
    return await this.orderService.get();
  }
}
