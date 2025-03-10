import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile';
import { profile } from 'console';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
   constructor(
    @InjectRepository(Profile)
    private readonly profileRepository:Repository<Profile>
){}
async create(userId){
console.log(userId);
    const profile =this.profileRepository.create({
        user_id:userId
    })
    return this.profileRepository.save(profile);

}

}
