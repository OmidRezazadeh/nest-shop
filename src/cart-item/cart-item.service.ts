import { Injectable, NotFoundException } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { Repository } from 'typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from 'src/common/constants/custom-http.exceptions';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartItemService {

    constructor(
      private readonly cartService:CartService,
      
      @InjectRepository(Cart)
      private readonly cartRepository:Repository<Cart>,

      @InjectRepository(CartItem)
      private  readonly cartItemRepository:Repository<CartItem>   
   
   ){}


   async extractCartAndItemIds(cartItemDeleteDto: any, userId: number) {
      const cart = await this.cartService.findByUserId(userId);
      
      if (!cart) {
        throw new NotFoundException('سبد خریدی یافت نشد');
      }
    
      const cartItemIds: number[] = cart.items.map(item => Number(item.id));
      const currentCartItemIds: number[] = cartItemDeleteDto.cart_item_ids.map((id: any) => Number(id));
    
      return { cart, cartItemIds, currentCartItemIds };
    }


   async validateDelete(cartItemDeleteDto: any, userId: number) {
      const {cartItemIds, currentCartItemIds } = await this.extractCartAndItemIds(cartItemDeleteDto, userId);

      const allExist = currentCartItemIds.every(value => cartItemIds.includes(value));
    
      if (!allExist) {
        throw new BadRequestException('برخی آیتم‌ها در سبد خرید شما وجود ندارند.');
      }
   


}
async delete(cartItemDeleteDto:any, userId:any){
   const { cart, cartItemIds, currentCartItemIds } = await this.extractCartAndItemIds(cartItemDeleteDto, userId);
 
   if (cartItemIds.length===currentCartItemIds.length ) {
   await this.cartRepository.delete({id:cart.id});
   } else {
      
    for (const cartItemId of currentCartItemIds) {
      await this.cartItemRepository.delete(cartItemId);
    }
  }

}

}