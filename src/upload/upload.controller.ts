import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

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
     const fileName= await this.uploadService.saveFile(file);
  

    return {
      message: ' عکس با موفقیت اپلود شد',
      fileUrl: `/${process.env.UPLOAD_DIR}/${fileName}`
    };
  }

}
