import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';

@ValidatorConstraint({ name: 'UniqueProductIds', async: false })
export class UniqueProductIds implements ValidatorConstraintInterface {
  validate(cartItems: CartItem) {
    if (!Array.isArray(cartItems)) {
      return false;
    }
    const ids = cartItems.map((item) => item.product_id);
    const uniqueIds = new Set(ids);
    return ids.length === uniqueIds.size;
  }

  defaultMessage() {
    return 'محصولات تکراری در سبد وجود دارد. شناسه هر محصول باید یکتا باشد.';
  }
}
