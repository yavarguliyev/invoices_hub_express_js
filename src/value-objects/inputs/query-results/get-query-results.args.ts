import { IsPositive, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetQueryResultsArgs {
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    page: number = 1;

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit: number = 10;

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    filters?: number = 10;

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    order?: number = 10;
}
