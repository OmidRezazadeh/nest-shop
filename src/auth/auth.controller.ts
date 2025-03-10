import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/registerDto';
import { plainToInstance } from 'class-transformer';

@Controller('auth')
export class AuthController {
    constructor(
        private authService:AuthService,
       
    ) {}
    
    @Post('register')
    async register(@Body() registerDto:RegisterDto ){
         const user= this.authService.createUser(registerDto);
         return user;
        }

}
