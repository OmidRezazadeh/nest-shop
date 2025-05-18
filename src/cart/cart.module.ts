import { forwardRef, Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { User } from 'src/user/entities/user.entity';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { Product } from 'src/product/entities/product.entity';
import { DateService } from 'src/date/date.service';
import { RedisService } from 'src/redis/redis.service';
import { CartItemService } from 'src/cart-item/cart-item.service';
import { LogsService } from 'src/logs/logs.service';
import { Log } from 'src/logs/entities/log.entity';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, Product, CartItem, User,Log]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
      })
    }),
    LogsModule
  ],
  providers: [CartService, DateService, RedisService, CartItemService,LogsService],
  controllers: [CartController],
})
export class CartModule {}
