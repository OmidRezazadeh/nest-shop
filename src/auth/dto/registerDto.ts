import { IsEmail, IsNotEmpty, MinLength,  } from "class-validator";
import { Match } from "src/common/decorators/match.decorator";
import { IsPhoneNumber } from "src/common/decorators/PhoneNumberConstraint.decorator";


export class RegisterDto {
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email:string;

    @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد' })
    @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
    password:string;
 
    @IsNotEmpty({ message: 'تأیید رمز عبور نمی‌تواند خالی باشد' })
    @Match('password', { message: 'رمز عبور و تأیید آن باید یکسان باشند' })
    confirmPassword: string;
    @IsNotEmpty({ message: 'شماره تلفن نمی‌تواند خالی باشد' })
    @IsPhoneNumber({ message: 'شماره تلفن وارد شده معتبر نیست' })
    phone: string;
}