import { IsEmail, IsNotEmpty  } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class ConfirmDto{
    
    @ApiProperty({ example: 'user@example.com' })
    @IsNotEmpty({ message: 'ایمیل نمی‌تواند خالی باشد' })
    @IsEmail({}, { message: 'ایمیل وارد شده صحیح نیست ' })
    email!: string;

    @ApiProperty({ example: 123456 })
    @IsNotEmpty({ message: 'کد نمی‌تواند خالی باشد' })
    code!: number

}