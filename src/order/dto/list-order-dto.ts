import { IsOptional, IsPositive } from "class-validator";

export class ListOrderDto{
    @IsOptional()
    @IsPositive()
    page?: number;

    @IsOptional()
    @IsPositive()
    limit?: number;

    @IsOptional()
    status:number;

  @IsOptional()
  minPrice:number;
  
  @IsOptional()
  maxPrice:number;

  @IsOptional()
  product_name:string



}