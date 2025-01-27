import { IsNumber } from 'class-validator';

export class GetUserArgs {
  @IsNumber()
  public id: number;
}
