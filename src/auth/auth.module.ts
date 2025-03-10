import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileModule } from 'src/profile/profile.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]),
ProfileModule
],

  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
