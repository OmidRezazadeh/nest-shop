import { IsNotEmpty } from 'class-validator';
export class ChatDto {
  @IsNotEmpty()
  conversationId:number;
}