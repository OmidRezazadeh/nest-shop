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
import { TagModule } from './tag/tag.module';
import { Tag } from './tag/entities/tag.entity';
import { ProductModule } from './product/product.module';

dotenv.config();
@Module({


  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'login', 
          ttl: 60000,
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
      entities: [User,Role,Profile,confirmationCode,Photo,Tag], 
      synchronize: true,
    }),
    UserModule, 
    RoleModule,
    AuthModule,
    ProfileModule,
    ConfirmationCodeModule,
    EmailModule,
    UploadModule,
    TagModule,
    ProductModule,
  
    ],
  controllers: [AppController],
  providers: [
    AppService,IsUniqueConstraint, DateService],
})
export class AppModule {}
