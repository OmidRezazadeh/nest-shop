import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UploadDto {
  @IsNotEmpty()
  @IsNumber()
  imageable_id: number; // Associated ID (User, Product, etc.)

  @IsNotEmpty()
  @IsString()
  imageable_type: string; // Model name (User, Product, etc.)

  @IsNotEmpty()
  @IsString()
  filename:string;
  

}
