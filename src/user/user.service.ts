import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Photo } from 'src/upload/entities/photo.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {

constructor(
    @InjectRepository(User)
    private userRepository:Repository<User>,

    @InjectRepository(Photo)
    private readonly photoRepository:Repository<Photo>
    
){}

async findByEmail(email:string) {
   const  user = await this.userRepository.findOne({where:{email: email}})
   return user;
}

 async findById(userId){
    const  user = await this.userRepository.findOne({where:{id: userId},
        relations: ['profile'],
    
    })
    
    const photo = await this.photoRepository.findOne({
        where: { imageable_id: userId, imageable_type: 'profile' },
      });

      const userResponse = new UserResponseDto({
        user:{
          id: user?.id ?? 0, 
          email: user?.email ?? '',
          phone: user?.phone ?? '' 
        },
        role: user?.role,
        profile: user?.profile ,
        image: photo ? `/${process.env.PROFILE_DIR}/${userId}/${photo.filename}` : undefined
      });
    
      return plainToInstance(UserResponseDto, userResponse);


    // return{
    //     user: user,
    //     profile:user?.profile,
    //     image: photo ? `${process.env.BASE_URL}/profile/${userId}/${photo.filename}` : null, 
    //     role:user?.role

 }

}
