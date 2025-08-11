import {Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
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
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { ForgotPasswordDto } from './dto/forgotPasswordDto';
import { SavePasswordDto } from './dto/savePasswordDto';
import { CustomThrottlerGuard } from '../guards/throttler/custom-throttler.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('auth section')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly dataSource: DataSource,
    private readonly confirmationCodeService:ConfirmationCodeService,
    private readonly  mailService:MailService,
  ) {}



  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin(){

  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req,) {
    const {user} = req;
  return await this.authService.loginGoogle(user)
}
  @ApiOperation({summary:"register user by email password "})
  @ApiResponse({status:201,description:'ثبت نام کاربر با موفقیت انجام شد'})
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
     const {email} = user
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
  @UseGuards(CustomThrottlerGuard) 
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
  @Post('refreshToken')
  async refreshToken(@Body() body: {userId:number, refreshToken: string}){
    return this.authService.refreshToken(body.userId, body.refreshToken);

  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto:ForgotPasswordDto){
   await this.authService.validateEmail(forgotPasswordDto.email)
  
   const confirmationCode = randomInt(100000, 999999);
   await this.confirmationCodeService.create(forgotPasswordDto.email, confirmationCode)
   await this.mailService.sendCodeEmail(forgotPasswordDto.email,confirmationCode)
    return{
      message: 'ایمیلی  برای شما ',
    }

  }

  @Patch('save-password')
  async savePassword(@Body() savePasswordDto:SavePasswordDto){
      await this.authService.validateSavePassword(savePasswordDto)
      await this.authService.updatePassword(savePasswordDto.email,savePasswordDto.new_password);
      return {
        message:"رمز عبور شما بروز رسانی شد"
      }
    
  }
}
