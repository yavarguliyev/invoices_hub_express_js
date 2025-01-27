import { IsNumber, Min } from 'class-validator';

export class DeleteUserArgs {
  @IsNumber()
  @Min(1)
  public id: number;
}
