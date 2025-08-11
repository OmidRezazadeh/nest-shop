import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Order ID to add the item to', example: 123 })
  @IsNumber()
  order_id: number;

  @ApiProperty({ description: 'Product ID to be added to the order', example: 45 })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  @IsNumber()
  quantity: number;
}
