import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Photo } from 'src/upload/entities/photo.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/googleUser.dto';
import { ROLE_NAME } from 'src/common/constants/role-name';

import { USER_STATUS } from 'src/common/constants/user-status';
import { Profile } from 'src/profile/entities/profile';

@Injectable()
export class UserService {

constructor(
    @InjectRepository(User)
    private userRepository:Repository<User>,

    @InjectRepository(Photo)
    private readonly photoRepository:Repository<Photo>,

    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly dataSource: DataSource, // Inject DataSource
    
){}

async findByEmail(email:string) {
   const  user = await this.userRepository.findOne({where:{email: email}})
   return user;
}

 async findById(userId:number){
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
          phone: user?.phone ?? '' ,
          status: user?.status ?? 0
          
        },
        role: user?.role,
        profile: user?.profile ,
        image: photo ? `/${process.env.PROFILE_DIR}/${userId}/${photo.filename}` : undefined
      });
    
      return plainToInstance(UserResponseDto, userResponse);


   

 }

 async create(createUserDto: CreateUserDto) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Create User
    const user = this.userRepository.create(createUserDto);
    user.status = ROLE_NAME.Clint;
    user.role_id = USER_STATUS.ACTIVE;
    const newUser = await queryRunner.manager.save(user);

    // 2. Create Profile
    const profile = this.profileRepository.create({ user_id: newUser.id });
    await queryRunner.manager.save(profile);

    // 3. Commit Transaction
    await queryRunner.commitTransaction();

    return newUser;
  } catch (err) {
    // Rollback if anything fails
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release(); // Clean up
  }
}
}
