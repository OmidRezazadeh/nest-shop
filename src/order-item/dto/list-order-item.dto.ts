import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ListOrderItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @IsOptional()
  @Type(() => Number)
  minPrice: number;

  @IsOptional()
  @Type(() => Number)
  maxPrice: number;
}
