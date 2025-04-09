// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> {
    const requiredRoleId = this.reflector.get<number>('role_id', context.getHandler());
    if (!requiredRoleId) {
      return true; // If no role id is required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Assuming the user is attached to the request
  
    // Check if the user has the required role id
    if (!user || user.role_id !== requiredRoleId) {
      throw new ForbiddenException('شما اجازه دسترسی ندارید');
    }
    return true;
  }
}
