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
      
      // Extract the logged-in user's ID from the request
      const userId = request.user.id;
    
      // Validate if the item can be deleted (e.g., check if it exists in the user's cart)
      await this.cartItemService.validateDelete(cartItemDeleteDto, userId);
    
      // Proceed to delete the cart item for the user
      await this.cartItemService.delete(cartItemDeleteDto, userId);
    
      // Define the Redis cache key for the user's cart
      const key = `${RedisKeys.CART_ID}:${userId}`;
    
      // Invalidate the cached cart data in Redis (to reflect changes next time it's fetched)
      await this.redisService.deleteValue(key);
    
      // Return a success message
      return { message: 'ایتم مورد نظر با موفقیت حذف شد' }; 
    
 

}
}