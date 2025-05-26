import { Module } from '@nestjs/common';
import { OrderItemService } from './order-item.service';

@Module({
  providers: [OrderItemService]
})
export class OrderItemModule {}
