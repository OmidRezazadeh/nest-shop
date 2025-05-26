import { Expose, Type } from "class-transformer";
import { ProductResponseDto } from "src/product/dto/product-response.dto";

export class orderItemResponseDto{
    
    @Expose()
    id:number;

    @Expose()
    price:number
    
    @Expose()
    quantity:number;

    @Expose()
    @Type(()=>ProductResponseDto)
    product:ProductResponseDto;
    
} 