import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';


@Injectable()
export class UploadService {

    constructor(
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>
    ){}

    async saveFile(file: Express.Multer.File ){
        const fileName = `compressed-${Date.now()}.jpg`;
        const filePath=path.join(__dirname, '../../'+ process.env.UPLOAD_DIR,fileName);
         await sharp(file.buffer)
         .resize({width: Number(process.env.IMAGE_WIDTH) })
         .jpeg({ quality: Number(process.env.IMAGE_QUALITY) })
         .toFile(filePath);
         
         return fileName;

    }
}
