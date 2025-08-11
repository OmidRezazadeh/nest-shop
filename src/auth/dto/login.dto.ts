import { IsEmail, IsNotEmpty, MinLength,} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {

    @ApiProperty({ example: 'secret1234' })
    @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد' })
    @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
    password!:string;

    @ApiProperty({ example: 'user@example.com' })
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email!:string;
}