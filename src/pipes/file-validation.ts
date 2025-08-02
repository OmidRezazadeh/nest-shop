import { PipeTransform, Injectable } from '@nestjs/common';
import { BadRequestException } from 'src/common/constants/custom-http.exceptions';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  private readonly maxSize: number;
  private readonly allowedFormats:string[];
  constructor(
    maxSize: number,
    allowedFormats: string[] = ['image/jpeg', 'image/png', 'image/jpg']
) { 
    this.maxSize = maxSize;
    this.allowedFormats = allowedFormats;
  }


  transform(value: Express.Multer.File) {
    if (!value) {
      throw new BadRequestException(' لطفا فایل را اپلود کنید');
    }

    if (value.size > this.maxSize) {
      throw new BadRequestException(` اندازه فایل از حد مجاز بیشتر است ${this.maxSize} `);
    }

    if(!this.allowedFormats.includes(value.mimetype)){
      throw new BadRequestException('فرمت فایل اپلود شده صحیح نیست');

    }

    return value;
  }
}
