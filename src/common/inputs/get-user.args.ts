import { IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class GetUserArgs {
  @Expose()
  @IsNumber()
  public id: number;
}
