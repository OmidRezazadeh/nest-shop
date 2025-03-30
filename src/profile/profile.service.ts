import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { UploadService } from 'src/upload/upload.service';
import { Photo } from 'src/upload/entities/photo.entity';
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    
    @InjectRepository(Photo)
    private readonly photoRepository:Repository<Photo>,

    private readonly uploadService:UploadService       
  ) {}
  async create(userId) {
    const profile = this.profileRepository.create({
      user_id: userId,
    });
    return this.profileRepository.save(profile);
  }
  async findById(userId) {
    const profile = await this.profileRepository.findOne({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException('پروفایلی یافت نشد');
    }
    return profile;
  }
  async update(bio, userId) {
    await this.profileRepository.update(userId, { bio: bio });
  }

  async moveImage(imageName: string, userId: number) {
    const imagePath = path.join(__dirname, `../../${process.env.UPLOAD_DIR}/${imageName}`);
  
    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('عکس مورد نظر یافت نشد');
    }
  
    const userFolder = path.join(__dirname, `../../${process.env.PROFILE_DIR}/${userId}`);
  
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
  
    const newFilePath = path.join(userFolder, imageName);
    fs.renameSync(imagePath, newFilePath);
  
    const existingPhoto = await this.photoRepository.findOne({
      where: { imageable_id: userId, imageable_type: 'profile' },
    });
  
    if (!existingPhoto) {

      const newPhoto = this.photoRepository.create({
        filename: imageName,
        imageable_id: userId,
        imageable_type: 'profile',
      });
  
      try {
        const savedPhoto = await this.photoRepository.save(newPhoto);
        console.log('Photo saved:', savedPhoto);
        return savedPhoto;
      } catch (error) {
        console.error('Error saving photo:', error);
        throw new Error('Database error while saving photo.');
      }
    } else {

      const oldFilePath = path.join(userFolder, existingPhoto.filename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
  
      try {
        await this.photoRepository.update(
          { imageable_id: userId, imageable_type: 'profile' }, // WHERE condition
          { filename: imageName },  // Update filename
        );
  
        return await this.photoRepository.findOne({
          where: { imageable_id: userId, imageable_type: 'profile' },
        });
      } catch (error) {
        console.error('Error updating photo:', error);
        throw new Error('Database error while updating photo.');
      }
    }
  }

 async deleteImage(userId){
  const photo = await this.photoRepository.findOne({where:{imageable_id:userId}})
  if (!photo) {
    throw new NotFoundException('عکسی یافت نشد')
  }
  const userImage = path.join(__dirname, `../../${process.env.PROFILE_DIR}/${userId}/${photo.filename}`);
  if (fs.existsSync(userImage)) {
    fs.unlinkSync(userImage);
  }
  await this.photoRepository.delete({imageable_id:userId})



  }
  
}
