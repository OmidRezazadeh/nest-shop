import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/registerDto'; // Adjust the path if necessary
import { USER_STATUS } from 'src/common/constants/user-status';
import { Role } from '../role/entities/role.entity';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { ConfirmDto } from './dto/confirmDto';
import { Validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from 'src/common/constants/custom-http.exceptions';
@Injectable()
export class AuthService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      private readonly  userService:UserService,
      private readonly jwtService: JwtService,
      ) {}

      async createUser(registerDto: RegisterDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);  
     
        const user = this.userRepository.create({
          ...registerDto,
          password: hashedPassword, 
          status: USER_STATUS.INACTIVE,
          role_id:ROLE_NAME.Clint
        });
        return this.userRepository.save(user);

      }
       
      async validateUser(email:string, password:string){
        const user =await this.userService.findByEmail(email);
        if(!user){
           throw new UnauthorizedException('شما مجاز به دسترسی به این منبع نیستید');

        }
        
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('رمز عبور وارد شده صحیح نیست ');
    }

    return user; 
      }
      async login(loginDto: any){
          const user = await this.validateUser(loginDto.email, loginDto.password);
          const payload={email:user.email, id:user.id}
          return {
            access_token: this.jwtService.sign(payload),
          };
       }
 

}
