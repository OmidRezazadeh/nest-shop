import { Expose, Type } from 'class-transformer';

import { TagResponseDto } from 'src/tag/dto/TagResponseDto';
import { PhotoResponseDto } from 'src/upload/dto/photoResponse.Dto';

export class ProductResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    price: number;

    @Expose()
    quantity: number;

    @Expose()
    status: number;

    @Expose()
    @Type(() => TagResponseDto)
    tags: TagResponseDto[];

    @Expose()
    @Type(() => PhotoResponseDto)
    photos: PhotoResponseDto[];

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date;
}