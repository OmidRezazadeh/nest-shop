import { Expose, Type } from "class-transformer";
import { ProductResponseDto } from '../../product/dto/product-response.dto';
import { cartItemResponseDto } from "src/cart-item/dto/cart-item-response.dto";

export class CartResponseDto{
@Expose()
id: number;
 
@Expose()
description:string

@Expose()
total_price:number
@Expose()
status:string 
@Expose()
created_at:string  

@Expose()
@Type(()=>cartItemResponseDto)
item: cartItemResponseDto[]


}