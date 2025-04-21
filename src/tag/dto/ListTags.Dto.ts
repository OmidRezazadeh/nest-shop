// list-tags.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class ListTagsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  name?: string;

  @IsOptional()
  isActive?: boolean;
}
