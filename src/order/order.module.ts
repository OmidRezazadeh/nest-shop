import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order';
import { JwtModule } from '@nestjs/jwt';
import { Cart } from 'src/cart/entities/cart.entity';
import { OrderItem } from 'src/order-item/entities/order-item';
import { DateService } from 'src/date/date.service';

@Module({
  imports:[TypeOrmModule.forFeature([Order,Cart,OrderItem]),
  JwtModule.registerAsync({
    useFactory:()=>({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
    })
  })
],
  providers: [OrderService,DateService],
  controllers: [OrderController]
})
export class OrderModule {}
