import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'UniqueProductIds', async: false })
export class UniqueProductIds implements ValidatorConstraintInterface {
  validate(cartItems: any[]) {
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
