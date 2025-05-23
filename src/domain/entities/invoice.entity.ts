import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, Length, IsNumber } from 'class-validator';

import BaseEntity from 'domain/entities/base.entity';
import User from 'domain/entities/user.entity';
import { Entities } from 'domain/enums/entities.enum';
import { InvoiceStatus } from 'domain/enums/invoice-status.enum';
import Role from 'domain/entities/role.entity';
import Order from 'domain/entities/order.entity';

@Entity(Entities.INVOICE)
export default class Invoice extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @Length(1, 255)
  title: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  amount: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @IsString()
  description: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  @IsString()
  status: InvoiceStatus;

  @Column({ name: 'approved_by_role', type: 'int', nullable: true })
  @ManyToOne(() => Role, (role) => role.invoices, { lazy: true })
  @JoinColumn({ name: 'approved_by_role' })
  public approvedByRole: Role;

  @ManyToOne(() => User, (user) => user.invoices, { lazy: true })
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @ManyToOne(() => Order, (order) => order.invoices, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  public order: Order;
}
