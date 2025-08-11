import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
   
    constructor(
        private readonly userService: UserService
    ){}
   
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get the authenticated user profile' })
    @ApiOkResponse({ type: UserResponseDto })
    async getUser(@Request() request){
       
      const userId = request.user.id;
     return this.userService.findById(userId);
    
         

  }
}
