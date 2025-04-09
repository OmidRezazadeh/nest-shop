import { SetMetadata } from '@nestjs/common';

export const Roles = (roleId: number) => SetMetadata('role_id', roleId);
