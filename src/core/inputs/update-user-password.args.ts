import { IsString, Length, Matches } from 'class-validator';

import { PasswordStrengthDecorator } from 'core/decorators/password-strength.decorator';

export class UpdateUserPasswordArgs {
  @IsString()
  @Length(8, 256, { message: 'Password must be between 8 and 256 characters.' })
  @PasswordStrengthDecorator()
  password: string;

  @IsString()
  @Matches(/^.{8,256}$/, { message: 'Confirm password must be between 8 and 256 characters.' })
  confirmPassword: string;

  @IsString()
  @Length(8, 256, { message: 'Current password must be between 8 and 256 characters.' })
  currentPassword: string;
}
