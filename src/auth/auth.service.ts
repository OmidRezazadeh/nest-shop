import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/registerDto'; // Adjust the path if necessary
@Injectable()
export class AuthService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      ) {}

      async createUser(registerDto: RegisterDto): Promise<User> {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
        // Create the user instance with hashed password and other details from DTO
        const user = this.userRepository.create({
          ...registerDto,
          password: hashedPassword, // Set hashed password
        });
        return user; 
      }
}
