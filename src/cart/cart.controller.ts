import { Body, Controller, Post,Request, UseGuards } from '@nestjs/common';
import { CartDto } from './dto/create-cart.dto';
import { DataSource } from 'typeorm';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { RedisService } from 'src/redis/redis.service';
import { RedisKeys } from 'src/redis/redis-keys-constants';

@Controller('cart')
export class CartController {
   constructor(
      private readonly redisService: RedisService,
      private readonly cartService:CartService,


   ){}

   @UseGuards(JwtAuthGuard,CheckVerifiedGuard)
   @Post('store')
   async create(@Body() cartDto:CartDto, 
   @Request() request
){
        const userId = request.user.id;
        await this.cartService.validate(cartDto)
         const cart= await this.cartService.create(cartDto,userId);
         const key = `${RedisKeys.CART_ID}:${userId}`;
         await  this.redisService.setValue(key,JSON.stringify(cart))
          return {cart}
      }

      

}
