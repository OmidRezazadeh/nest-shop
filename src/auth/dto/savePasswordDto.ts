import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
 export class SavePasswordDto{
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email:string;

    @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد' })
    @MinLength(4, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
    new_password:string;

    @IsNotEmpty({ message: 'کد را وارد کنید' })
    code:number
 }