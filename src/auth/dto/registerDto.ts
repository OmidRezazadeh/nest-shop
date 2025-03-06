import { IsEmail, IsNotEmpty, MinLength, Validate } from "class-validator";


export class RegisterDto {
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email:string

    @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد' })
    @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
    password:string;
 
    @IsNotEmpty({ message: 'تأیید رمز عبور نمی‌تواند خالی باشد' })
    @Validate((object, value) => value === object.password, { message: 'رمز عبور و تأیید آن باید یکسان باشند' })
    confirmPassword: string;
}