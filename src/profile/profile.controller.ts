import { Controller, NotFoundException, Put, Req, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { Photo } from 'src/upload/entities/photo.entity';
import * as fs from 'fs';
import { UploadService } from '../upload/upload.service';

@Controller('profile')
export class ProfileController {
    constructor(
   
        @InjectRepository(Photo)
        private readonly photoRepository:Repository<Photo>,
        private readonly uploadService:UploadService,
        private readonly profileService:ProfileService,
        
    ){}
    @Put('update')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(JwtAuthGuard)
    async update(@Request() request, @UploadedFile() file?: Express.Multer.File) {

      const userId = request.user.id;
      const profile= await this.profileService.findById(userId);
    
      if (file) {
        const existingPhoto = await this.photoRepository.findOne({
          where: { imageable_id: profile.id, imageable_type: 'profile' },
        });
        console.log(existingPhoto);
        // Delete old photo from storage
      
        if (existingPhoto) {
          if (fs.existsSync(existingPhoto.path)) {
              fs.unlinkSync(existingPhoto.path);
          }
          await this.photoRepository.remove(existingPhoto);
      }
      
     
      const photo = await this.uploadService.saveFile(file, profile.id, 'profile');
      return {
        "photo":photo
  }
    }

}

}
