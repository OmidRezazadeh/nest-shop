import { IsEmail, IsNotEmpty, MinLength  } from "class-validator";
import { IsUnique } from "src/common/decorators/is-unique";
import { Match } from "src/common/decorators/match.decorator";
import { IsPhoneNumber } from "src/common/decorators/PhoneNumberConstraint.decorator";

export class RegisterDto {
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    @IsUnique({tableName: 'users', column:"email" })
    email:string;

    @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد' })
    @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
    password:string;
    @IsNotEmpty({message: ' نام را وارد کنید'})
    first_name:string;
  
    @IsNotEmpty({message: ' نام خانوادگی را وارد کنید'})
    last_name:string;
 
    @IsNotEmpty({ message: 'تأیید رمز عبور نمی‌تواند خالی باشد' })
    @Match('password', { message: 'رمز عبور و تأیید آن باید یکسان باشند' })
    confirmPassword: string;


    @IsPhoneNumber({ message: 'شماره تلفن وارد شده معتبر نیست' })
    @IsUnique({tableName:'users',column: 'phone'})
    phone: string;
}