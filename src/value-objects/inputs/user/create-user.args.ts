import { IsEmail, IsString, Length } from 'class-validator';

import { PasswordStrengthDecorator } from 'decorators/password-strength.decorator';

export class CreateUserArgs {
  @Length(8, 128)
  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 64)
  firstName: string;

  @IsString()
  @Length(3, 64)
  lastName: string;

  @IsString()
  @Length(8, 256, { message: 'Password must be between 8 and 256 characters.' })
  @PasswordStrengthDecorator()
  password: string;

  roleId: number;
}
