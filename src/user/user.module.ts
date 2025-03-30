import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module'; // Import AuthModule
import { Photo } from 'src/upload/entities/photo.entity';
import { UploadModule } from 'src/upload/upload.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User,Photo]), 
  forwardRef(() => AuthModule),
  JwtModule.registerAsync({
    useFactory: () => ({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN 
      },
  }),
}),
  UploadModule

], 
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
