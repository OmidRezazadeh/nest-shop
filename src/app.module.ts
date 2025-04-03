import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { User } from './user/entities/user.entity';
import { Role } from './role/entities/role.entity';
import { ProfileModule } from './profile/profile.module';
import { Profile } from './profile/entities/profile';
import { IsUniqueConstraint } from './common/decorators/is-unique-constraint';
import { ConfirmationCodeModule } from './confirmation-code/confirmation-code.module';
import { confirmationCode } from './confirmation-code/entities/confirmationCode';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { Photo } from './upload/entities/photo.entity';
import { DateService } from './date/date.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/jwt-auth/throttler/custom-throttler.guard';

dotenv.config();
@Module({


  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 3,
        },
      ],
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User,Role,Profile,confirmationCode,Photo], // Change if using compiled JS
      synchronize: true,
    }),
    UserModule, 
    RoleModule,
    AuthModule,
    ProfileModule,
    ConfirmationCodeModule,
    EmailModule,
    UploadModule,
  
    ],
  controllers: [AppController],
  providers: [
    {
      provide:APP_GUARD,
      useClass:CustomThrottlerGuard
    },
    AppService,IsUniqueConstraint, DateService],
})
export class AppModule {}
