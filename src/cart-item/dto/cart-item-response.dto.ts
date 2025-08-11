import { Expose, Type } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

export class ProductMiniDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    id: number;
}

export class cartItemResponseDto{
    @ApiProperty()
    id:number
    @Expose()
    @ApiProperty()
    price: number;

    @Expose()
    @ApiProperty()
    quantity:number
    
    @Expose()
    @Type(() => ProductMiniDto)
    @ApiProperty({ type: () => ProductMiniDto })
    product: ProductMiniDto;


} 