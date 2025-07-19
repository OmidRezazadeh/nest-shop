import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageDto {
  @IsNumber()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  message: string;
}