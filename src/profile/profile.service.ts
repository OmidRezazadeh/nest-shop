import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
   constructor(
    @InjectRepository(Profile)
    private readonly profileRepository:Repository<Profile>
){}
async create(userId){

    const profile =this.profileRepository.create({
        user_id:userId
    })
    return this.profileRepository.save(profile);

}
async findById(userId){
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
        throw new NotFoundException('پروفایلی یافت نشد');
      }
      return profile;  


}


}
