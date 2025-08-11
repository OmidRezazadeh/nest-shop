import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength  } from "class-validator";
import { IsUnique } from "src/common/decorators/is-unique";
import { Match } from "src/common/decorators/match.decorator";
import { IsPhoneNumber } from "src/common/decorators/PhoneNumberConstraint.decorator";

export class RegisterDto {
    @ApiProperty({example:'omid@gmail.com'})
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    @IsUnique({tableName: 'users', column:"email" })
    email:string;

    @ApiProperty({example:'secret1234'})
    @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد' })
    @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
    password:string;
    @ApiProperty({example:"omid"})
    @IsNotEmpty({message: ' نام را وارد کنید'})
    first_name:string;
    @ApiProperty({example:"rezazdeh"})
    @IsNotEmpty({message: ' نام خانوادگی را وارد کنید'})
    last_name:string;
    @ApiProperty({example:'secret1234'})
    @IsNotEmpty({ message: 'تأیید رمز عبور نمی‌تواند خالی باشد' })
    @Match('password', { message: 'رمز عبور و تأیید آن باید یکسان باشند' })
    confirmPassword: string;

    @ApiProperty({example:"09371896469"})
    @IsPhoneNumber({ message: 'شماره تلفن وارد شده معتبر نیست' })
    @IsUnique({tableName:'users',column: 'phone'})
    phone: string;
}