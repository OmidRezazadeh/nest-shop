import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListOrderItemDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page (max via env MAX_LIMIT)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({ description: 'Filter by order id', example: 123 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  order_id: number;

  @ApiPropertyOptional({ description: 'Filter by product id', example: 45 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  product_id: number;

  @ApiPropertyOptional({ description: 'Filter by user id (order owner)', example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @ApiPropertyOptional({ description: 'Minimum price filter', example: 10000 })
  @IsOptional()
  @Type(() => Number)
  minPrice: number;

  @ApiPropertyOptional({ description: 'Maximum price filter', example: 50000 })
  @IsOptional()
  @Type(() => Number)
  maxPrice: number;
}
