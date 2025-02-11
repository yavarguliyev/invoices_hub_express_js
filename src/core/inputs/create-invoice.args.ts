import { IsEnum } from 'class-validator';
import { Expose } from 'class-transformer';

import { InvoiceStatus } from 'domain/enums/invoice-status.enum';
import User from 'domain/entities/user.entity';
import Order from 'domain/entities/order.entity';

export class CreateInvoiceArgs {
  @Expose()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @Expose()
  user: User;

  @Expose()
  order: Order;
}
