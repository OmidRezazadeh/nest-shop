import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
 export class SavePasswordDto{
    @ApiProperty({ example: 'user@example.com' })
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email:string;

    @ApiProperty({ example: 'newSecret1234' })
    @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد' })
    @MinLength(4, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
    new_password:string;

    @ApiProperty({ example: 123456 })
    @IsNotEmpty({ message: 'کد را وارد کنید' })
    code:number
 }