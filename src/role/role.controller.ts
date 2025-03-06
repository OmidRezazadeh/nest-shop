import { Controller, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { RolesResponseDto } from './dto/roles-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('role')
export class RoleController {

    constructor(
        private roleService:RoleService
    ){}
    @Post('default-roles')
    async store(){
        const roles = this.roleService.store()
        return plainToInstance(RolesResponseDto,roles);

    }


}
