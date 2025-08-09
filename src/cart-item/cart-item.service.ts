import { Injectable, NotFoundException } from '@nestjs/common';
import { CartService } from '../cart/cart.service';
import { Repository } from 'typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException } from 'src/common/constants/custom-http.exceptions';
import { CartItem } from './entities/cart-item.entity';
import { CartItemDeleteDto } from './dto/cart-item-delete.dto';
import { ErrorMessage } from 'src/common/errors/error-messages';

@Injectable()
export class CartItemService {

    constructor(
      private readonly cartService:CartService,
      
      @InjectRepository(Cart)
      private readonly cartRepository:Repository<Cart>,

      @InjectRepository(CartItem)
      private  readonly cartItemRepository:Repository<CartItem>   
   
   ){}



// This method fetches the user's cart and extracts all cart item IDs
async extractCartAndItemIds(cartItemDeleteDto: any, userId: number) {
  // Find the user's cart from the database
  const cart = await this.cartService.findByUserId(userId);
  
  // If no cart exists, throw a 404 error
  if (!cart) {
    throw new NotFoundException(ErrorMessage.CART.NOT_FOUND); // "No cart found"
  }

  // Get all existing cart item IDs from the user's cart
  const cartItemIds: number[] = cart.items.map(item => Number(item.id));

  // Get the item IDs the user wants to delete from the request body
  const currentCartItemIds: number[] = cartItemDeleteDto.cart_item_ids.map((id: number) => Number(id));

  // Return the cart and both ID arrays
  return { cart, cartItemIds, currentCartItemIds };
}




// This method ensures that the items to be deleted actually exist in the user's cart
async validateDelete(cartItemDeleteDto: CartItemDeleteDto, userId: number) {
  // Extract the cart and both sets of item IDs
  const { cartItemIds, currentCartItemIds } = await this.extractCartAndItemIds(cartItemDeleteDto, userId);

  // Check if every ID the user wants to delete is actually in their cart
  const allExist = currentCartItemIds.every(value => cartItemIds.includes(value));

  // If some items don't exist in the cart, throw a 400 Bad Request error
  if (!allExist) {
    throw new BadRequestException(ErrorMessage.CART_ITEM.NOT_FOUND); // "Some items are not in your cart."
  }
}



// This method deletes cart items or the entire cart depending on the deletion scenario
async delete(cartItemDeleteDto: CartItemDeleteDto, userId: number) {
  // Extract the cart and item IDs
  const { cart, cartItemIds, currentCartItemIds } = await this.extractCartAndItemIds(cartItemDeleteDto, userId);

  // If all items in the cart are to be deleted, delete the entire cart record
  if (cartItemIds.length === currentCartItemIds.length) {
    await this.cartRepository.delete({ id: cart.id });
  } else {
    // Otherwise, delete only the specific cart items one by one
    for (const cartItemId of currentCartItemIds) {
      await this.cartItemRepository.delete(cartItemId);
    }
  }
}




}