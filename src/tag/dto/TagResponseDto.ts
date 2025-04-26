// tag-response.dto.ts
import { Expose } from 'class-transformer';

export class TagResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;
}

