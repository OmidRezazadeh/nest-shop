import { Expose, Type } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';
import { cartItemResponseDto } from "src/cart-item/dto/cart-item-response.dto";
import { UserResponseDto } from "src/user/dto/user-response.dto";

export class CartResponseDto{
@Expose()
@ApiProperty()
id: number;
 
@Expose()
@ApiProperty({ required: false })
description:string

@Expose()
@ApiProperty()
total_price:number
@Expose()
@ApiProperty()
status:string 
@Expose()
@ApiProperty()
created_at:string  

@Expose()
@Type(()=>UserResponseDto)
@ApiProperty({ type: () => UserResponseDto })
user:UserResponseDto

@Expose()
@Type(()=>cartItemResponseDto)
@ApiProperty({ type: () => [cartItemResponseDto] })
item: cartItemResponseDto[]



}