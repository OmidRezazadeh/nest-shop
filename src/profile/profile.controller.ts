import { Body, Controller, Delete, Put, Req, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { Photo } from 'src/upload/entities/photo.entity';

import { UploadService } from '../upload/upload.service';
import { NotFoundException } from 'src/common/constants/custom-http.exceptions';
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
    async update(@Request() request,@Body()  profileDto:ProfileDto) {

      const userId = request.user.id;
      await this.profileService.update(profileDto.bio,userId);
      if (profileDto.image) {
          await this.profileService.moveImage(profileDto.image,userId)
      }
      return {
        message:"پروفایل با موفقیت بروز رسانی شد "
      }



    
    }

    @Delete('image')
    @UseGuards(JwtAuthGuard)
    async delete(@Request() request){
        const userId = request.user.id;
        await this.profileService.deleteImage(userId)
        return {
            message:" عکس با موفقیت حذف شد"
        }

    }



}
