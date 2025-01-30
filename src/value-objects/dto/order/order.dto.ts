import { Expose } from 'class-transformer';

import { OrderStatus } from 'value-objects/enums/order-status.enum';

export class OrderDto {
  @Expose()
  id: number;

  @Expose()
  totalAmount: number;

  @Expose()
  status: OrderStatus;
}
