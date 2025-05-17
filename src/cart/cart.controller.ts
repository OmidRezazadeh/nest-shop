import { Body, Controller, Delete, Get, Post,Request, UseGuards } from '@nestjs/common';
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

 @Get()
 @UseGuards(JwtAuthGuard,CheckVerifiedGuard)  
 async getCart(@Request() request){
   const userId = request.user.id;
   const key = `${RedisKeys.CART_ID}:${userId}`;
   let cart = await this.redisService.getValue(key);
   if (!cart) {
      const dbCart = await this.cartService.getCartByUserId(userId);
      if (dbCart) {
         await this.redisService.setValue(key, JSON.stringify(dbCart));
         cart = JSON.stringify(dbCart);
      }
   }
   return { cart: cart ? JSON.parse(cart) : null };
 }

   @UseGuards(JwtAuthGuard,CheckVerifiedGuard)
   @Post('store')
   async create(
   @Body() cartDto:CartDto, 
   @Request() request
){
        const userId = request.user.id;
         await this.cartService.validate(cartDto,userId)
         const cart= await this.cartService.create(cartDto,userId);
         const key = `${RedisKeys.CART_ID}:${userId}`;
         await  this.redisService.setValue(key,JSON.stringify(cart))
         return {cart}
      }

      
   @UseGuards(JwtAuthGuard,CheckVerifiedGuard)
      @Delete('delete')
      async delete(@Request() request){
         const userId = request.user.id;
         await this.cartService.checkExistsCart(userId)
         await this.cartService.deleteByUserId(userId);
         const key = `${RedisKeys.CART_ID}:${userId}`;
         await this.redisService.deleteValue(key)
         return {message:"سبد خرید با موفقیت حذف شد"}
      }

}
