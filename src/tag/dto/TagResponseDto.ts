// tag-response.dto.ts
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
    @ApiProperty({ description: 'Tag id' })
    @Expose()
    id: number;

    @ApiProperty({ description: 'Tag name' })
    @Expose()
    name: string;
}

