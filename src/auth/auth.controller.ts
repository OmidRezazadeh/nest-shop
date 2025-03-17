import {Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ProfileService } from '../profile/profile.service';
import { RegisterDto } from './dto/registerDto';
import { ConfirmDto } from './dto/confirmDto';
import { DataSource, QueryRunner } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { User } from '../user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { ConfirmationCodeService } from '../confirmation-code/confirmation-code.service';
import { randomInt } from 'crypto';
import { MailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly dataSource: DataSource,
    private readonly confirmationCodeService:ConfirmationCodeService,
    private readonly  mailService:MailService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const user = await this.authService.createUser(registerDto); // Ensure user creation returns the role
  
      const profile = await this.profileService.create(user.id);
      const role = await queryRunner.manager.findOne(Role, { where: { id: user.role_id } });

     const confirmationCode = randomInt(100000, 999999);

     const email= user.email
     await this.confirmationCodeService.create(email,confirmationCode)
    await this.mailService.sendConfirmationEmail(email,confirmationCode)
    
    
     await queryRunner.commitTransaction();
      const userResponse = plainToInstance(User, {
        ...user,
        profile: profile,
        role:role
    
      });
  
      return {
        message: 'ثبت نام کاربر با موفقیت انجام شد',
        user: userResponse,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'لطفا مجددا امتحان کنید',
      );
    } finally {
      await queryRunner.release();
    }
  }


  @Post('confirm-email')
  async confirmEmail(@Body() ConfirmDto:ConfirmDto ){
        await this.confirmationCodeService.confirmEmail(ConfirmDto);
      

  }

  @Post('login')
  async login(@Body() loginDto:LoginDto){
    return this.authService.login(loginDto)
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    
    await this.authService.logout(req.user.id);
    return {
      message: '  خروج کاربر با موفقیت انجام شد',
      
    };


  }

 
}
