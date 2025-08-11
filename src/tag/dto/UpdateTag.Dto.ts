import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsUnique } from 'src/common/decorators/is-unique';

export class UpdateTagDto {
  @ApiProperty({ description: 'Tag name', maxLength: 100 })
  @IsString({message:"تگ باید از نوع رشته باشد"})
  @IsNotEmpty({ message: 'تگ نمی‌تواند خالی باشد' })
  @MaxLength(100,{message:"تعداد کاراکتر های وارد شده حداکثر باید ۱۰۰عدد باشد"})
  @IsUnique({tableName:'tags',column: 'name'})
  name: string;
}
