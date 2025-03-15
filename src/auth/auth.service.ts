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
@Injectable()
export class AuthService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
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

      async ConfirmEmail(confirmDto:ConfirmDto){
          
      }
}
