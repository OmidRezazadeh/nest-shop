// create-tag.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { IsUnique } from 'src/common/decorators/is-unique';

export class CreateTagDto {
  @IsString({message:"تگ باید از نوع رشته باشد"})
  @IsNotEmpty({ message: 'تگ نمی‌تواند خالی باشد' })
  @MaxLength(100,{message:"تعداد کاراکتر های وارد شده حداکثر باید ۱۰۰عدد باشد"})
  @IsUnique({tableName:'tags',column: 'name'})
  name: string;
}
