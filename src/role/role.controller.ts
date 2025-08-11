import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { RolesResponseDto } from './dto/roles-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Roles')
@Controller('role')
export class RoleController {

    constructor(
        private roleService:RoleService
    ){}
    @Post('default-roles')
    @ApiOperation({ summary: 'Create default roles' })
    @ApiOkResponse({ type: RolesResponseDto, isArray: true })
    async store(){
        const roles = await this.roleService.store();
        return plainToInstance(RolesResponseDto, roles);
    }


}
