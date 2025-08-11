import { Expose, Type } from 'class-transformer';
import { ProductResponseDto } from 'src/product/dto/product-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class orderItemResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 25000 })
  @Expose()
  price: number;

  @ApiProperty({ example: 2 })
  @Expose()
  quantity: number;

  @ApiProperty({ type: () => ProductResponseDto })
  @Expose()
  @Type(() => ProductResponseDto)
  product: ProductResponseDto;
}