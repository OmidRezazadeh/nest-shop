import { Expose } from "class-transformer";

export class cartItemResponseDto{
    id:number
    @Expose()
    price: number;

    @Expose()
    quantity:number
    
    @Expose()
    product:{ name: string, id:number};


} 