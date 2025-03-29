import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { FileSizeValidationPipe } from 'src/pipes/file-validation';
@Controller('upload')
export class UploadController {

  constructor(
    private readonly uploadService: UploadService
  ) {
  }


  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new FileSizeValidationPipe( Number(process.env.MAX_FILE_SIZE))) file: Express.Multer.File
    ){
      const fileName = `compressed-${Date.now()}.jpg`;
      const filePath=path.join(__dirname, '../../'+ process.env.UPLOAD_DIR,fileName);
       await sharp(file.buffer)
       .resize({width: Number(process.env.IMAGE_WIDTH) })
       .jpeg({ quality: Number(process.env.IMAGE_QUALITY) })
       .toFile(filePath);

    return {
      message: ' عکس با موفقیت اپلود شد',
      fileUrl: `/${process.env.UPLOAD_DIR}/${fileName}`
    };
  }

}
