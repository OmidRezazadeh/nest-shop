import { ApiProperty } from '@nestjs/swagger';
import { orderItemResponseDto } from './order-item-response.dto';
import { PaginationMetaDto } from 'src/common/dto/pagination-meta.dto';

export class OrderItemListResponseDto {
  @ApiProperty({ type: () => [orderItemResponseDto] })
  data: orderItemResponseDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;
}

