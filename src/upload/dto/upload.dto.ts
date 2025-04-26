import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UploadDto {
  @IsNotEmpty()
  @IsNumber()
  imageable_id: number;

  @IsNotEmpty()
  @IsString()
  imageable_type: string; 

  @IsNotEmpty()
  @IsString()
  filename:string;
  

}
