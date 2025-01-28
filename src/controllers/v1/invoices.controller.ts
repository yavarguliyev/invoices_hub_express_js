import { JsonController, Get, Post, Put, Delete, HttpCode } from 'routing-controllers';

import { createVersionedRoute } from 'helpers/utility-functions.helper';
import { IInvoiceService } from 'services/invoice.service';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { ContainerItems } from 'ioc/static/container-items';

@JsonController(createVersionedRoute('/invoices', 'v1'))
export class InvoicesController {
  private invoiceService: IInvoiceService;

  constructor () {
    this.invoiceService = ContainerHelper.get<IInvoiceService>(ContainerItems.IInvoiceService);
  }

  @Get('/')
  async get () {
    return await this.invoiceService.get();
  }

  @Get('/:id')
  async getBy () {
    return {};
  }

  @HttpCode(201)
  @Post('/')
  async create () {
    return {};
  }

  @Put('/:id')
  async update () {
    return {};
  }

  @Delete('/:id')
  async delete () {
    return true;
  }
}
