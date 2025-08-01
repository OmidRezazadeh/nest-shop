import { IsEmail, IsNotEmpty } from "class-validator";
export class ForgotPasswordDto {
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email:string;




}