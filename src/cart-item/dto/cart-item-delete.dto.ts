import { ApiPropertyOptional } from '@nestjs/swagger';

export class CartItemDeleteDto{
  @ApiPropertyOptional({ type: [Number], description: 'IDs of cart items to delete' })
  cart_item_ids?: number[];
}