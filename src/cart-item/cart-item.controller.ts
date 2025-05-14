import { Controller, UseGuards, Delete, Body, Request } from '@nestjs/common';
import { CheckVerifiedGuard } from 'src/guards/check-verfied/check-verified.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { CartItemDeleteDto } from './dto/cart-item-delete.dto';
import { CartItemService } from './cart-item.service';
import { RedisService } from 'src/redis/redis.service';
import { RedisKeys } from 'src/redis/redis-keys-constants';

@Controller('cart-item')
export class CartItemController {

    constructor(
        private readonly cartItemService:CartItemService,
        private readonly redisService:RedisService
    ){

    }
    @UseGuards(JwtAuthGuard, CheckVerifiedGuard)
    @Delete('delete')
    async delete(@Body() cartItemDeleteDto: CartItemDeleteDto, @Request() request) {
       const userId = request.user.id;
       await this.cartItemService.validateDelete(cartItemDeleteDto, userId)     
       await this.cartItemService.delete(cartItemDeleteDto, userId);
       const key = `${RedisKeys.CART_ID}:${userId}`;
       await this.redisService.deleteValue(key);
       return { message: ' ایتم مورد نظر  با موفقیت حذف شد ' };
    }
 

}
