import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Profile } from './entities/profile';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UploadService } from 'src/upload/upload.service';
import { Photo } from 'src/upload/entities/photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile,User,Photo]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN 
        },
    }),
  }),

  

],
  controllers: [ProfileController],
  providers: [ProfileService,UploadService],
  exports: [ProfileService], // Export ProfileService so it can be used in other modules

})
export class ProfileModule {}
