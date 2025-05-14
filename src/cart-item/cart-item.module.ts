import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { CartService } from 'src/cart/cart.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { JwtModule } from '@nestjs/jwt';
import { Product } from 'src/product/entities/product.entity';
import { DateService } from 'src/date/date.service';
import { User } from 'src/user/entities/user.entity';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports:
  [TypeOrmModule.forFeature([CartItem, Cart, Product,User]),
  JwtModule.registerAsync({
    useFactory:()=>({
      secret:process.env.JWT_SECRET,
      signOptions:{expiresIn:process.env.JWT_EXPIRES_IN}
    })
  })
],

  providers: [CartItemService, CartService, DateService,RedisService],
  controllers: [CartItemController]
})
export class CartItemModule {}
