import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module'; // Import AuthModule

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)], 
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
