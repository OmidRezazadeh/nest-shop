import { IsEnum } from "class-validator";
import { PaymentMethod } from "src/common/constants/payment-method.enum";

export class payOrderDto{
    @IsEnum(PaymentMethod,{ message:' روش پرداخت صحیح  نیست'})
    paymentMethod:PaymentMethod;
}