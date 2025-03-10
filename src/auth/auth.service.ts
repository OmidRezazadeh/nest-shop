import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/registerDto'; // Adjust the path if necessary
import { USER_STATUS } from 'src/common/constants/user-status';
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
          status: USER_STATUS.INACTIVE, // Set default status
        });
        return this.userRepository.save(user);

      }
}
