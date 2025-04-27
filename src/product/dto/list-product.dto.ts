import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class ListProductDto {
  @IsOptional()
  @IsPositive()
  page?: number;

  @IsOptional()
  @IsPositive()
  limit?: number;

  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsOptional()
  tag?: string;

  @IsOptional()
  minPrice:number;
  
  @IsOptional()
  maxPrice:number 
}
