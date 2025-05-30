import { Expose, Type } from "class-transformer";
import { cartItemResponseDto } from "src/cart-item/dto/cart-item-response.dto";
import { UserResponseDto } from "src/user/dto/user-response.dto";

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
@Type(()=>UserResponseDto)
user:UserResponseDto

@Expose()
@Type(()=>cartItemResponseDto)
item: cartItemResponseDto[]



}