import { IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

import { InvoiceStatus } from 'common/enums/invoice-status.enum';
import User from 'entities/user.entity';
import Order from 'entities/order.entity';

export class CreateInvoiceArgs {
  @Expose()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @Expose()
  user: User;

  @Expose()
  order: Order;
}
