import { Column, Entity, OneToMany, Index } from 'typeorm';

import BaseEntity from 'domain/entities/base.entity';
import User from 'domain/entities/user.entity';
import { Roles } from 'domain/enums/roles.enum';
import { Entities } from 'domain/enums/entities.enum';
import Invoice from 'domain/entities/invoice.entity';

@Entity(Entities.ROLE)
export default class Role extends BaseEntity {
  @Column({ type: 'enum', enum: Roles, default: Roles.Standard })
  @Index({ unique: true })
  name: Roles;

  @OneToMany(() => Invoice, (invoice) => invoice.approvedByRole)
  public invoices: Invoice[];

  @OneToMany(() => User, (user) => user.role)
  public users: User[];
}
