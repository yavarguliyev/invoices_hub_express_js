import { IsEmail, IsString, Length } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateUserArgs {
  @Expose()
  @Length(8, 128)
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  @Length(3, 64)
  firstName: string;

  @Expose()
  @IsString()
  @Length(3, 64)
  lastName: string;

  @Expose()
  roleId: number;
}
