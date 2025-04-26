
import { Expose } from 'class-transformer';

export class PhotoResponseDto {
    @Expose()
    id: number;

    @Expose()
    filename: string;
}