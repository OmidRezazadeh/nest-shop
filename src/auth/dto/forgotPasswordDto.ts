import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class ForgotPasswordDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email!:string;




}