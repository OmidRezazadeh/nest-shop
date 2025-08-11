import { Expose } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

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
    @ApiProperty({ type: () => Object, properties: { name: { type: 'string' }, id: { type: 'number' } } })
    product:{ name: string, id:number};


} 