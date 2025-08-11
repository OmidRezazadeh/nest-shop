import { Body, Controller, Delete, Put, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileDto } from './dto/profile.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { Photo } from 'src/upload/entities/photo.entity';

import { UploadService } from '../upload/upload.service';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
    constructor(
   
        @InjectRepository(Photo)
        private readonly profileService:ProfileService,
        
    ){}
    
    @Put('update')
    @ApiOperation({ summary: 'Update user profile (bio and optional image)' })
    @ApiOkResponse({ schema: { example: { message: 'پروفایل با موفقیت بروز رسانی شد ' } } })
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
    @ApiOperation({ summary: 'Delete profile image' })
    @ApiOkResponse({ schema: { example: { message: ' عکس با موفقیت حذف شد' } } })
    @UseGuards(JwtAuthGuard)
    async delete(@Request() request){
        const userId = request.user.id;
        await this.profileService.deleteImage(userId)
        return {
            message:" عکس با موفقیت حذف شد"
        }

    }



}
