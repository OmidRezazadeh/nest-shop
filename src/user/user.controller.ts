import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { userInfo } from 'os';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
   
    constructor(
        private readonly userService: UserService
    ){}
   
    @Get()
    @UseGuards(JwtAuthGuard)
    async getUser(@Request() request){
       
      const userId = request.user.id;
     return this.userService.findById(userId);
    
         

  }
}
