import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { Socket } from 'socket.io';
import { ROLE_NAME } from 'src/common/constants/role-name';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

  
  @Injectable()
  export class AdminRolesGuard implements CanActivate {
    constructor(
      @InjectRepository(User)
      private  readonly  userRepository:Repository<User>) {}
  
   async canActivate(context: ExecutionContext) {
      
      const client = context.switchToWs().getClient<Socket>();
    
      const user = await this.userRepository.findOne({where:{id:client.data.id},
      relations:['role']
      })
  
 
  
      if (!user || user.role.id !== ROLE_NAME.Admin) {
        throw new ForbiddenException('شما اجازه دسترسی ندارید');
      }
  
      return true;
    }
  }
  