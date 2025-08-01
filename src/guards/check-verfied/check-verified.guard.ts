import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenException, UnauthorizedException } from 'src/common/constants/custom-http.exceptions';
import { USER_STATUS } from 'src/common/constants/user-status';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CheckVerifiedGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>) {}
 async canActivate(context: ExecutionContext):  Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
      const fullUser= await this.userRepository.findOne({where:{id:userId}});
      if (!fullUser) {
        throw new UnauthorizedException(" کاربری یافت نشد")
      }
    if (fullUser.status !== USER_STATUS.ACTIVE) {
      throw new ForbiddenException(' کاربر  صحت سنجی نشده');
    }
    return true;
  }
}

