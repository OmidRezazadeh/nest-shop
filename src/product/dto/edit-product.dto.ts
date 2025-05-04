import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";

export class EditProductDto{
  @IsString({message:"نام باید از نوع رشته باشد"})
  @MaxLength(100,{message:"تعداد کاراکتر های وارد شده حداکثر باید ۱۰۰عدد باشد"})
  name: string;

  
  @IsString({message:"توضیحات باید از نوع رشته باشد"})
  @IsNotEmpty({message:"لطفا توضیحات محصول را وارد کنید "})
  description: string;
   
  
  @IsNumber()
  price:number;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsArray({message:'تصاویر باید یک آرایه از نام فایل‌ها باشند'})
  photos?: Array<{
    id?: number; 
    file_name: string; 
    action: 'add' | 'replace' | 'delete'; 
  }>;
 
  
  @IsOptional()
  @IsArray({message:'تگ باید یک آرایه از نام فایل‌ها باشند'})
  tag_ideas ?: number[];
}