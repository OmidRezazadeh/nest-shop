import { IsEmail, IsNotEmpty, IsNumber  } from "class-validator";
export class ConfirmDto{
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email:string;

    @IsNotEmpty({ message: 'کد نمی‌تواند خالی باشد' })
    code:number

}