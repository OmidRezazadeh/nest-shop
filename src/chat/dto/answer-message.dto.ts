import { IsNotEmpty,  IsNumber,  IsString } from 'class-validator';

export class AnswerMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsNotEmpty({ message: "لطفا شناسه گفتگو را وارد کنید" })
  @IsNumber({}, { message: "شناسه گفتگو باید  از نوع عدد باشد" })
  conversationId: number;
}