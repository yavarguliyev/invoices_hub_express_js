import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserArgs {
  @IsOptional()
  @Length(8, 128)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(3, 64)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(3, 64)
  lastName?: string;

  @IsOptional()
  roleId?: number;
}
