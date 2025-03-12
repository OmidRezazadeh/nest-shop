import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from 'src/profile/profile.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ProfileModule,
    forwardRef(() => UserModule), // Use forwardRef
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // Export AuthService if needed
})
export class AuthModule {}
