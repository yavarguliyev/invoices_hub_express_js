import { IsEnum, IsNumber, IsString } from 'class-validator';

import { InvoiceStatus } from 'common/enums/invoice-status.enum';
import { OrderStatus } from 'common/enums/order-status.enum';

export class OrderApproveOrCancelArgs {
  @IsNumber()
  userId: number;

  @IsNumber()
  orderId: number;

  @IsEnum(OrderStatus)
  newOrderStatus: OrderStatus;

  @IsEnum(InvoiceStatus)
  newInvoiceStatus: InvoiceStatus;

  @IsString()
  serviceName: string;
}
