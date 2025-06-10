import { Module } from '@nestjs/common';
import { OrderItemService } from './order-item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Order } from 'src/order/entities/order';
import { OrderItem } from './entities/order-item';
import { JwtModule } from '@nestjs/jwt';
import { OrderItemController } from './order-item.controller';

@Module({
  imports:[TypeOrmModule.forFeature([Product,Order,OrderItem]),
  JwtModule.registerAsync({
    useFactory: () => ({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN 
      },
  }),
}),
],
  controllers: [OrderItemController], 
  providers: [OrderItemService],
  exports: [TypeOrmModule]
})
export class OrderItemModule {}
