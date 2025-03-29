import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { FileSizeValidationPipe } from 'src/pipes/file-validation';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // @Post()
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: 'uploads/',
  //       filename: (req, file, cb) => {
  //         cb(null, `${Date.now()}-${file.originalname}`);
  //       },
  //     }),
  //     fileFilter: (req, file, cb) => {
  //       if (!file.mimetype.match(/(jpg|jpeg|png)$/)) {
  //         return cb(new Error('Invalid file type!'), false);
  //       }
  //       cb(null, true);
  //     },
  //   }),
  // )
  // async uploadFile(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() uploadDto: UploadDto,
  // ) {
  //   return this.uploadService.saveFile(file, uploadDto.imageable_id, uploadDto.imageable_type);
  // }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(new FileSizeValidationPipe(200000)) file: Express.Multer.File){
      const fileName = `compressed-${Date.now()}.jpg`;
      const filePath=path.join(__dirname, '../../public/temps',fileName);
       await sharp(file.buffer)
       .resize({width:800})
       .jpeg({ quality: 80 })
       .toFile(filePath);

    return {
      message: ' عکس با موفقیت اپلود شد',
      fileUrl: `/public/temps/${fileName}`, // Correct URL for frontend
    };
  }

}
