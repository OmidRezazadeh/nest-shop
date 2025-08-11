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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


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
  @ApiOperation({ summary: 'Google OAuth login redirect' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth consent screen' })
  googleLogin(){

  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Login via Google successful' })
  async googleCallback(@Req() req,) {
    const {user} = req;
  return await this.authService.loginGoogle(user)
}
  @ApiOperation({summary:"register user by email password "})
  @ApiResponse({status:201,description:'ثبت نام کاربر با موفقیت انجام شد'})
  @Post('register')
  @ApiBody({ type: RegisterDto })
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
  @ApiOperation({ summary: 'Confirm email via code' })
  @ApiBody({ type: ConfirmDto })
  @ApiResponse({ status: 200, description: 'ایمیل با موفقیت تایید شد' })
  async confirmEmail(@Body() ConfirmDto:ConfirmDto ){
        await this.confirmationCodeService.confirmEmail(ConfirmDto);
      

  }
  @Post('login')
  @UseGuards(CustomThrottlerGuard) 
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'ورود موفق' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto:LoginDto){
    return this.authService.login(loginDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'خروج موفق' })
  async logout(@Req() req) {
    
    await this.authService.logout(req.user.id);
    return {
      message: '  خروج کاربر با موفقیت انجام شد',
      
    };


  }
  @Post('refreshToken')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ schema: { properties: { userId: { type: 'number', example: 1 }, refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } }, required: ['userId', 'refreshToken'] } })
  @ApiResponse({ status: 200, description: 'توکن بروز شد' })
  async refreshToken(@Body() body: {userId:number, refreshToken: string}){
    return this.authService.refreshToken(body.userId, body.refreshToken);

  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset code via email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'ایمیل ارسال شد' })
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
  @ApiOperation({ summary: 'Save new password using confirmation code' })
  @ApiBody({ type: SavePasswordDto })
  @ApiResponse({ status: 200, description: 'رمز عبور بروز شد' })
  async savePassword(@Body() savePasswordDto:SavePasswordDto){
      await this.authService.validateSavePassword(savePasswordDto)
      await this.authService.updatePassword(savePasswordDto.email,savePasswordDto.new_password);
      return {
        message:"رمز عبور شما بروز رسانی شد"
      }
    
  }
}
