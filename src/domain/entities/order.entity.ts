import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { IsEnum, IsNumber } from 'class-validator';

import BaseEntity from 'domain/entities/base.entity';
import { Entities } from 'domain/enums/entities.enum';
import Invoice from 'domain/entities/invoice.entity';
import { OrderStatus } from 'domain/enums/order-status.enum';
import User from 'domain/entities/user.entity';

@Entity(Entities.ORDER)
export default class Order extends BaseEntity {
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  @IsNumber()
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ManyToOne(() => User, (user) => user.orders, { lazy: true })
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @OneToMany(() => Invoice, (invoice) => invoice.order)
  public invoices: Invoice[];
}
