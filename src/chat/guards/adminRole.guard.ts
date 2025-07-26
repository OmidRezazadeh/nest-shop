import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';

import { User } from '../../user/entities/user.entity';
import { ROLE_NAME } from 'src/common/constants/role-name';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const userId = client?.data?.id;

    if (!userId) {
      throw new ForbiddenException('شناسه کاربر یافت نشد');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user || user.role.id !== ROLE_NAME.Admin) {
      throw new ForbiddenException('شما اجازه دسترسی ندارید');
    }

    return true;
  }
}
