import { Type } from "class-transformer";
import { IsArray, ValidateNested, Validate, Min, IsNumber, IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { UniqueProductIds } from "src/validators/unique-product-id.validator";

export class CartItemInput {
  @ApiProperty({ description: 'Product ID', example: 12 })
  @IsNotEmpty({ message: "شناسه محصول الزامی است" })
  @IsNumber({}, { message: "شناسه محصول باید عدد باشد" })
  product_id: number;

  @ApiProperty({ description: 'Quantity of the product', example: 2, minimum: 1 })
  @IsNotEmpty({ message: "تعداد الزامی است" })
  @IsNumber({}, { message: "تعداد باید عدد باشد" })
  @Min(1, { message: "تعداد باید حداقل ۱ باشد" })
  quantity: number;
}

export class CartDto {
  @ApiProperty({ description: 'Optional description for the cart', required: false })
  description:string
  
  @ApiProperty({ type: [CartItemInput], description: 'List of cart items' })
  @IsArray({ message: 'آیتم‌های سبد باید یک آرایه باشند' })
  @ValidateNested({ each: true })
  @Type(() => CartItemInput)
  @Validate(UniqueProductIds, {
    message: 'محصولات تکراری در سبد وجود دارد. شناسه هر محصول باید یکتا باشد.'
  })
  cart_item: CartItemInput[];
}
    