import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'UniqueProductIds', async: false })
export class UniqueProductIds implements ValidatorConstraintInterface {
  validate(cartItems: any[], args: ValidationArguments) {
    if (!Array.isArray(cartItems)) {
      return false;
    }
    const ids = cartItems.map((item) => item.product_id);
    const uniqueIds = new Set(ids);
    return ids.length === uniqueIds.size;
  }

  defaultMessage(args: ValidationArguments) {
    return 'محصولات تکراری در سبد وجود دارد. شناسه هر محصول باید یکتا باشد.';
  }
}
