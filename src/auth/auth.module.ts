import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { UserModule } from 'src/user/user.module';
import { ConfirmationCodeModule } from 'src/confirmation-code/confirmation-code.module';
import { EmailModule } from 'src/email/email.module';
import { UserService } from 'src/user/user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { confirmationCode } from 'src/confirmation-code/entities/confirmationCode';
import { UploadModule } from 'src/upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from 'src/config/google-oauth.config';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { Profile } from 'src/profile/entities/profile';

@Module({
  imports: [

    TypeOrmModule.forFeature([User,confirmationCode,Profile]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN 
        },
    }),
  }),

    ProfileModule,
    ConfirmationCodeModule,
    EmailModule,
    forwardRef(() => UserModule),
    UploadModule, 
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    
    AuthService,
    UserService,
    JwtStrategy,
    GoogleStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
