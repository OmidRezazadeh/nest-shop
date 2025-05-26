import { Expose, Type } from "class-transformer";
import { orderItemResponseDto } from "src/order-item/dto/order-item-response.dto";
import { UserResponseDto } from "src/user/dto/user-response.dto";

export class orderResponseDto{
    @Expose()
    id:number;

    @Expose()
    status:number;

    @Expose()
    total_price:number;

    @Expose()
    created_at:string;

    @Expose()
    @Type(()=>UserResponseDto)
    user:UserResponseDto

    @Expose()
    @Type(()=>orderItemResponseDto)
    orderItem:orderItemResponseDto

    


}