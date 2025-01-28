import { Entity, Column, ManyToOne, Index, BeforeInsert, BeforeRemove, JoinColumn, getManager, OneToMany } from 'typeorm';
import { IsEmail, IsString, Length } from 'class-validator';
import bcrypt from 'bcrypt';

import BaseEntity from 'entities/base.entity';
import Role from 'entities/role.entity';
import { Entities } from 'value-objects/enums/entities.enum';
import { PasswordStrengthDecorator } from 'decorators/password-strength.decorator';
import Invoice from 'entities/invoices.entity';

@Entity(Entities.USER)
export default class User extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  @Length(8, 128)
  @IsEmail()
  @Index({ unique: true })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 128 })
  @IsString()
  @Length(3, 64)
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 64 })
  @IsString()
  @Length(3, 64)
  lastName: string;

  @Column()
  @IsString()
  @Length(8, 256, { message: 'Password must be between 8 and 256 characters.' })
  @PasswordStrengthDecorator()
  password: string;

  @BeforeInsert()
  async hashPassword (): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeRemove()
  async handleSoftDelete () {
    if (this.deletedAt) {
      await getManager().query('DELETE FROM unique_constraint_table WHERE email = ?;', [this.email]);
    }
  }

  @OneToMany(() => Invoice, (invoice) => invoice.user)
  public invoices: Invoice[];

  @ManyToOne(() => Role, (role) => role.users, { lazy: true })
  @JoinColumn({ name: 'role_id' })
  public role: Role;
}
