import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { UserModule } from 'src/user/user.module';
import { ConfirmationCodeModule } from 'src/confirmation-code/confirmation-code.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ProfileModule,
    ConfirmationCodeModule,
    EmailModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService], // Do NOT add ConfirmationCodeService here
  exports: [AuthService],
})
export class AuthModule {}
