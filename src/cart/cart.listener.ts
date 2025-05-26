import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { CartItem } from "src/cart-item/entities/cart-item.entity";
import { Repository } from "typeorm";
import { Cart } from "./entities/cart.entity";

@Injectable()
export class cartListener{
     constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}


  @OnEvent('cart.clear-request')
  async handleCartClearEvent(cart: Cart) {
   if (cart.items && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
      console.log(`Cart ${cart.id} has been cleared.`);
    }
}
}