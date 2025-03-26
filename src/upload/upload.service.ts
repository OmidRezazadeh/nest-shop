import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as sharp from 'sharp';


@Injectable()
export class UploadService {

    constructor(
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>
    ){}

    async saveFile(file: Express.Multer.File, imageableId:number, imageableType:string ){
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir,{recursive:true})
        }
        const resizeFilename = `${Date.now()}-${file.originalname}`;
        const resizePath=`${uploadDir}${resizeFilename}`;
        
        try {
            await sharp(file.buffer)
                .resize(500, 500)
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toFile(resizePath);
        } catch (error) {
            console.error('Error processing image:', error);
            throw new Error('Image processing failed');
        }

        const photo  = await this.photoRepository.create({
      filename: resizeFilename,
      path: resizePath,
      imageable_id: imageableId,
      imageable_type: imageableType,
        })
        try {
            const savedPhoto = await this.photoRepository.save(photo);
            console.log('Saved photo:', savedPhoto);
            return savedPhoto;
        } catch (error) {
            console.error('Error saving photo:', error);
            throw error;
        }
        

    }
}
