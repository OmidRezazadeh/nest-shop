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

dotenv.config();
@Module({


  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User,Role,Profile,confirmationCode], // Change if using compiled JS
      synchronize: true,
    }),
    UserModule, 
    RoleModule,
    AuthModule,
    ProfileModule,
    ConfirmationCodeModule,
    EmailModule,
  
    ],
  controllers: [AppController],
  providers: [AppService,IsUniqueConstraint],
})
export class AppModule {}
