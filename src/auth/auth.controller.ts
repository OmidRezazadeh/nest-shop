import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ProfileService } from '../profile/profile.service';
import { RegisterDto } from './dto/registerDto';
import { DataSource, QueryRunner } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { User } from '../user/entities/user.entity';
import { Role } from 'src/role/entities/role.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly dataSource: DataSource,
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
  
}
