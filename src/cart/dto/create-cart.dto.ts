import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, Min, ValidateNested } from "class-validator";

class CartItemInput{
    @IsNotEmpty({message:"شناسه محصول الزامی است"})
    @IsNumber({},{message:"شناسه محصول باید عدد باشد"})
    product_id:number

    @IsNotEmpty({message:"'تعداد الزامی است"})
    @IsNumber({}, { message: 'تعداد باید عدد باشد' })
    @Min(1, { message: 'تعداد باید حداقل ۱ باشد' })
    quantity: number;

}


export class CartDto{
    @IsArray({message:'آیتم‌های سبد باید یک آرایه باشند'})
    @ValidateNested({each:true})
    @Type(()=> CartItemInput)
    cart_item:CartItemInput[];  
}
